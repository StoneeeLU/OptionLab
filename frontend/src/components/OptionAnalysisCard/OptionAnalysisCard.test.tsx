import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OptionAnalysisCard } from './OptionAnalysisCard';
import type { OptionAnalysis } from '../../types';

const mockAnalysis: OptionAnalysis = {
  option: {
    symbol: 'AAPL',
    strike: 150.0,
    expiry: '2027-01-25',
    option_type: 'call',
    bid: 8.0,
    ask: 8.5,
    last: 8.25,
    volume: 1000,
    open_interest: 5000,
    implied_volatility: 0.25,
    exercise_style: 'american',
  },
  greeks: {
    delta: 0.52,
    gamma: 0.023,
    theta: -0.045,
    vega: 0.18,
    rho: 0.032,
  },
  theoretical_price: 8.30,
  market_price: 8.25,
  iv_percentile: 0.65,
  historical_volatility: 0.20,
  mispricing: -0.05,
  valuation: 'cheap',
};

describe('OptionAnalysisCard', () => {
  it('should display option basic info', () => {
    render(<OptionAnalysisCard analysis={mockAnalysis} />);

    expect(screen.getByText(/AAPL/)).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/2027-01-25/)).toBeInTheDocument();
    expect(screen.getByText(/call/i)).toBeInTheDocument();
  });

  it('should display all Greeks', () => {
    render(<OptionAnalysisCard analysis={mockAnalysis} />);

    expect(screen.getByText(/delta/i)).toBeInTheDocument();
    expect(screen.getByText('0.52')).toBeInTheDocument();
    
    expect(screen.getByText(/gamma/i)).toBeInTheDocument();
    expect(screen.getByText(/theta/i)).toBeInTheDocument();
    expect(screen.getByText(/vega/i)).toBeInTheDocument();
    expect(screen.getByText(/rho/i)).toBeInTheDocument();
  });

  it('should color code Greeks correctly', () => {
    render(<OptionAnalysisCard analysis={mockAnalysis} />);

    // Positive values should have positive class
    const deltaElement = screen.getByText('0.52').closest('.greek-value');
    expect(deltaElement).toHaveClass('positive');

    // Negative values should have negative class
    const thetaElement = screen.getByText(/-0.045/).closest('.greek-value');
    expect(thetaElement).toHaveClass('negative');
  });

  it('should display theoretical vs market price', () => {
    render(<OptionAnalysisCard analysis={mockAnalysis} />);

    expect(screen.getByText(/theoretical/i)).toBeInTheDocument();
    expect(screen.getByText('$8.30')).toBeInTheDocument();
    
    expect(screen.getByText(/market/i)).toBeInTheDocument();
    expect(screen.getByText('$8.25')).toBeInTheDocument();
  });

  it('should display valuation badge', () => {
    render(<OptionAnalysisCard analysis={mockAnalysis} />);

    const badge = screen.getByText(/cheap/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('valuation-badge');
    expect(badge).toHaveClass('cheap');
  });

  it('should display valuation as expensive when overpriced', () => {
    const expensiveAnalysis: OptionAnalysis = {
      ...mockAnalysis,
      valuation: 'expensive',
      mispricing: 0.50,
    };

    render(<OptionAnalysisCard analysis={expensiveAnalysis} />);

    const badge = screen.getByText(/expensive/i);
    expect(badge).toHaveClass('expensive');
  });

  it('should display valuation as fair when fairly priced', () => {
    const fairAnalysis: OptionAnalysis = {
      ...mockAnalysis,
      valuation: 'fair',
      mispricing: 0.01,
    };

    render(<OptionAnalysisCard analysis={fairAnalysis} />);

    const badge = screen.getByText(/fair/i);
    expect(badge).toHaveClass('fair');
  });

  it('should display IV percentile', () => {
    render(<OptionAnalysisCard analysis={mockAnalysis} />);

    expect(screen.getByText(/IV Percentile/i)).toBeInTheDocument();
    expect(screen.getByText(/65/)).toBeInTheDocument(); // 0.65 = 65%
  });

  it('should display historical volatility', () => {
    render(<OptionAnalysisCard analysis={mockAnalysis} />);

    expect(screen.getByText(/Historical/i)).toBeInTheDocument();
    expect(screen.getByText(/20.0%/)).toBeInTheDocument();
  });

  it('should display implied volatility', () => {
    render(<OptionAnalysisCard analysis={mockAnalysis} />);

    expect(screen.getByText(/Implied/i)).toBeInTheDocument();
    expect(screen.getByText(/25.0%/)).toBeInTheDocument();
  });
});
