import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeChain, SESSION_DATA, PROFILE_DATA } from './__mocks__/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn() },
  },
}))

import { supabase } from '../lib/supabase'
import { AddAssetsFn, CalcAssetFn, DeleteAssetsFn } from '../components/custom/assetsFn'

beforeEach(() => {
  vi.clearAllMocks()
  supabase.auth.getSession.mockResolvedValue(SESSION_DATA)
})

const insertedAsset = {
  id: 'a-1',
  name: 'Laptop',
  code: 'AST-001',
  type: 'Electronics',
}

// ─── AddAssetsFn ────────────────────────────────────────────────────────────

describe('AddAssetsFn', () => {
  beforeEach(() => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      if (table === 'assets')   return makeChain({ data: insertedAsset, error: null })
      return makeChain({ data: null, error: null })
    })
  })

  it('returns the inserted asset row', async () => {
    const result = await AddAssetsFn({
      name:              'Laptop',
      code:              'AST-001',
      type:              'Electronics',
      acquisition_date:  '2024-01-01',
      acquisition_value: 15000,
      useful_life_years: 5,
      depreciation_rate: 20,
      current_value:     12000,
    })
    expect(result).toEqual(insertedAsset)
  })

  it('coerces numeric fields to numbers', async () => {
    let insertedRow
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      const chain = makeChain({ data: insertedAsset, error: null })
      chain.insert = vi.fn((row) => { insertedRow = row; return chain })
      return chain
    })

    await AddAssetsFn({ name: 'Laptop', acquisition_value: '1500', useful_life_years: '5', depreciation_rate: '20', current_value: '1200' })
    expect(typeof insertedRow?.acquisition_value).toBe('number')
    expect(typeof insertedRow?.useful_life_years).toBe('number')
    expect(typeof insertedRow?.depreciation_rate).toBe('number')
    expect(typeof insertedRow?.current_value).toBe('number')
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      return makeChain({ data: null, error: { message: 'asset insert failed' } })
    })
    await expect(AddAssetsFn({ name: 'Laptop' })).rejects.toThrow('asset insert failed')
  })
})

// ─── CalcAssetFn ────────────────────────────────────────────────────────────

describe('CalcAssetFn', () => {
  it('is a function', () => {
    expect(typeof CalcAssetFn).toBe('function')
  })

  it('resolves without throwing', async () => {
    await expect(CalcAssetFn({})).resolves.not.toThrow()
  })
})

// ─── DeleteAssetsFn ─────────────────────────────────────────────────────────

describe('DeleteAssetsFn', () => {
  it('resolves when deletion succeeds', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: null }))
    await expect(DeleteAssetsFn({ id: 'a-1' })).resolves.not.toThrow()
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'delete failed' } }))
    await expect(DeleteAssetsFn({ id: 'a-1' })).rejects.toThrow('delete failed')
  })
})
