import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { I18nProvider } from '../../../i18n/I18nContext'
import { Glossary } from './Glossary'

describe('Glossary', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders term cards and filters via search', () => {
    render(
      <I18nProvider>
        <Glossary />
      </I18nProvider>,
    )

    expect(screen.getByTestId('glossary')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('glossary-search'), { target: { value: 'delta' } })
    expect(screen.queryByTestId('glossary-empty')).not.toBeInTheDocument()
    expect(screen.getByTestId('glossary-toggle-delta')).toBeInTheDocument()
  })

  it('expands and collapses a term', async () => {
    render(
      <I18nProvider>
        <Glossary />
      </I18nProvider>,
    )

    const toggle = screen.getByTestId('glossary-toggle-delta')
    fireEvent.click(toggle)
    expect(screen.getByTestId('glossary-detail-delta')).toBeInTheDocument()

    fireEvent.click(toggle)
    await waitFor(() => {
      expect(screen.queryByTestId('glossary-detail-delta')).not.toBeInTheDocument()
    })
  })
})
