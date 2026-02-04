import { Link } from 'react-router-dom'

import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { useEducationProgress } from '../../../hooks/useEducationProgress'
import { StrategyPayoffExample } from '../charts/StrategyPayoffExample'
import { STRATEGY_EXAMPLES } from '../data/strategyExamples'
import './StrategiesChapter.css'

const CHAPTER_ID = 'strategies'

const STRATEGY_DETAILS: Record<string, {
  whenToUse: { en: string; zh: string }
  riskReward: { en: string; zh: string }
}> = {
  'bull-call-spread': {
    whenToUse: {
      en: 'When you are moderately bullish on a stock and want to reduce the upfront cost of a long call.',
      zh: '当你对股票适度看涨，并希望降低买入认购期权的预付成本时。'
    },
    riskReward: {
      en: 'Max Risk: Net premium paid. Max Reward: Difference between strikes minus net premium.',
      zh: '最大风险：支付的净权利金。最大收益：行权价之差减去净权利金。'
    }
  },
  'bear-put-spread': {
    whenToUse: {
      en: 'When you are moderately bearish and want to reduce the cost of a long put.',
      zh: '当你适度看跌，并希望降低买入认沽期权的成本时。'
    },
    riskReward: {
      en: 'Max Risk: Net premium paid. Max Reward: Difference between strikes minus net premium.',
      zh: '最大风险：支付的净权利金。最大收益：行权价之差减去净权利金。'
    }
  },
  'long-straddle': {
    whenToUse: {
      en: 'When you expect a significant price move but are unsure of the direction (e.g., before earnings).',
      zh: '当你预计会有重大价格波动但不确定方向时（例如财报发布前）。'
    },
    riskReward: {
      en: 'Max Risk: Total premium paid. Max Reward: Unlimited.',
      zh: '最大风险：支付的总权利金。最大收益：无限。'
    }
  },
  'long-strangle': {
    whenToUse: {
      en: 'Similar to straddle but cheaper; use when you expect a very large move.',
      zh: '类似于跨式但成本更低；当你预计会有巨大的波动时使用。'
    },
    riskReward: {
      en: 'Max Risk: Total premium paid. Max Reward: Unlimited (requires larger move than straddle).',
      zh: '最大风险：支付的总权利金。最大收益：无限（需要比跨式更大的波动）。'
    }
  },
  'iron-condor': {
    whenToUse: {
      en: 'When you expect the stock to trade within a specific range until expiration.',
      zh: '当你预计股票在到期前会在特定范围内波动时。'
    },
    riskReward: {
      en: 'Max Risk: Limited (width of wider spread minus credit). Max Reward: Net credit received.',
      zh: '最大风险：有限（较宽价差的宽度减去权利金）。最大收益：收到的净权利金。'
    }
  }
}

export function StrategiesChapter() {
  const { language } = useI18n()
  const { markChapterComplete } = useEducationProgress()

  const title = language === 'zh' ? '期权策略' : 'Strategies'

  return (
    <GlassPanel variant="subtle" className="education-chapter">
      <header className="education-chapter-header">
        <h2>{title}</h2>
        <p className="subtitle">
          {language === 'zh'
            ? '策略通常是多腿组合：先用盈亏图理解形状，再看风险与情景。'
            : 'Strategies are often multi-leg combos: start with payoff shape, then consider risks and scenarios.'}
        </p>
      </header>

      <div className="education-chapter-content">
        <section aria-label={language === 'zh' ? '常见策略' : 'Common strategies'}>
          <h3>{language === 'zh' ? '常见策略' : 'Common strategies'}</h3>
          <div className="strategies-list-container" data-testid="strategies-list">
            {STRATEGY_EXAMPLES.map((strategy) => {
              const details = STRATEGY_DETAILS[strategy.id]
              return (
                <div key={strategy.id} className="strategy-example-wrapper" data-testid={`strategy-${strategy.id}`}>
                  <StrategyPayoffExample {...strategy} />
                  <div className="strategy-usage-info">
                    <div className="usage-section">
                      <h4>{language === 'zh' ? '使用场景' : 'When to use'}</h4>
                      <p>{language === 'zh' ? details?.whenToUse.zh : details?.whenToUse.en}</p>
                    </div>
                    <div className="usage-section">
                      <h4>{language === 'zh' ? '风险/收益' : 'Risk/Reward Profile'}</h4>
                      <p>{language === 'zh' ? details?.riskReward.zh : details?.riskReward.en}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section aria-label={language === 'zh' ? '构建器预留' : 'Builder placeholder'}>
          <h3>{language === 'zh' ? '构建器预留' : 'Builder placeholder'}</h3>
          <div className="education-placeholder" data-testid="strategies-builder-placeholder">
            {language === 'zh'
              ? '后续任务将嵌入多腿策略构建器。'
              : 'Later tasks will embed the multi-leg strategy builder here.'}
          </div>
        </section>
      </div>

      <footer className="education-chapter-footer">
        <div className="education-cta" data-testid="strategies-cta">
          <Link to="/options" data-testid="strategies-cta-options">
            {language === 'zh' ? '尝试期权分析' : 'Try options analysis'}
          </Link>
          <Link to="/volatility" data-testid="strategies-cta-volatility">
            {language === 'zh' ? '查看波动率曲面' : 'View volatility surface'}
          </Link>
        </div>
        <button
          type="button"
          data-testid="strategies-complete"
          className="education-complete-btn"
          onClick={() => markChapterComplete(CHAPTER_ID)}
        >
          {language === 'zh' ? '完成本章' : 'Mark chapter complete'}
        </button>
      </footer>
    </GlassPanel>
  )
}
