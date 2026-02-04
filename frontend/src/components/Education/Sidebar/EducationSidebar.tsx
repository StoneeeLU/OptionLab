import { useEffect, useMemo, useRef, useState } from 'react'

import { useEducationProgress } from '../../../hooks/useEducationProgress'
import { useI18n } from '../../../i18n/I18nContext'
import basicsIcon from '../../../assets/education/basics-icon.svg'
import chapterCompleteIcon from '../../../assets/education/chapter-complete.svg'
import greeksIcon from '../../../assets/education/greeks-icon.svg'
import ivIcon from '../../../assets/education/iv-icon.svg'
import pricingIcon from '../../../assets/education/pricing-icon.svg'
import progressBadge from '../../../assets/education/progress-badge.svg'
import strategiesIcon from '../../../assets/education/strategies-icon.svg'
import './EducationSidebar.css'

type Chapter = {
  id: string
}

const CHAPTERS: Chapter[] = [
  { id: 'basics' },
  { id: 'pricing' },
  { id: 'greeks' },
  { id: 'iv' },
  { id: 'strategies' },
]

const ICON_BY_ID: Record<string, string> = {
  basics: basicsIcon,
  pricing: pricingIcon,
  greeks: greeksIcon,
  iv: ivIcon,
  strategies: strategiesIcon,
}

function getHashId(): string {
  const raw = window.location.hash
  if (!raw || raw === '#') return 'basics'
  return raw.startsWith('#') ? raw.slice(1) : raw
}

function safeScrollToId(id: string, behavior: ScrollBehavior) {
  const el = document.getElementById(id)
  if (!el) return
  if (typeof el.scrollIntoView !== 'function') return
  el.scrollIntoView({ block: 'start', inline: 'nearest', behavior })
}

export function EducationSidebar() {
  const { t } = useI18n()
  const { progress } = useEducationProgress()

  const completed = progress.completedChapters
  const totalChapters = CHAPTERS.length
  const completedCount = Math.min(completed.length, totalChapters)
  const percent = Math.round((completedCount / totalChapters) * 100)

  const [activeId, setActiveId] = useState<string>(() => getHashId())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const entriesRef = useRef<Record<string, IntersectionObserverEntry>>({})

  // Keep activeId in sync with hash navigation.
  useEffect(() => {
    function handleHashChange() {
      setActiveId(getHashId())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Scrollspy via IntersectionObserver. Falls back to hash-based active state.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const ids = CHAPTERS.map((c) => c.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    observerRef.current?.disconnect()
    entriesRef.current = {}

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.target?.id) continue
          entriesRef.current[entry.target.id] = entry
        }

        const visible = Object.values(entriesRef.current).filter((e) => e.isIntersecting)
        if (visible.length === 0) return

        const byOrder = (id: string) => ids.indexOf(id)
        const nextActive = visible
          .slice()
          .sort((a, b) => byOrder(a.target.id) - byOrder(b.target.id))[0]

        if (nextActive?.target?.id) setActiveId(nextActive.target.id)
      },
      {
        root: null,
        rootMargin: '0px 0px -70% 0px',
        threshold: 0.1,
      },
    )

    observerRef.current = observer
    elements.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [])

  const items = useMemo(
    () =>
      CHAPTERS.map((chapter) => {
        const label = t(`education.chapters.${chapter.id}`)
        return {
          id: chapter.id,
          label,
          completed: completed.includes(chapter.id),
          active: chapter.id === activeId,
        }
      }),
    [activeId, completed, t],
  )

  const progressLabel = t('education.sidebar.progress')
  const chaptersLabel = t('education.sidebar.chapters')
  const completeLabel = t('education.sidebar.done')

  return (
    <aside className="education-sidebar" data-testid="education-sidebar" aria-label={chaptersLabel}>
      <div className="education-sidebar-card" data-testid="education-sidebar-card">
        <div className="education-sidebar-progress" data-testid="education-progress">
          <div className="education-sidebar-progress-top">
            <span className="sr-only" data-testid="education-sidebar-progress" />
            <div className="education-sidebar-progress-title">{progressLabel}</div>
            <div className="education-sidebar-progress-count" aria-label="Completion">
              {completedCount}/{totalChapters}
            </div>
          </div>

          <div className="education-sidebar-ring" aria-label={`${progressLabel}: ${percent}%`}>
            <img className="education-sidebar-ring-badge" src={progressBadge} alt="" aria-hidden="true" />
            <svg viewBox="0 0 44 44" className="education-sidebar-ring-svg" aria-hidden="true">
              <circle className="education-sidebar-ring-track" cx="22" cy="22" r="18" />
              <circle
                className="education-sidebar-ring-fill"
                cx="22"
                cy="22"
                r="18"
                style={{ strokeDashoffset: `${Math.max(0, 100 - percent)}` }}
              />
            </svg>
            <div className="education-sidebar-ring-text">{percent}%</div>
          </div>
        </div>

        <nav className="education-sidebar-links" aria-label={chaptersLabel}>
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`education-sidebar-link${item.active ? ' active' : ''}`}
              aria-current={item.active ? 'true' : undefined}
              data-testid={`education-sidebar-link-${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                const behavior: ScrollBehavior =
                  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth'
                window.location.hash = `#${item.id}`
                safeScrollToId(item.id, behavior)
              }}
            >
              <span className="education-sidebar-link-icon" aria-hidden="true">
                <img className="education-sidebar-link-icon-img" src={ICON_BY_ID[item.id]} alt="" />
              </span>
              <span className="education-sidebar-link-label">{item.label}</span>
              {item.completed && (
                <span className="education-sidebar-chip" data-testid={`education-sidebar-done-${item.id}`}>
                  <img className="education-sidebar-chip-icon" src={chapterCompleteIcon} alt="" aria-hidden="true" />
                  {completeLabel}
                </span>
              )}
            </a>
          ))}
        </nav>

        <label className="education-sidebar-select" aria-label={chaptersLabel}>
          <span className="sr-only">{chaptersLabel}</span>
          <select
            data-testid="education-sidebar-select"
            value={activeId}
            onChange={(e) => {
              const id = e.target.value
              window.location.hash = `#${id}`
              safeScrollToId(id, 'auto')
            }}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}{item.completed ? ` (${completeLabel})` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>
    </aside>
  )
}
