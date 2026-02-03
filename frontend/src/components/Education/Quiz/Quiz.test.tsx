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

  it('persists score to localStorage when finishing', () => {
    render(
      <I18nProvider>
        <Quiz chapterId="basics" />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    fireEvent.click(screen.getByTestId('quiz-next'))
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    fireEvent.click(screen.getByTestId('quiz-next'))
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    fireEvent.click(screen.getByTestId('quiz-finish'))

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) as string) as {
      quizScores: Record<string, number>
    }
    expect(stored.quizScores.basics).toBe(100)
  })
})
