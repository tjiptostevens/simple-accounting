import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useWindow from '../components/useWindow'

describe('useWindow', () => {
  beforeEach(() => {
    // jsdom defaults to 1024×768
    Object.defineProperty(window, 'innerWidth',  { writable: true, configurable: true, value: 1024 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the initial window dimensions', () => {
    const { result } = renderHook(() => useWindow())
    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)
  })

  it('returns an object with width and height properties', () => {
    const { result } = renderHook(() => useWindow())
    expect(result.current).toHaveProperty('width')
    expect(result.current).toHaveProperty('height')
  })

  it('updates dimensions when a resize event fires', () => {
    const { result } = renderHook(() => useWindow())

    act(() => {
      window.innerWidth  = 800
      window.innerHeight = 600
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.width).toBe(800)
    expect(result.current.height).toBe(600)
  })

  it('removes the resize listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useWindow())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
