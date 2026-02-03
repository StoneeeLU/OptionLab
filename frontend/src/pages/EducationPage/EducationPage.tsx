import { AnimatedContainer } from '../../components/common/AnimatedContainer'
import { GlassPanel } from '../../components/common/GlassPanel'
import { ChapterNav } from '../../components/Education/ChapterNav'
import { Glossary } from '../../components/Education/Glossary'
import { AchievementPanel } from '../../components/Education/Achievements'
import { Quiz } from '../../components/Education/Quiz'
import { OptionCalculator, StrategyBuilder, TimeDecayDemo } from '../../components/Education/simulators'
import { BasicsChapter } from '../../components/Education/chapters/BasicsChapter'
import { PricingChapter } from '../../components/Education/chapters/PricingChapter'
import { GreeksChapter } from '../../components/Education/chapters/GreeksChapter'
import { IVChapter } from '../../components/Education/chapters/IVChapter'
import { StrategiesChapter } from '../../components/Education/chapters/StrategiesChapter'
import { I18nProvider, useI18n } from '../../i18n/I18nContext'
import { LanguageToggle } from '../../i18n/LanguageToggle'
import { useEducationProgress } from '../../hooks/useEducationProgress'
import './EducationPage.css'

function EducationPageInner() {
  const { language } = useI18n()
  const { progress } = useEducationProgress()

  const title = language === 'zh' ? '期权科普' : 'Options Education'
  const subtitle =
    language === 'zh'
      ? '面向新手的交互式期权入门：概念、Greeks、波动率与策略。'
      : 'An interactive introduction: concepts, Greeks, volatility, and strategies.'

  const totalChapters = 5
  const completedCount = Math.min(progress.completedChapters.length, totalChapters)
  const percent = Math.round((completedCount / totalChapters) * 100)

  return (
    <div className="education-page">
      <AnimatedContainer animation="slideUp">
        <GlassPanel className="education-hero" variant="subtle">
          <div className="education-hero-header">
            <div className="education-hero-text">
              <h1>{title}</h1>
              <p className="subtitle">{subtitle}</p>
            </div>
            <LanguageToggle />
          </div>
        </GlassPanel>
      </AnimatedContainer>

      <AnimatedContainer animation="fadeIn">
        <GlassPanel className="education-nav" variant="subtle">
          <div className="education-progress" data-testid="education-progress">
            <div className="education-progress-label">
              {language === 'zh' ? '学习进度' : 'Progress'}: {completedCount}/{totalChapters}
            </div>
            <div className="education-progress-bar" aria-label="Progress">
              <div className="education-progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <ChapterNav />
        </GlassPanel>
      </AnimatedContainer>

      <AnimatedContainer animation="fadeIn">
        <AchievementPanel />
      </AnimatedContainer>

      <div className="education-sections">
        <section id="basics" className="education-section" data-testid="section-basics">
          <BasicsChapter />
          <Quiz chapterId="basics" />
        </section>

        <section id="pricing" className="education-section" data-testid="section-pricing">
          <PricingChapter />
          <OptionCalculator />
          <TimeDecayDemo />
          <Quiz chapterId="pricing" />
        </section>

        <section id="greeks" className="education-section" data-testid="section-greeks">
          <GreeksChapter />
          <Quiz chapterId="greeks" />
        </section>

        <section id="iv" className="education-section" data-testid="section-iv">
          <IVChapter />
          <Quiz chapterId="iv" />
        </section>

        <section id="strategies" className="education-section" data-testid="section-strategies">
          <StrategiesChapter />
          <StrategyBuilder />
          <Quiz chapterId="strategies" />
        </section>

        <section className="education-section" data-testid="section-glossary">
          <Glossary />
        </section>
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
