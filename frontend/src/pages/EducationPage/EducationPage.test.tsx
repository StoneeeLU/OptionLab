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

  it('renders a sticky nav with anchor links and matching sections', () => {
    render(
      <MemoryRouter>
        <EducationPage />
      </MemoryRouter>,
    )

    const nav = screen.getByRole('navigation', { name: /chapters/i })
    const links = within(nav).getAllByRole('link')
    const ids = ['basics', 'pricing', 'greeks', 'iv', 'strategies']

    expect(links).toHaveLength(ids.length)

    links.forEach((link, index) => {
      expect(link).toHaveAttribute('href', `#${ids[index]}`)
    })

    ids.forEach((id) => {
      expect(document.getElementById(id)).toBeInTheDocument()
    })

    expect(screen.getByTestId('section-basics')).toBeInTheDocument()
    expect(screen.getByTestId('section-pricing')).toBeInTheDocument()
    expect(screen.getByTestId('section-greeks')).toBeInTheDocument()
    expect(screen.getByTestId('section-iv')).toBeInTheDocument()
    expect(screen.getByTestId('section-strategies')).toBeInTheDocument()

    expect(screen.getByTestId('education-progress')).toBeInTheDocument()
  })
})
