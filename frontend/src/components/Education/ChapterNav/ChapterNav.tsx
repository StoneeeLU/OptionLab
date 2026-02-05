import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { useEducationProgress } from '../../../hooks/useEducationProgress'
import { CHAPTERS } from '../../../constants/education'
import chapterCompleteIcon from '../../../assets/education/chapter-complete.svg'
import './ChapterNav.css'

function getHashId(): string {
  const raw = window.location.hash
  if (!raw || raw === '#') return 'basics'
  return raw.startsWith('#') ? raw.slice(1) : raw
}

export function ChapterNav() {
  const { progress } = useEducationProgress()
  const completed = progress.completedChapters

  const [activeId, setActiveId] = useState<string>(() => getHashId())

  useEffect(() => {
    function handleHashChange() {
      setActiveId(getHashId())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const options = useMemo(
    () =>
      CHAPTERS.map((chapter) => ({
        ...chapter,
        completed: completed.includes(chapter.id),
        active: chapter.id === activeId,
      })),
    [activeId, completed],
  )

  return (
    <div className="chapter-nav" data-testid="chapter-nav">
      <nav className="chapter-nav-links" aria-label="Chapters">
        {options.map((chapter) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            className={`chapter-link${chapter.active ? ' active' : ''}`}
            data-testid={`chapter-link-${chapter.id}`}
          >
            {chapter.active && (
              <motion.div
                layoutId="chapterNavActive"
                className="chapter-link-bg"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="chapter-link-label">{chapter.label}</span>
            {chapter.completed && (
              <span
                className="chapter-complete"
                data-testid={`chapter-complete-${chapter.id}`}
                aria-label="Completed"
              >
                <img src={chapterCompleteIcon} alt="" aria-hidden="true" />
              </span>
            )}
          </a>
        ))}
      </nav>

      <label className="chapter-nav-select" aria-label="Chapters">
        <span className="sr-only">Chapters</span>
        <select
          data-testid="chapter-select"
          value={activeId}
          onChange={(e) => {
            const id = e.target.value
            window.location.hash = `#${id}`
          }}
        >
          {options.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.label}{chapter.completed ? ' (Done)' : ''}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
