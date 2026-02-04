import { Link } from 'react-router-dom'

import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { useEducationProgress } from '../../../hooks/useEducationProgress'

const CHAPTER_ID = 'greeks'

type GreekDetail = {
  id: string
  symbol: string
  en: {
    name: string
    definition: string
    formula: string
    range: string
    interpretation: string[]
    tradingTips: string[]
    workedExample: string
    realWorldApplication: string
  }
  zh: {
    name: string
    definition: string
    formula: string
    range: string
    interpretation: string[]
    tradingTips: string[]
    workedExample: string
    realWorldApplication: string
  }
}

const GREEKS: GreekDetail[] = [
  {
    id: 'delta',
    symbol: 'Δ',
    en: {
      name: 'Delta',
      definition: 'Measures how much the option price changes when the underlying stock moves $1.',
      formula: 'Δ = ∂V / ∂S',
      range: 'Call: 0 to +1 | Put: -1 to 0',
      interpretation: [
        'Delta 0.50 means if stock rises $1, option gains ~$0.50',
        'ATM options have Delta near ±0.50',
        'Deep ITM options approach Delta ±1.00 (move like stock)',
        'Deep OTM options approach Delta 0 (barely respond)',
        'Delta also approximates probability of expiring ITM',
      ],
      tradingTips: [
        'Use Delta to estimate directional exposure',
        'Delta-neutral strategies hedge directional risk',
        'Higher Delta = more aggressive directional bet',
      ],
      workedExample: 'If AAPL is at $150 and your call has Delta 0.65, a $2 move means you gain $130 (0.65 × $2 × 100).',
      realWorldApplication: 'Used for position sizing and managing directional exposure. A Delta of 0.65 means the option behaves like 65 shares of the underlying stock.',
    },
    zh: {
      name: 'Delta',
      definition: '衡量标的资产价格变动 $1 时，期权价格的变化量。',
      formula: 'Δ = ∂V / ∂S',
      range: 'Call: 0 到 +1 | Put: -1 到 0',
      interpretation: [
        'Delta 0.50 意味着股价涨 $1，期权涨约 $0.50',
        'ATM 期权的 Delta 接近 ±0.50',
        '深度实值期权 Delta 趋近 ±1.00（走势类似股票）',
        '深度虚值期权 Delta 趋近 0（几乎不响应）',
        'Delta 也可近似看作期权到期时为实值的概率',
      ],
      tradingTips: [
        '用 Delta 估算方向性敞口',
        'Delta 中性策略可对冲方向风险',
        '更高的 Delta = 更激进的方向押注',
      ],
      workedExample: '如果 AAPL 股价为 $150，你持有一份 Delta 为 0.65 的认购期权。如果股价上涨 $2，你的收益约为 $130 (0.65 × $2 × 100)。',
      realWorldApplication: '用于仓位控制和管理方向性风险。0.65 的 Delta 意味着该期权的走势类似于持仓 65 股标的股票。',
    },
  },
  {
    id: 'gamma',
    symbol: 'Γ',
    en: {
      name: 'Gamma',
      definition: 'Measures how fast Delta changes when the underlying moves $1. It\'s the "acceleration" of option price.',
      formula: 'Γ = ∂Δ / ∂S = ∂²V / ∂S²',
      range: 'Always positive for long options',
      interpretation: [
        'High Gamma means Delta changes rapidly with price moves',
        'ATM options have highest Gamma (most sensitive)',
        'Gamma peaks near expiration for ATM options',
        'Long options: positive Gamma (benefits from moves)',
        'Short options: negative Gamma (hurts from moves)',
      ],
      tradingTips: [
        'High Gamma = position needs frequent rebalancing',
        'Gamma risk is biggest near expiration',
        'Scalpers love high Gamma; sellers fear it',
      ],
      workedExample: 'If an option has Delta 0.50 and Gamma 0.05, a $1 increase in the stock price will increase the Delta to 0.55.',
      realWorldApplication: 'Measures the "acceleration" of your position. High Gamma means your risk profile (Delta) changes rapidly, especially critical near expiration for At-The-Money options.',
    },
    zh: {
      name: 'Gamma',
      definition: '衡量标的变动 $1 时 Delta 的变化速度。是期权价格的"加速度"。',
      formula: 'Γ = ∂Δ / ∂S = ∂²V / ∂S²',
      range: '对于多头期权始终为正',
      interpretation: [
        '高 Gamma 意味着 Delta 随价格变化快',
        'ATM 期权 Gamma 最高（最敏感）',
        '临近到期时 ATM 期权的 Gamma 达到峰值',
        '多头期权：正 Gamma（从波动中获益）',
        '空头期权：负 Gamma（波动会带来损失）',
      ],
      tradingTips: [
        '高 Gamma = 仓位需要频繁调整',
        '临近到期时 Gamma 风险最大',
        '短线交易者喜欢高 Gamma；卖方则惧怕它',
      ],
      workedExample: '如果某期权的 Delta 为 0.50，Gamma 为 0.05。如果股价上涨 $1，Delta 将增加到 0.55。',
      realWorldApplication: '衡量仓位的“加速度”。高 Gamma 意味着你的风险敞口（Delta）变化非常快，在临近到期且处于平值（ATM）状态时尤为关键。',
    },
  },
  {
    id: 'theta',
    symbol: 'Θ',
    en: {
      name: 'Theta',
      definition: 'Measures how much value the option loses each day due to time passing. Also called "time decay".',
      formula: 'Θ = ∂V / ∂t',
      range: 'Usually negative for long options',
      interpretation: [
        'Theta -0.05 means option loses $0.05 per day',
        'ATM options have highest Theta (most time value)',
        'Theta accelerates as expiration approaches',
        'Weekends count: Friday Theta includes 3 days',
        'Deep ITM/OTM options have lower Theta',
      ],
      tradingTips: [
        'Option buyers fight Theta every day',
        'Option sellers profit from Theta decay',
        'Avoid holding long options through weekends if Theta is high',
      ],
      workedExample: 'If an option is priced at $3.00 with a Theta of -0.05, and all other factors remain constant, the option will be worth $2.95 after one day.',
      realWorldApplication: 'Central to income-generating strategies. Sellers look for high Theta decay to profit from time passing, while buyers must ensure their directional move happens fast enough to offset decay.',
    },
    zh: {
      name: 'Theta',
      definition: '衡量期权每天因时间流逝而损失的价值。又称"时间衰减"。',
      formula: 'Θ = ∂V / ∂t',
      range: '对于多头期权通常为负',
      interpretation: [
        'Theta -0.05 意味着期权每天损失 $0.05',
        'ATM 期权 Theta 最高（时间价值最多）',
        '临近到期时 Theta 加速衰减',
        '周末也算：周五的 Theta 包含 3 天',
        '深度实值/虚值期权 Theta 较低',
      ],
      tradingTips: [
        '期权买方每天都在与 Theta 抗争',
        '期权卖方从 Theta 衰减中获利',
        'Theta 高时避免持仓过周末',
      ],
      workedExample: '如果期权价格为 $3.00，Theta 为 -0.05。在其他因素不变的情况下，一天后该期权的价值将变为 $2.95。',
      realWorldApplication: '收益型策略的核心。卖方利用高 Theta 衰减通过时间流逝获利，而买方必须确保方向性预测能快速兑现，以抵消时间价值的流失。',
    },
  },
  {
    id: 'vega',
    symbol: 'ν',
    en: {
      name: 'Vega',
      definition: 'Measures how much the option price changes when implied volatility moves 1%.',
      formula: 'ν = ∂V / ∂σ',
      range: 'Always positive for long options',
      interpretation: [
        'Vega 0.10 means if IV rises 1%, option gains $0.10',
        'Longer-dated options have higher Vega',
        'ATM options have highest Vega',
        'Vega decreases as expiration approaches',
        'IV crush after earnings destroys option value via Vega',
      ],
      tradingTips: [
        'Buy options when IV is low (cheap Vega)',
        'Sell options when IV is high (expensive Vega)',
        'Straddles/strangles are Vega plays',
      ],
      workedExample: 'If an option is priced at $5.00 with a Vega of 0.20, and the implied volatility rises by 1%, the option price will increase to $5.20.',
      realWorldApplication: 'Vital for trading volatility. Used to play earnings events (where IV often drops sharply after the announcement) or to hedge against market uncertainty.',
    },
    zh: {
      name: 'Vega',
      definition: '衡量隐含波动率变动 1% 时期权价格的变化。',
      formula: 'ν = ∂V / ∂σ',
      range: '对于多头期权始终为正',
      interpretation: [
        'Vega 0.10 意味着 IV 涨 1%，期权涨 $0.10',
        '长期期权 Vega 更高',
        'ATM 期权 Vega 最高',
        '临近到期时 Vega 降低',
        '财报后 IV 骤降会通过 Vega 摧毁期权价值',
      ],
      tradingTips: [
        'IV 低时买入期权（便宜的 Vega）',
        'IV 高时卖出期权（昂贵的 Vega）',
        '跨式/宽跨式是 Vega 策略',
      ],
      workedExample: '如果期权价格为 $5.00，Vega 为 0.20。如果隐含波动率（IV）上升 1%，期权价格将上涨至 $5.20。',
      realWorldApplication: '波动率交易的关键指标。用于参与财报行情（财报后 IV 通常会骤降）或对冲市场不确定性带来的风险。',
    },
  },
  {
    id: 'rho',
    symbol: 'ρ',
    en: {
      name: 'Rho',
      definition: 'Measures how much the option price changes when interest rates move 1%.',
      formula: 'ρ = ∂V / ∂r',
      range: 'Positive for calls, negative for puts',
      interpretation: [
        'Rho 0.05 means if rates rise 1%, call gains $0.05',
        'Longer-dated options have higher Rho',
        'Usually the least important Greek for short-term options',
        'Matters more for LEAPS and long-dated options',
        'Higher rates favor calls, hurt puts',
      ],
      tradingTips: [
        'Mostly ignore Rho for weekly/monthly options',
        'Consider Rho for LEAPS in changing rate environments',
        'Rate changes rarely move options significantly',
      ],
      workedExample: 'If a call option is priced at $2.00 with a Rho of 0.03, and interest rates rise by 1%, the option price will increase to $2.03.',
      realWorldApplication: 'Measures sensitivity to interest rate changes. While minor for short-term options, it becomes significant for long-term LEAPS (Long-term Equity Anticipation Securities).',
    },
    zh: {
      name: 'Rho',
      definition: '衡量利率变动 1% 时期权价格的变化。',
      formula: 'ρ = ∂V / ∂r',
      range: 'Call 为正，Put 为负',
      interpretation: [
        'Rho 0.05 意味着利率涨 1%，看涨期权涨 $0.05',
        '长期期权 Rho 更高',
        '对于短期期权通常是最不重要的 Greek',
        '对 LEAPS 和长期期权更重要',
        '利率上升利好看涨期权，不利于看跌期权',
      ],
      tradingTips: [
        '周度/月度期权可基本忽略 Rho',
        '利率环境变化时关注 LEAPS 的 Rho',
        '利率变化很少显著影响期权价格',
      ],
      workedExample: '如果一份看涨期权价格为 $2.00，Rho 为 0.03。如果利率上升 1%，期权价格将上涨至 $2.03。',
      realWorldApplication: '衡量对利率变化的敏感度。虽然对短期期权影响较小，但对于长期期权（LEAPS）来说非常重要。',
    },
  },
]

