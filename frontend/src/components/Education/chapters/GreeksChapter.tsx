import { Link } from 'react-router-dom'

import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { useEducationProgress } from '../../../hooks/useEducationProgress'

const CHAPTER_ID = 'greeks'

type Greek = {
  id: string
  en: { name: string; meaning: string; analogy: string }
  zh: { name: string; meaning: string; analogy: string }
}

const GREEKS: Greek[] = [
  {
    id: 'delta',
    en: { name: 'Delta', meaning: 'Sensitivity to underlying price.', analogy: 'Like speed: how fast price responds.' },
    zh: { name: 'Delta', meaning: '对标的价格变化的敏感度。', analogy: '像速度：价格响应有多快。' },
  },
  {
    id: 'gamma',
    en: { name: 'Gamma', meaning: 'How Delta changes as price moves.', analogy: 'Like acceleration: how speed changes.' },
    zh: { name: 'Gamma', meaning: 'Delta 随价格变化的变化率。', analogy: '像加速度：速度如何变化。' },
  },
  {
    id: 'theta',
    en: { name: 'Theta', meaning: 'Time decay of option value.', analogy: 'Like melting ice: value evaporates with time.' },
    zh: { name: 'Theta', meaning: '时间流逝带来的价值衰减。', analogy: '像冰融化：时间价值会流失。' },
  },
  {
    id: 'vega',
    en: { name: 'Vega', meaning: 'Sensitivity to volatility.', analogy: 'Like a volume knob for uncertainty.' },
    zh: { name: 'Vega', meaning: '对波动率变化的敏感度。', analogy: '像不确定性的音量旋钮。' },
  },
  {
    id: 'rho',
    en: { name: 'Rho', meaning: 'Sensitivity to interest rates.', analogy: 'Like discounting: how rate changes affect value.' },
    zh: { name: 'Rho', meaning: '对利率变化的敏感度。', analogy: '像折现：利率变化如何影响价值。' },
  },
]

export function GreeksChapter() {
  const { language } = useI18n()
  const { markChapterComplete } = useEducationProgress()

  const title = language === 'zh' ? 'Greeks 详解' : 'Greeks'

  return (
    <GlassPanel variant="subtle" className="education-chapter">
      <header className="education-chapter-header">
        <h2>{title}</h2>
        <p className="subtitle">
          {language === 'zh'
            ? '用一组敏感度指标来描述：当输入变量变化时，期权价格如何变化。'
            : 'A set of sensitivities describing how option value changes as inputs move.'}
        </p>
      </header>

      <div className="education-chapter-content">
        <section aria-label={language === 'zh' ? '五大Greek' : 'Five core greeks'}>
          <h3>{language === 'zh' ? '五大Greek' : 'Five core greeks'}</h3>
          <div className="education-greeks-grid" data-testid="greeks-list">
            {GREEKS.map((g) => {
              const data = language === 'zh' ? g.zh : g.en
              return (
                <div key={g.id} className="education-greek-card" data-testid={`greek-${g.id}`}>
                  <strong>{data.name}</strong>
                  <p>{data.meaning}</p>
                  <p className="muted">{data.analogy}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section aria-label={language === 'zh' ? '可视化预留' : 'Visualization placeholder'}>
          <h3>{language === 'zh' ? '可视化预留' : 'Visualization placeholder'}</h3>
          <div className="education-placeholder" data-testid="greeks-visual-placeholder">
            {language === 'zh'
              ? '后续任务将嵌入 Greeks 曲线/图表用于交互演示。'
              : 'Later tasks will embed interactive Greeks curves/charts here.'}
          </div>
        </section>
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
