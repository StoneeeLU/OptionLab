import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { I18nProvider } from '../../../i18n/I18nContext'
import { StrategiesChapter } from './StrategiesChapter'

const STORAGE_KEY = 'optionlab:education:v1'

describe('StrategiesChapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('covers at least 5 strategies with payoff placeholders', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <StrategiesChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /strategies/i })).toBeInTheDocument()
    expect(screen.getByTestId('strategies-list')).toBeInTheDocument()

    ;[
      'bull-call-spread',
      'bear-put-spread',
      'long-straddle',
      'long-strangle',
      'iron-condor',
    ].forEach((id) => {
      expect(screen.getByTestId(`strategy-${id}`)).toBeInTheDocument()
    })

    expect(screen.getAllByTestId('payoff-chart')).toHaveLength(5)
  })

  it('completion button persists progress', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <StrategiesChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('strategies-complete'))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) as string) as {
      completedChapters: string[]
    }
    expect(stored.completedChapters).toContain('strategies')
  })

  it('renders Chinese when language is zh', () => {
    localStorage.setItem('optionlab-language', 'zh')

    render(
      <MemoryRouter>
        <I18nProvider>
          <StrategiesChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /期权策略/ })).toBeInTheDocument()
  })
})
