import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { I18nProvider } from '../../../i18n/I18nContext'
import { Quiz } from './Quiz'

const STORAGE_KEY = 'optionlab:education:v1'

describe('Quiz', () => {
  it('renders questions and shows immediate feedback', () => {
    render(
      <I18nProvider>
        <Quiz chapterId="basics" />
      </I18nProvider>,
    )

    expect(screen.getByTestId('quiz-question')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument()
  })

  it('shows incorrect feedback when wrong answer selected', () => {
    render(
      <I18nProvider>
        <Quiz chapterId="basics" />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByTestId('quiz-choice-2'))
    expect(screen.getByTestId('quiz-feedback').textContent).toMatch(/incorrect|回答错误/i)
  })

  it('persists score to localStorage when finishing', async () => {
    render(
      <I18nProvider>
        <Quiz chapterId="basics" />
      </I18nProvider>,
    )

    // Q1
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    fireEvent.click(screen.getByTestId('quiz-next'))

    // Q2 - Wait for prompt to ensure transition complete
    await screen.findByText(/option buyer pays/i)
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    
    // Wait for next button (in feedback)
    const q2Next = await screen.findByTestId('quiz-next')
    fireEvent.click(q2Next)

    // Q3 - Wait for prompt
    await screen.findByText(/option seller, the key is/i)
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    fireEvent.click(await screen.findByTestId('quiz-next'))

    // Q4
    await screen.findByText(/exercise a call option/i)
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    fireEvent.click(await screen.findByTestId('quiz-next'))

    // Q5
    await screen.findByText(/In-the-Money/i)
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    fireEvent.click(await screen.findByTestId('quiz-next'))

    // Q6
    await screen.findByText(/right \(but not obligation\)/i)
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    
    // Wait for finish button
    const finish = await screen.findByTestId('quiz-finish')
    fireEvent.click(finish)

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) as string) as {
      quizScores: Record<string, number>
    }
    expect(stored.quizScores.basics).toBe(100)
  })
})
