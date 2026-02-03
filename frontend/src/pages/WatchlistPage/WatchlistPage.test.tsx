import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { WatchlistPage } from './WatchlistPage'

const STORAGE_KEY = 'optionlab-watchlist'

describe('WatchlistPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders items from useWatchlist', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { symbol: 'AAPL', addedAt: new Date('2026-01-01T00:00:00.000Z').toISOString() },
        { symbol: 'TSLA', addedAt: new Date('2026-01-02T00:00:00.000Z').toISOString() },
      ]),
    )

    render(
      <MemoryRouter>
        <WatchlistPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /watchlist/i })).toBeInTheDocument()
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('TSLA')).toBeInTheDocument()
  })

  it('delete button removes item', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ symbol: 'AAPL', addedAt: new Date('2026-01-01T00:00:00.000Z').toISOString() }]),
    )

    render(
      <MemoryRouter>
        <WatchlistPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /remove aapl from watchlist/i }))

    expect(screen.getByText(/your watchlist is empty/i)).toBeInTheDocument()
  })

  it('empty state shows appropriate message', () => {
    render(
      <MemoryRouter>
        <WatchlistPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/your watchlist is empty/i)).toBeInTheDocument()
  })
})
