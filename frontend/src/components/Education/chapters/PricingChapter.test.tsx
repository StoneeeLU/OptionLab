import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { I18nProvider } from '../../../i18n/I18nContext'
import { PricingChapter } from './PricingChapter'

const STORAGE_KEY = 'optionlab:education:v1'

describe('PricingChapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders pricing concepts', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <PricingChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /pricing/i })).toBeInTheDocument()
    expect(screen.getByTestId('pricing-value-diagram')).toBeInTheDocument()
    expect(screen.getByTestId('pricing-calculator-preview')).toBeInTheDocument()
  })

  it('completion button persists progress', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <PricingChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('pricing-complete'))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) as string) as {
      completedChapters: string[]
    }
    expect(stored.completedChapters).toContain('pricing')
  })

  it('renders Chinese when language is zh', () => {
    localStorage.setItem('optionlab-language', 'zh')

    render(
      <MemoryRouter>
        <I18nProvider>
          <PricingChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /定价原理/ })).toBeInTheDocument()
  })
})
