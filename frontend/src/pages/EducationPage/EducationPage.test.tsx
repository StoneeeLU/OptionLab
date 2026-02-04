import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { EducationPage } from './EducationPage'

describe('EducationPage', () => {
  it('renders the heading and language toggle', () => {
    render(
      <MemoryRouter>
        <EducationPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /options/i })).toBeInTheDocument()
    expect(screen.getByTestId('language-toggle')).toBeInTheDocument()
  })

  it('renders tab-based navigation with chapter tabs', () => {
    render(
      <MemoryRouter>
        <EducationPage />
      </MemoryRouter>,
    )

    // Now uses tablist instead of navigation with anchor links
    const tablist = screen.getByRole('tablist', { name: /education chapters/i })
    const tabs = within(tablist).getAllByRole('tab')
    const tabNames = ['Basics', 'Pricing', 'Greeks', 'IV', 'Strategies']

    expect(tabs).toHaveLength(tabNames.length)

    tabs.forEach((tab, index) => {
      expect(tab).toHaveTextContent(tabNames[index])
    })

    // First tab should be selected by default
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')

    // Progress indicator should be present
    expect(screen.getByTestId('education-progress')).toBeInTheDocument()

    // Sidebar should be present
    expect(screen.getByTestId('education-sidebar')).toBeInTheDocument()
  })
})
