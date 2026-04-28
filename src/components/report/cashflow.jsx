import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reqCoaList, reqJournalEntry, reqPeriod } from '../reqFetch'

// ── Formatting ─────────────────────────────────────────────────
const fmt = (n) =>
  'Rp ' +
  Math.abs(Number(n))
    .toFixed(0)
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') +
  (Number(n) < 0 ? ' (-)' : '')

// ── Account classification ─────────────────────────────────────
// Uses Indonesian SME account-number conventions:
//   1xx Assets  → 111/112 (or name has "kas"/"bank") = Cash
//                 11x (others)                        = Current Asset
//                 12x–19x                             = Fixed Asset
//   2xx Liabil. → 21x = Current Liability, rest = Long-term Liability
//   3xx Equity  → 32x = Drawing, "330" = Retained Earnings, rest = Capital
//   4xx Income, 5xx Expense
const classify = (coa) => {
  if (!coa) return null
  const num   = String(coa.number ?? '')
  const name  = String(coa.name   ?? '').toLowerCase()
  const type  = coa.type

  if (type === 'Income')  return 'Income'
  if (type === 'Expense') return 'Expense'

  if (type === 'Assets') {
    if (
      num === '111' || num === '112' ||
      num.startsWith('111') || num.startsWith('112') ||
      name.includes('kas') || name.includes('bank') || name.includes('cash')
    ) return 'Cash'
    if (num.startsWith('11')) return 'CurrentAsset'
    return 'FixedAsset'
  }
  if (type === 'Liability') {
    return num.startsWith('21') ? 'CurrentLiability' : 'LongTermLiability'
  }
  if (type === 'Equity') {
    if (num.startsWith('32')) return 'Drawing'
    if (num === '330')         return 'RetainedEarnings'
    return 'Capital'
  }
  return null
}

// ── Net balance for one aggregated account row ─────────────────
// Assets / Expense → normal-debit  (net = debit − credit)
// others           → normal-credit (net = credit − debit)
const netBal = (row, type) => {
  if (!row) return 0
  return type === 'Assets' || type === 'Expense'
    ? row.debit - row.credit
    : row.credit - row.debit
}

// ── Aggregate journal entries by account number ────────────────
const aggregateByAcc = (entries) => {
  const m = {}
  entries.forEach((e) => {
    if (e.acc === 'Total') return
    if (!m[e.acc]) m[e.acc] = { debit: 0, credit: 0 }
    m[e.acc].debit  += parseFloat(e.debit  ?? 0)
    m[e.acc].credit += parseFloat(e.credit ?? 0)
  })
  return m
}

// ── Small display components ───────────────────────────────────
const Row = ({ label, amount, indent = false, bold = false }) => {
  const pos = Number(amount) >= 0
  const color = bold
    ? pos ? 'text-white' : 'text-red-400'
    : pos ? 'text-gray-300' : 'text-red-400'
  return (
    <div className={`flex justify-between items-center py-1 px-2 ${indent ? 'pl-8' : ''} ${bold ? 'font-semibold' : ''}`}>
      <span className={color}>{label}</span>
      <span className={color}>{fmt(amount)}</span>
    </div>
  )
}

