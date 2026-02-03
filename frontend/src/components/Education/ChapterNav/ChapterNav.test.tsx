import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ChapterNav } from './ChapterNav'

const STORAGE_KEY = 'optionlab:education:v1'

describe('ChapterNav', () => {
  beforeEach(() => {
    localStorage.clear()
    window.location.hash = ''
  })

  it('renders 5 chapter links', () => {
    render(<ChapterNav />)

    expect(screen.getByTestId('chapter-nav')).toBeInTheDocument()
    expect(screen.getByTestId('chapter-link-basics')).toHaveAttribute('href', '#basics')
    expect(screen.getByTestId('chapter-link-pricing')).toHaveAttribute('href', '#pricing')
    expect(screen.getByTestId('chapter-link-greeks')).toHaveAttribute('href', '#greeks')
    expect(screen.getByTestId('chapter-link-iv')).toHaveAttribute('href', '#iv')
    expect(screen.getByTestId('chapter-link-strategies')).toHaveAttribute('href', '#strategies')
  })

  it('shows completion indicators and reacts to hash changes', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedChapters: ['pricing'],
        quizScores: {},
        achievements: [],
        version: 1,
      }),
    )

    window.location.hash = '#pricing'
    render(<ChapterNav />)

    expect(screen.getByTestId('chapter-complete-pricing')).toBeInTheDocument()
    expect(screen.getByTestId('chapter-link-pricing').className).toContain('active')

    fireEvent.change(screen.getByTestId('chapter-select'), { target: { value: 'greeks' } })
    expect(window.location.hash).toBe('#greeks')
  })
})
