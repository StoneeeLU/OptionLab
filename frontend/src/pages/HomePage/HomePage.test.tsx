import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { HomePage } from './HomePage'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

describe('HomePage', () => {
  it('renders 8 stock cards', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(8)
  })

  it('clicking a card navigates to /options?symbol=XXX', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <LocationDisplay />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/options" element={<div>Options Route</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location')).toHaveTextContent('/')

    await user.click(screen.getByRole('link', { name: /open options chain for aapl/i }))

    expect(screen.getByText('Options Route')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/options?symbol=AAPL')
  })
})
