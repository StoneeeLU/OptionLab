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
          <h3>{language === 'zh' ? 'IV 是什么' : 'What is IV'}</h3>
          <p>
            {language === 'zh'
              ? '隐含波动率（Implied Volatility, IV）反映了市场对标的资产未来波动程度的预期。与历史波动率不同，IV 是从期权的市场价格中“反推”出来的。'
              : 'Implied Volatility (IV) represents the market\'s expectation of a stock\'s future volatility. Unlike historical volatility, IV is "implied" by the current market price of an option.'}
          </p>
          <div className="greek-info-grid">
            <div className="greek-info-card">
              <div className="greek-info-label">{language === 'zh' ? '历史 vs 隐含' : 'Historical vs Implied'}</div>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {language === 'zh'
                  ? '历史波动率 (HV) 衡量过去发生了什么；IV 衡量市场预期未来会发生什么。'
                  : 'Historical Volatility (HV) measures past price swings; IV measures expected future swings.'}
              </p>
            </div>
            <div className="greek-info-card">
              <div className="greek-info-label">{language === 'zh' ? '定价核心' : 'Pricing Core'}</div>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {language === 'zh'
                  ? 'IV 是期权价格中唯一的未知变量。IV 越高，期权的时间价值就越高（越贵）。'
                  : 'IV is the only unknown variable in pricing models. Higher IV leads to higher time value (more expensive options).'}
              </p>
            </div>
          </div>
        </section>

        <section aria-label={language === 'zh' ? '波动率微笑 (Volatility Smile)' : 'Volatility Smile'}>
          <h3>{language === 'zh' ? '波动率微笑 (Volatility Smile)' : 'Volatility Smile'}</h3>
          <p>
            {language === 'zh'
              ? '波动率微笑是指在同一到期日下，深度虚值（OTM）和深度实值（ITM）期权的 IV 通常高于平值（ATM）期权的现象。'
              : 'The Volatility Smile occurs when OTM and ITM options have higher IVs than ATM options for the same expiration date.'}
          </p>
          <ul>
            <li>
              {language === 'zh'
                ? '形状：当我们将 IV 对行权价作图时，它呈现出类似“微笑”的曲线。'
                : 'Shape: When plotting IV against strike price, it forms a curve resembling a "smile".'}
            </li>
            <li>
              {language === 'zh'
                ? '原因：市场为了防范极端行情（尾部风险），会给深度虚值合约支付更高的溢价，导致其 IV 升高。'
                : 'Why it exists: Traders pay higher premiums for deep OTM options to hedge against extreme market moves (tail risk).'}
            </li>
          </ul>
        </section>

        <section aria-label={language === 'zh' ? '波动率偏斜 (Volatility Skew)' : 'Volatility Skew'}>
          <h3>{language === 'zh' ? '波动率偏斜 (Volatility Skew)' : 'Volatility Skew'}</h3>
          <p>
            {language === 'zh'
              ? '偏斜是指 IV 随行权价的变化呈现非对称分布。这在股票市场中尤为常见。'
              : 'Volatility Skew describes an asymmetrical distribution of IV across different strike prices.'}
          </p>
          <ul>
            <li>
              {language === 'zh'
                ? '看跌偏斜 (Put Skew)：在股票市场，低行权价看跌期权的 IV 通常高于高行权价看涨期权，反映了对市场暴跌的恐惧。'
                : 'Put Skew: In equities, low-strike puts often have higher IV than high-strike calls, reflecting fear of market crashes.'}
            </li>
            <li>
              {language === 'zh'
                ? '商品偏斜：某些商品（如农产品）可能会出现“正向偏斜”，即高行权价看涨期权 IV 更高，反映了对供应短缺导致的暴涨的担忧。'
                : 'Commodity Skew: Some commodities show "reverse skew" where OTM calls have higher IV due to fear of supply shocks.'}
            </li>
          </ul>
        </section>

        <section aria-label={language === 'zh' ? 'IV 暴跌 (IV Crush)' : 'IV Crush'}>
          <h3>{language === 'zh' ? 'IV 暴跌 (IV Crush)' : 'IV Crush'}</h3>
          <p>
            {language === 'zh'
              ? 'IV 暴跌通常发生在重大不确定性消除之后，最典型的是在财报发布后。'
              : 'An IV Crush occurs when uncertainty is suddenly resolved, most commonly immediately after an earnings announcement.'}
          </p>
          <div className="education-placeholder" style={{ background: 'color-mix(in srgb, var(--color-warning), transparent 90%)', borderStyle: 'solid', borderColor: 'color-mix(in srgb, var(--color-warning), transparent 70%)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--color-warning)' }}>{language === 'zh' ? 'IV 暴跌案例' : 'IV Crush Example'}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text)' }}>{language === 'zh' ? '财报前' : 'Before Earnings'}</p>
                <ul style={{ fontSize: '0.9rem' }}>
                  <li>{language === 'zh' ? '股价：$100' : 'Stock: $100'}</li>
                  <li>{language === 'zh' ? '平值认购期权：$8.00' : 'ATM Call: $8.00'}</li>
                  <li>{language === 'zh' ? 'IV：80%' : 'IV: 80%'}</li>
                </ul>
              </div>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text)' }}>{language === 'zh' ? '财报后' : 'After Earnings'}</p>
                <ul style={{ fontSize: '0.9rem' }}>
                  <li>{language === 'zh' ? '股价：$102' : 'Stock: $102'}</li>
                  <li>{language === 'zh' ? '平值认购期权：$5.00' : 'ATM Call: $5.00'}</li>
                  <li>{language === 'zh' ? 'IV：30%' : 'IV: 30%'}</li>
                </ul>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', marginTop: '12px', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
              {language === 'zh'
                ? '结论：即便股价上涨了 $2，认购期权仍然亏损，因为 IV 的崩塌（80% -> 30%）对价格的打击超过了股价上涨带来的收益。'
                : 'Conclusion: Even though the stock rose by $2, the call lost value because the IV collapse (80% -> 30%) impacted the price more than the stock move.'}
            </p>
          </div>
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
