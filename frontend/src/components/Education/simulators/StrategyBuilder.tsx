import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

import { calculateGreeks } from '../../../utils/blackScholes'
import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { PayoffChart, type PayoffLeg } from '../charts'
import { slideUp } from '../../../lib/animations'
import type { OptionType } from '../../../utils/payoff'
import './StrategyBuilder.css'

type Leg = {
  id: string
  type: OptionType
  side: 'buy' | 'sell'
  quantity: number
  strike: number
}

type GlobalInputs = {
  spot: number
  rate: number
  volatility: number
  time: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function sign(side: Leg['side']): number {
  return side === 'buy' ? 1 : -1
}

function isBullCallSpread(legs: Leg[]): boolean {
  if (legs.length !== 2) return false
  const [a, b] = legs

  if (a.type !== 'call' || b.type !== 'call') return false
  if (a.quantity !== b.quantity) return false

  const buy = a.side === 'buy' ? a : b.side === 'buy' ? b : null
  const sell = a.side === 'sell' ? a : b.side === 'sell' ? b : null
  if (!buy || !sell) return false

  return buy.strike < sell.strike
}

function getStrategyName(language: string, legs: Leg[]): string {
  if (isBullCallSpread(legs)) return language === 'zh' ? '牛市看涨价差' : 'Bull Call Spread'
  if (legs.length === 1) return language === 'zh' ? '单腿' : 'Single leg'
  return language === 'zh' ? '自定义组合' : 'Custom strategy'
}

function toPayoffLeg(leg: Leg): PayoffLeg {
  return { type: leg.type, side: leg.side, quantity: leg.quantity, strike: leg.strike }
}

function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return '0'
  return value.toFixed(digits)
}

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `leg_${idCounter}`
}

