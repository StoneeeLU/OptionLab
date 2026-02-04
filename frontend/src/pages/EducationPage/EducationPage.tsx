import { useReducedMotion, useScroll, useSpring, useTransform, motion } from 'framer-motion'
import { AnimatedContainer } from '../../components/common/AnimatedContainer'
import { GlassPanel } from '../../components/common/GlassPanel'
import { Glossary } from '../../components/Education/Glossary'
import { Quiz } from '../../components/Education/Quiz'
import { OptionCalculator, StrategyBuilder, TimeDecayDemo } from '../../components/Education/simulators'
import { BasicsChapter } from '../../components/Education/chapters/BasicsChapter'
import { PricingChapter } from '../../components/Education/chapters/PricingChapter'
import { GreeksChapter } from '../../components/Education/chapters/GreeksChapter'
import { IVChapter } from '../../components/Education/chapters/IVChapter'
import { StrategiesChapter } from '../../components/Education/chapters/StrategiesChapter'
import { I18nProvider, useI18n } from '../../i18n/I18nContext'
import { LanguageToggle } from '../../i18n/LanguageToggle'
import { Tabs, TabList, Tab, TabPanel } from '../../components/common/Tabs'
import { useEducationProgress } from '../../hooks/useEducationProgress'
import './EducationPage.css'

// Icons
import basicsIcon from '../../assets/education/basics-icon.svg'
import chapterCompleteIcon from '../../assets/education/chapter-complete.svg'
import greeksIcon from '../../assets/education/greeks-icon.svg'
import ivIcon from '../../assets/education/iv-icon.svg'
import pricingIcon from '../../assets/education/pricing-icon.svg'
import progressBadge from '../../assets/education/progress-badge.svg'
import strategiesIcon from '../../assets/education/strategies-icon.svg'

const CHAPTERS = ['basics', 'pricing', 'greeks', 'iv', 'strategies']

function EducationPageInner() {
  const { language, t } = useI18n()
  const { progress } = useEducationProgress()
  const shouldReduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll()
  const heroYBase = useTransform(scrollYProgress, [0, 0.22], [0, -22])
  const heroY = useSpring(heroYBase, { stiffness: 120, damping: 26, restDelta: 0.001 })

  const title = language === 'zh' ? '期权科普' : 'Options Education'
  const subtitle =
    language === 'zh'
      ? '面向新手的交互式期权入门：概念、Greeks、波动率与策略。'
      : 'An interactive introduction: concepts, Greeks, volatility, and strategies.'

  const isCompleted = (id: string) => progress.completedChapters.includes(id)

  // Progress calculation
  const completedCount = Math.min(progress.completedChapters.length, CHAPTERS.length)
  const percent = Math.round((completedCount / CHAPTERS.length) * 100)
  const progressLabel = t('education.sidebar.progress')

  return (
    <div className="education-page">
      <AnimatedContainer animation="slideUp">
        <GlassPanel className="education-hero" variant="subtle">
          {!shouldReduceMotion && (
            <motion.div className="education-hero-decor" aria-hidden="true" style={{ y: heroY }} />
          )}
          <div className="education-hero-header">
            <div className="education-hero-text">
              <h1>{title}</h1>
              <p className="subtitle">{subtitle}</p>
            </div>
            <LanguageToggle />
          </div>
        </GlassPanel>
      </AnimatedContainer>

      <Tabs defaultTab="basics" className="education-tabs-layout">
        {/* Left Sidebar with Tabs */}
        <aside className="education-sidebar" data-testid="education-sidebar">
          <div className="education-sidebar-card" data-testid="education-sidebar-card">
            {/* Progress Ring - Centered */}
            <div className="education-sidebar-progress" data-testid="education-progress">
              <div className="education-sidebar-progress-top">
                <div className="education-sidebar-progress-title">{progressLabel}</div>
                <div className="education-sidebar-progress-count" aria-label="Completion">
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
                  <div className="education-sidebar-ring-text">{percent}%</div>
                </div>
              </div>
            </div>

            {/* Vertical Tab List */}
            <TabList aria-label="Education Chapters" className="education-sidebar-tabs">
              <Tab id="basics" className="education-sidebar-tab">
                <img src={basicsIcon} alt="" className="tab-icon" aria-hidden="true" />
                <span className="tab-label">{t('education.chapters.basics')}</span>
                {isCompleted('basics') && (
                  <img src={chapterCompleteIcon} alt="Completed" className="tab-status-icon" />
                )}
              </Tab>
              <Tab id="pricing" className="education-sidebar-tab">
                <img src={pricingIcon} alt="" className="tab-icon" aria-hidden="true" />
                <span className="tab-label">{t('education.chapters.pricing')}</span>
                {isCompleted('pricing') && (
                  <img src={chapterCompleteIcon} alt="Completed" className="tab-status-icon" />
                )}
              </Tab>
              <Tab id="greeks" className="education-sidebar-tab">
                <img src={greeksIcon} alt="" className="tab-icon" aria-hidden="true" />
                <span className="tab-label">{t('education.chapters.greeks')}</span>
                {isCompleted('greeks') && (
                  <img src={chapterCompleteIcon} alt="Completed" className="tab-status-icon" />
                )}
              </Tab>
              <Tab id="iv" className="education-sidebar-tab">
                <img src={ivIcon} alt="" className="tab-icon" aria-hidden="true" />
                <span className="tab-label">{t('education.chapters.iv')}</span>
                {isCompleted('iv') && (
                  <img src={chapterCompleteIcon} alt="Completed" className="tab-status-icon" />
                )}
              </Tab>
              <Tab id="strategies" className="education-sidebar-tab">
                <img src={strategiesIcon} alt="" className="tab-icon" aria-hidden="true" />
                <span className="tab-label">{t('education.chapters.strategies')}</span>
                {isCompleted('strategies') && (
                  <img src={chapterCompleteIcon} alt="Completed" className="tab-status-icon" />
                )}
              </Tab>
            </TabList>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="education-main">
          <TabPanel id="basics">
            <div className="education-section">
              <BasicsChapter />
              <Quiz chapterId="basics" />
            </div>
          </TabPanel>

          <TabPanel id="pricing">
            <div className="education-section">
              <PricingChapter />
              <OptionCalculator />
              <TimeDecayDemo />
              <Quiz chapterId="pricing" />
            </div>
          </TabPanel>

          <TabPanel id="greeks">
            <div className="education-section">
              <GreeksChapter />
              <Quiz chapterId="greeks" />
            </div>
          </TabPanel>

          <TabPanel id="iv">
            <div className="education-section">
              <IVChapter />
              <Quiz chapterId="iv" />
            </div>
          </TabPanel>

          <TabPanel id="strategies">
            <div className="education-section">
              <StrategiesChapter />
              <StrategyBuilder />
              <Quiz chapterId="strategies" />
            </div>
          </TabPanel>

          <AnimatedContainer animation="fadeIn">
            <GlassPanel className="education-section-panel">
              <Glossary />
            </GlassPanel>
          </AnimatedContainer>
        </div>
      </Tabs>
    </div>
  )
}

export function EducationPage() {
  return (
    <I18nProvider>
      <EducationPageInner />
    </I18nProvider>
  )
}
