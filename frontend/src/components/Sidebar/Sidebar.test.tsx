import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { ThemeProvider } from '../../contexts/ThemeContext'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('renders 4 navigation links', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /options/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /volatility/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /watchlist/i })).toBeInTheDocument()
  })

  it('can collapse and expand', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </ThemeProvider>,
    )

    const collapse = screen.getByRole('button', { name: /collapse sidebar/i })
    await user.click(collapse)

    expect(screen.queryByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /expand sidebar/i }))
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('shows ThemeToggle', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument()
  })
})
