import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { I18nProvider } from '../../../i18n/I18nContext'
import { BasicsChapter } from './BasicsChapter'

const STORAGE_KEY = 'optionlab:education:v1'

describe('BasicsChapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the chapter title', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <BasicsChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /basics/i })).toBeInTheDocument()
    expect(screen.getByTestId('basics-contract-diagram')).toBeInTheDocument()
  })

  it('completion button persists progress', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <BasicsChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('basics-complete'))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) as string) as {
      completedChapters: string[]
    }
    expect(stored.completedChapters).toContain('basics')
  })

  it('renders Chinese when language is zh', () => {
    localStorage.setItem('optionlab-language', 'zh')

    render(
      <MemoryRouter>
        <I18nProvider>
          <BasicsChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /期权基础/ })).toBeInTheDocument()
  })
})