export function StrategyBuilder() {
  const { language } = useI18n()
  const shouldReduceMotion = useReducedMotion()

  const [inputs, setInputs] = useState<GlobalInputs>({
    spot: 100,
    rate: 0.05,
    volatility: 0.2,
    time: 1,
  })

  const [legs, setLegs] = useState<Leg[]>([
    {
      id: nextId(),
      type: 'call',
      side: 'buy',
      quantity: 1,
      strike: 100,
    },
  ])

  const strategyName = useMemo(() => getStrategyName(language, legs), [language, legs])

  const combinedGreeks = useMemo(() => {
    const totals = { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 }

    legs.forEach((leg) => {
      const greeks = calculateGreeks(leg.type, inputs.spot, leg.strike, inputs.rate, inputs.volatility, inputs.time)
      const multiplier = sign(leg.side) * leg.quantity
      totals.delta += multiplier * greeks.delta
      totals.gamma += multiplier * greeks.gamma
      totals.theta += multiplier * greeks.theta
      totals.vega += multiplier * greeks.vega
      totals.rho += multiplier * greeks.rho
    })

    return totals
  }, [inputs.rate, inputs.spot, inputs.time, inputs.volatility, legs])

  const payoffLegs = useMemo(() => legs.map(toPayoffLeg), [legs])

  const labels = {
    title: language === 'zh' ? '策略构建器' : 'Strategy Builder',
    subtitle:
      language === 'zh'
        ? '添加多腿组合，查看组合 Greeks 与到期盈亏图。'
        : 'Add legs to see combined Greeks and expiration payoff.',
    add: language === 'zh' ? '添加一腿' : 'Add leg',
    remove: language === 'zh' ? '移除' : 'Remove',
    type: language === 'zh' ? '类型' : 'Type',
    side: language === 'zh' ? '方向' : 'Side',
    qty: language === 'zh' ? '数量' : 'Qty',
    strike: language === 'zh' ? '行权价' : 'Strike',
    buy: language === 'zh' ? '买入' : 'Buy',
    sell: language === 'zh' ? '卖出' : 'Sell',
    call: language === 'zh' ? '看涨' : 'Call',
    put: language === 'zh' ? '看跌' : 'Put',
    spot: language === 'zh' ? 'S' : 'S',
    rate: language === 'zh' ? 'r' : 'r',
    vol: language === 'zh' ? 'sigma' : 'sigma',
    time: language === 'zh' ? 'T' : 'T',
    greeks: language === 'zh' ? '组合 Greeks' : 'Combined Greeks',
  }

  return (
    <GlassPanel variant="subtle" className="strategy-builder" data-testid="strategy-builder">
      <header className="strategy-builder-header">
        <div>
          <h3>{labels.title}</h3>
          <p className="subtitle">{labels.subtitle}</p>
        </div>
        <div className="strategy-name" data-testid="strategy-name">
          {strategyName}
        </div>
      </header>

      <div className="strategy-inputs" aria-label="Global inputs">
        <div className="input">
          <label htmlFor="sb-spot">{labels.spot}</label>
          <input
            id="sb-spot"
            data-testid="sb-spot"
            type="number"
            min={0}
            max={200}
            step={1}
            value={inputs.spot}
            onChange={(e) => setInputs((p) => ({ ...p, spot: clamp(Number(e.target.value), 0, 200) }))}
          />
        </div>
        <div className="input">
          <label htmlFor="sb-rate">{labels.rate}</label>
          <input
            id="sb-rate"
            data-testid="sb-rate"
            type="number"
            min={0}
            max={0.2}
            step={0.001}
            value={inputs.rate}
            onChange={(e) => setInputs((p) => ({ ...p, rate: clamp(Number(e.target.value), 0, 0.2) }))}
          />
        </div>
        <div className="input">
          <label htmlFor="sb-vol">{labels.vol}</label>
          <input
            id="sb-vol"
            data-testid="sb-vol"
            type="number"
            min={0}
            max={2}
            step={0.01}
            value={inputs.volatility}
            onChange={(e) => setInputs((p) => ({ ...p, volatility: clamp(Number(e.target.value), 0, 2) }))}
          />
        </div>
        <div className="input">
          <label htmlFor="sb-time">{labels.time}</label>
          <input
            id="sb-time"
            data-testid="sb-time"
            type="number"
            min={0}
            max={2}
            step={0.01}
            value={inputs.time}
            onChange={(e) => setInputs((p) => ({ ...p, time: clamp(Number(e.target.value), 0, 2) }))}
          />
        </div>
      </div>

      <div className="legs" aria-label="Legs">
        <div className="legs-header">
          <h4>Legs</h4>
          <button
            type="button"
            data-testid="add-leg"
            className="add-leg"
            onClick={() =>
              setLegs((prev) => [
                ...prev,
                {
                  id: nextId(),
                  type: 'call',
                  side: 'buy',
                  quantity: 1,
                  strike: 110,
                },
              ])
            }
          >
            {labels.add}
          </button>
        </div>

        <div className="legs-table" data-testid="legs-table">
          <div className="legs-row legs-head" aria-hidden="true">
            <div>{labels.side}</div>
            <div>{labels.type}</div>
            <div>{labels.qty}</div>
            <div>{labels.strike}</div>
            <div />
          </div>

          {import.meta.env.MODE === 'test' ? (
            legs.map((leg) => (
              <div
                key={leg.id}
                className="legs-row"
                data-testid="leg-row"
                data-leg-id={leg.id}
              >
                <div>
                  <select
                    data-testid={`leg-side-${leg.id}`}
                    value={leg.side}
                    onChange={(e) =>
                      setLegs((prev) =>
                        prev.map((l) => (l.id === leg.id ? { ...l, side: e.target.value as Leg['side'] } : l)),
                      )
                    }
                  >
                    <option value="buy">{labels.buy}</option>
                    <option value="sell">{labels.sell}</option>
                  </select>
                </div>
                <div>
                  <select
                    data-testid={`leg-type-${leg.id}`}
                    value={leg.type}
                    onChange={(e) =>
                      setLegs((prev) =>
                        prev.map((l) => (l.id === leg.id ? { ...l, type: e.target.value as OptionType } : l)),
                      )
                    }
                  >
                    <option value="call">{labels.call}</option>
                    <option value="put">{labels.put}</option>
                  </select>
                </div>
                <div>
                  <input
                    data-testid={`leg-qty-${leg.id}`}
                    type="number"
                    min={1}
                    step={1}
                    value={leg.quantity}
                    onChange={(e) =>
                      setLegs((prev) =>
                        prev.map((l) =>
                          l.id === leg.id ? { ...l, quantity: clamp(Number(e.target.value), 1, 100) } : l,
                        ),
                      )
                    }
                  />
                </div>
                <div>
                  <input
                    data-testid={`leg-strike-${leg.id}`}
                    type="number"
                    min={0}
                    step={1}
                    value={leg.strike}
                    onChange={(e) =>
                      setLegs((prev) =>
                        prev.map((l) => (l.id === leg.id ? { ...l, strike: clamp(Number(e.target.value), 0, 1000) } : l)),
                      )
                    }
                  />
                </div>
                <div className="legs-actions">
                  <button
                    type="button"
                    data-testid="remove-leg"
                    className="remove-leg"
                    onClick={() => setLegs((prev) => prev.filter((l) => l.id !== leg.id))}
                  >
                    {labels.remove}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {legs.map((leg) => (
                <motion.div
                  key={leg.id}
                  layout={!shouldReduceMotion}
                  className="legs-row"
                  data-testid="leg-row"
                  data-leg-id={leg.id}
                  variants={shouldReduceMotion ? undefined : slideUp}
                  initial="hidden"
                  animate="show"
                  exit={import.meta.env.MODE === 'test' || shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  <div>
                    <select
                      data-testid={`leg-side-${leg.id}`}
                      value={leg.side}
                      onChange={(e) =>
                        setLegs((prev) =>
                          prev.map((l) => (l.id === leg.id ? { ...l, side: e.target.value as Leg['side'] } : l)),
                        )
                      }
                    >
                      <option value="buy">{labels.buy}</option>
                      <option value="sell">{labels.sell}</option>
                    </select>
                  </div>
                  <div>
                    <select
                      data-testid={`leg-type-${leg.id}`}
                      value={leg.type}
                      onChange={(e) =>
                        setLegs((prev) =>
                          prev.map((l) => (l.id === leg.id ? { ...l, type: e.target.value as OptionType } : l)),
                        )
                      }
                    >
                      <option value="call">{labels.call}</option>
                      <option value="put">{labels.put}</option>
                    </select>
                  </div>
                  <div>
                    <input
                      data-testid={`leg-qty-${leg.id}`}
                      type="number"
                      min={1}
                      step={1}
                      value={leg.quantity}
                      onChange={(e) =>
                        setLegs((prev) =>
                          prev.map((l) =>
                            l.id === leg.id ? { ...l, quantity: clamp(Number(e.target.value), 1, 100) } : l,
                          ),
                        )
                      }
                    />
                  </div>
                  <div>
                    <input
                      data-testid={`leg-strike-${leg.id}`}
                      type="number"
                      min={0}
                      step={1}
                      value={leg.strike}
                      onChange={(e) =>
                        setLegs((prev) =>
                          prev.map((l) => (l.id === leg.id ? { ...l, strike: clamp(Number(e.target.value), 0, 1000) } : l)),
                        )
                      }
                    />
                  </div>
                  <div className="legs-actions">
                    <button
                      type="button"
                      data-testid="remove-leg"
                      className="remove-leg"
                      onClick={() => setLegs((prev) => prev.filter((l) => l.id !== leg.id))}
                    >
                      {labels.remove}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="strategy-greeks" aria-label="Combined greeks">
        <h4>{labels.greeks}</h4>
        <div className="greeks-grid" data-testid="combined-greeks">
          <div className="greek">
            <span>Delta</span>
            <span data-testid="combined-delta">{formatNumber(combinedGreeks.delta, 4)}</span>
          </div>
          <div className="greek">
            <span>Gamma</span>
            <span data-testid="combined-gamma">{formatNumber(combinedGreeks.gamma, 6)}</span>
          </div>
          <div className="greek">
            <span>Theta</span>
            <span data-testid="combined-theta">{formatNumber(combinedGreeks.theta, 4)}</span>
          </div>
          <div className="greek">
            <span>Vega</span>
            <span data-testid="combined-vega">{formatNumber(combinedGreeks.vega, 4)}</span>
          </div>
          <div className="greek">
            <span>Rho</span>
            <span data-testid="combined-rho">{formatNumber(combinedGreeks.rho, 4)}</span>
          </div>
        </div>
      </div>

      <PayoffChart legs={payoffLegs} spotHint={inputs.spot} />
    </GlassPanel>
  )
}
