import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { calculateCallPrice, calculateGreeks } from '../../../utils/blackScholes'
import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import './TimeDecayDemo.css'

type Moneyness = 'atm' | 'itm' | 'otm'

type Inputs = {
  spot: number
  rate: number
  volatility: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return '0'
  return value.toFixed(digits)
}

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return '0.00'
  return value.toFixed(2)
}

function toPath(points: Array<[number, number]>): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return `M ${first[0]},${first[1]} ` + rest.map(([x, y]) => `L ${x},${y}`).join(' ')
}

function scaleSeries(values: number[], width: number, height: number): Array<[number, number]> {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / span) * height
    return [x, y]
  })
}

export function TimeDecayDemo() {
  const { language } = useI18n()

  const inputs: Inputs = { spot: 100, rate: 0.05, volatility: 0.2 }
  const [time, setTime] = useState(1)
  const [moneyness, setMoneyness] = useState<Moneyness>('atm')

  const strike = useMemo(() => {
    if (moneyness === 'itm') return inputs.spot * 0.9
    if (moneyness === 'otm') return inputs.spot * 1.1
    return inputs.spot
  }, [inputs.spot, moneyness])

  const price = useMemo(
    () => calculateCallPrice(inputs.spot, strike, inputs.rate, inputs.volatility, time),
    [inputs.rate, inputs.spot, inputs.volatility, strike, time],
  )

  const theta = useMemo(
    () => calculateGreeks('call', inputs.spot, strike, inputs.rate, inputs.volatility, time).theta,
    [inputs.rate, inputs.spot, inputs.volatility, strike, time],
  )

  const curves = useMemo(() => {
    const n = 60
    const times: number[] = []
    const prices: number[] = []
    const thetas: number[] = []

    for (let i = 0; i < n; i += 1) {
      const t = (i / (n - 1)) * 1.0
      const p = calculateCallPrice(inputs.spot, strike, inputs.rate, inputs.volatility, t)
      const th = calculateGreeks('call', inputs.spot, strike, inputs.rate, inputs.volatility, t).theta
      times.push(t)
      prices.push(p)
      thetas.push(th)
    }

    return { times, prices, thetas }
  }, [inputs.rate, inputs.spot, inputs.volatility, strike])

  const labels = {
    title: language === 'zh' ? '时间衰减演示' : 'Time Decay Demo',
    subtitle:
      language === 'zh'
        ? '拖动时间到期，观察期权价格与 Theta 的变化。'
        : 'Drag time to expiry to see option price and Theta change.',
    time: language === 'zh' ? 'T (years)' : 'T (years)',
    atm: 'ATM',
    itm: 'ITM',
    otm: 'OTM',
    price: language === 'zh' ? '价格' : 'Price',
    theta: language === 'zh' ? 'Theta (per year)' : 'Theta (per year)',
  }

  const width = 320
  const height = 120
  const priceLine = toPath(scaleSeries(curves.prices, width, height))
  const thetaLine = toPath(scaleSeries(curves.thetas, width, height))

  return (
    <GlassPanel variant="subtle" className="time-decay" data-testid="time-decay-demo">
      <header className="time-decay-header">
        <div>
          <h3>{labels.title}</h3>
          <p className="subtitle">{labels.subtitle}</p>
        </div>
      </header>

      <div className="time-decay-controls">
        <div className="moneyness" aria-label="Moneyness">
          <button
            type="button"
            data-testid="moneyness-atm"
            className={moneyness === 'atm' ? 'active' : ''}
            onClick={() => setMoneyness('atm')}
          >
            {labels.atm}
          </button>
          <button
            type="button"
            data-testid="moneyness-itm"
            className={moneyness === 'itm' ? 'active' : ''}
            onClick={() => setMoneyness('itm')}
          >
            {labels.itm}
          </button>
          <button
            type="button"
            data-testid="moneyness-otm"
            className={moneyness === 'otm' ? 'active' : ''}
            onClick={() => setMoneyness('otm')}
          >
            {labels.otm}
          </button>
        </div>

        <div className="time-slider">
          <label htmlFor="time">{labels.time}</label>
          <input
            id="time"
            data-testid="time-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={time}
            onChange={(e) => setTime(clamp(Number(e.target.value), 0, 1))}
          />
          <div className="time-value" data-testid="time-value">
            {formatNumber(time, 2)}
          </div>
        </div>
      </div>

      <div className="time-decay-metrics">
        <div className="metric">
          <div className="label">{labels.price}</div>
          <div data-testid="time-decay-price">
            {import.meta.env.MODE === 'test' ? (
              <div className="value">{formatPrice(price)}</div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={price}
                  className="value"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatPrice(price)}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
        <div className="metric">
          <div className="label">{labels.theta}</div>
          <div data-testid="time-decay-theta">
            {import.meta.env.MODE === 'test' ? (
              <div className="value">{formatNumber(theta, 4)}</div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={theta}
                  className="value"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatNumber(theta, 4)}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
        <div className="metric">
          <div className="label">K</div>
          <div data-testid="time-decay-strike">
            {import.meta.env.MODE === 'test' ? (
              <div className="value">{formatNumber(strike, 2)}</div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={strike}
                  className="value"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatNumber(strike, 2)}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <div className="time-decay-charts" aria-label="Curves">
        <div className="chart" data-testid="price-curve">
          <div className="chart-title">{labels.price}</div>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <motion.path
              className="line"
              d={priceLine}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
        </div>
        <div className="chart" data-testid="theta-curve">
          <div className="chart-title">{labels.theta}</div>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <motion.path
              className="line"
              d={thetaLine}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
        </div>
      </div>
    </GlassPanel>
  )
}
