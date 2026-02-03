import { Link } from 'react-router-dom'

import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { useEducationProgress } from '../../../hooks/useEducationProgress'

const CHAPTER_ID = 'iv'

export function IVChapter() {
  const { language } = useI18n()
  const { markChapterComplete } = useEducationProgress()

  const title = language === 'zh' ? '隐含波动率 (IV)' : 'Implied Volatility (IV)'

  return (
    <GlassPanel variant="subtle" className="education-chapter">
      <header className="education-chapter-header">
        <h2>{title}</h2>
        <p className="subtitle">
          {language === 'zh'
            ? 'IV 是市场对未来不确定性的定价表达。'
            : 'IV is the market-implied price of future uncertainty.'}
        </p>
      </header>

      <div className="education-chapter-content">
        <section aria-label={language === 'zh' ? 'IV 是什么' : 'What is IV'}>
          <h3>{language === 'zh' ? 'IV 是什么' : 'What is IV'} </h3>
          <p>
            {language === 'zh'
              ? '隐含波动率不是历史统计出来的波动，而是把期权市场价格反推出的一种“市场预期波动”。'
              : 'Implied volatility is not historical volatility. It is the volatility level that, when plugged into a pricing model, matches the market option price.'}
          </p>
        </section>

        <section aria-label={language === 'zh' ? '微笑与偏斜' : 'Smile and skew'}>
          <h3>{language === 'zh' ? '微笑与偏斜' : 'Smile and skew'}</h3>
          <ul>
            <li>
              {language === 'zh'
                ? 'Volatility smile: 不同行权价的 IV 形状像微笑曲线。'
                : 'Volatility smile: IV varies by strike, often forming a curved shape.'}
            </li>
            <li>
              {language === 'zh'
                ? 'Skew: 看跌/深度虚值合约常有更高的 IV（风险偏好与尾部风险）。'
                : 'Skew: puts and deep OTM strikes often have higher IV due to tail risk and demand.'}
            </li>
          </ul>
        </section>

        <section aria-label={language === 'zh' ? '可视化预留' : 'Visualization placeholder'}>
          <h3>{language === 'zh' ? '可视化预留' : 'Visualization placeholder'}</h3>
          <div className="education-placeholder" data-testid="iv-surface-preview">
            {language === 'zh'
              ? '后续任务将显示 IV 曲面/Smile 示例。'
              : 'Later tasks will show an IV surface/smile example here.'}
          </div>
          <p>
            <Link to="/volatility" data-testid="iv-volatility-link">
              {language === 'zh' ? '查看完整波动率曲面' : 'Open volatility surface tool'}
            </Link>
          </p>
        </section>
      </div>

      <footer className="education-chapter-footer">
        <div className="education-cta" data-testid="iv-cta">
          <Link to="/options" data-testid="iv-cta-options">
            {language === 'zh' ? '尝试期权分析' : 'Try options analysis'}
          </Link>
          <Link to="/volatility" data-testid="iv-cta-volatility">
            {language === 'zh' ? '查看波动率曲面' : 'View volatility surface'}
          </Link>
        </div>
        <button
          type="button"
          data-testid="iv-complete"
          className="education-complete-btn"
          onClick={() => markChapterComplete(CHAPTER_ID)}
        >
          {language === 'zh' ? '完成本章' : 'Mark chapter complete'}
        </button>
      </footer>
    </GlassPanel>
  )
}
