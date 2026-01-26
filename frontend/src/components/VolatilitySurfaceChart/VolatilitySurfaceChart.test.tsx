import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VolatilitySurfaceChart } from './VolatilitySurfaceChart';

describe('VolatilitySurfaceChart', () => {
  it('renders empty state when no data provided', () => {
    render(<VolatilitySurfaceChart data={null} />);
    expect(screen.getByText(/No volatility data available/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<VolatilitySurfaceChart data={null} loading={true} />);
    expect(screen.getByText(/Loading volatility surface/i)).toBeInTheDocument();
  });

  it('renders chart header when data is provided', () => {
    const data = {
      surface_data: [[150, 30, 0.25], [155, 30, 0.26], [150, 60, 0.28]],
      strikes: [150, 155],
      expiries: ['2024-02-15', '2024-03-15'],
      days_to_expiry: [30, 60]
    };

    render(<VolatilitySurfaceChart data={data} />);
    expect(screen.getByText('Implied Volatility Surface')).toBeInTheDocument();
    expect(screen.getByText(/3D visualization/i)).toBeInTheDocument();
  });

  it('shows controls tip', () => {
    const data = {
      surface_data: [[150, 30, 0.25]],
      strikes: [150],
      expiries: ['2024-02-15'],
      days_to_expiry: [30]
    };

    render(<VolatilitySurfaceChart data={data} />);
    expect(screen.getByText(/Click and drag to rotate/i)).toBeInTheDocument();
  });

  it('renders empty state for empty surface data', () => {
    const data = {
      surface_data: [],
      strikes: [],
      expiries: [],
      days_to_expiry: []
    };

    render(<VolatilitySurfaceChart data={data} />);
    expect(screen.getByText(/No volatility data available/i)).toBeInTheDocument();
  });
});
