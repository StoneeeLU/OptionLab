import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

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
    {
      id: 'basics_q4',
      prompt: { en: 'What happens if you exercise a call option?', zh: '行使看涨期权（Call）会发生什么？' },
      choices: [
        { en: 'Buy underlying at strike', zh: '以行权价买入标的资产' },
        { en: 'Sell underlying at strike', zh: '以行权价卖出标的资产' },
        { en: 'Get cash only', zh: '仅获得现金' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Exercising a call means buying the underlying asset at the agreed strike price.',
        zh: '行使看涨期权意味着按约定的行权价买入标的资产。',
      },
    },
    {
      id: 'basics_q5',
      prompt: { en: 'A put option is "In-the-Money" (ITM) when:', zh: '看跌期权（Put）在什么情况下是“实值”（ITM）的？' },
      choices: [
        { en: 'Spot price < Strike price', zh: '现价 < 行权价' },
        { en: 'Spot price > Strike price', zh: '现价 > 行权价' },
        { en: 'Spot price = Strike price', zh: '现价 = 行权价' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'For puts, being ITM means the market price is lower than the strike price.',
        zh: '对于看跌期权，实值意味着市场价格低于行权价。',
      },
    },
    {
      id: 'basics_q6',
      prompt: { en: 'Who has the right (but not obligation) in an option contract?', zh: '在期权合约中，谁拥有权利（而非义务）？' },
      choices: [
        { en: 'The buyer (long)', zh: '买方（多头）' },
        { en: 'The seller (short)', zh: '卖方（空头）' },
        { en: 'Both parties', zh: '双方' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Only the buyer holds the right; the seller has the potential obligation.',
        zh: '只有买方持有权利；卖方承担潜在的履约义务。',
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
    {
      id: 'pricing_q4',
      prompt: { en: 'What is "Intrinsic Value"?', zh: '什么是“内在价值”？' },
      choices: [
        { en: 'The profit if exercised immediately', zh: '立即行权可获得的利润' },
        { en: 'The potential for future profit', zh: '未来盈利的潜力' },
        { en: 'The cost of the margin', zh: '保证金的成本' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Intrinsic value is the "real" value if the option were exercised right now.',
        zh: '内在价值是如果期权立即行权所具有的“真实”价值。',
      },
    },
    {
      id: 'pricing_q5',
      prompt: { en: '"Time Value" is also known as:', zh: '“时间价值”也被称作：' },
      choices: [
        { en: 'Extrinsic value', zh: '外在价值' },
        { en: 'Intrinsic value', zh: '内在价值' },
        { en: 'Historical value', zh: '历史价值' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Time value and extrinsic value are often used interchangeably to describe value beyond intrinsic.',
        zh: '时间价值和外在价值通常可以互换使用，描述超出内在价值的那部分价值。',
      },
    },
    {
      id: 'pricing_q6',
      prompt: { en: 'What is "IV Crush"?', zh: '什么是“IV 崩溃”（IV Crush）？' },
      choices: [
        { en: 'Sharp drop in IV after an event', zh: '事件后 IV 大幅下降' },
        { en: 'Sharp rise in IV during a crash', zh: '崩盘期间 IV 大幅上升' },
        { en: 'IV reaching zero at expiry', zh: '到期时 IV 归零' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'IV often drops sharply after an expected event like earnings, reducing option prices.',
        zh: 'IV 通常在预期事件（如财报）后大幅下降，导致期权价格缩水。',
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
    {
      id: 'greeks_q4',
      prompt: { en: 'Which Greek is most sensitive to the passage of time?', zh: '哪一个希腊字母对时间的流逝最敏感？' },
      choices: [
        { en: 'Theta', zh: 'Theta' },
        { en: 'Gamma', zh: 'Gamma' },
        { en: 'Delta', zh: 'Delta' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Theta measures the rate of value decline due to time passing.',
        zh: 'Theta 衡量因时间流逝而导致的价值衰减速度。',
      },
    },
    {
      id: 'greeks_q5',
      prompt: { en: 'Gamma is highest for options that are:', zh: 'Gamma 在哪种期权中最高？' },
      choices: [
        { en: 'At-the-money (ATM)', zh: '平值期权（ATM）' },
        { en: 'Far out-of-the-money (OTM)', zh: '远虚值期权（OTM）' },
        { en: 'Deep in-the-money (ITM)', zh: '深实值期权（ITM）' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'ATM options have the most sensitive Delta, hence the highest Gamma.',
        zh: '平值期权的 Delta 最敏感，因此 Gamma 最高。',
      },
    },
    {
      id: 'greeks_q6',
      prompt: { en: 'A "Delta Neutral" portfolio aims to be:', zh: '“Delta 中性”组合旨在：' },
      choices: [
        { en: 'Insensitive to small price moves', zh: '对微小价格波动不敏感' },
        { en: 'Unaffected by volatility', zh: '不受波动率影响' },
        { en: 'Immune to time decay', zh: '免疫时间衰减' },
      ],
      correctIndex: 0,
      explanation: {
        en: "Delta neutral means the net Delta is zero, so small price changes don't affect value.",
        zh: 'Delta 中性意味着净 Delta 为零，因此微小的价格变动不会影响价值。',
      },
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
    {
      id: 'iv_q4',
      prompt: { en: 'IV Percentile compares current IV to:', zh: 'IV 百分位（IV Percentile）将当前 IV 与谁对比？' },
      choices: [
        { en: 'Its own historical range', zh: '自身的历史区间' },
        { en: 'The market index IV', zh: '市场指数的 IV' },
        { en: 'Fixed thresholds', zh: '固定阈值' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'IV Percentile shows where current IV sits relative to its past year\'s high and low.',
        zh: 'IV 百分位显示当前 IV 在过去一年高低点之间的相对位置。',
      },
    },
    {
      id: 'iv_q5',
      prompt: { en: 'Why is IV often higher for OTM puts on equity indices?', zh: '为什么指数的虚值看跌期权 IV 通常更高？' },
      choices: [
        { en: 'Fear of market crashes', zh: '对市场崩盘的恐惧' },
        { en: 'Dividend expectations', zh: '股息预期' },
        { en: 'Lower trading volume', zh: '交易量较低' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'The market pays a premium for protection against sudden drops, creating a "smirk".',
        zh: '市场为防范突发暴跌支付溢价，形成了波动率“偏斜”。',
      },
    },
    {
      id: 'iv_q6',
      prompt: { en: 'If IV increases while the stock price stays the same, the option price will:', zh: '如果在股价不变的情况下 IV 上升，期权价格会：' },
      choices: [
        { en: 'Increase', zh: '上涨' },
        { en: 'Decrease', zh: '下跌' },
        { en: 'Stay the same', zh: '保持不变' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Vega is positive for both calls and puts; higher IV makes options more expensive.',
        zh: 'Vega 对认购和认沽都是正的；更高的 IV 让期权更贵。',
      },
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
    {
      id: 'strat_q4',
      prompt: { en: 'A "Bull Call Spread" involves:', zh: '“牛市认购价差”（Bull Call Spread）涉及：' },
      choices: [
        { en: 'Buying a low strike call, selling a high strike call', zh: '买入低行权价 Call，卖出高行权价 Call' },
        { en: 'Selling a low strike call, buying a high strike call', zh: '卖出低行权价 Call，买入高行权价 Call' },
        { en: 'Buying both a call and a put', zh: '同时买入 Call 和 Put' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'This vertical spread reduces cost by selling an OTM call to fund the ITM/ATM call.',
        zh: '这种垂直价差通过卖出虚值 Call 来降低买入实值/平值 Call 的成本。',
      },
    },
    {
      id: 'strat_q5',
      prompt: { en: 'Which strategy benefits from a massive move in EITHER direction?', zh: '哪种策略受益于任一方向的剧烈波动？' },
      choices: [
        { en: 'Long Straddle', zh: '买入跨式（Long Straddle）' },
        { en: 'Iron Condor', zh: '铁鹰（Iron Condor）' },
        { en: 'Covered Call', zh: '备兑看涨（Covered Call）' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'Long Straddle involves buying both a call and a put at the same strike.',
        zh: '买入跨式涉及在同一行权价同时买入认购和认沽期权。',
      },
    },
    {
      id: 'strat_q6',
      prompt: { en: 'A "Covered Call" involves:', zh: '“备兑看涨期权”（Covered Call）涉及：' },
      choices: [
        { en: 'Owning stock and selling calls against it', zh: '持有股票并卖出对应 Call' },
        { en: 'Buying calls and puts simultaneously', zh: '同时买入 Call 和 Put' },
        { en: 'Selling naked calls', zh: '卖出裸 Call' },
      ],
      correctIndex: 0,
      explanation: {
        en: 'You "cover" the potential call obligation with shares you already own.',
        zh: '你用已经持有的股票来“覆盖”潜在的补券义务。',
      },
    },
  ],
}

export type QuizProps = {
  chapterId: ChapterId
}

export function Quiz({ chapterId }: QuizProps) {
  const { language } = useI18n()
  const shouldReduceMotion = useReducedMotion()
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

  function restart() {
    setIndex(0)
    setAnswers({})
    setLastChoice(null)
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="quiz-step-container"
          >
            <div className="quiz-question" data-testid="quiz-question">
              {language === 'zh' ? current.prompt.zh : current.prompt.en}
            </div>

            <div className="quiz-choices" role="list">
              {current.choices.map((c, i) => {
                const choiceText = language === 'zh' ? c.zh : c.en
                const isCorrect = i === current.correctIndex
                const isSelected = lastChoice === i
                const showState = answered

                let statusClass = ''
                if (showState) {
                  if (isCorrect) statusClass = ' correct'
                  else if (isSelected) statusClass = ' wrong'
                }

                return (
                  <motion.button
                    key={`${current.id}_${i}`}
                    type="button"
                    role="listitem"
                    data-testid={`quiz-choice-${i}`}
                    className={`quiz-choice${statusClass}`}
                    onClick={() => submitChoice(i)}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    animate={
                      showState && isCorrect
                        ? { scale: [1, 1.05, 1], transition: { duration: 0.3 } }
                        : showState && isSelected && !isCorrect
                          ? { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4 } }
                          : {}
                    }
                  >
                    <div className="choice-content">
                      <span className="choice-text">{choiceText}</span>
                      {showState && isCorrect && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="choice-icon success"
                        >
                          ✓
                        </motion.span>
                      )}
                      {showState && isSelected && !isCorrect && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="choice-icon error"
                        >
                          ✕
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {answered && (
              <motion.div
                className="quiz-feedback"
                data-testid="quiz-feedback"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
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
                    <>
                      <button
                        type="button"
                        data-testid="quiz-finish"
                        className="quiz-next"
                        onClick={finalize}
                        disabled={!completed}
                      >
                        {language === 'zh' ? '完成并保存' : 'Finish & Save'}
                      </button>
                      <button
                        type="button"
                        data-testid="quiz-restart"
                        className="quiz-restart"
                        onClick={restart}
                      >
                        {language === 'zh' ? '重做' : 'Restart'}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </GlassPanel>
  )
}
