import { useCallback, useEffect, useMemo, useState } from 'react'

export type WatchlistItem = {
  symbol: string
  addedAt: Date
}

type StoredWatchlistItem = {
  symbol: string
  addedAt: string
}

const STORAGE_KEY = 'optionlab-watchlist'

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase()
}

function readStoredWatchlist(): WatchlistItem[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as StoredWatchlistItem[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => typeof item?.symbol === 'string' && typeof item?.addedAt === 'string')
      .map((item) => ({
        symbol: normalizeSymbol(item.symbol),
        addedAt: new Date(item.addedAt),
      }))
  } catch {
    return []
  }
}

function writeStoredWatchlist(items: WatchlistItem[]) {
  const stored: StoredWatchlistItem[] = items.map((item) => ({
    symbol: normalizeSymbol(item.symbol),
    addedAt: item.addedAt.toISOString(),
  }))

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(() => readStoredWatchlist())

  useEffect(() => {
    writeStoredWatchlist(items)
  }, [items])

  const addToWatchlist = useCallback((symbol: string) => {
    const normalized = normalizeSymbol(symbol)
    if (!normalized) return

    setItems((prev) => {
      if (prev.some((item) => item.symbol === normalized)) return prev
      return [{ symbol: normalized, addedAt: new Date() }, ...prev]
    })
  }, [])

  const removeFromWatchlist = useCallback((symbol: string) => {
    const normalized = normalizeSymbol(symbol)
    if (!normalized) return

    setItems((prev) => prev.filter((item) => item.symbol !== normalized))
  }, [])

  const isInWatchlist = useCallback(
    (symbol: string) => {
      const normalized = normalizeSymbol(symbol)
      if (!normalized) return false
      return items.some((item) => item.symbol === normalized)
    },
    [items],
  )

  const getWatchlist = useCallback(() => items, [items])

  return useMemo(
    () => ({
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      getWatchlist,
    }),
    [addToWatchlist, getWatchlist, isInWatchlist, removeFromWatchlist],
  )
}
