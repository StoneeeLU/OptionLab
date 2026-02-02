import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ThemeProvider } from '../../contexts/ThemeContext'
import { Layout } from './Layout'

describe('Layout', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Layout>
            <div>Layout Child</div>
          </Layout>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Layout Child')).toBeInTheDocument()
  })
})
