import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { I18nProvider } from '../../../i18n/I18nContext'
import { IVChapter } from './IVChapter'

const STORAGE_KEY = 'optionlab:education:v1'

describe('IVChapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders IV explanation and a link to /volatility', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <IVChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /iv|implied volatility/i })).toBeInTheDocument()
    expect(screen.getByTestId('iv-surface-preview')).toBeInTheDocument()
    const link = screen.getByTestId('iv-volatility-link')
    expect(link).toHaveAttribute('href', '/volatility')
  })

  it('completion button persists progress', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <IVChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('iv-complete'))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) as string) as {
      completedChapters: string[]
    }
    expect(stored.completedChapters).toContain('iv')
  })

  it('renders Chinese when language is zh', () => {
    localStorage.setItem('optionlab-language', 'zh')

    render(
      <MemoryRouter>
        <I18nProvider>
          <IVChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /隐含波动率/ })).toBeInTheDocument()
  })
})
