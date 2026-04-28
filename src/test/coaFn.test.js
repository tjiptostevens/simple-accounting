import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeChain, SESSION_DATA, PROFILE_DATA } from './__mocks__/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn() },
  },
}))

import { supabase } from '../lib/supabase'
import { AddCoaFn, EditCoaFn, DeleteCoaFn } from '../components/custom/coaFn'

beforeEach(() => {
  vi.clearAllMocks()
  supabase.auth.getSession.mockResolvedValue(SESSION_DATA)
})

const coaRow = { id: 'coa-1', number: '1100', name: 'Cash', type: 'Asset', parent: '0', is_group: false }

// ─── AddCoaFn ───────────────────────────────────────────────────────────────

describe('AddCoaFn', () => {
  beforeEach(() => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')          return makeChain(PROFILE_DATA)
      if (table === 'chart_of_accounts') return makeChain({ data: coaRow, error: null })
      return makeChain({ data: null, error: null })
    })
  })

  it('returns the inserted COA row', async () => {
    const result = await AddCoaFn({ number: '1100', name: 'Cash', type: 'Asset' })
    expect(result).toEqual(coaRow)
  })

  it('defaults parent to "0" when not provided', async () => {
    let capturedRow
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      const chain = makeChain({ data: coaRow, error: null })
      chain.insert = vi.fn((row) => { capturedRow = row; return chain })
      return chain
    })
    await AddCoaFn({ number: '1100', name: 'Cash', type: 'Asset' })
    expect(capturedRow?.parent).toBe('0')
  })

  it('coerces is_group to boolean', async () => {
    let capturedRow
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      const chain = makeChain({ data: coaRow, error: null })
      chain.insert = vi.fn((row) => { capturedRow = row; return chain })
      return chain
    })
    await AddCoaFn({ number: '1100', name: 'Cash', type: 'Asset', is_group: 1 })
    expect(capturedRow?.is_group).toBe(true)
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')          return makeChain(PROFILE_DATA)
      if (table === 'chart_of_accounts') return makeChain({ data: null, error: { message: 'coa insert failed' } })
      return makeChain({ data: null, error: null })
    })
    await expect(AddCoaFn({ number: '1100', name: 'Cash', type: 'Asset' })).rejects.toThrow('coa insert failed')
  })
})

// ─── EditCoaFn ──────────────────────────────────────────────────────────────

describe('EditCoaFn', () => {
  const updatedRow = { ...coaRow, name: 'Petty Cash' }

  it('returns the updated COA row', async () => {
    supabase.from.mockReturnValue(makeChain({ data: updatedRow, error: null }))
    const result = await EditCoaFn({ id: 'coa-1', name: 'Petty Cash', is_group: false })
    expect(result).toEqual(updatedRow)
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'update failed' } }))
    await expect(EditCoaFn({ id: 'coa-1', name: 'Petty Cash' })).rejects.toThrow('update failed')
  })
})

// ─── DeleteCoaFn ────────────────────────────────────────────────────────────

describe('DeleteCoaFn', () => {
  it('resolves when deletion succeeds', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: null }))
    await expect(DeleteCoaFn({ id: 'coa-1' })).resolves.not.toThrow()
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'delete failed' } }))
    await expect(DeleteCoaFn({ id: 'coa-1' })).rejects.toThrow('delete failed')
  })
})
