import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('Route / renders HomePage', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /optionlab/i })).toBeInTheDocument()
  })

  it('Route /options renders OptionsPage', () => {
    render(
      <MemoryRouter initialEntries={['/options']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /options chain/i })).toBeInTheDocument()
  })

  it('Route /volatility renders VolatilitySurfacePage', () => {
    render(
      <MemoryRouter initialEntries={['/volatility']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /volatility surface/i })).toBeInTheDocument()
  })

  it('Route /watchlist renders WatchlistPage', () => {
    render(
      <MemoryRouter initialEntries={['/watchlist']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /watchlist/i })).toBeInTheDocument()
  })

  it('Unknown route redirects to /', () => {
    render(
      <MemoryRouter initialEntries={['/nope']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /optionlab/i })).toBeInTheDocument()
  })
})
