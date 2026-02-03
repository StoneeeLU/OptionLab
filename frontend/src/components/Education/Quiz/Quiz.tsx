import { useMemo, useState } from 'react'

import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import { useEducationProgress } from '../../../hooks/useEducationProgress'
import './Quiz.css'

type QuizChoice = {
  en: string
  zh: string
}

type QuizQuestion = {
  id: string
  prompt: {
    en: string
    zh: string
  }
  choices: QuizChoice[]
  correctIndex: number
  explanation: {
    en: string
    zh: string
  }
}

type ChapterId = 'basics' | 'pricing' | 'greeks' | 'iv' | 'strategies'

const QUESTIONS: Record<ChapterId, QuizQuestion[]> = {
  basics: [
    {
      id: 'basics_q1',
      prompt: { en: 'A call option gives the buyer the right to...', zh: '看涨期权赋予买方的权利是...' },
      choices: [
        { en: 'Buy the underlying at the strike price', zh: '以行权价买入标的' },
        { en: 'Sell the underlying at the strike price', zh: '以行权价卖出标的' },
        { en: 'Receive dividends', zh: '获得股息' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Calls are rights to buy; puts are rights to sell.',
        zh: 'Call 是买入的权利；Put 是卖出的权利。',
      },
    },
    {
      id: 'basics_q2',
      prompt: { en: 'The option buyer pays the...', zh: '期权买方支付的是...' },
      choices: [
        { en: 'Premium', zh: '权利金' },
        { en: 'Margin only', zh: '仅保证金' },
        { en: 'Strike price', zh: '行权价' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'The premium is the price of the option contract.',
        zh: '权利金是购买期权合约的价格。',
      },
    },
    {
      id: 'basics_q3',
      prompt: { en: 'For the option seller, the key is...', zh: '对期权卖方来说，关键是...' },
      choices: [
        { en: 'They have an obligation if exercised', zh: '被行权时承担履约义务' },
        { en: 'They can walk away freely', zh: '可以随时不履约' },
        { en: 'They are guaranteed profit', zh: '保证盈利' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Sellers receive premium but may have to fulfill exercise.',
        zh: '卖方收取权利金，但被行权时需要履约。',
      },
    },
  ],
  pricing: [
    {
      id: 'pricing_q1',
      prompt: { en: 'Option price is typically made of...', zh: '期权价格通常由...构成' },
      choices: [
        { en: 'Intrinsic value + time value', zh: '内在价值 + 时间价值' },
        { en: 'Only intrinsic value', zh: '只有内在价值' },
        { en: 'Only time value', zh: '只有时间价值' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Before expiry, time value is often non-zero.',
        zh: '到期前，时间价值通常不为零。',
      },
    },
    {
      id: 'pricing_q2',
      prompt: { en: 'Higher volatility usually makes options...', zh: '更高的波动率通常会让期权...' },
      choices: [
        { en: 'More expensive', zh: '更贵' },
        { en: 'Cheaper', zh: '更便宜' },
        { en: 'Unchanged', zh: '不变' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'More uncertainty increases the value of optionality.',
        zh: '不确定性更大，选择权通常更有价值。',
      },
    },
    {
      id: 'pricing_q3',
      prompt: { en: 'As time to expiry decreases, time value tends to...', zh: '随着到期时间减少，时间价值倾向于...' },
      choices: [
        { en: 'Decrease', zh: '减少' },
        { en: 'Increase', zh: '增加' },
        { en: 'Become negative', zh: '变成负数' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Less time means less chance for favorable moves.',
        zh: '时间越少，出现有利波动的机会越少。',
      },
    },
  ],
  greeks: [
    {
      id: 'greeks_q1',
      prompt: { en: 'Delta measures sensitivity to...', zh: 'Delta 衡量对...的敏感度' },
      choices: [
        { en: 'Underlying price', zh: '标的价格' },
        { en: 'Time', zh: '时间' },
        { en: 'Interest rate', zh: '利率' },
      ],
      correctIndex: 0,
      explanation: { en: 'Delta is dPrice/dSpot (roughly).', zh: 'Delta 近似表示价格对标的价格的导数。' },
    },
    {
      id: 'greeks_q2',
      prompt: { en: 'Theta is most related to...', zh: 'Theta 最相关的是...' },
      choices: [
        { en: 'Time decay', zh: '时间衰减' },
        { en: 'Volatility', zh: '波动率' },
        { en: 'Strike', zh: '行权价' },
      ],
      correctIndex: 0,
      explanation: { en: 'Theta captures value loss as time passes.', zh: 'Theta 描述时间流逝带来的价值损耗。' },
    },
    {
      id: 'greeks_q3',
      prompt: { en: 'Vega measures sensitivity to...', zh: 'Vega 衡量对...的敏感度' },
      choices: [
        { en: 'Volatility', zh: '波动率' },
        { en: 'Interest rate', zh: '利率' },
        { en: 'Dividend', zh: '股息' },
      ],
      correctIndex: 0,
      explanation: { en: 'Vega is dPrice/dVolatility (roughly).', zh: 'Vega 近似表示价格对波动率的导数。' },
    },
  ],
  iv: [
    {
      id: 'iv_q1',
      prompt: { en: 'Implied volatility is...', zh: '隐含波动率是...' },
      choices: [
        { en: 'Volatility implied by option prices', zh: '由期权价格反推的波动率' },
        { en: 'Historical realized volatility', zh: '历史实现波动率' },
        { en: 'Guaranteed future volatility', zh: '未来必然发生的波动' },
      ],
      correctIndex: 0,
      explanation: { en: 'It is model-implied from market prices.', zh: '它是把市场价格代入模型反推得到的。' },
    },
    {
      id: 'iv_q2',
      prompt: { en: 'Volatility skew often reflects...', zh: '波动率偏斜通常反映...' },
      choices: [
        { en: 'Tail risk demand', zh: '尾部风险需求' },
        { en: 'Dividends only', zh: '仅股息影响' },
        { en: 'Arbitrage-free guarantee', zh: '无套利保证' },
      ],
      correctIndex: 0,
      explanation: { en: 'OTM puts often trade richer due to crash protection demand.', zh: '虚值看跌常更贵，因保护性需求。' },
    },
    {
      id: 'iv_q3',
      prompt: { en: 'A volatility smile means IV changes with...', zh: '波动率微笑意味着 IV 会随...变化' },
      choices: [
        { en: 'Strike', zh: '行权价' },
        { en: 'Ticker symbol', zh: '股票代码' },
        { en: 'Exchange hours', zh: '交易时段' },
      ],
      correctIndex: 0,
      explanation: { en: 'IV is not flat across strikes.', zh: '不同的行权价对应不同的 IV。' },
    },
  ],
  strategies: [
    {
      id: 'strat_q1',
      prompt: { en: 'A spread strategy typically...', zh: '价差策略通常...' },
      choices: [
        { en: 'Limits risk and reward', zh: '限制风险与收益' },
        { en: 'Guarantees profit', zh: '保证盈利' },
        { en: 'Has no legs', zh: '不包含多腿' },
      ],
      correctIndex: 0,
      explanation: { en: 'Buying and selling options can cap payoff.', zh: '买卖组合通常会让盈亏有限。' },
    },
    {
      id: 'strat_q2',
      prompt: { en: 'A straddle is most aligned with...', zh: '跨式策略最贴近...' },
      choices: [
        { en: 'Expecting big movement', zh: '预期大波动' },
        { en: 'Expecting no movement', zh: '预期不波动' },
        { en: 'Only earning interest', zh: '只赚利息' },
      ],
      correctIndex: 0,
      explanation: { en: 'Straddles benefit from large moves either way.', zh: '跨式押注上涨或下跌都可能大幅波动。' },
    },
    {
      id: 'strat_q3',
      prompt: { en: 'Iron condor is often used when...', zh: '铁鹰策略常用于...' },
      choices: [
        { en: 'Expecting a range', zh: '预期区间震荡' },
        { en: 'Expecting a crash', zh: '预期暴跌' },
        { en: 'Seeking dividends', zh: '追求股息' },
      ],
      correctIndex: 0,
      explanation: { en: 'Condors are often range-bound premium-selling structures.', zh: '铁鹰常是押注价格在区间内的结构。' },
    },
  ],
}

export type QuizProps = {
  chapterId: ChapterId
}

export function Quiz({ chapterId }: QuizProps) {
  const { language } = useI18n()
  const { progress, updateQuizScore, unlockAchievement } = useEducationProgress()

  const questions = QUESTIONS[chapterId]
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [lastChoice, setLastChoice] = useState<number | null>(null)

  const current = questions[index]
  const answered = current.id in answers

  const correctCount = useMemo(() => {
    return questions.reduce((count, q) => {
      const a = answers[q.id]
      return count + (a === q.correctIndex ? 1 : 0)
    }, 0)
  }, [answers, questions])

  const completed = Object.keys(answers).length === questions.length
  const score = useMemo(() => {
    if (!questions.length) return 0
    return Math.round((correctCount / questions.length) * 100)
  }, [correctCount, questions.length])

  const bestScore = progress.quizScores[chapterId] ?? 0

  function submitChoice(choiceIndex: number) {
    if (answered) return
    setLastChoice(choiceIndex)
    setAnswers((prev) => ({ ...prev, [current.id]: choiceIndex }))
  }

  function next() {
    setLastChoice(null)
    setIndex((i) => Math.min(i + 1, questions.length - 1))
  }

  function finalize() {
    updateQuizScore(chapterId, score)
    if (score === 100) {
      unlockAchievement('perfect_quiz')
    }
  }

  return (
    <GlassPanel variant="subtle" className="quiz" data-testid="quiz">
      <header className="quiz-header">
        <div>
          <h4>{language === 'zh' ? '小测验' : 'Quiz'}</h4>
          <p className="subtitle">
            {language === 'zh'
              ? `题目 ${index + 1}/${questions.length}`
              : `Question ${index + 1}/${questions.length}`}
          </p>
        </div>
        <div className="quiz-score" data-testid="quiz-score">
          {language === 'zh' ? '得分' : 'Score'}: {completed ? score : bestScore}%
        </div>
      </header>

      <div className="quiz-body">
        <div className="quiz-question" data-testid="quiz-question">
          {language === 'zh' ? current.prompt.zh : current.prompt.en}
        </div>

        <div className="quiz-choices" role="list">
          {current.choices.map((c, i) => {
            const choiceText = language === 'zh' ? c.zh : c.en
            const isCorrect = i === current.correctIndex
            const isSelected = lastChoice === i
            const showState = answered
            return (
              <button
                key={`${current.id}_${i}`}
                type="button"
                role="listitem"
                data-testid={`quiz-choice-${i}`}
                className={`quiz-choice${showState && isCorrect ? ' correct' : ''}${showState && isSelected && !isCorrect ? ' wrong' : ''}`}
                onClick={() => submitChoice(i)}
              >
                {choiceText}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="quiz-feedback" data-testid="quiz-feedback">
            <div className="quiz-feedback-title">
              {lastChoice === current.correctIndex
                ? language === 'zh'
                  ? '回答正确'
                  : 'Correct'
                : language === 'zh'
                  ? '回答错误'
                  : 'Incorrect'}
            </div>
            <div className="quiz-feedback-text">
              {language === 'zh' ? current.explanation.zh : current.explanation.en}
            </div>
            <div className="quiz-actions">
              {index < questions.length - 1 ? (
                <button type="button" data-testid="quiz-next" className="quiz-next" onClick={next}>
                  {language === 'zh' ? '下一题' : 'Next'}
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="quiz-finish"
                  className="quiz-next"
                  onClick={finalize}
                  disabled={!completed}
                >
                  {language === 'zh' ? '完成并保存' : 'Finish & Save'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  )
}
