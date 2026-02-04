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

          <div className="education-example-box">
            <h4>{language === 'zh' ? '实例说明' : 'Examples'}</h4>
            <div className="example-grid">
              <div className="example-item">
                <strong>{language === 'zh' ? '实值 (ITM)' : 'In-the-Money (ITM)'}</strong>
                <p>
                  {language === 'zh'
                    ? '股票 $110，行权价 $100 的看涨期权。内在价值为 $10。如果期权价格为 $12，则时间价值为 $2。'
                    : 'Stock at $110, $100 Call. Intrinsic value is $10. If option price is $12, time value is $2.'}
                </p>
              </div>
              <div className="example-item">
                <strong>{language === 'zh' ? '虚值 (OTM)' : 'Out-of-the-Money (OTM)'}</strong>
                <p>
                  {language === 'zh'
                    ? '股票 $90，行权价 $100 的看涨期权。内在价值为 $0。整个期权价格（如 $1.50）全部是时间价值。'
                    : 'Stock at $90, $100 Call. Intrinsic value is $0. The entire option price (e.g., $1.50) is time value.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-label={language === 'zh' ? '计算示例' : 'Worked Example'}>
          <h3>{language === 'zh' ? '计算示例：看涨期权定价' : 'Worked Example: Pricing a Call Option'}</h3>
          <div className="greek-example-box">
            <p><strong>{language === 'zh' ? '已知条件：' : 'Given:'}</strong></p>
            <ul>
              <li>{language === 'zh' ? '股票价格 (S): $100' : 'Stock price (S): $100'}</li>
              <li>{language === 'zh' ? '行权价 (K): $105' : 'Strike price (K): $105'}</li>
              <li>{language === 'zh' ? '到期时间: 30 天' : 'Time to expiry: 30 days'}</li>
              <li>{language === 'zh' ? '隐含波动率: 25%' : 'Implied volatility: 25%'}</li>
              <li>{language === 'zh' ? '无风险利率: 5%' : 'Risk-free rate: 5%'}</li>
            </ul>
            <p>
              <strong>{language === 'zh' ? '步骤 1：计算内在价值' : 'Step 1: Calculate intrinsic value'}</strong><br />
              {language === 'zh'
                ? '内在价值 = max(S - K, 0) = max(100 - 105, 0) = $0'
                : 'Intrinsic = max(S - K, 0) = max(100 - 105, 0) = $0'}
            </p>
            <p>
              <strong>{language === 'zh' ? '步骤 2：剩余价值为时间价值' : 'Step 2: The remaining value is time value'}</strong><br />
              {language === 'zh'
                ? '假设期权价格为 $1.20，这全部来自标的股票在到期前上涨超过 $105 的概率。'
                : 'Assuming the option price is $1.20, this comes from the probability the stock rises above $105 before expiry.'}
            </p>
          </div>
        </section>

        <section aria-label={language === 'zh' ? '影响期权价格的因素' : 'What affects option price'}>
          <h3>{language === 'zh' ? '影响因素' : 'What affects option price'}</h3>
          <div className="education-drivers-grid">
            <div className="driver-card">
              <h4>{language === 'zh' ? '标的价格变动' : 'Stock price movement'}</h4>
              <p>
                {language === 'zh'
                  ? '股票上涨利好看涨期权（Call），看跌期权（Put）贬值。'
                  : 'Rising stock price increases Call value and decreases Put value.'}
              </p>
            </div>
            <div className="driver-card">
              <h4>{language === 'zh' ? '时间衰减' : 'Time decay'}</h4>
              <p>
                {language === 'zh'
                  ? '随着到期日临近，时间价值逐渐消失。这对期权买方不利，对卖方有利。'
                  : 'As expiration approaches, time value erodes. This hurts buyers and benefits sellers.'}
              </p>
            </div>
            <div className="driver-card">
              <h4>{language === 'zh' ? '波动率变化' : 'Volatility changes'}</h4>
              <p>
                {language === 'zh'
                  ? '波动率越高，未来不确定性越大，期权越贵。'
                  : 'Higher volatility means more uncertainty and higher option prices.'}
              </p>
            </div>
            <div className="driver-card">
              <h4>{language === 'zh' ? '利率' : 'Interest rates'}</h4>
              <p>
                {language === 'zh'
                  ? '利率上升通常会略微提高看涨期权价格，降低看跌期权价格。'
                  : 'Higher rates generally increase Call prices and decrease Put prices slightly.'}
              </p>
            </div>
          </div>
        </section>

        <section aria-label={language === 'zh' ? '模型与模拟器' : 'Models & Simulators'}>
          <h3>{language === 'zh' ? '模型与模拟器' : 'Models & Simulators'}</h3>
          <p>
            {language === 'zh'
              ? 'Black-Scholes 是一个常见的欧式期权定价框架：它把价格看成输入变量（S, K, 波动率, 时间, 利率）的函数。下方提供了交互式计算器和时间衰减演示，帮助你直观理解这些概念。'
              : 'Black-Scholes is a common European option pricing framework: it treats price as a function of inputs (S, K, volatility, time, rate). Interactive calculators and time decay demos are provided below to help you visualize these concepts.'}
          </p>
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
