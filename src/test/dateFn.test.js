import { describe, it, expect } from 'vitest'
import { showFormattedDate } from '../components/custom/dateFn'

describe('showFormattedDate', () => {
  it('returns a non-empty string for a valid date string', () => {
    const result = showFormattedDate('2024-01-15')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes the year in the output', () => {
    const result = showFormattedDate('2024-06-20')
    expect(result).toContain('2024')
  })

  it('formats a date object without throwing', () => {
    const d = new Date('2023-03-05')
    expect(() => showFormattedDate(d)).not.toThrow()
  })

  it('formats a timestamp number without throwing', () => {
    expect(() => showFormattedDate(0)).not.toThrow()
  })

  it('returns different strings for different dates', () => {
    const a = showFormattedDate('2024-01-01')
    const b = showFormattedDate('2024-12-31')
    expect(a).not.toBe(b)
  })
})
