import { useState, lazy, Suspense } from 'react'

const VolatilitySurfaceChart = lazy(() =>
  import('../../components/VolatilitySurfaceChart/VolatilitySurfaceChart').then((m) => ({
    default: m.VolatilitySurfaceChart,
  }))
)
import { GlassPanel, Skeleton, AnimatedContainer } from '../../components/common'
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
      <AnimatedContainer animation="slideUp">
        <GlassPanel className="vol-surface-header-panel">
          <div className="header-content">
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
        </GlassPanel>
      </AnimatedContainer>

      {error && (
        <AnimatedContainer animation="fadeIn">
          <div className="error">Error: {error}</div>
        </AnimatedContainer>
      )}

      <AnimatedContainer animation="fadeIn" className="chart-section">
        {loading ? (
          <GlassPanel className="chart-skeleton-container">
            <div className="chart-header-skeleton">
              <Skeleton variant="text" width={250} height={32} className="mb-2" />
              <Skeleton variant="text" width={350} height={20} />
            </div>
            <Skeleton variant="rect" width="100%" height={600} className="chart-canvas-skeleton" />
            <div className="chart-controls-skeleton">
              <Skeleton variant="text" width={300} height={20} />
            </div>
          </GlassPanel>
        ) : (
          <Suspense
            fallback={
              <GlassPanel className="chart-skeleton-container">
                <div className="chart-header-skeleton">
                  <Skeleton variant="text" width={250} height={32} className="mb-2" />
                  <Skeleton variant="text" width={350} height={20} />
                </div>
                <Skeleton
                  variant="rect"
                  width="100%"
                  height={600}
                  className="chart-canvas-skeleton"
                />
                <div className="chart-controls-skeleton">
                  <Skeleton variant="text" width={300} height={20} />
                </div>
              </GlassPanel>
            }
          >
            <VolatilitySurfaceChart data={chartData} loading={loading} />
          </Suspense>
        )}
      </AnimatedContainer>
    </div>
  )
}
