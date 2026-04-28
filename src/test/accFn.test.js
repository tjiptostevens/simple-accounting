import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeChain, SESSION_DATA, PROFILE_DATA } from './__mocks__/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn() },
  },
}))

import { supabase } from '../lib/supabase'
import {
  AddJournalFn,
  AddJournalEntryFn,
  AddEquityChangeFn,
  GetJournalLastFn,
} from '../components/custom/accFn'

beforeEach(() => {
  vi.clearAllMocks()
  supabase.auth.getSession.mockResolvedValue(SESSION_DATA)
})

// ─── GetJournalLastFn ───────────────────────────────────────────────────────

describe('GetJournalLastFn', () => {
  it('returns { last: "0000" } when no journal exists (PGRST116)', async () => {
    supabase.from.mockReturnValue(
      makeChain({ data: null, error: { code: 'PGRST116', message: 'not found' } }),
    )
    await expect(GetJournalLastFn('JV')).resolves.toEqual({ last: '0000' })
  })

  it('extracts the last serial from the journal name', async () => {
    supabase.from.mockReturnValue(
      makeChain({ data: { name: 'JV/2024/0042' }, error: null }),
    )
    await expect(GetJournalLastFn('JV')).resolves.toEqual({ last: '0042' })
  })

  it('throws when a non-PGRST116 error occurs', async () => {
    supabase.from.mockReturnValue(
      makeChain({ data: null, error: { code: '500', message: 'server error' } }),
    )
    await expect(GetJournalLastFn('JV')).rejects.toThrow('server error')
  })
})

// ─── AddJournalFn ───────────────────────────────────────────────────────────

describe('AddJournalFn', () => {
  const insertedJournal = { id: 'j-1', name: 'JV/2024/0001', type: 'JV' }

  beforeEach(() => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')  return makeChain(PROFILE_DATA)
      if (table === 'journals')  return makeChain({ data: insertedJournal, error: null })
      return makeChain({ data: null, error: null })
    })
  })

  it('returns the inserted journal row', async () => {
    const result = await AddJournalFn({
      name: 'JV/2024/0001',
      type: 'JV',
      posting_date: '2024-01-01',
      total_debit: 1000,
      total_credit: 1000,
    })
    expect(result).toEqual(insertedJournal)
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      return makeChain({ data: null, error: { message: 'insert failed' } })
    })
    await expect(
      AddJournalFn({ name: 'JV/2024/0001', type: 'JV', posting_date: '2024-01-01' }),
    ).rejects.toThrow('insert failed')
  })
})

// ─── AddJournalEntryFn ──────────────────────────────────────────────────────

describe('AddJournalEntryFn', () => {
  const insertedEntry = { id: 'e-1', parent: 'JV/2024/0001', acc: '1100', debit: 500, credit: 0 }

  beforeEach(() => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')        return makeChain(PROFILE_DATA)
      if (table === 'journals')        return makeChain({ data: { id: 'j-1' }, error: null })
      if (table === 'journal_entries') return makeChain({ data: insertedEntry, error: null })
      return makeChain({ data: null, error: null })
    })
  })

  it('returns the inserted entry row', async () => {
    const result = await AddJournalEntryFn({
      parent:       'JV/2024/0001',
      acc:          '1100',
      debit:        500,
      credit:       0,
      posting_date: '2024-01-01',
    })
    expect(result).toEqual(insertedEntry)
  })

  it('throws when the parent journal lookup fails', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      if (table === 'journals') return makeChain({ data: null, error: { message: 'journal not found' } })
      return makeChain({ data: null, error: null })
    })
    await expect(
      AddJournalEntryFn({ parent: 'UNKNOWN', acc: '1100', posting_date: '2024-01-01' }),
    ).rejects.toThrow('journal not found')
  })
})

// ─── AddEquityChangeFn ──────────────────────────────────────────────────────

describe('AddEquityChangeFn', () => {
  const insertedEquity = { id: 'eq-1', period_name: 'JAN-2024', opening: 5000 }

  beforeEach(() => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')       return makeChain(PROFILE_DATA)
      if (table === 'equity_changes') return makeChain({ data: insertedEquity, error: null })
      return makeChain({ data: null, error: null })
    })
  })

  it('returns the inserted equity change row', async () => {
    const result = await AddEquityChangeFn({
      name:         'JAN-2024',
      opening:      5000,
      profit:       1000,
      prive:        200,
      closing:      5800,
      posting_date: '2024-01-31',
    })
    expect(result).toEqual(insertedEquity)
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')       return makeChain(PROFILE_DATA)
      if (table === 'equity_changes') return makeChain({ data: null, error: { message: 'equity insert failed' } })
      return makeChain({ data: null, error: null })
    })
    await expect(
      AddEquityChangeFn({ name: 'JAN-2024', posting_date: '2024-01-31' }),
    ).rejects.toThrow('equity insert failed')
  })
})
