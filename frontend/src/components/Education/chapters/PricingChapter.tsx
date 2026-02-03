import { Link } from 'react-router-dom'

import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { useEducationProgress } from '../../../hooks/useEducationProgress'

const CHAPTER_ID = 'pricing'

export function PricingChapter() {
  const { language } = useI18n()
  const { markChapterComplete } = useEducationProgress()

  const title = language === 'zh' ? '定价原理' : 'Pricing'
  const subtitle =
    language === 'zh'
      ? '内在价值 vs 时间价值：期权价格通常由两部分组成。'
      : 'Intrinsic value vs time value: option prices usually have two components.'

  return (
    <GlassPanel variant="subtle" className="education-chapter">
      <header className="education-chapter-header">
        <h2>{title}</h2>
        <p className="subtitle">{subtitle}</p>
      </header>

      <div className="education-chapter-content">
        <section aria-label={language === 'zh' ? '价值构成' : 'Value components'}>
          <h3>{language === 'zh' ? '价值构成' : 'Value components'}</h3>
          <div className="education-value-breakdown" data-testid="pricing-value-diagram">
            <div className="education-contract-row">
              <span className="label">{language === 'zh' ? '内在价值' : 'Intrinsic value'}</span>
              <span className="value">
                {language === 'zh'
                  ? '立即行权能得到的价值（到期时最直观）'
                  : 'Value from immediate exercise (most intuitive at expiry)'}
              </span>
            </div>
            <div className="education-contract-row">
              <span className="label">{language === 'zh' ? '时间价值' : 'Time value'}</span>
              <span className="value">
                {language === 'zh'
                  ? '未来不确定性带来的额外价值（时间越长通常越大）'
                  : 'Extra value from uncertainty (often higher with more time)'}
              </span>
            </div>
          </div>
        </section>

        <section aria-label={language === 'zh' ? '影响因素' : 'Key drivers'}>
          <h3>{language === 'zh' ? '影响因素' : 'Key drivers'}</h3>
          <ul>
            <li>{language === 'zh' ? '标的价格与行权价的相对位置' : 'Spot vs strike relationship'}</li>
            <li>{language === 'zh' ? '剩余时间（到期日越近时间价值越少）' : 'Time to expiry (time value decays)'}</li>
            <li>{language === 'zh' ? '波动率（越不确定通常越贵）' : 'Volatility (more uncertainty often means higher price)'}</li>
            <li>{language === 'zh' ? '利率（折现因子影响）' : 'Interest rate (discounting effect)'}</li>
          </ul>
        </section>

        <section aria-label={language === 'zh' ? '模型概念' : 'Model concept'}>
          <h3>{language === 'zh' ? '模型概念' : 'Model concept'}</h3>
          <p>
            {language === 'zh'
              ? 'Black-Scholes 是一个常见的欧式期权定价框架：它把价格看成输入变量（S, K, 波动率, 时间, 利率）的函数。'
              : 'Black-Scholes is a common European option pricing framework: it treats price as a function of inputs (S, K, volatility, time, rate).'}
          </p>
          <div data-testid="pricing-calculator-preview" className="education-placeholder">
            {language === 'zh'
              ? '模拟器预览：这里将嵌入单期权计算器（后续任务实现）'
              : 'Simulator preview: single-option calculator will be embedded here (later task).'}
          </div>
        </section>
      </div>

      <footer className="education-chapter-footer">
        <div className="education-cta" data-testid="pricing-cta">
          <Link to="/options" data-testid="pricing-cta-options">
            {language === 'zh' ? '尝试期权分析' : 'Try options analysis'}
          </Link>
          <Link to="/volatility" data-testid="pricing-cta-volatility">
            {language === 'zh' ? '查看波动率曲面' : 'View volatility surface'}
          </Link>
        </div>
        <button
          type="button"
          data-testid="pricing-complete"
          className="education-complete-btn"
          onClick={() => markChapterComplete(CHAPTER_ID)}
        >
          {language === 'zh' ? '完成本章' : 'Mark chapter complete'}
        </button>
      </footer>
    </GlassPanel>
  )
}
