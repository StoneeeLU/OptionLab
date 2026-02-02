import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useWatchlist } from './useWatchlist'

const STORAGE_KEY = 'optionlab-watchlist'

describe('useWatchlist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('addToWatchlist adds item to localStorage', () => {
    const { result } = renderHook(() => useWatchlist())

    act(() => {
      result.current.addToWatchlist('AAPL')
    })

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()

    const stored = JSON.parse(raw as string) as Array<{ symbol: string; addedAt: string }>
    expect(stored).toHaveLength(1)
    expect(stored[0].symbol).toBe('AAPL')
    expect(typeof stored[0].addedAt).toBe('string')
  })

  it('removeFromWatchlist removes item', () => {
    const { result } = renderHook(() => useWatchlist())

    act(() => {
      result.current.addToWatchlist('AAPL')
      result.current.addToWatchlist('TSLA')
    })

    act(() => {
      result.current.removeFromWatchlist('AAPL')
    })

    const list = result.current.getWatchlist()
    expect(list.map((i) => i.symbol)).toEqual(['TSLA'])
  })

  it('isInWatchlist returns correct boolean', () => {
    const { result } = renderHook(() => useWatchlist())

    expect(result.current.isInWatchlist('AAPL')).toBe(false)

    act(() => {
      result.current.addToWatchlist('AAPL')
    })

    expect(result.current.isInWatchlist('AAPL')).toBe(true)
    expect(result.current.isInWatchlist('TSLA')).toBe(false)
  })

  it('getWatchlist returns all items', () => {
    const { result } = renderHook(() => useWatchlist())

    act(() => {
      result.current.addToWatchlist('AAPL')
      result.current.addToWatchlist('TSLA')
    })

    const list = result.current.getWatchlist()
    expect(list).toHaveLength(2)
    expect(list[0].symbol).toBe('TSLA')
    expect(list[1].symbol).toBe('AAPL')
    expect(list[0].addedAt).toBeInstanceOf(Date)
  })
})
