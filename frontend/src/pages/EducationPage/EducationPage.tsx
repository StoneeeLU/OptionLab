import { useState } from 'react'
import { useReducedMotion, useScroll, useSpring, useTransform, motion, AnimatePresence } from 'framer-motion'
import { AnimatedContainer } from '../../components/common/AnimatedContainer'
import { GlassPanel } from '../../components/common/GlassPanel'
import { Glossary } from '../../components/Education/Glossary'
import { Quiz } from '../../components/Education/Quiz'
import { OptionCalculator, StrategyBuilder, TimeDecayDemo, GreeksSensitivityExplorer } from '../../components/Education/simulators'
import { IVSmileChart } from '../../components/Education/charts'
import { BasicsChapter } from '../../components/Education/chapters/BasicsChapter'
import { PricingChapter } from '../../components/Education/chapters/PricingChapter'
import { GreeksChapter } from '../../components/Education/chapters/GreeksChapter'
import { IVChapter } from '../../components/Education/chapters/IVChapter'
import { StrategiesChapter } from '../../components/Education/chapters/StrategiesChapter'
import { I18nProvider, useI18n } from '../../i18n/I18nContext'
import { LanguageToggle } from '../../i18n/LanguageToggle'
import { EducationSidebar, CHAPTERS } from '../../components/Education/Sidebar/EducationSidebar'
import './EducationPage.css'

function EducationPageInner() {
  const { language } = useI18n()
  const shouldReduceMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && CHAPTERS.some(c => c.id === hash)) {
      return hash
    }
    return 'basics'
  })

  // Scroll animations for hero
  const { scrollYProgress } = useScroll()
  const heroYBase = useTransform(scrollYProgress, [0, 0.22], [0, -50])
  const heroY = useSpring(heroYBase, { stiffness: 120, damping: 26, restDelta: 0.001 })
  
  const heroTextYBase = useTransform(scrollYProgress, [0, 0.2], [0, -15])
  const heroTextY = useSpring(heroTextYBase, { stiffness: 120, damping: 26 })


  const handleTabChange = (id: string) => {
    setActiveTab(id)
    window.history.pushState(null, '', `#${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const title = language === 'zh' ? '期权科普' : 'Options Education'
  const subtitle =
    language === 'zh'
      ? '面向新手的交互式期权入门：概念、Greeks、波动率与策略。'
      : 'An interactive introduction: concepts, Greeks, volatility, and strategies.'

  return (
    <div className="education-page">
      <AnimatedContainer animation="slideUp">
        <GlassPanel className="education-hero" variant="subtle">
          {!shouldReduceMotion && (
            <motion.div className="education-hero-decor" aria-hidden="true" style={{ y: heroY }} />
          )}
          <motion.div 
            className="education-hero-header"
            style={shouldReduceMotion ? {} : { y: heroTextY }}
          >
            <div className="education-hero-text">
              <h1>{title}</h1>
              <p className="subtitle">{subtitle}</p>
            </div>
            <LanguageToggle />
          </motion.div>
        </GlassPanel>
      </AnimatedContainer>

      <div className="education-layout">
        {/* Left Sidebar - Sticky/Fixed via Component CSS */}
        <EducationSidebar 
          className="education-sidebar-layout" 
          activeId={activeTab}
          onNavigate={handleTabChange}
        />

        {/* Main Content - Active Chapter Only */}
        <main className="education-content">
          <AnimatePresence mode="wait">
            {activeTab === 'basics' && (
              <motion.section 
                key="basics"
                id="basics" 
                className="education-chapter-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="education-section">
                  <BasicsChapter />
                  <Quiz chapterId="basics" />
                </div>
              </motion.section>
            )}

            {activeTab === 'pricing' && (
              <motion.section 
                key="pricing"
                id="pricing" 
                className="education-chapter-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="education-section">
                  <PricingChapter />
                  <OptionCalculator />
                  <TimeDecayDemo />
                  <Quiz chapterId="pricing" />
                </div>
              </motion.section>
            )}

            {activeTab === 'greeks' && (
              <motion.section 
                key="greeks"
                id="greeks" 
                className="education-chapter-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="education-section">
                  <GreeksChapter />
                  <GreeksSensitivityExplorer />
                  <Quiz chapterId="greeks" />
                </div>
              </motion.section>
            )}

            {activeTab === 'iv' && (
              <motion.section 
                key="iv"
                id="iv" 
                className="education-chapter-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="education-section">
                  <IVChapter />
                  <IVSmileChart />
                  <Quiz chapterId="iv" />
                </div>
              </motion.section>
            )}

            {activeTab === 'strategies' && (
              <motion.section 
                key="strategies"
                id="strategies" 
                className="education-chapter-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="education-section">
                  <StrategiesChapter />
                  <StrategyBuilder />
                  <Quiz chapterId="strategies" />
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <AnimatedContainer animation="fadeIn">
            <GlassPanel className="education-section-panel">
              <Glossary />
            </GlassPanel>
          </AnimatedContainer>
        </main>
      </div>
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
