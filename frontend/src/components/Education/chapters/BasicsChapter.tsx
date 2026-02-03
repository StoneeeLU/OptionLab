import { Link } from 'react-router-dom'

import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { useEducationProgress } from '../../../hooks/useEducationProgress'

const CHAPTER_ID = 'basics'

export function BasicsChapter() {
  const { language } = useI18n()
  const { markChapterComplete } = useEducationProgress()

  const title = language === 'zh' ? '期权基础' : 'Options Basics'
  const subtitle =
    language === 'zh'
      ? '从零开始：期权是什么、合约要素，以及买方与卖方的区别。'
      : 'Start from zero: what options are, key contract terms, and buyer vs seller.'

  return (
    <GlassPanel variant="subtle" className="education-chapter">
      <header className="education-chapter-header">
        <h2>{title}</h2>
        <p className="subtitle">{subtitle}</p>
      </header>

      <div className="education-chapter-content">
        <section aria-label={language === 'zh' ? '核心概念' : 'Core concepts'}>
          <h3>{language === 'zh' ? '核心概念' : 'Core concepts'}</h3>
          <p>
            {language === 'zh'
              ? '期权是一种合约：它让你拥有在未来某个时间点，以约定价格买入或卖出标的资产的权利（但不是义务）。'
              : 'An option is a contract: it gives you the right (but not the obligation) to buy or sell an underlying at a set price by a future date.'}
          </p>
          <p>
            {language === 'zh'
              ? '买方支付权利金获得权利；卖方收取权利金承担履约义务。'
              : 'The buyer pays a premium to obtain the right; the seller receives the premium and takes on the obligation.'}
          </p>
        </section>

        <section aria-label={language === 'zh' ? '合约要素' : 'Contract terms'}>
          <h3>{language === 'zh' ? '合约要素' : 'Contract terms'}</h3>
          <div className="education-contract-diagram" data-testid="basics-contract-diagram">
            <div className="education-contract-row">
              <span className="label">{language === 'zh' ? '标的' : 'Underlying'}</span>
              <span className="value">{language === 'zh' ? '例如：AAPL' : 'e.g. AAPL'}</span>
            </div>
            <div className="education-contract-row">
              <span className="label">{language === 'zh' ? '类型' : 'Type'}</span>
              <span className="value">{language === 'zh' ? 'Call / Put' : 'Call / Put'}</span>
            </div>
            <div className="education-contract-row">
              <span className="label">{language === 'zh' ? '行权价' : 'Strike'}</span>
              <span className="value">{language === 'zh' ? '约定价格' : 'Agreed price'}</span>
            </div>
            <div className="education-contract-row">
              <span className="label">{language === 'zh' ? '到期日' : 'Expiry'}</span>
              <span className="value">{language === 'zh' ? '最后有效日期' : 'Last valid date'}</span>
            </div>
            <div className="education-contract-row">
              <span className="label">{language === 'zh' ? '权利金' : 'Premium'}</span>
              <span className="value">{language === 'zh' ? '购买权利的价格' : 'Price paid for the right'}</span>
            </div>
          </div>
        </section>

        <section aria-label={language === 'zh' ? '术语速查' : 'Quick glossary'}>
          <h3>{language === 'zh' ? '术语速查' : 'Quick glossary'}</h3>
          <ul>
            <li>{language === 'zh' ? 'Call：看涨期权（买入的权利）' : 'Call: option to buy (right to buy)'}</li>
            <li>{language === 'zh' ? 'Put：看跌期权（卖出的权利）' : 'Put: option to sell (right to sell)'}</li>
            <li>{language === 'zh' ? '行权价：约定买入/卖出的价格' : 'Strike: the agreed buy/sell price'}</li>
          </ul>
        </section>
      </div>

      <footer className="education-chapter-footer">
        <div className="education-cta" data-testid="basics-cta">
          <Link to="/options" data-testid="basics-cta-options">
            {language === 'zh' ? '尝试期权分析' : 'Try options analysis'}
          </Link>
          <Link to="/volatility" data-testid="basics-cta-volatility">
            {language === 'zh' ? '查看波动率曲面' : 'View volatility surface'}
          </Link>
        </div>
        <button
          type="button"
          data-testid="basics-complete"
          className="education-complete-btn"
          onClick={() => markChapterComplete(CHAPTER_ID)}
        >
          {language === 'zh' ? '完成本章' : 'Mark chapter complete'}
        </button>
      </footer>
    </GlassPanel>
  )
}
