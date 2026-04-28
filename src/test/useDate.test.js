import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import useDate from '../components/useDate'

describe('useDate', () => {
  it('returns an object with expected keys', () => {
    const { result } = renderHook(() => useDate())
    expect(result.current).toHaveProperty('date')
    expect(result.current).toHaveProperty('now')
    expect(result.current).toHaveProperty('DD')
    expect(result.current).toHaveProperty('MM')
    expect(result.current).toHaveProperty('MMM')
    expect(result.current).toHaveProperty('MMMM')
    expect(result.current).toHaveProperty('YY')
    expect(result.current).toHaveProperty('HH')
    expect(result.current).toHaveProperty('mm')
    expect(result.current).toHaveProperty('ss')
  })

  it('DD is a zero-padded 2-digit string', () => {
    const { result } = renderHook(() => useDate())
    expect(result.current.DD).toMatch(/^\d{2}$/)
  })

  it('MM is a zero-padded 2-digit month string', () => {
    const { result } = renderHook(() => useDate())
    expect(result.current.MM).toMatch(/^(0[1-9]|1[0-2])$/)
  })

  it('MMM is a 3-letter month abbreviation', () => {
    const { result } = renderHook(() => useDate())
    const shorts = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    expect(shorts).toContain(result.current.MMM)
  })

  it('MMMM is a full month name', () => {
    const { result } = renderHook(() => useDate())
    const full = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ]
    expect(full).toContain(result.current.MMMM)
  })

  it('YY is the current 4-digit year', () => {
    const { result } = renderHook(() => useDate())
    expect(result.current.YY).toBe(new Date().getFullYear())
  })

  it('date is in YYYY-M-D format', () => {
    const { result } = renderHook(() => useDate())
    expect(result.current.date).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/)
  })

  it('now is in YYYY-MM-DD HH:mm:ss format', () => {
    const { result } = renderHook(() => useDate())
    expect(result.current.now).toMatch(/^\d{4}-\d{2}-\d{2} \d{1,2}:\d{1,2}:\d{1,2}$/)
  })
})
