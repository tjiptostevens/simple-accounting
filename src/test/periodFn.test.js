import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeChain, SESSION_DATA, PROFILE_DATA } from './__mocks__/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn() },
  },
}))

import { supabase } from '../lib/supabase'
import { AddPeriodFn, ClosePeriodFn, DeletePeriodFn } from '../components/custom/periodFn'

beforeEach(() => {
  vi.clearAllMocks()
  supabase.auth.getSession.mockResolvedValue(SESSION_DATA)
})

const periodRow = {
  id: 'p-1',
  name: 'JAN-2024',
  description: 'January 2024',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  status: 1,
}

// ─── AddPeriodFn ─────────────────────────────────────────────────────────────

describe('AddPeriodFn', () => {
  beforeEach(() => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      if (table === 'periods')  return makeChain({ data: periodRow, error: null })
      return makeChain({ data: null, error: null })
    })
  })

  it('returns the inserted period row', async () => {
    const result = await AddPeriodFn({
      name:        'JAN-2024',
      description: 'January 2024',
      start:       '2024-01-01',
      end:         '2024-01-31',
    })
    expect(result).toEqual(periodRow)
  })

  it('defaults description to empty string when not provided', async () => {
    let capturedRow
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      const chain = makeChain({ data: periodRow, error: null })
      chain.insert = vi.fn((row) => { capturedRow = row; return chain })
      return chain
    })
    await AddPeriodFn({ name: 'FEB-2024', start: '2024-02-01', end: '2024-02-29' })
    expect(capturedRow?.description).toBe('')
  })

  it('always sets status to 1 on creation', async () => {
    let capturedRow
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      const chain = makeChain({ data: periodRow, error: null })
      chain.insert = vi.fn((row) => { capturedRow = row; return chain })
      return chain
    })
    await AddPeriodFn({ name: 'MAR-2024', start: '2024-03-01', end: '2024-03-31' })
    expect(capturedRow?.status).toBe(1)
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      if (table === 'periods')  return makeChain({ data: null, error: { message: 'period insert failed' } })
      return makeChain({ data: null, error: null })
    })
    await expect(
      AddPeriodFn({ name: 'JAN-2024', start: '2024-01-01', end: '2024-01-31' }),
    ).rejects.toThrow('period insert failed')
  })
})

// ─── ClosePeriodFn ───────────────────────────────────────────────────────────

describe('ClosePeriodFn', () => {
  const closedRow = { ...periodRow, status: 2 }

  it('returns the updated period with new status', async () => {
    supabase.from.mockReturnValue(makeChain({ data: closedRow, error: null }))
    const result = await ClosePeriodFn({ id: 'p-1', status: 2 })
    expect(result).toEqual(closedRow)
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'close failed' } }))
    await expect(ClosePeriodFn({ id: 'p-1', status: 2 })).rejects.toThrow('close failed')
  })
})

// ─── DeletePeriodFn ──────────────────────────────────────────────────────────

describe('DeletePeriodFn', () => {
  it('resolves when deletion succeeds', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: null }))
    await expect(DeletePeriodFn({ id: 'p-1' })).resolves.not.toThrow()
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'delete failed' } }))
    await expect(DeletePeriodFn({ id: 'p-1' })).rejects.toThrow('delete failed')
  })
})
