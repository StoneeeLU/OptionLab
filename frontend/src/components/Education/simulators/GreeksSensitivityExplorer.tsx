import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { calculateGreeks } from '../../../utils/blackScholes'
import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { slideUp, stagger } from '../../../lib/animations'
import './GreeksSensitivityExplorer.css'

type OptionType = 'call' | 'put'

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

export function GreeksSensitivityExplorer() {
  const { language } = useI18n()
  const shouldReduceMotion = useReducedMotion()

  const [type, setType] = useState<OptionType>('call')
  const [inputs, setInputs] = useState<Inputs>({
    spot: 100,
    strike: 100,
    rate: 0.05,
    volatility: 0.2,
    time: 0.25,
  })
  
  // Debounced inputs for calculation
  const [debouncedInputs, setDebouncedInputs] = useState<Inputs>(inputs)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInputs(inputs)
    }, 100)
    return () => clearTimeout(handler)
  }, [inputs])

  const greeks = useMemo(() => {
    return calculateGreeks(
      type,
      debouncedInputs.spot,
      debouncedInputs.strike,
      debouncedInputs.rate,
      debouncedInputs.volatility,
      debouncedInputs.time
    )
  }, [type, debouncedInputs])

  const labels = {
    title: language === 'zh' ? 'Greeks 敏感度分析' : 'Greeks Sensitivity Explorer',
    subtitle:
      language === 'zh'
        ? '调整参数以观察 Greeks 的动态变化。'
        : 'Adjust parameters to observe dynamic Greeks sensitivity.',
    spot: language === 'zh' ? '标的价格 (S)' : 'Spot (S)',
    strike: language === 'zh' ? '行权价 (K)' : 'Strike (K)',
    rate: language === 'zh' ? '无风险利率 (r)' : 'Rate (r)',
    volatility: language === 'zh' ? '波动率 (σ)' : 'Volatility (σ)',
    time: language === 'zh' ? '剩余时间 (t)' : 'Time (t)',
    call: language === 'zh' ? '看涨 (Call)' : 'Call',
    put: language === 'zh' ? '看跌 (Put)' : 'Put',
    delta: 'Delta (Δ)',
    gamma: 'Gamma (Γ)',
    theta: 'Theta (Θ)',
    vega: 'Vega (ν)',
    rho: 'Rho (ρ)',
  }

  const greekRows = [
    { id: 'delta', label: labels.delta, value: greeks.delta, min: -1, max: 1, digits: 4 },
    { id: 'gamma', label: labels.gamma, value: greeks.gamma, min: 0, max: 0.2, digits: 6 }, // Gamma can be small but spikes at ATM
    { id: 'theta', label: labels.theta, value: greeks.theta, min: -50, max: 0, digits: 4 }, // Theta is usually negative
    { id: 'vega', label: labels.vega, value: greeks.vega, min: 0, max: 50, digits: 4 },
    { id: 'rho', label: labels.rho, value: greeks.rho, min: -50, max: 50, digits: 4 },
  ]

  // Auto-scale bars based on typical ranges or dynamic max? 
  // For simplicity and visualization, we'll use a fixed conceptual range or simple absolute ratio.
  // Delta is always -1 to 1.
  // Others can vary widely. Let's try to normalize visually.
  
  function getBarWidth(value: number, id: string): string {
    const absVal = Math.abs(value)
    let percent = 0
    
    switch(id) {
      case 'delta': percent = absVal; break; // 0 to 1
      case 'gamma': percent = absVal * 10; break; // 0 to 0.1 usually
      case 'theta': percent = absVal / 50; break; 
      case 'vega': percent = absVal / 50; break;
      case 'rho': percent = absVal / 50; break;
      default: percent = 0;
    }
    return `${clamp(percent, 0, 1) * 100}%`
  }

  function setField<K extends keyof Inputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <GlassPanel variant="subtle" className="greeks-explorer" data-testid="greeks-explorer">
      <header className="greeks-explorer-header">
        <div>
          <h3>{labels.title}</h3>
          <p className="subtitle">{labels.subtitle}</p>
        </div>
        <div className="type-toggle">
            <button 
                data-testid="toggle-type"
                className={`toggle-btn ${type === 'call' ? 'active' : ''}`}
                onClick={() => setType(type === 'call' ? 'put' : 'call')}
            >
                {type === 'call' ? labels.call : labels.put}
            </button>
        </div>
      </header>

      <div className="greeks-explorer-grid">
        <motion.div
          className="greeks-explorer-inputs"
          variants={stagger}
          initial={shouldReduceMotion ? 'show' : 'hidden'}
          animate="show"
        >
             {/* Spot */}
            <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
                <label htmlFor="ge-spot">{labels.spot}</label>
                <input
                    id="ge-spot"
                    data-testid="input-spot"
                    type="range"
                    aria-label={labels.spot}
                    min={1} max={500} step={1}
                    value={inputs.spot}
                    onChange={(e) => setField('spot', Number(e.target.value))}
                />
                <input
                    type="number"
                    aria-label={`${labels.spot} value`}
                    min={1} max={500} step={1}
                    value={inputs.spot}
                    onChange={(e) => setField('spot', clamp(Number(e.target.value), 1, 500))}
                />
            </motion.div>

            {/* Strike */}
            <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
                <label htmlFor="ge-strike">{labels.strike}</label>
                <input
                    id="ge-strike"
                    data-testid="input-strike"
                    type="range"
                    aria-label={labels.strike}
                    min={1} max={500} step={1}
                    value={inputs.strike}
                    onChange={(e) => setField('strike', Number(e.target.value))}
                />
                <input
                    type="number"
                    aria-label={`${labels.strike} value`}
                    min={1} max={500} step={1}
                    value={inputs.strike}
                    onChange={(e) => setField('strike', clamp(Number(e.target.value), 1, 500))}
                />
            </motion.div>

             {/* Volatility */}
             <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
                <label htmlFor="ge-vol">{labels.volatility}</label>
                 <input
                     id="ge-vol"
                     data-testid="input-volatility"
                     type="range"
                     aria-label={labels.volatility}
                     min={0.01} max={1.5} step={0.01}
                     value={inputs.volatility}
                     onChange={(e) => setField('volatility', Number(e.target.value))}
                 />
                <input
                    type="number"
                    aria-label={`${labels.volatility} value`}
                    min={0.01} max={1.5} step={0.01}
                    value={inputs.volatility}
                    onChange={(e) => setField('volatility', clamp(Number(e.target.value), 0.01, 1.5))}
                />
            </motion.div>

            {/* Time */}
            <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
                <label htmlFor="ge-time">{labels.time}</label>
                <input
                    id="ge-time"
                    data-testid="input-time"
                    type="range"
                    aria-label={labels.time}
                    min={0.01} max={2} step={0.01}
                    value={inputs.time}
                    onChange={(e) => setField('time', Number(e.target.value))}
                />
                <input
                    type="number"
                    aria-label={`${labels.time} value`}
                    min={0.01} max={2} step={0.01}
                    value={inputs.time}
                    onChange={(e) => setField('time', clamp(Number(e.target.value), 0.01, 2))}
                />
            </motion.div>

             {/* Rate */}
             <motion.div className="input-row" variants={shouldReduceMotion ? undefined : slideUp}>
                <label htmlFor="ge-rate">{labels.rate}</label>
                <input
                    id="ge-rate"
                    data-testid="input-rate"
                    type="range"
                    aria-label={labels.rate}
                    min={0} max={0.2} step={0.001}
                    value={inputs.rate}
                    onChange={(e) => setField('rate', Number(e.target.value))}
                />
                <input
                    type="number"
                    aria-label={`${labels.rate} value`}
                    min={0} max={0.2} step={0.001}
                    value={inputs.rate}
                    onChange={(e) => setField('rate', clamp(Number(e.target.value), 0, 0.2))}
                />
            </motion.div>
        </motion.div>

        <div className="greeks-explorer-results">
            {greekRows.map((row) => (
                <motion.div 
                    key={row.id} 
                    className="greek-row" 
                    data-testid={`greek-${row.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="greek-label">{row.label}</div>
                    <div className="greek-bar-container">
                        <motion.div 
                            className={`greek-bar-fill ${row.value < 0 ? 'negative' : 'positive'}`}
                            animate={{ width: getBarWidth(row.value, row.id) }}
                            transition={{ type: "spring", stiffness: 100 }}
                        />
                    </div>
                    <div className="greek-value" data-testid={`greek-value-${row.id}`}>
                        {formatNumber(row.value, row.digits)}
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </GlassPanel>
  )
}
