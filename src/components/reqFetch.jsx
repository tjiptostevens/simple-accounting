/**
 * reqFetch.js  –  All read queries using @supabase/supabase-js
 *
 * Each function is designed to be used as the `queryFn` in a
 * TanStack Query `useQuery` call.  They rely on Supabase RLS to
 * automatically scope results to the authenticated user's company.
 */
import { supabase } from '../lib/supabase'

// ── Helper ────────────────────────────────────────────────────
const throwOnError = ({ data, error }) => {
  if (error) throw new Error(error.message)
  return data
}

// ─────────────────────────────────────────────────────────────
// Companies
// ─────────────────────────────────────────────────────────────
const reqCompany = async () =>
  throwOnError(await supabase.from('companies').select('*'))

// ─────────────────────────────────────────────────────────────
// Periods
// ─────────────────────────────────────────────────────────────
const reqPeriod = async () =>
  throwOnError(
    await supabase
      .from('periods')
      .select('*')
      .order('start_date', { ascending: true }),
  )

// ─────────────────────────────────────────────────────────────
// Chart of Accounts – full list (with is_group & parent)
// ─────────────────────────────────────────────────────────────
const reqCoa = async () =>
  throwOnError(
    await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('number', { ascending: true }),
  )

// reqCoaList returns the same data as reqCoa; kept as a separate
// query key so components can invalidate independently.
const reqCoaList = async () =>
  throwOnError(
    await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('number', { ascending: true }),
  )

// ─────────────────────────────────────────────────────────────
// Journals (header rows)
// ─────────────────────────────────────────────────────────────
const reqJournal = async () =>
  throwOnError(
    await supabase
      .from('journals')
      .select('*')
      .order('posting_date', { ascending: true }),
  )

const reqJournalList = async () =>
  throwOnError(
    await supabase
      .from('journals')
      .select('id, name, title, type, posting_date')
      .order('posting_date', { ascending: true }),
  )

// ─────────────────────────────────────────────────────────────
// Journal Entries (line items)
// ─────────────────────────────────────────────────────────────
const reqJournalEntry = async () =>
  throwOnError(
    await supabase
      .from('journal_entries')
      .select('*')
      .order('posting_date', { ascending: true }),
  )

// ─────────────────────────────────────────────────────────────
// Equity Changes
// ─────────────────────────────────────────────────────────────
const reqEquityChange = async () =>
  throwOnError(
    await supabase
      .from('equity_changes')
      .select('*')
      .order('posting_date', { ascending: true }),
  )

// ─────────────────────────────────────────────────────────────
// Fixed Assets
// ─────────────────────────────────────────────────────────────
const reqAssets = async () =>
  throwOnError(
    await supabase
      .from('assets')
      .select('*')
      .order('acquisition_date', { ascending: true }),
  )

// ─────────────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────────────
const reqCustomer = async () =>
  throwOnError(
    await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true }),
  )

// ─────────────────────────────────────────────────────────────
// Users (profiles)
// ─────────────────────────────────────────────────────────────
const reqUser = async () =>
  throwOnError(
    await supabase
      .from('profiles')
      .select('id, first_name, last_name, mobile, role, created_at, auth.users(email)')
      .order('first_name', { ascending: true }),
  )

// ─────────────────────────────────────────────────────────────
// Orders & Payments
// ─────────────────────────────────────────────────────────────
const reqOrder = async () =>
  throwOnError(
    await supabase
      .from('orders')
      .select('*, customers(name)')
      .order('order_date', { ascending: true }),
  )

const reqPayment = async () =>
  throwOnError(
    await supabase
      .from('payments')
      .select('*, orders(name)')
      .order('payment_date', { ascending: true }),
  )

export {
  reqCompany,
  reqJournal,
  reqJournalList,
  reqJournalEntry,
  reqCoa,
  reqCoaList,
  reqPeriod,
  reqEquityChange,
  reqAssets,
  reqCustomer,
  reqUser,
  reqOrder,
  reqPayment,
}

