import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { I18nProvider } from '../../../i18n/I18nContext'
import { BasicsChapter } from './BasicsChapter'

describe('Chapter CTAs', () => {
  it('renders CTA links to /options and /volatility', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <BasicsChapter />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('basics-cta-options')).toHaveAttribute('href', '/options')
    expect(screen.getByTestId('basics-cta-volatility')).toHaveAttribute('href', '/volatility')
  })
})
