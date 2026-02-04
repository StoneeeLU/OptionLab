import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useMemo } from 'react'

import { AnimatedContainer } from '../../components/common/AnimatedContainer'
import { GlassPanel } from '../../components/common/GlassPanel'
import { Glossary } from '../../components/Education/Glossary'
import { AchievementPanel } from '../../components/Education/Achievements'
import { Quiz } from '../../components/Education/Quiz'
import { EducationSidebar } from '../../components/Education/Sidebar'
import { OptionCalculator, StrategyBuilder, TimeDecayDemo } from '../../components/Education/simulators'
import { BasicsChapter } from '../../components/Education/chapters/BasicsChapter'
import { PricingChapter } from '../../components/Education/chapters/PricingChapter'
import { GreeksChapter } from '../../components/Education/chapters/GreeksChapter'
import { IVChapter } from '../../components/Education/chapters/IVChapter'
import { StrategiesChapter } from '../../components/Education/chapters/StrategiesChapter'
import { I18nProvider, useI18n } from '../../i18n/I18nContext'
import { LanguageToggle } from '../../i18n/LanguageToggle'
import './EducationPage.css'

function EducationPageInner() {
  const { language } = useI18n()
  const shouldReduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll()
  const heroYBase = useTransform(scrollYProgress, [0, 0.22], [0, -22])
  const heroY = useSpring(heroYBase, { stiffness: 120, damping: 26, restDelta: 0.001 })

  const sectionMotionProps = useMemo(() => {
    if (shouldReduceMotion) return {}
    if (typeof IntersectionObserver === 'undefined') return {}
    return {
      initial: { opacity: 0, y: 18 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.22 },
      transition: { duration: 0.45, ease: 'easeOut' },
    } as const
  }, [shouldReduceMotion])

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
          <div className="education-hero-header">
            <div className="education-hero-text">
              <h1>{title}</h1>
              <p className="subtitle">{subtitle}</p>
            </div>
            <LanguageToggle />
          </div>
        </GlassPanel>
      </AnimatedContainer>

      <div className="education-layout" data-testid="education-layout">
        <AnimatedContainer animation="fadeIn">
          <EducationSidebar />
        </AnimatedContainer>

        <div className="education-main">
          <AnimatedContainer animation="fadeIn">
            <AchievementPanel />
          </AnimatedContainer>

          <div className="education-sections">
            <motion.section
              id="basics"
              className="education-section"
              data-testid="section-basics"
              {...sectionMotionProps}
            >
              <BasicsChapter />
              <Quiz chapterId="basics" />
            </motion.section>

            <motion.section
              id="pricing"
              className="education-section"
              data-testid="section-pricing"
              {...sectionMotionProps}
            >
              <PricingChapter />
              <OptionCalculator />
              <TimeDecayDemo />
              <Quiz chapterId="pricing" />
            </motion.section>

            <motion.section
              id="greeks"
              className="education-section"
              data-testid="section-greeks"
              {...sectionMotionProps}
            >
              <GreeksChapter />
              <Quiz chapterId="greeks" />
            </motion.section>

            <motion.section id="iv" className="education-section" data-testid="section-iv" {...sectionMotionProps}>
              <IVChapter />
              <Quiz chapterId="iv" />
            </motion.section>

            <motion.section
              id="strategies"
              className="education-section"
              data-testid="section-strategies"
              {...sectionMotionProps}
            >
              <StrategiesChapter />
              <StrategyBuilder />
              <Quiz chapterId="strategies" />
            </motion.section>

            <motion.section className="education-section" data-testid="section-glossary" {...sectionMotionProps}>
              <Glossary />
            </motion.section>
          </div>
        </div>
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
