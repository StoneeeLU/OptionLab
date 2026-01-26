import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CombinationAnalysisPanel } from './CombinationAnalysisPanel';

describe('CombinationAnalysisPanel', () => {
  it('renders empty state when no analysis provided', () => {
    render(<CombinationAnalysisPanel analysis={null} />);
    expect(screen.getByText(/Select options to analyze combinations/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<CombinationAnalysisPanel analysis={null} loading={true} />);
    expect(screen.getByText(/Loading analysis/i)).toBeInTheDocument();
  });

  it('renders strategy name', () => {
    const analysis = {
      strategy_name: 'Vertical Spread',
      combined_greeks: { delta: 0.5, gamma: 0.02, theta: -0.05, vega: 0.3, rho: 0.1 },
      net_premium: -5.0,
      pnl_data: [{ price: 100, pnl: -5 }, { price: 150, pnl: 0 }, { price: 200, pnl: 45 }],
      max_profit: 45,
      max_loss: -5,
      breakevens: [155]
    };

    render(<CombinationAnalysisPanel analysis={analysis} />);
    expect(screen.getByText('Vertical Spread')).toBeInTheDocument();
  });

  it('displays debit premium correctly', () => {
    const analysis = {
      strategy_name: 'Bull Call Spread',
      combined_greeks: { delta: 0.3, gamma: 0.01, theta: -0.03, vega: 0.2, rho: 0.05 },
      net_premium: -3.5,
      pnl_data: [],
      max_profit: 6.5,
      max_loss: -3.5,
      breakevens: [153.5]
    };

    render(<CombinationAnalysisPanel analysis={analysis} />);
    expect(screen.getByText(/Debit:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$3.50/)).toBeInTheDocument();
  });

  it('displays credit premium correctly', () => {
    const analysis = {
      strategy_name: 'Iron Condor',
      combined_greeks: { delta: 0, gamma: -0.01, theta: 0.05, vega: -0.15, rho: 0 },
      net_premium: 2.0,
      pnl_data: [],
      max_profit: 2.0,
      max_loss: -3.0,
      breakevens: [145, 160]
    };

    render(<CombinationAnalysisPanel analysis={analysis} />);
    expect(screen.getByText(/Credit:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$2.00/)).toBeInTheDocument();
  });

  it('displays all Greeks', () => {
    const analysis = {
      strategy_name: 'Straddle',
      combined_greeks: { delta: 0.01, gamma: 0.04, theta: -0.10, vega: 0.50, rho: 0.02 },
      net_premium: -10.0,
      pnl_data: [],
      max_profit: null,
      max_loss: -10.0,
      breakevens: [140, 160]
    };

    render(<CombinationAnalysisPanel analysis={analysis} />);
    expect(screen.getByText('0.0100')).toBeInTheDocument(); // Delta
    expect(screen.getByText('0.0400')).toBeInTheDocument(); // Gamma
    expect(screen.getByText('-0.1000')).toBeInTheDocument(); // Theta
    expect(screen.getByText('0.5000')).toBeInTheDocument(); // Vega
    expect(screen.getByText('0.0200')).toBeInTheDocument(); // Rho
  });

  it('displays unlimited max profit', () => {
    const analysis = {
      strategy_name: 'Long Call',
      combined_greeks: { delta: 0.6, gamma: 0.03, theta: -0.08, vega: 0.25, rho: 0.15 },
      net_premium: -5.0,
      pnl_data: [],
      max_profit: null,
      max_loss: -5.0,
      breakevens: [155]
    };

    render(<CombinationAnalysisPanel analysis={analysis} />);
    expect(screen.getByText('Unlimited')).toBeInTheDocument();
  });

  it('displays breakeven prices', () => {
    const analysis = {
      strategy_name: 'Straddle',
      combined_greeks: { delta: 0, gamma: 0.05, theta: -0.12, vega: 0.60, rho: 0 },
      net_premium: -10.0,
      pnl_data: [],
      max_profit: null,
      max_loss: -10.0,
      breakevens: [140.5, 159.5]
    };

    render(<CombinationAnalysisPanel analysis={analysis} />);
    expect(screen.getByText(/\$140.50, \$159.50/)).toBeInTheDocument();
  });
});
