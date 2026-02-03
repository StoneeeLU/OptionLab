import { useState } from 'react'

import { VolatilitySurfaceChart } from '../../components/VolatilitySurfaceChart'
import { getVolatilitySurfaceForSymbol } from '../../services/api'
import type { VolatilitySurfaceResponse } from '../../types'
import './VolatilitySurfacePage.css'

export function VolatilitySurfacePage() {
  const [symbol, setSymbol] = useState('AAPL')
  const [data, setData] = useState<VolatilitySurfaceResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const chartData = data
    ? {
        surface_data: data.surface_data as number[][],
        strikes: data.strikes ?? [],
        expiries: data.expiries ?? [],
        days_to_expiry: data.days_to_expiry ?? [],
      }
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = symbol.trim().toUpperCase()
    if (!normalized) return

    setLoading(true)
    setError(null)

    try {
      const res = await getVolatilitySurfaceForSymbol(normalized)
      setData(res)
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : 'Failed to load volatility surface')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="vol-surface-page">
      <header className="vol-surface-header">
        <div>
          <h1>Volatility Surface</h1>
          <p className="subtitle">3D view of implied volatility across strikes and expiries.</p>
        </div>

        <form className="symbol-form" onSubmit={handleSubmit}>
          <input
            className="symbol-input"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter symbol (e.g., AAPL)"
            aria-label="Symbol"
          />
          <button className="fetch-btn" type="submit" disabled={loading}>
            {loading ? 'Loading…' : 'Load'}
          </button>
        </form>
      </header>

      {error && <div className="error">Error: {error}</div>}

      <VolatilitySurfaceChart data={chartData} loading={loading} />
    </div>
  )
}
