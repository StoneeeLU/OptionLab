import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { VolatilitySurfacePage } from './VolatilitySurfacePage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('VolatilitySurfacePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('page renders with search input', () => {
    render(
      <MemoryRouter>
        <VolatilitySurfacePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /volatility surface/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /symbol/i })).toBeInTheDocument()
  })

  it('submitting symbol calls API and renders chart', async () => {
    const user = userEvent.setup()
    vi.mocked(api.getVolatilitySurfaceForSymbol).mockResolvedValue({
      surface_data: [[150, 30, 0.25]],
      strikes: [150],
      expiries: ['2027-01-25'],
      days_to_expiry: [30],
    })

    render(
      <MemoryRouter>
        <VolatilitySurfacePage />
      </MemoryRouter>,
    )

    const input = screen.getByRole('textbox', { name: /symbol/i })
    await user.clear(input)
    await user.type(input, 'aapl')
    await user.click(screen.getByRole('button', { name: /load/i }))

    await waitFor(() => {
      expect(api.getVolatilitySurfaceForSymbol).toHaveBeenCalledWith('AAPL')
    })

    expect(screen.getByText(/implied volatility surface/i)).toBeInTheDocument()
  })
})
