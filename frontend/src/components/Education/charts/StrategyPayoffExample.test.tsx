import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StrategyPayoffExample } from './StrategyPayoffExample'

// Mock the PayoffChart component
vi.mock('./PayoffChart', () => ({
  PayoffChart: vi.fn(({ legs, offset }: { legs: unknown[]; offset: number }) => (
    <div data-testid="mock-payoff-chart">
      Mock Chart
      <span data-testid="chart-offset">{offset}</span>
      <span data-testid="chart-legs-count">{legs.length}</span>
    </div>
  )),
}))

// Mock useI18n
vi.mock('../../../i18n/I18nContext', () => ({
  useI18n: () => ({ language: 'en', t: (k: string) => k }),
}))

describe('StrategyPayoffExample', () => {
  const mockLegs = [
    {
      type: 'call' as const,
      position: 'long' as const,
      strike: 100,
      premium: 5,
    },
    {
      type: 'call' as const,
      position: 'short' as const,
      strike: 110,
      premium: 2,
    },
  ]

  const defaultProps = {
    name: { en: 'Bull Call Spread', zh: '牛市看涨价差' },
    description: { en: 'A bullish strategy...', zh: '看涨策略...' },
    legs: mockLegs,
    spot: 100,
  }

  it('renders strategy name and description', () => {
    render(<StrategyPayoffExample {...defaultProps} />)
    expect(screen.getByText('Bull Call Spread')).toBeInTheDocument()
    expect(screen.getByText('A bullish strategy...')).toBeInTheDocument()
  })

  it('calculates and displays max profit', () => {
    // Bull Call Spread 100/110. Cost = 5 - 2 = 3.
    // Max Profit = (110 - 100) - 3 = 7.
    render(<StrategyPayoffExample {...defaultProps} />)
    // We expect "Max Profit" label and "7"
    expect(screen.getByText(/Max Profit/i)).toBeInTheDocument()
    expect(screen.getByText('7.00')).toBeInTheDocument()
  })

  it('calculates and displays max loss', () => {
    // Bull Call Spread. Max Loss = Net Debit = 3.
    // Usually displayed as negative number or just "3.00" depending on convention.
    // P&L diagrams usually show negative Y. Text might say "Max Loss: 3.00"
    render(<StrategyPayoffExample {...defaultProps} />)
    expect(screen.getByText(/Max Loss/i)).toBeInTheDocument()
    expect(screen.getByText('3.00')).toBeInTheDocument()
  })

  it('calculates and displays breakeven', () => {
    // Breakeven = 100 + 3 = 103.
    render(<StrategyPayoffExample {...defaultProps} />)
    expect(screen.getByText(/Breakeven/i)).toBeInTheDocument()
    expect(screen.getByText('103.00')).toBeInTheDocument()
  })

  it('passes correct props to PayoffChart', () => {
    render(<StrategyPayoffExample {...defaultProps} />)
    
    expect(screen.getByTestId('mock-payoff-chart')).toBeInTheDocument()
    expect(screen.getByTestId('chart-legs-count')).toHaveTextContent('2')
    // Net premium is debit 3 (paid 3). So offset should be -3.
    expect(screen.getByTestId('chart-offset')).toHaveTextContent('-3')
  })
})
