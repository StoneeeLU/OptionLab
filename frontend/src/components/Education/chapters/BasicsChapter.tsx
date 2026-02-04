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
        <section aria-label={language === 'zh' ? '什么是期权' : 'What is an option'}>
          <h3>{language === 'zh' ? '什么是期权' : 'What is an option'}</h3>
          <p>
            {language === 'zh'
              ? '期权是一种金融衍生品合约，它赋予买方在特定日期（到期日）或之前，以特定价格（行权价）买入或卖出某种资产（如股票）的权利。'
              : 'An option is a financial derivative contract that gives the buyer the right, but not the obligation, to buy or sell an underlying asset (like a stock) at a specific price (strike price) on or before a specific date (expiration date).'}
          </p>
          <p>
            {language === 'zh'
              ? '关键在于“权利而非义务”。如果你作为买方，觉得行权不划算，你可以选择让期权作废，损失仅限于你支付的权利金。'
              : 'The key is "right, not obligation." As a buyer, if exercising the option is not profitable, you can simply let it expire. Your maximum loss is limited to the premium you paid.'}
          </p>
        </section>

        <section aria-label={language === 'zh' ? '为什么要使用期权' : 'Why use options'}>
          <h3>{language === 'zh' ? '为什么要使用期权' : 'Why use options'}</h3>
          <ul>
            <li>
              <strong>{language === 'zh' ? '套期保值 (Hedging):' : 'Hedging:'}</strong>{' '}
              {language === 'zh'
                ? '保护你的股票持仓。例如，持有 100 股 AAPL，购买看跌期权（Put）可以在股价下跌时对冲损失。'
                : 'Protecting your stock positions. For example, if you own 100 shares of AAPL, buying a Put option can hedge against potential price drops.'}
            </li>
            <li>
              <strong>{language === 'zh' ? '投机 (Speculation):' : 'Speculation:'}</strong>{' '}
              {language === 'zh'
                ? '利用杠杆。如果你认为 TSLA 会大涨，购买看涨期权（Call）可以用较少的资金获得股价上涨带来的高额回报。'
                : 'Gaining leverage. If you think TSLA will jump, buying Call options allows you to gain exposure to price movements with a fraction of the capital.'}
            </li>
            <li>
              <strong>{language === 'zh' ? '获取收入 (Income):' : 'Income Generation:'}</strong>{' '}
              {language === 'zh'
                ? '卖出备兑开仓（Covered Call）。通过卖出你持有的股票的看涨期权，你可以收取权利金作为额外收入。'
                : 'Selling covered calls. By selling call options against stocks you already own, you can collect premiums as a steady stream of income.'}
            </li>
          </ul>
        </section>

        <section aria-label={language === 'zh' ? '看涨 vs 看跌' : 'Call vs Put'}>
          <h3>{language === 'zh' ? '看涨 vs 看跌' : 'Call vs Put'}</h3>
          <div className="education-table-wrapper">
            <table className="education-table">
              <thead>
                <tr>
                  <th>{language === 'zh' ? '维度' : 'Aspect'}</th>
                  <th>{language === 'zh' ? '看涨期权 (Call)' : 'Call Option'}</th>
                  <th>{language === 'zh' ? '看跌期权 (Put)' : 'Put Option'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{language === 'zh' ? '权利' : 'Right'}</td>
                  <td>{language === 'zh' ? '买入标的资产' : 'Buy underlying'}</td>
                  <td>{language === 'zh' ? '卖出标的资产' : 'Sell underlying'}</td>
                </tr>
                <tr>
                  <td>{language === 'zh' ? '盈利预期' : 'Profit when'}</td>
                  <td>{language === 'zh' ? '价格上涨' : 'Price rises'}</td>
                  <td>{language === 'zh' ? '价格下跌' : 'Price falls'}</td>
                </tr>
                <tr>
                  <td>{language === 'zh' ? '最大亏损 (买方)' : 'Max loss'}</td>
                  <td>{language === 'zh' ? '支付的权利金' : 'Premium paid'}</td>
                  <td>{language === 'zh' ? '支付的权利金' : 'Premium paid'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section aria-label={language === 'zh' ? '买入 vs 卖出风险' : 'Buying vs Selling Risk'}>
          <h3>{language === 'zh' ? '买入 vs 卖出风险' : 'Buying vs Selling Risk'}</h3>
          <div className="risk-comparison-grid">
            <div className="risk-box buyer">
              <h4>{language === 'zh' ? '期权买方' : 'Option Buyer'}</h4>
              <p>{language === 'zh' ? '风险有限：最大损失为权利金。' : 'Limited risk: Max loss is the premium paid.'}</p>
              <p>{language === 'zh' ? '收益潜力：理论上无限（看涨）或极大（看跌）。' : 'Unlimited potential: Theoretically unlimited (Call) or substantial (Put).'}</p>
            </div>
            <div className="risk-box seller">
              <h4>{language === 'zh' ? '期权卖方' : 'Option Seller'}</h4>
              <p>{language === 'zh' ? '风险极大：股价大幅波动可能导致巨额亏损。' : 'Unlimited risk: Significant price moves can lead to massive losses.'}</p>
              <p>{language === 'zh' ? '收益有限：最大收益仅为收取的权利金。' : 'Limited profit: Max gain is the premium received.'}</p>
            </div>
          </div>
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
