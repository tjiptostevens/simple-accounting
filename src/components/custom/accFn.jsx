/**
 * accFn.js  –  Journal & equity mutations via Supabase
 */
import { supabase } from '../../lib/supabase'

const throwOnError = ({ data, error }) => {
  if (error) throw new Error(error.message)
  return data
}

// ─────────────────────────────────────────────────────────────
// Get the last journal serial for a given type
// Returns { last: "0042" }
// ─────────────────────────────────────────────────────────────
const GetJournalLastFn = async (journalType) => {
  const { data, error } = await supabase
    .from('journals')
    .select('name')
    .eq('type', journalType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  if (!data) return { last: '0000' }

  // Extract the 4-digit serial from the name e.g. "JV/2024/0042" → "0042"
  const parts = data.name.split('/')
  return { last: parts[parts.length - 1] ?? '0000' }
}

// ─────────────────────────────────────────────────────────────
// Add a journal header
// ─────────────────────────────────────────────────────────────
const AddJournalFn = async (input) => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData?.session?.user?.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .single()

  const row = {
    name:             input.name,
    title:            input.title ?? '',
    type:             input.type,
    posting_date:     input.posting_date,
    total_debit:      Number(input.total_debit ?? 0),
    total_credit:     Number(input.total_credit ?? 0),
    pay_to_recd_from: input.pay_to_recd_from ?? '',
    user_remark:      input.user_remark ?? '',
    ref:              input.ref ?? '',
    ref_id:           input.ref_id ?? '',
    company_id:       profile?.company_id,
    created_by:       userId,
  }
  return throwOnError(await supabase.from('journals').insert(row).select().single())
}

// ─────────────────────────────────────────────────────────────
// Add a journal entry line
// ─────────────────────────────────────────────────────────────
const AddJournalEntryFn = async (input) => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData?.session?.user?.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .single()

  // Resolve journal_id from parent name
  const { data: journal, error: jErr } = await supabase
    .from('journals')
    .select('id')
    .eq('name', input.parent)
    .single()
  if (jErr) throw new Error(jErr.message)

  const row = {
    journal_id:   journal.id,
    parent:       input.parent,
    acc:          input.acc,
    acc_type:     input.acc_type ?? null,
    party_type:   input.party_type ?? null,
    party:        input.party ?? null,
    debit:        Number(input.debit ?? 0),
    credit:       Number(input.credit ?? 0),
    posting_date: input.posting_date,
    company_id:   profile?.company_id,
    created_by:   userId,
  }
  return throwOnError(await supabase.from('journal_entries').insert(row).select().single())
}

// ─────────────────────────────────────────────────────────────
// Add an equity change record (used when closing a period)
// ─────────────────────────────────────────────────────────────
const AddEquityChangeFn = async (input) => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData?.session?.user?.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .single()

  const row = {
    period_name:  input.name,
    opening:      Number(input.opening ?? 0),
    profit:       Number(input.profit ?? 0),
    prive:        Number(input.prive ?? 0),
    closing:      Number(input.closing ?? 0),
    posting_date: input.posting_date,
    company_id:   profile?.company_id,
    created_by:   userId,
  }
  return throwOnError(await supabase.from('equity_changes').insert(row).select().single())
}

export { AddJournalFn, AddJournalEntryFn, AddEquityChangeFn, GetJournalLastFn }

