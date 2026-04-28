import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeChain, SESSION_DATA, PROFILE_DATA } from './__mocks__/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn() },
  },
}))

import { supabase } from '../lib/supabase'
import { AddCustomerFn, EditCustomerFn, DeleteCustomerFn } from '../components/custom/customerFn'

beforeEach(() => {
  vi.clearAllMocks()
  supabase.auth.getSession.mockResolvedValue(SESSION_DATA)
})

const customerRow = {
  id: 'c-1',
  name: 'Acme Corp',
  mobile: '08123456789',
  email: 'acme@example.com',
  address: 'Jl. Example 1',
  status: 1,
}

// ─── AddCustomerFn ──────────────────────────────────────────────────────────

describe('AddCustomerFn', () => {
  beforeEach(() => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')  return makeChain(PROFILE_DATA)
      if (table === 'customers') return makeChain({ data: customerRow, error: null })
      return makeChain({ data: null, error: null })
    })
  })

  it('returns the inserted customer row', async () => {
    const result = await AddCustomerFn({
      name:    'Acme Corp',
      mobile:  '08123456789',
      email:   'acme@example.com',
      address: 'Jl. Example 1',
    })
    expect(result).toEqual(customerRow)
  })

  it('defaults optional fields to empty strings', async () => {
    let capturedRow
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      const chain = makeChain({ data: customerRow, error: null })
      chain.insert = vi.fn((row) => { capturedRow = row; return chain })
      return chain
    })
    await AddCustomerFn({ name: 'No Contact' })
    expect(capturedRow?.mobile).toBe('')
    expect(capturedRow?.email).toBe('')
    expect(capturedRow?.address).toBe('')
  })

  it('always sets status to 1 on creation', async () => {
    let capturedRow
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return makeChain(PROFILE_DATA)
      const chain = makeChain({ data: customerRow, error: null })
      chain.insert = vi.fn((row) => { capturedRow = row; return chain })
      return chain
    })
    await AddCustomerFn({ name: 'New Customer' })
    expect(capturedRow?.status).toBe(1)
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')  return makeChain(PROFILE_DATA)
      if (table === 'customers') return makeChain({ data: null, error: { message: 'customer insert failed' } })
      return makeChain({ data: null, error: null })
    })
    await expect(AddCustomerFn({ name: 'Fail Corp' })).rejects.toThrow('customer insert failed')
  })
})

// ─── EditCustomerFn ─────────────────────────────────────────────────────────

describe('EditCustomerFn', () => {
  const updatedRow = { ...customerRow, name: 'Acme Inc' }

  beforeEach(() => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')  return makeChain(PROFILE_DATA)
      if (table === 'customers') return makeChain({ data: updatedRow, error: null })
      return makeChain({ data: null, error: null })
    })
  })

  it('returns the updated customer row', async () => {
    const result = await EditCustomerFn({ id: 'c-1', name: 'Acme Inc' })
    expect(result).toEqual(updatedRow)
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles')  return makeChain(PROFILE_DATA)
      if (table === 'customers') return makeChain({ data: null, error: { message: 'update failed' } })
      return makeChain({ data: null, error: null })
    })
    await expect(EditCustomerFn({ id: 'c-1', name: 'Fail' })).rejects.toThrow('update failed')
  })
})

// ─── DeleteCustomerFn ───────────────────────────────────────────────────────

describe('DeleteCustomerFn', () => {
  it('resolves when deletion succeeds', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: null }))
    await expect(DeleteCustomerFn({ id: 'c-1' })).resolves.not.toThrow()
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'delete failed' } }))
    await expect(DeleteCustomerFn({ id: 'c-1' })).rejects.toThrow('delete failed')
  })
})
