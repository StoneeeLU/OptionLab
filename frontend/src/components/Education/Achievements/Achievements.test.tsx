import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { AchievementPanel } from './AchievementPanel'

const STORAGE_KEY = 'optionlab:education:v1'

describe('AchievementPanel', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows locked achievements by default', () => {
    render(<AchievementPanel />)

    expect(screen.getByTestId('achievement-panel')).toBeInTheDocument()
    expect(screen.getByTestId('achievement-first_chapter-state').textContent).toMatch(/locked/i)
  })

  it('unlocks first_chapter when any chapter is completed', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedChapters: ['basics'],
        quizScores: {},
        achievements: [],
        version: 1,
      }),
    )

    render(<AchievementPanel />)
    expect(screen.getByTestId('achievement-first_chapter-state').textContent).toMatch(/unlocked/i)
  })

  it('shows all badges', () => {
    render(<AchievementPanel />)
    expect(screen.getByTestId('achievement-first_chapter')).toBeInTheDocument()
    expect(screen.getByTestId('achievement-perfect_quiz')).toBeInTheDocument()
    expect(screen.getByTestId('achievement-all_complete')).toBeInTheDocument()
  })
})
