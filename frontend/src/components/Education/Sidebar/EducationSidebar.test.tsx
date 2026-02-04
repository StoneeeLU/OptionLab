import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { I18nProvider } from '../../../i18n/I18nContext'
import { EducationSidebar } from './EducationSidebar'

const STORAGE_KEY = 'optionlab:education:v1'

describe('EducationSidebar', () => {
  beforeEach(() => {
    localStorage.clear()
    window.location.hash = ''
  })

  it('renders chapter links', () => {
    render(
      <I18nProvider>
        <EducationSidebar />
      </I18nProvider>,
    )

    expect(screen.getByTestId('education-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('education-sidebar-link-basics')).toHaveAttribute('href', '#basics')
    expect(screen.getByTestId('education-sidebar-link-pricing')).toHaveAttribute('href', '#pricing')
    expect(screen.getByTestId('education-sidebar-link-greeks')).toHaveAttribute('href', '#greeks')
    expect(screen.getByTestId('education-sidebar-link-iv')).toHaveAttribute('href', '#iv')
    expect(screen.getByTestId('education-sidebar-link-strategies')).toHaveAttribute('href', '#strategies')
  })

  it('shows completion chips based on progress storage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedChapters: ['pricing'],
        quizScores: {},
        achievements: [],
        version: 1,
      }),
    )

    render(
      <I18nProvider>
        <EducationSidebar />
      </I18nProvider>,
    )

    expect(screen.getByTestId('education-sidebar-done-pricing')).toBeInTheDocument()
  })

  it('reacts to hash changes for active state', () => {
    window.location.hash = '#iv'
    render(
      <I18nProvider>
        <EducationSidebar />
      </I18nProvider>,
    )

    expect(screen.getByTestId('education-sidebar-link-iv').getAttribute('aria-current')).toBe('true')
  })
})
