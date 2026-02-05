import { useState, useEffect } from 'react'
import { motion, useSpring, useTransform, useMotionValue, useReducedMotion } from 'framer-motion'
import { useEducationProgress } from '../../../hooks/useEducationProgress'
import { useI18n } from '../../../i18n/I18nContext'
import { CHAPTERS, type ChapterId } from '../../../constants/education'
import './EducationSidebar.css'

// Icons
import chapterCompleteIcon from '../../../assets/education/chapter-complete.svg'
import progressBadge from '../../../assets/education/progress-badge.svg'

interface EducationSidebarProps {
  className?: string
  activeId: ChapterId
  onNavigate: (id: ChapterId) => void
}

export function EducationSidebar({ 
  className = '', 
  activeId, 
  onNavigate
}: EducationSidebarProps) {
  const { t } = useI18n()
  const { progress } = useEducationProgress()
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  
  // Progress calculation
  const completedCount = Math.min(progress.completedChapters.length, CHAPTERS.length)
  const percent = Math.round((completedCount / CHAPTERS.length) * 100)
  const progressLabel = t('education.sidebar.progress')

  // Animation for progress number
  const progressMotionValue = useMotionValue(0)
  const animatedProgress = useSpring(progressMotionValue, { 
    damping: 20, 
    stiffness: 100,
    duration: shouldReduceMotion ? 0 : undefined
  })
  const roundedProgress = useTransform(animatedProgress, (latest) => Math.round(latest))

  useEffect(() => {
    progressMotionValue.set(percent)
  }, [percent, progressMotionValue])

  const isCompleted = (id: string) => progress.completedChapters.includes(id)

  const handleChapterClick = (e: React.MouseEvent, id: ChapterId) => {
    e.preventDefault()
    
    // Close mobile menu on selection
    setIsExpanded(false)

    onNavigate(id)
  }

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const activeChapterConfig = CHAPTERS.find(c => c.id === activeId) || CHAPTERS[0]

  return (
    <>
      <aside 
        className={`education-sidebar ${isExpanded ? 'expanded' : ''} ${className}`} 
        data-testid="education-sidebar"
      >
        {/* Mobile Floating Indicator */}
        <div 
          className="education-mobile-indicator" 
          onClick={toggleExpanded}
          role="button"
          aria-label={t('education.sidebar.toggle')}
        >
          <div className="education-mobile-ring">
             <svg viewBox="0 0 44 44" className="education-sidebar-ring-svg" aria-hidden="true">
              <circle className="education-sidebar-ring-track" cx="22" cy="22" r="18" strokeWidth="4" />
              <circle
                className="education-sidebar-ring-fill"
                cx="22"
                cy="22"
                r="18"
                strokeWidth="4"
                style={{ strokeDashoffset: `${Math.max(0, 100 - percent)}` }}
              />
            </svg>
          </div>
          <span className="education-mobile-label">
            {t(`education.chapters.${activeChapterConfig.id}`)}
          </span>
          <svg className="education-mobile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>

        {/* Sidebar Card */}
        <div className="education-sidebar-card" data-testid="education-sidebar-card">
          <div className="education-sidebar-progress" data-testid="education-progress">
            <div className="education-sidebar-progress-top">
              <div className="education-sidebar-progress-title">{progressLabel}</div>
              <div className="education-sidebar-progress-count" aria-label={t('education.sidebar.completion')}>
                {completedCount}/{CHAPTERS.length}
              </div>
            </div>
            <div className="education-sidebar-ring-wrapper">
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
                <div className="education-sidebar-ring-text">
                  <motion.span>{roundedProgress}</motion.span>%
                </div>
              </div>
            </div>
          </div>

          <nav className="education-sidebar-nav">
            <ul className="education-sidebar-tabs">
              {CHAPTERS.map((chapter) => (
                <li key={chapter.id}>
                  <a
                    href={`#${chapter.id}`}
                    className={`education-sidebar-tab ${activeId === chapter.id ? 'active' : ''}`}
                    onClick={(e) => handleChapterClick(e, chapter.id)}
                    aria-current={activeId === chapter.id ? 'true' : undefined}
                  >
                    <img src={chapter.icon} alt="" className="tab-icon" aria-hidden="true" />
                    <span className="tab-label">{t(`education.chapters.${chapter.id}`)}</span>
                    {isCompleted(chapter.id) && (
                      <motion.img 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        src={chapterCompleteIcon} 
                        alt={t('education.sidebar.done')} 
                        className="tab-status-icon" 
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Backdrop for mobile */}
        {isExpanded && (
          <div 
            className="education-sidebar-backdrop" 
            onClick={() => setIsExpanded(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 150 }} 
            aria-hidden="true"
          />
        )}
      </aside>
    </>
  )
}
