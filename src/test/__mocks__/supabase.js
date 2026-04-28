/**
 * Factory that returns a fully chainable Supabase query mock.
 * Pass the resolved value for .single() / direct await.
 */
import { vi } from 'vitest'

export const makeChain = (resolved) => {
  const chain = {
    select:  vi.fn().mockReturnThis(),
    insert:  vi.fn().mockReturnThis(),
    update:  vi.fn().mockReturnThis(),
    delete:  vi.fn().mockReturnThis(),
    eq:      vi.fn().mockReturnThis(),
    order:   vi.fn().mockReturnThis(),
    limit:   vi.fn().mockReturnThis(),
    single:  vi.fn().mockResolvedValue(resolved),
    then: (resolve) => Promise.resolve(resolved).then(resolve),
  }
  return chain
}

/** Default session / profile resolved values used across most tests. */
export const SESSION_DATA = { data: { session: { user: { id: 'user-1' } } } }
export const PROFILE_DATA = { data: { company_id: 'co-1' }, error: null }
