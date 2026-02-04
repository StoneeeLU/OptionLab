import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { I18nProvider } from '../../../i18n/I18nContext'
import { GreeksChapter } from './GreeksChapter'

const STORAGE_KEY = 'optionlab:education:v1'

describe('GreeksChapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('covers all 5 greeks', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <GreeksChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /greeks/i })).toBeInTheDocument()
    // Each Greek has a detailed section with greek-detail-{id} testid
    ;['delta', 'gamma', 'theta', 'vega', 'rho'].forEach((id) => {
      expect(screen.getByTestId(`greek-detail-${id}`)).toBeInTheDocument()
    })
  })

  it('completion button persists progress', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <GreeksChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('greeks-complete'))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) as string) as {
      completedChapters: string[]
    }
    expect(stored.completedChapters).toContain('greeks')
  })

  it('renders Chinese when language is zh', () => {
    localStorage.setItem('optionlab-language', 'zh')

    render(
      <MemoryRouter>
        <I18nProvider>
          <GreeksChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /Greeks 详解/ })).toBeInTheDocument()
  })
})
