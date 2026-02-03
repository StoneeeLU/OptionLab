import { Link } from 'react-router-dom'

import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { useEducationProgress } from '../../../hooks/useEducationProgress'

const CHAPTER_ID = 'strategies'

type Strategy = {
  id: string
  en: { name: string; idea: string }
  zh: { name: string; idea: string }
}

const STRATEGIES: Strategy[] = [
  {
    id: 'bull_call_spread',
    en: { name: 'Bull Call Spread', idea: 'Buy a call, sell a higher strike call (limited risk/reward).' },
    zh: { name: '牛市看涨价差', idea: '买入看涨 + 卖出更高行权价看涨（风险/收益有限）。' },
  },
  {
    id: 'bear_put_spread',
    en: { name: 'Bear Put Spread', idea: 'Buy a put, sell a lower strike put (limited risk/reward).' },
    zh: { name: '熊市看跌价差', idea: '买入看跌 + 卖出更低行权价看跌（风险/收益有限）。' },
  },
  {
    id: 'straddle',
    en: { name: 'Straddle', idea: 'Buy call + buy put at same strike (bet on big move).' },
    zh: { name: '跨式 (Straddle)', idea: '同一行权价买入看涨+看跌（押注大波动）。' },
  },
  {
    id: 'strangle',
    en: { name: 'Strangle', idea: 'Buy OTM call + buy OTM put (cheaper than straddle).' },
    zh: { name: '宽跨式 (Strangle)', idea: '买入虚值看涨+虚值看跌（通常更便宜）。' },
  },
  {
    id: 'iron_condor',
    en: { name: 'Iron Condor', idea: 'Sell an inner spread and buy an outer spread (range-bound).' },
    zh: { name: '铁鹰 (Iron Condor)', idea: '卖出内侧价差并买入外侧保护（押注区间震荡）。' },
  },
]

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
          <div className="education-strategy-grid" data-testid="strategies-grid">
            {STRATEGIES.map((s) => {
              const data = language === 'zh' ? s.zh : s.en
              return (
                <div key={s.id} className="education-strategy-card" data-testid={`strategy-${s.id}`}>
                  <strong>{data.name}</strong>
                  <p>{data.idea}</p>
                  <div
                    className="education-placeholder"
                    data-testid={`strategy-payoff-${s.id}`}
                  >
                    {language === 'zh' ? '盈亏图预留（后续任务接入）' : 'Payoff diagram placeholder (later task)'}
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
