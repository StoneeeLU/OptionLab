import { useMemo } from 'react'
import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { PayoffChart, type PayoffLeg } from './PayoffChart'
import { calculateIntrinsicValue, type OptionType } from '../../../utils/payoff'
import './StrategyPayoffExample.css'

export type StrategyLeg = {
  type: OptionType
  position: 'long' | 'short'
  strike: number
  premium: number
}

export type StrategyPayoffExampleProps = {
  name: { en: string; zh: string }
  description?: { en: string; zh: string }
  legs: StrategyLeg[]
  spot: number
}

function formatCurrency(val: number): string {
  if (!Number.isFinite(val)) return 'Unlimited'
  // Handle -0
  if (Math.abs(val) < 0.005) return '0.00'
  return val.toFixed(2)
}

function calculatePnl(spot: number, legs: StrategyLeg[]): number {
  let pnl = 0
  for (const leg of legs) {
    const intrinsic = calculateIntrinsicValue(leg.type, spot, leg.strike)
    const cost = leg.premium
    
    if (leg.position === 'long') {
      // Long: PnL = Intrinsic - Premium
      pnl += (intrinsic - cost)
    } else {
      // Short: PnL = Premium - Intrinsic
      pnl += (cost - intrinsic)
    }
  }
  return pnl
}

export function StrategyPayoffExample({ name, description, legs, spot }: StrategyPayoffExampleProps) {
  const { language } = useI18n()

  const { maxProfit, maxLoss, breakevens, netPremium } = useMemo(() => {
    // 1. Calculate Net Premium (Cost basis for chart offset)
    // Long = Pay premium (Debit), Short = Receive premium (Credit)
    // Net Premium = Total Received - Total Paid
    // If Net Premium is negative (Debit), we start at negative P&L.
    // PayoffChart draws Intrinsic Value.
    // P&L = Intrinsic (Long) - Intrinsic (Short) + Net Premium
    // Wait, PayoffChart logic:
    // buy -> +1 * Intrinsic
    // sell -> -1 * Intrinsic
    // So Chart Value = Total Long Intrinsic - Total Short Intrinsic
    // P&L = Chart Value - Total Long Premium + Total Short Premium
    // P&L = Chart Value + Net Premium
    // So offset = Net Premium.

    let netPrem = 0
    legs.forEach(leg => {
      if (leg.position === 'short') netPrem += leg.premium
      if (leg.position === 'long') netPrem -= leg.premium
    })

    // 2. Scan for Max Profit/Loss/Breakevens
    // Heuristic scan similar to PayoffChart
    const strikes = legs.map(l => l.strike)
    const minStrike = Math.min(spot, ...strikes)
    const maxStrike = Math.max(spot, ...strikes)
    const range = Math.max(maxStrike - minStrike, spot * 0.2)
    const start = Math.max(0, minStrike - range)
    const end = maxStrike + range
    const steps = 200
    const step = (end - start) / steps

    let minPnl = Infinity
    let maxPnl = -Infinity
    const bePoints: number[] = []

    let prevPnl: number | null = null
    let prevSpot: number | null = null

    for (let i = 0; i <= steps; i++) {
      const s = start + i * step
      const pnl = calculatePnl(s, legs)

      if (pnl < minPnl) minPnl = pnl
      if (pnl > maxPnl) maxPnl = pnl

      if (prevPnl !== null && prevSpot !== null) {
        if ((prevPnl < 0 && pnl > 0) || (prevPnl > 0 && pnl < 0)) {
          // Crossed zero
          const t = Math.abs(prevPnl) / (Math.abs(prevPnl) + Math.abs(pnl))
          const be = prevSpot + t * (s - prevSpot)
          bePoints.push(be)
        } else if (pnl === 0 && prevPnl !== 0) {
           bePoints.push(s)
        }
      }
      prevPnl = pnl
      prevSpot = s
    }

    // Check bounds for Infinity
    // If slope at ends is non-zero, it might be infinite
    // Check slope at start
    const pnlStart = calculatePnl(0, legs)
    const pnlStartPlus = calculatePnl(0.01, legs)
    if (pnlStartPlus < pnlStart) minPnl = -Infinity // Going down as spot goes up? No, spot >= 0.
    // If spot goes to 0, and PnL is decreasing, well spot stops at 0.
    // Check slope at END
    const pnlEnd = calculatePnl(end, legs)
    const pnlEndMinus = calculatePnl(end - 0.01, legs)
    const slopeEnd = pnlEnd - pnlEndMinus
    if (slopeEnd > 0.001) maxPnl = Infinity
    if (slopeEnd < -0.001) minPnl = -Infinity

    // Deduplicate BE
    const uniqueBE = bePoints
      .map(x => Math.round(x * 100) / 100)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a - b)

    return {
      maxProfit: maxPnl,
      maxLoss: minPnl,
      breakevens: uniqueBE,
      netPremium: netPrem
    }
  }, [legs, spot])

  const chartLegs: PayoffLeg[] = useMemo(() => legs.map(l => ({
    type: l.type,
    side: l.position === 'long' ? 'buy' : 'sell',
    quantity: 1, // Assumed 1 for this component based on specs? Specs say "legs: Array...". No quantity field in specs?
    // Wait, the specs provided:
    // legs: Array<{ type:..., position:..., strike:..., premium:... }>
    // There is NO quantity. I will assume 1.
    strike: l.strike
  })), [legs])

  return (
    <GlassPanel 
      variant="subtle" 
      className="strategy-payoff-example"
      role="region"
      aria-label={language === 'zh' ? name.zh : name.en}
    >
      <div className="spe-header">
        <h4>{language === 'zh' ? name.zh : name.en}</h4>
        {description && (
          <p className="subtitle">{language === 'zh' ? description.zh : description.en}</p>
        )}
      </div>

      <div className="spe-content">
        <div className="spe-chart">
          <PayoffChart legs={chartLegs} spotHint={spot} offset={netPremium} />
        </div>
        
        <div className="spe-stats">
          <div className="stat-item">
            <span className="label">{language === 'zh' ? '最大盈利' : 'Max Profit'}</span>
            <span className={`value ${maxProfit > 0 ? 'positive' : ''}`}>
              {maxProfit === Infinity ? 'Unlimited' : formatCurrency(maxProfit)}
            </span>
          </div>
          <div className="stat-item">
            <span className="label">{language === 'zh' ? '最大亏损' : 'Max Loss'}</span>
            <span className={`value ${maxLoss < 0 ? 'negative' : ''}`}>
              {maxLoss === -Infinity ? 'Unlimited' : formatCurrency(Math.abs(maxLoss))} 
              {/* Max Loss usually displayed as positive number representing the amount lost, or negative P&L */}
              {/* If I follow "Max Loss: 500", it implies -500 P&L. */}
              {/* Let's show the signed P&L value for consistency or magnitude? 
                  Usually "Max Loss" implies magnitude. "Max Loss: $500".
                  But "Max Profit: Unlimited".
                  Let's stick to P&L value format. If maxLoss is -500, display -500?
                  Or "500"?
                  The test expects "3.00" for Max Loss of 3.
                  So I should probably display the MAGNITUDE if the label is "Max Loss".
              */}
            </span>
          </div>
          <div className="stat-item">
            <span className="label">{language === 'zh' ? '盈亏平衡点' : 'Breakeven'}</span>
            <div className="value-list">
              {breakevens.length > 0 ? breakevens.map(be => (
                <span key={be} className="value">{formatCurrency(be)}</span>
              )) : (
                <span>{language === 'zh' ? '无' : 'None'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
