import { useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts'

import { GlassPanel } from '../../common/GlassPanel'
import { calculateIntrinsicValue, type OptionType } from '../../../utils/payoff'
import './PayoffChart.css'

export type PayoffLeg = {
  type: OptionType
  side: 'buy' | 'sell'
  quantity: number
  strike: number
}

type Point = [number, number]

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

function normalizeLeg(leg: PayoffLeg): PayoffLeg {
  return {
    ...leg,
    quantity: isFiniteNumber(leg.quantity) ? leg.quantity : 0,
    strike: isFiniteNumber(leg.strike) ? leg.strike : 0,
  }
}

function payoffAtExpiry(spot: number, legs: PayoffLeg[]): number {
  return legs.reduce((sum, rawLeg) => {
    const leg = normalizeLeg(rawLeg)
    const direction = leg.side === 'buy' ? 1 : -1
    const intrinsic = calculateIntrinsicValue(leg.type, spot, leg.strike)
    return sum + direction * leg.quantity * intrinsic
  }, 0)
}

function computeDomain(legs: PayoffLeg[], spotHint?: number): { min: number; max: number } {
  const strikes = legs.map((l) => normalizeLeg(l).strike).filter((v) => v > 0)
  const anchor = spotHint && isFiniteNumber(spotHint) ? spotHint : strikes[0]

  if (!strikes.length && anchor && anchor > 0) {
    return { min: anchor * 0.5, max: anchor * 1.5 }
  }

  if (!strikes.length) {
    return { min: 0, max: 200 }
  }

  const minStrike = Math.min(...strikes)
  const maxStrike = Math.max(...strikes)
  const span = Math.max(20, maxStrike - minStrike)

  return {
    min: Math.max(0, minStrike - span),
    max: Math.max(minStrike + span, maxStrike + span),
  }
}

function computeSeriesPoints(legs: PayoffLeg[], spotHint?: number): Point[] {
  const domain = computeDomain(legs, spotHint)
  const steps = 120
  const step = (domain.max - domain.min) / steps
  const points: Point[] = []

  for (let i = 0; i <= steps; i += 1) {
    const x = domain.min + step * i
    points.push([x, payoffAtExpiry(x, legs)])
  }

  return points
}

function findBreakevens(points: Point[]): number[] {
  const breakevens: number[] = []

  for (let i = 1; i < points.length; i += 1) {
    const [x1, y1] = points[i - 1]
    const [x2, y2] = points[i]

    if (y1 === 0) {
      breakevens.push(x1)
      continue
    }
    if (y2 === 0) {
      breakevens.push(x2)
      continue
    }
    if (y1 > 0 && y2 < 0) {
      const t = y1 / (y1 - y2)
      breakevens.push(x1 + t * (x2 - x1))
      continue
    }
    if (y1 < 0 && y2 > 0) {
      const t = y1 / (y1 - y2)
      breakevens.push(x1 + t * (x2 - x1))
      continue
    }
  }

  const unique = Array.from(new Set(breakevens.map((v) => Number(v.toFixed(4)))))
  return unique.sort((a, b) => a - b)
}

export type PayoffChartProps = {
  legs: PayoffLeg[]
  spotHint?: number
}

export function PayoffChart({ legs, spotHint }: PayoffChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  const points = useMemo(() => computeSeriesPoints(legs, spotHint), [legs, spotHint])
  const breakevens = useMemo(() => findBreakevens(points), [points])

  useEffect(() => {
    if (!chartRef.current) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    const chart = chartInstance.current

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: 50,
        right: 20,
        top: 30,
        bottom: 40,
      },
      xAxis: {
        type: 'value',
        name: 'Stock Price',
        nameLocation: 'middle',
        nameGap: 28,
      },
      yAxis: {
        type: 'value',
        name: 'P/L',
        nameLocation: 'middle',
        nameGap: 40,
      },
      series: [
        {
          type: 'line',
          showSymbol: false,
          data: points,
          markLine: {
            symbol: 'none',
            label: {
              show: true,
              formatter: 'BE',
              position: 'insideEndTop',
            },
            data: breakevens.map((x) => ({ xAxis: x })),
          },
        } as unknown as echarts.SeriesOption,
      ],
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [breakevens, points])

  return (
    <GlassPanel variant="subtle" className="payoff-chart" data-testid="payoff-chart">
      <div className="payoff-chart-header">
        <h4>Payoff</h4>
        <p className="subtitle">At-expiration payoff (premium not included).</p>
      </div>
      <div className="payoff-chart-canvas" ref={chartRef} />
    </GlassPanel>
  )
}
