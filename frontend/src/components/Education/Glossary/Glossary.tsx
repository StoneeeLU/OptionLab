import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

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
  const shouldReduceMotion = useReducedMotion()
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
            <motion.div
              key={term.id}
              className="glossary-card"
              role="listitem"
              layout
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              whileHover={shouldReduceMotion ? {} : { y: -4, boxShadow: 'var(--shadow-md)' }}
              transition={{ layout: { duration: 0.3, ease: 'circOut' } }}
            >
              <div className="glossary-card-top">
                <div className="glossary-term">
                  <motion.strong layout>{title}</motion.strong>
                  <motion.span layout className="glossary-id">
                    {term.id}
                  </motion.span>
                </div>
                <button
                  type="button"
                  className="glossary-toggle"
                  data-testid={`glossary-toggle-${term.id}`}
                  aria-expanded={expanded}
                  aria-controls={`glossary-detail-${term.id}`}
                  onClick={() => setExpandedId((prev) => (prev === term.id ? null : term.id))}
                >
                  <span>{expanded ? (language === 'zh' ? '收起' : 'Collapse') : (language === 'zh' ? '展开' : 'Expand')}</span>
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ marginLeft: 6, display: 'inline-block', verticalAlign: 'middle' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </motion.svg>
                </button>
              </div>

              <motion.p layout className="glossary-short">
                {short}
              </motion.p>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    className="glossary-detail"
                    id={`glossary-detail-${term.id}`}
                    data-testid={`glossary-detail-${term.id}`}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="glossary-detail-content">
                      <p>{long}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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
