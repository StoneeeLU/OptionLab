import { useMemo, useState } from 'react'

import { useI18n } from '../../../i18n/I18nContext'
import './Glossary.css'

type GlossaryTerm = {
  id: string
  term: {
    en: string
    zh: string
  }
  short: {
    en: string
    zh: string
  }
  long: {
    en: string
    zh: string
  }
}

const DEFAULT_TERMS: GlossaryTerm[] = [
  {
    id: 'call',
    term: { en: 'Call', zh: '看涨期权' },
    short: { en: 'Right to buy at a strike price.', zh: '以行权价买入的权利。' },
    long: {
      en: 'A call option gives the buyer the right, but not the obligation, to buy the underlying at the strike price by expiration.',
      zh: '看涨期权赋予买方在到期日前（或到期时）以行权价买入标的的权利，但不承担必须买入的义务。',
    },
  },
  {
    id: 'put',
    term: { en: 'Put', zh: '看跌期权' },
    short: { en: 'Right to sell at a strike price.', zh: '以行权价卖出的权利。' },
    long: {
      en: 'A put option gives the buyer the right, but not the obligation, to sell the underlying at the strike price by expiration.',
      zh: '看跌期权赋予买方在到期日前（或到期时）以行权价卖出标的的权利，但不承担必须卖出的义务。',
    },
  },
  {
    id: 'delta',
    term: { en: 'Delta', zh: 'Delta(德尔塔)' },
    short: { en: 'Sensitivity to underlying price.', zh: '对标的价格变化的敏感度。' },
    long: {
      en: 'Delta approximates how much an option price changes for a small change in the underlying price, holding other inputs constant.',
      zh: 'Delta近似表示在其他条件不变时，标的价格小幅变化会导致期权价格变化多少。',
    },
  },
]

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

export function Glossary() {
  const { language } = useI18n()
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return DEFAULT_TERMS

    return DEFAULT_TERMS.filter((term) => {
      const termText = language === 'zh' ? term.term.zh : term.term.en
      const shortText = language === 'zh' ? term.short.zh : term.short.en
      const longText = language === 'zh' ? term.long.zh : term.long.en
      return (
        normalize(termText).includes(q) ||
        normalize(shortText).includes(q) ||
        normalize(longText).includes(q) ||
        normalize(term.id).includes(q)
      )
    })
  }, [language, query])

  return (
    <div className="glossary" data-testid="glossary">
      <div className="glossary-header">
        <h2>Glossary</h2>
        <p className="glossary-subtitle">Search and expand terms as needed.</p>
      </div>

      <div className="glossary-controls">
        <input
          data-testid="glossary-search"
          className="glossary-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={language === 'zh' ? '搜索术语...' : 'Search terms...'}
          aria-label={language === 'zh' ? '搜索术语' : 'Search terms'}
        />
      </div>

      <div className="glossary-grid" role="list">
        {filtered.map((term) => {
          const title = language === 'zh' ? term.term.zh : term.term.en
          const short = language === 'zh' ? term.short.zh : term.short.en
          const long = language === 'zh' ? term.long.zh : term.long.en
          const expanded = expandedId === term.id

          return (
            <div key={term.id} className="glossary-card" role="listitem">
              <div className="glossary-card-top">
                <div className="glossary-term">
                  <strong>{title}</strong>
                  <span className="glossary-id">{term.id}</span>
                </div>
                <button
                  type="button"
                  className="glossary-toggle"
                  data-testid={`glossary-toggle-${term.id}`}
                  aria-expanded={expanded}
                  aria-controls={`glossary-detail-${term.id}`}
                  onClick={() => setExpandedId((prev) => (prev === term.id ? null : term.id))}
                >
                  {expanded ? (language === 'zh' ? '收起' : 'Collapse') : (language === 'zh' ? '展开' : 'Expand')}
                </button>
              </div>

              <p className="glossary-short">{short}</p>

              {expanded && (
                <div
                  className="glossary-detail"
                  id={`glossary-detail-${term.id}`}
                  data-testid={`glossary-detail-${term.id}`}
                >
                  <p>{long}</p>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="glossary-empty" data-testid="glossary-empty">
            {language === 'zh' ? '没有匹配的术语。' : 'No matching terms.'}
          </div>
        )}
      </div>
    </div>
  )
}
