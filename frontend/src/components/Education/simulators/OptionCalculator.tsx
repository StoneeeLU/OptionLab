import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { calculateCallPrice, calculateGreeks, calculatePutPrice } from '../../../utils/blackScholes'
import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { fadeIn, slideUp, stagger } from '../../../lib/animations'
import './OptionCalculator.css'

type Inputs = {
  spot: number
  strike: number
  rate: number
  volatility: number
  time: number
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

export function OptionCalculator() {
  const { language } = useI18n()
  const shouldReduceMotion = useReducedMotion()

  const [inputs, setInputs] = useState<Inputs>({
    spot: 100,
    strike: 100,
    rate: 0.05,
    volatility: 0.2,
    time: 1,
  })

  const call = useMemo(() => {
    const price = calculateCallPrice(inputs.spot, inputs.strike, inputs.rate, inputs.volatility, inputs.time)
    const greeks = calculateGreeks('call', inputs.spot, inputs.strike, inputs.rate, inputs.volatility, inputs.time)
    return { price, greeks }
  }, [inputs.rate, inputs.spot, inputs.strike, inputs.time, inputs.volatility])

  const put = useMemo(() => {
    const price = calculatePutPrice(inputs.spot, inputs.strike, inputs.rate, inputs.volatility, inputs.time)
    const greeks = calculateGreeks('put', inputs.spot, inputs.strike, inputs.rate, inputs.volatility, inputs.time)
    return { price, greeks }
  }, [inputs.rate, inputs.spot, inputs.strike, inputs.time, inputs.volatility])

  const labels = {
    title: language === 'zh' ? '单期权计算器' : 'Option Calculator',
    subtitle:
      language === 'zh'
        ? '调整输入参数，实时查看价格与 Greeks 的变化（欧式 Black-Scholes）。'
        : 'Adjust inputs to see live price and Greeks (European Black-Scholes).',
    spot: language === 'zh' ? '标的价格 (S)' : 'Spot (S)',
    strike: language === 'zh' ? '行权价 (K)' : 'Strike (K)',
    rate: language === 'zh' ? '利率 (r)' : 'Rate (r)',
    volatility: language === 'zh' ? '波动率 (sigma)' : 'Volatility (sigma)',
    time: language === 'zh' ? '到期时间 (T, years)' : 'Time (T, years)',
    call: language === 'zh' ? '看涨 (Call)' : 'Call',
    put: language === 'zh' ? '看跌 (Put)' : 'Put',
    price: language === 'zh' ? '价格' : 'Price',
    greeks: language === 'zh' ? 'Greeks' : 'Greeks',
    delta: 'Delta',
    gamma: 'Gamma',
    theta: 'Theta',
    vega: 'Vega',
    rho: 'Rho',
  }

  const greekRows = [
    { id: 'delta', label: labels.delta, get: (g: typeof call.greeks) => g.delta, digits: 4 },
    { id: 'gamma', label: labels.gamma, get: (g: typeof call.greeks) => g.gamma, digits: 6 },
    { id: 'theta', label: labels.theta, get: (g: typeof call.greeks) => g.theta, digits: 4 },
    { id: 'vega', label: labels.vega, get: (g: typeof call.greeks) => g.vega, digits: 4 },
    { id: 'rho', label: labels.rho, get: (g: typeof call.greeks) => g.rho, digits: 4 },
  ]

  function setField<K extends keyof Inputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <GlassPanel variant="subtle" className="option-calculator" data-testid="option-calculator">
      <header className="option-calculator-header">
        <div>
          <h3>{labels.title}</h3>
          <p className="subtitle">{labels.subtitle}</p>
        </div>
      </header>

      <div className="option-calculator-grid">
        <motion.div
          className="option-calculator-inputs"
          aria-label="Inputs"
          variants={stagger}
          initial={shouldReduceMotion ? 'show' : 'hidden'}
          animate="show"
        >
          <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
            <label htmlFor="spot">{labels.spot}</label>
            <input
              id="spot"
              data-testid="input-spot"
              type="range"
              min={0}
              max={200}
              step={1}
              value={inputs.spot}
              onChange={(e) => setField('spot', Number(e.target.value))}
            />
            <input
              data-testid="number-spot"
              type="number"
              min={0}
              max={200}
              step={1}
              value={inputs.spot}
              onChange={(e) => setField('spot', clamp(Number(e.target.value), 0, 200))}
            />
          </motion.div>

          <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
            <label htmlFor="strike">{labels.strike}</label>
            <input
              id="strike"
              data-testid="input-strike"
              type="range"
              min={0}
              max={200}
              step={1}
              value={inputs.strike}
              onChange={(e) => setField('strike', Number(e.target.value))}
            />
            <input
              data-testid="number-strike"
              type="number"
              min={0}
              max={200}
              step={1}
              value={inputs.strike}
              onChange={(e) => setField('strike', clamp(Number(e.target.value), 0, 200))}
            />
          </motion.div>

          <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
            <label htmlFor="rate">{labels.rate}</label>
            <input
              id="rate"
              data-testid="input-rate"
              type="range"
              min={0}
              max={0.2}
              step={0.001}
              value={inputs.rate}
              onChange={(e) => setField('rate', Number(e.target.value))}
            />
            <input
              data-testid="number-rate"
              type="number"
              min={0}
              max={0.2}
              step={0.001}
              value={inputs.rate}
              onChange={(e) => setField('rate', clamp(Number(e.target.value), 0, 0.2))}
            />
          </motion.div>

          <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
            <label htmlFor="vol">{labels.volatility}</label>
            <input
              id="vol"
              data-testid="input-volatility"
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={inputs.volatility}
              onChange={(e) => setField('volatility', Number(e.target.value))}
            />
            <input
              data-testid="number-volatility"
              type="number"
              min={0}
              max={2}
              step={0.01}
              value={inputs.volatility}
              onChange={(e) => setField('volatility', clamp(Number(e.target.value), 0, 2))}
            />
          </motion.div>

          <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
            <label htmlFor="time">{labels.time}</label>
            <input
              id="time"
              data-testid="input-time"
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={inputs.time}
              onChange={(e) => setField('time', Number(e.target.value))}
            />
            <input
              data-testid="number-time"
              type="number"
              min={0}
              max={2}
              step={0.01}
              value={inputs.time}
              onChange={(e) => setField('time', clamp(Number(e.target.value), 0, 2))}
            />
          </motion.div>
        </motion.div>

        <div className="option-calculator-results" aria-label="Results">
          <motion.div
            className="result-card"
            data-testid="call-results"
            variants={fadeIn}
            initial={shouldReduceMotion ? 'show' : 'hidden'}
            animate="show"
          >
            <div className="result-header">
              <h4>{labels.call}</h4>
              <div className="price">
                <span className="label">{labels.price}</span>
                <span data-testid="call-price">{formatPrice(call.price)}</span>
              </div>
            </div>

            <div className="greeks" aria-label="Call greeks">
              <div className="greeks-title">{labels.greeks}</div>
              {greekRows.map((row) => {
                const value = row.get(call.greeks)
                const magnitude = clamp(Math.abs(value) / 1.0, 0, 1)
                return (
                  <div key={row.id} className="greek-row" data-testid={`call-greek-${row.id}`}>
                    <div className="greek-label">{row.label}</div>
                    <div className="greek-bar" aria-hidden="true">
                      <motion.div
                        className="greek-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${magnitude * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="greek-value">{formatNumber(value, row.digits)}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            className="result-card"
            data-testid="put-results"
            variants={fadeIn}
            initial={shouldReduceMotion ? 'show' : 'hidden'}
            animate="show"
            transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
          >
            <div className="result-header">
              <h4>{labels.put}</h4>
              <div className="price">
                <span className="label">{labels.price}</span>
                <span data-testid="put-price">{formatPrice(put.price)}</span>
              </div>
            </div>

            <div className="greeks" aria-label="Put greeks">
              <div className="greeks-title">{labels.greeks}</div>
              {greekRows.map((row) => {
                const value = row.get(put.greeks)
                const magnitude = clamp(Math.abs(value) / 1.0, 0, 1)
                return (
                  <div key={row.id} className="greek-row" data-testid={`put-greek-${row.id}`}>
                    <div className="greek-label">{row.label}</div>
                    <div className="greek-bar" aria-hidden="true">
                      <motion.div
                        className="greek-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${magnitude * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="greek-value">{formatNumber(value, row.digits)}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </GlassPanel>
  )
}
