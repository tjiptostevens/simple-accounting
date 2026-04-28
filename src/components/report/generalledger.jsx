import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reqCoaList, reqJournalEntry, reqPeriod } from '../reqFetch'
import { showFormattedDate } from '../custom/dateFn'

const GeneralLedger = () => {
  const [filters, setFilters] = useState({
    period: '',
    account: '',
  })

  const { data: period } = useQuery({ queryKey: ['period'], queryFn: reqPeriod })
  const { data: coaList } = useQuery({ queryKey: ['coaList'], queryFn: reqCoaList })
  const { data: journalEntry, isLoading, isError, error } = useQuery({
    queryKey: ['journalEntry'],
    queryFn: reqJournalEntry,
  })

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  // Filter and process ledger data
  const ledgerData = useMemo(() => {
    if (!journalEntry || !coaList) return []

    let entries = [...journalEntry]

    // Filter by period
    if (filters.period !== '' && period) {
      const selectedPeriod = period[parseInt(filters.period)]
      const start = new Date(selectedPeriod.start)
      const end = new Date(selectedPeriod.end)
      entries = entries.filter((e) => {
        const d = new Date(e.posting_date)
        return d >= start && d <= end
      })
    }

    // Filter by account
    if (filters.account !== '') {
      entries = entries.filter((e) => e.acc === filters.account)
    } else {
      return [] // Don't show anything if no account is selected
    }

    // Sort by date
    entries.sort((a, b) => (a.posting_date > b.posting_date ? 1 : -1))

    // Calculate running balance
    const selectedCoa = coaList.find((c) => c.number === filters.account)
    const isNormalDebit = selectedCoa?.type === 'Assets' || selectedCoa?.type === 'Expense'

    let runningBalance = 0
    return entries.map((e) => {
      const debit = parseFloat(e.debit || 0)
      const credit = parseFloat(e.credit || 0)
      
      if (isNormalDebit) {
        runningBalance += debit - credit
      } else {
        runningBalance += credit - debit
      }

      return {
        ...e,
        runningBalance,
      }
    })
  }, [journalEntry, coaList, period, filters])

  if (isLoading) return <div className="p-4 text-app-text">Loading ledger data...</div>
  if (isError) return <div className="p-4 text-red-400">Error: {error.message}</div>

  const formatNum = (n) => 
    Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <p className="__content_title">General Ledger</p>
        <div className="flex gap-2">
          <select
            name="period"
            className="px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-primary text-sm"
            value={filters.period}
            onChange={handleChange}
          >
            <option value="">Select Period</option>
            {period?.map((p, i) => (
              <option key={i} value={i}>{p.name}</option>
            ))}
          </select>

          <select
            name="account"
            className="px-3 py-1.5 bg-[#212529] text-white border border-gray-600 rounded focus:outline-none focus:border-primary text-sm"
            value={filters.account}
            onChange={handleChange}
            style={{ minWidth: '200px' }}
          >
            <option value="">Select Account</option>
            {coaList?.filter(c => !c.is_group).map((c) => (
              <option key={c.number} value={c.number}>
                {c.number} - {c.name}
              </option>
            ))}
          </select>

          <button
            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors cursor-pointer border-none"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer"></i>
          </button>
        </div>
      </div>
      <hr className="border-app-border mb-6" />

      {filters.account === '' ? (
        <div className="text-center py-20 text-muted opacity-50">
          <i className="bi bi-journal-text text-4xl block mb-2"></i>
          <p>Please select an account to view the ledger</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-app-text opacity-70 text-sm border-b border-app-border">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Description</th>
                <th className="py-2 px-4 text-right">Debit</th>
                <th className="py-2 px-4 text-right">Credit</th>
                <th className="py-2 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-muted">No transactions found for this period</td>
                </tr>
              ) : (
                ledgerData.map((row, idx) => (
                  <tr key={idx} className="border-b border-app-border hover:bg-app-surface transition-colors text-sm text-white">
                    <td className="py-3 px-4">{showFormattedDate(row.posting_date)}</td>
                    <td className="py-3 px-4">
                      <div>{row.parent}</div>
                      <div className="text-xs opacity-50">{row.title || 'No description'}</div>
                    </td>
                    <td className="py-3 px-4 text-right">{parseFloat(row.debit) > 0 ? formatNum(row.debit) : '-'}</td>
                    <td className="py-3 px-4 text-right">{parseFloat(row.credit) > 0 ? formatNum(row.credit) : '-'}</td>
                    <td className="py-3 px-4 text-right font-semibold">{formatNum(row.runningBalance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default GeneralLedger