const Section = ({ title, total, totalLabel, children }) => (
  <div className="mb-5">
    <div className="bg-[#2d3340] px-4 py-2 rounded-t font-semibold text-green-400 text-sm">
      {title}
    </div>
    <div className="bg-[#212529] rounded-b px-2 py-2 space-y-0.5">
      {children}
      <hr className="border-[#2d3340] my-2" />
      <div className="flex justify-between font-semibold px-2 py-1">
        <span className="text-white text-sm">{totalLabel}</span>
        <span className={`text-sm ${Number(total) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {fmt(total)}
        </span>
      </div>
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════
const CashFlow = () => {
  const [selectedIdx, setSelectedIdx] = useState('')

  const { data: period }                                     = useQuery({ queryKey: ['period'],       queryFn: reqPeriod       })
  const { data: journalEntry, isLoading, isError, error }   = useQuery({ queryKey: ['journalEntry'], queryFn: reqJournalEntry })
  const { data: coaList }                                    = useQuery({ queryKey: ['coaList'],      queryFn: reqCoaList      })

  // COA number → row lookup
  const coaMap = useMemo(() => {
    const m = {}
    coaList?.forEach((c) => { m[c.number] = c })
    return m
  }, [coaList])

  // Period date bounds
  const { periodStart, periodEnd } = useMemo(() => {
    if (selectedIdx === '' || !period) return {}
    const p = period[parseInt(selectedIdx)]
    return {
      periodStart: new Date(p.start_date ?? p.start),
      periodEnd:   new Date(p.end_date   ?? p.end),
    }
  }, [period, selectedIdx])

  // Partition entries: "current period" vs "prior to period"
  const { curr, prior } = useMemo(() => {
    if (!journalEntry) return { curr: [], prior: [] }
    if (!periodStart)  return { curr: journalEntry, prior: [] }
    return {
      curr:  journalEntry.filter((e) => { const d = new Date(e.posting_date); return d >= periodStart && d <= periodEnd }),
      prior: journalEntry.filter((e) => new Date(e.posting_date) < periodStart),
    }
  }, [journalEntry, periodStart, periodEnd])

  const currAgg  = useMemo(() => aggregateByAcc(curr),  [curr])
  const priorAgg = useMemo(() => aggregateByAcc(prior), [prior])

  // ── Main calculation ──────────────────────────────────────────
  const cf = useMemo(() => {
    if (!coaList || !journalEntry) return null

    // Beginning cash balance (from all entries before this period)
    let cashBeginning = 0
    Object.entries(priorAgg).forEach(([num, row]) => {
      const coa = coaMap[num]
      if (!coa || coa.is_group) return
      if (classify(coa) === 'Cash') cashBeginning += netBal(row, 'Assets')
    })

    let income = 0, expense = 0
    const depLines        = []
    const wcAssetLines    = []   // working-capital: current assets (non-cash)
    const wcLiabLines     = []   // working-capital: current liabilities
    const investLines     = []
    const financeLines    = []

    coaList.forEach((coa) => {
      if (coa.is_group === '1' || coa.is_group === true) return
      const cat = classify(coa)
      if (!cat) return
      const row = currAgg[coa.number]
      if (!row) return   // no activity this period
      const nb = netBal(row, coa.type)

      switch (cat) {
        case 'Income':  income  += nb; break
        case 'Expense': {
          expense += nb
          // Detect depreciation entries (acc_type or journal type stored on the entry)
          const isDepr = curr.some(
            (e) =>
              e.acc === coa.number &&
              (String(e.acc_type ?? '').toLowerCase().includes('depreciat') ||
               String(e.party_type ?? '').toLowerCase().includes('depreciat'))
          )
          if (isDepr) depLines.push({ name: coa.name, amount: nb })
          break
        }
        case 'CurrentAsset':    wcAssetLines.push({ name: coa.name, amount: -nb });             break
        case 'CurrentLiability': wcLiabLines.push({ name: coa.name, amount: nb });              break
        case 'FixedAsset':      investLines.push({ name: coa.name, amount: -nb });              break
        case 'Capital':         financeLines.push({ name: coa.name, amount: nb });              break
        case 'Drawing':         financeLines.push({ name: `${coa.name} (Drawing)`, amount: -nb }); break
        case 'LongTermLiability': financeLines.push({ name: coa.name, amount: nb });            break
        default: break
      }
    })

    const netIncome    = income - expense
    const depreciation = depLines.reduce((s, l) => s + l.amount, 0)
    const wcAsset      = wcAssetLines.reduce((s, l) => s + l.amount, 0)
    const wcLiab       = wcLiabLines.reduce((s, l)  => s + l.amount, 0)
    const operating    = netIncome + depreciation + wcAsset + wcLiab
    const investing    = investLines.reduce((s, l)  => s + l.amount, 0)
    const financing    = financeLines.reduce((s, l) => s + l.amount, 0)
    const netChange    = operating + investing + financing

    return {
      netIncome, income, expense,
      depreciation, depLines,
      wcAsset, wcAssetLines,
      wcLiab, wcLiabLines,
      operating,
      investing, investLines,
      financing, financeLines,
      netChange,
      cashBeginning,
      cashEnding: cashBeginning + netChange,
    }
  }, [coaList, journalEntry, currAgg, priorAgg, coaMap, curr])

  if (isLoading) return <div className="p-4 text-gray-400 animate-pulse">Loading…</div>
  if (isError)   return <div className="p-4 text-red-400">Error: {error.message}</div>

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="w-full flex justify-between items-center">
        <div className="__content_title">Cash Flow Statement</div>
        <div className="__search_bar">
          <select
            className="m-1 px-3 py-1.5 bg-[#212529] text-white border border-[#2d3340] rounded text-sm focus:outline-none focus:border-green-500"
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(e.target.value)}
            style={{ minWidth: '140px' }}
          >
            <option value="">All Periods</option>
            {period?.map((d, i) => <option key={i} value={i}>{d.name}</option>)}
          </select>
          <button
            className="m-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer no-print"
            onClick={() => window.print()}
            title="Print"
          >
            <i className="bi bi-printer"></i>
          </button>
        </div>
      </div>
      <hr className="border-[#2d3340] mb-4" style={{ margin: '0 0 1rem' }} />

      {cf ? (
        <div className="w-full overflow-y-auto pb-8">

          {/* ── Summary cards ───────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Operating',  val: cf.operating  },
              { label: 'Investing',  val: cf.investing  },
              { label: 'Financing',  val: cf.financing  },
            ].map(({ label, val }) => (
              <div key={label} className="bg-[#212529] rounded-lg p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                <p className={`font-bold text-sm ${Number(val) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {fmt(val)}
                </p>
              </div>
            ))}
          </div>

          {/* ── A. Operating ────────────────────────────────────── */}
          <Section
            title="A.  Cash Flows from Operating Activities"
            total={cf.operating}
            totalLabel="Net Cash from Operating Activities"
          >
            <Row label="Net Income / (Loss)" amount={cf.netIncome} bold />

            {cf.depreciation !== 0 && (
              <>
                <p className="text-gray-500 text-xs px-2 pt-2 pb-0.5">
                  Adjustments for non-cash items:
                </p>
                <Row label="Depreciation &amp; Amortisation" amount={cf.depreciation} indent />
              </>
            )}

            {(cf.wcAssetLines.length > 0 || cf.wcLiabLines.length > 0) && (
              <p className="text-gray-500 text-xs px-2 pt-2 pb-0.5">
                Changes in working capital:
              </p>
            )}
            {cf.wcAssetLines.map((l, i) => (
              <Row key={`ca-${i}`} label={`(Increase)/Decrease in ${l.name}`} amount={l.amount} indent />
            ))}
            {cf.wcLiabLines.map((l, i) => (
              <Row key={`cl-${i}`} label={`Increase/(Decrease) in ${l.name}`} amount={l.amount} indent />
            ))}
          </Section>

          {/* ── B. Investing ─────────────────────────────────────── */}
          <Section
            title="B.  Cash Flows from Investing Activities"
            total={cf.investing}
            totalLabel="Net Cash from Investing Activities"
          >
            {cf.investLines.length > 0
              ? cf.investLines.map((l, i) => (
                  <Row key={i} label={l.name} amount={l.amount} indent />
                ))
              : <p className="text-gray-500 text-xs px-2 py-1 italic">No investing activity this period</p>
            }
          </Section>

          {/* ── C. Financing ─────────────────────────────────────── */}
          <Section
            title="C.  Cash Flows from Financing Activities"
            total={cf.financing}
            totalLabel="Net Cash from Financing Activities"
          >
            {cf.financeLines.length > 0
              ? cf.financeLines.map((l, i) => (
                  <Row key={i} label={l.name} amount={l.amount} indent />
                ))
              : <p className="text-gray-500 text-xs px-2 py-1 italic">No financing activity this period</p>
            }
          </Section>

          {/* ── Net change + Beginning/Ending cash ──────────────── */}
          <div className="bg-[#1c2126] border border-[#2d3340] rounded-lg p-4 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-white text-sm">Net Change in Cash  (A + B + C)</span>
              <span className={`text-sm ${cf.netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fmt(cf.netChange)}
              </span>
            </div>
            <hr className="border-[#2d3340]" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cash at Beginning of Period</span>
              <span className="text-gray-300">{fmt(cf.cashBeginning)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-[#2d3340] pt-2">
              <span className="text-white text-sm">Cash at End of Period</span>
              <span className={`text-sm ${cf.cashEnding >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fmt(cf.cashEnding)}
              </span>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-6 text-gray-500 text-sm text-center">
          Select a period above to generate the Cash Flow Statement.
        </div>
      )}
    </>
  )
}

export default CashFlow

