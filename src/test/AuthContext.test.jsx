import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act, waitFor } from '@testing-library/react'
import React from 'react'
import { makeChain } from './__mocks__/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession:        vi.fn(),
      signInWithPassword: vi.fn(),
      signOut:           vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

import { supabase } from '../lib/supabase'
import { AuthProvider, useAuth } from '../context/AuthContext'

const mockSession = { user: { id: 'user-1', email: 'test@example.com' } }
const mockProfile = { id: 'user-1', company_id: 'co-1', role: 'admin' }

// Helper component that captures the hook value
function Consumer({ onValue }) {
  const auth = useAuth()
  onValue(auth)
  return null
}

function renderWithAuth(onValue) {
  return render(
    <AuthProvider>
      <Consumer onValue={onValue} />
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  supabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
  supabase.from.mockImplementation(() => makeChain({ data: mockProfile, error: null }))
})

// ─── useAuth ────────────────────────────────────────────────────────────────

describe('useAuth', () => {
  it('throws when used outside <AuthProvider>', () => {
    // Suppress console.error from React
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Consumer onValue={() => {}} />)).toThrow(
      'useAuth must be used inside <AuthProvider>',
    )
    spy.mockRestore()
  })
})

// ─── AuthProvider – initial loading state ───────────────────────────────────

describe('AuthProvider', () => {
  it('starts in a loading state', () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    let captured
    render(
      <AuthProvider>
        <Consumer onValue={(v) => { captured = v }} />
      </AuthProvider>,
    )
    expect(captured.loading).toBe(true)
  })

  it('sets loading to false after session resolves', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    let captured
    render(
      <AuthProvider>
        <Consumer onValue={(v) => { captured = v }} />
      </AuthProvider>,
    )
    await waitFor(() => expect(captured.loading).toBe(false))
  })

  it('populates user and session when a session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
    let captured
    render(
      <AuthProvider>
        <Consumer onValue={(v) => { captured = v }} />
      </AuthProvider>,
    )
    await waitFor(() => expect(captured.user).not.toBeNull())
    expect(captured.user).toEqual(mockSession.user)
    expect(captured.session).toEqual(mockSession)
  })

  it('sets user/session to null when no session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    let captured
    render(
      <AuthProvider>
        <Consumer onValue={(v) => { captured = v }} />
      </AuthProvider>,
    )
    await waitFor(() => expect(captured.loading).toBe(false))
    expect(captured.user).toBeNull()
    expect(captured.session).toBeNull()
  })

  it('exposes loginUser as email when user is set', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
    let captured
    render(
      <AuthProvider>
        <Consumer onValue={(v) => { captured = v }} />
      </AuthProvider>,
    )
    await waitFor(() => expect(captured.loginUser).toBe('test@example.com'))
  })

  it('exposes companyId from profile', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
    let captured
    render(
      <AuthProvider>
        <Consumer onValue={(v) => { captured = v }} />
      </AuthProvider>,
    )
    await waitFor(() => expect(captured.companyId).toBe('co-1'))
  })
})

// ─── signIn ─────────────────────────────────────────────────────────────────

describe('AuthProvider signIn', () => {
  it('calls supabase.auth.signInWithPassword and returns data', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    let captured
    render(
      <AuthProvider>
        <Consumer onValue={(v) => { captured = v }} />
      </AuthProvider>,
    )
    await waitFor(() => expect(captured.loading).toBe(false))

    const result = await captured.signIn('test@example.com', 'password')
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email:    'test@example.com',
      password: 'password',
    })
    expect(result).toEqual({ session: mockSession })
  })

  it('throws when signInWithPassword returns an error', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: new Error('Invalid credentials'),
    })

    let captured
    render(
      <AuthProvider>
        <Consumer onValue={(v) => { captured = v }} />
      </AuthProvider>,
    )
    await waitFor(() => expect(captured.loading).toBe(false))
    await expect(captured.signIn('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })
})

// ─── signOut ────────────────────────────────────────────────────────────────

describe('AuthProvider signOut', () => {
  it('calls supabase.auth.signOut and clears state', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
    supabase.auth.signOut.mockResolvedValue({})

    let captured
    render(
      <AuthProvider>
        <Consumer onValue={(v) => { captured = v }} />
      </AuthProvider>,
    )
    await waitFor(() => expect(captured.user).not.toBeNull())

    await act(async () => {
      await captured.signOut()
    })

    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(captured.user).toBeNull()
    expect(captured.session).toBeNull()
    expect(captured.profile).toBeNull()
  })
})