export function GreeksChapter() {
  const { language } = useI18n()
  const { markChapterComplete } = useEducationProgress()

  const title = language === 'zh' ? 'Greeks 详解' : 'The Greeks'
  const introText =
    language === 'zh'
      ? '期权的五大 Greeks 是描述期权价格敏感性的关键指标。理解它们对于风险管理和交易决策至关重要。'
      : 'The five major Greeks are key metrics describing option price sensitivities. Understanding them is crucial for risk management and trading decisions.'

  return (
    <GlassPanel variant="subtle" className="education-chapter">
      <header className="education-chapter-header">
        <h2>{title}</h2>
        <p className="subtitle">{introText}</p>
      </header>

      <div className="education-chapter-content">
        {/* Overview Section */}
        <section aria-label={language === 'zh' ? '概览' : 'Overview'}>
          <h3>{language === 'zh' ? '概览' : 'Overview'}</h3>
          <div className="education-greeks-overview">
            <table className="greeks-summary-table">
              <thead>
                <tr>
                  <th>{language === 'zh' ? '符号' : 'Symbol'}</th>
                  <th>{language === 'zh' ? '名称' : 'Name'}</th>
                  <th>{language === 'zh' ? '衡量' : 'Measures'}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Δ</td><td>Delta</td><td>{language === 'zh' ? '价格敏感度' : 'Price sensitivity'}</td></tr>
                <tr><td>Γ</td><td>Gamma</td><td>{language === 'zh' ? 'Delta 变化率' : 'Delta change rate'}</td></tr>
                <tr><td>Θ</td><td>Theta</td><td>{language === 'zh' ? '时间衰减' : 'Time decay'}</td></tr>
                <tr><td>ν</td><td>Vega</td><td>{language === 'zh' ? '波动率敏感度' : 'Volatility sensitivity'}</td></tr>
                <tr><td>ρ</td><td>Rho</td><td>{language === 'zh' ? '利率敏感度' : 'Interest rate sensitivity'}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Individual Greek Sections */}
        {GREEKS.map((greek) => {
          const data = language === 'zh' ? greek.zh : greek.en
          return (
            <section
              key={greek.id}
              aria-label={data.name}
              className="education-greek-detail"
              data-testid={`greek-detail-${greek.id}`}
            >
              <h3>
                <span className="greek-symbol">{greek.symbol}</span>
                {data.name}
              </h3>

              <div className="greek-definition">
                <p>{data.definition}</p>
              </div>

              <div className="greek-info-grid">
                <div className="greek-info-card">
                  <div className="greek-info-label">{language === 'zh' ? '公式' : 'Formula'}</div>
                  <div className="greek-formula">{data.formula}</div>
                </div>
                <div className="greek-info-card">
                  <div className="greek-info-label">{language === 'zh' ? '取值范围' : 'Range'}</div>
                  <div className="greek-range">{data.range}</div>
                </div>
              </div>

              <div className="greek-content-section">
                <h4>{language === 'zh' ? '如何理解' : 'How to interpret'}</h4>
                <ul>
                  {data.interpretation.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="greek-content-section">
                <h4>{language === 'zh' ? '交易技巧' : 'Trading tips'}</h4>
                <ul>
                  {data.tradingTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="greek-content-section">
                <h4>{language === 'zh' ? '计算示例' : 'Worked Example'}</h4>
                <div className="greek-example-box">
                  <p>{data.workedExample}</p>
                </div>
              </div>

              <div className="greek-content-section">
                <h4>{language === 'zh' ? '实际应用' : 'Real-world Application'}</h4>
                <p>{data.realWorldApplication}</p>
              </div>
            </section>
          )
        })}

        {/* End of Greek details */}
      </div>

      <footer className="education-chapter-footer">
        <div className="education-cta" data-testid="greeks-cta">
          <Link to="/options" data-testid="greeks-cta-options">
            {language === 'zh' ? '尝试期权分析' : 'Try options analysis'}
          </Link>
          <Link to="/volatility" data-testid="greeks-cta-volatility">
            {language === 'zh' ? '查看波动率曲面' : 'View volatility surface'}
          </Link>
        </div>
        <button
          type="button"
          data-testid="greeks-complete"
          className="education-complete-btn"
          onClick={() => markChapterComplete(CHAPTER_ID)}
        >
          {language === 'zh' ? '完成本章' : 'Mark chapter complete'}
        </button>
      </footer>
    </GlassPanel>
  )
}
