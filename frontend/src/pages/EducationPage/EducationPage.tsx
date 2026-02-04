import { useState } from 'react'
import { useReducedMotion, useScroll, useSpring, useTransform, motion, AnimatePresence } from 'framer-motion'
import { AnimatedContainer } from '../../components/common/AnimatedContainer'
import { GlassPanel } from '../../components/common/GlassPanel'
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
                  
                  <div className="simulator-intro" style={{ margin: '1rem 0 0' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{language === 'zh' ? '期权计算器' : 'Option Calculator'}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      {language === 'zh' 
                        ? 'Black-Scholes 模型是期权定价的基石。试着调整下方的输入参数，观察期权价格和 Greeks 如何变化。' 
                        : 'The Black-Scholes model is the cornerstone of option pricing. Try adjusting the inputs below to see how option prices and Greeks respond.'}
                    </p>
                    <div className="simulator-prompt" style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      marginTop: '1rem',
                      borderLeft: '4px solid var(--color-primary)'
                    }}>
                      <strong>{language === 'zh' ? '试一试：' : 'Try it yourself:'}</strong>
                      <ul style={{ margin: '0.5rem 0 0 1.5rem', color: 'var(--color-text-secondary)' }}>
                         <li>{language === 'zh' 
                           ? '将波动率 (Volatility) 设为 50%，观察价格变化。'
                           : 'Set Volatility to 50% and see how the price changes.'}
                         </li>
                         <li>{language === 'zh'
                           ? '改变距到期时间 (Days to Expiration)，看看 Theta 的影响。'
                           : 'Change Days to Expiration to see the impact of Theta.'}
                         </li>
                      </ul>
                    </div>
                  </div>

                  <OptionCalculator />

                  <div className="simulator-intro" style={{ margin: '2rem 0 0' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{language === 'zh' ? '时间衰减演示' : 'Time Decay Demo'}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      {language === 'zh'
                        ? '期权是耗损性资产。此演示展示了时间流逝对期权价值的侵蚀（即 Theta 衰减），尤其是在临近到期时。'
                        : 'Options are wasting assets. This demo visualizes how time erodes option value (Theta decay), especially as expiration approaches.'}
                    </p>
                     <div className="simulator-prompt" style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      marginTop: '1rem',
                      borderLeft: '4px solid var(--color-primary)'
                    }}>
                      <strong>{language === 'zh' ? '试一试：' : 'Try it yourself:'}</strong>
                      <ul style={{ margin: '0.5rem 0 0 1.5rem', color: 'var(--color-text-secondary)' }}>
                         <li>{language === 'zh'
                           ? '观察曲线在最后 30 天是如何加速下降的。'
                           : 'Watch how the curve accelerates downwards in the last 30 days.'}
                         </li>
                      </ul>
                    </div>
                  </div>

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
