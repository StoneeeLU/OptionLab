import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { OptionsChainTable } from './OptionsChainTable';
import type { Option } from '../../types';

describe('OptionsChainTable', () => {
  const mockOptions: Option[] = [
    {
      symbol: 'AAPL',
      strike: 145.0,
      expiry: '2027-01-25',
      option_type: 'call',
      bid: 7.5,
      ask: 7.7,
      last: 7.6,
      volume: 500,
      open_interest: 2500,
      implied_volatility: 0.23,
    },
    {
      symbol: 'AAPL',
      strike: 145.0,
      expiry: '2027-01-25',
      option_type: 'put',
      bid: 2.3,
      ask: 2.5,
      last: 2.4,
      volume: 300,
      open_interest: 1500,
      implied_volatility: 0.24,
    },
    {
      symbol: 'AAPL',
      strike: 150.0,
      expiry: '2027-01-25',
      option_type: 'call',
      bid: 5.1,
      ask: 5.3,
      last: 5.2,
      volume: 1000,
      open_interest: 5000,
      implied_volatility: 0.25,
    },
    {
      symbol: 'AAPL',
      strike: 150.0,
      expiry: '2027-01-25',
      option_type: 'put',
      bid: 4.9,
      ask: 5.1,
      last: 5.0,
      volume: 800,
      open_interest: 4000,
      implied_volatility: 0.26,
    },
    {
      symbol: 'AAPL',
      strike: 155.0,
      expiry: '2027-01-25',
      option_type: 'call',
      bid: 3.2,
      ask: 3.4,
      last: 3.3,
      volume: 400,
      open_interest: 2000,
      implied_volatility: 0.27,
    },
    {
      symbol: 'AAPL',
      strike: 155.0,
      expiry: '2027-01-25',
      option_type: 'put',
      bid: 7.8,
      ask: 8.0,
      last: 7.9,
      volume: 600,
      open_interest: 3000,
      implied_volatility: 0.28,
    },
  ];

  it('should render table with mock data', () => {
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);

    // Check headers exist
    expect(screen.getByText('Strike')).toBeInTheDocument();
    expect(screen.getAllByText('Bid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ask').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Last').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Volume').length).toBeGreaterThan(0);

    // Check strike prices are displayed
    expect(screen.getByText('145.00')).toBeInTheDocument();
    expect(screen.getByText('150.00')).toBeInTheDocument();
    expect(screen.getByText('155.00')).toBeInTheDocument();
  });

  it('should highlight ATM strike', () => {
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);

    // Find the row containing the ATM strike (150.00)
    const atmRow = screen.getByText('150.00').closest('tr');
    expect(atmRow).toHaveClass('atm-strike');
  });

  it('should display calls on left, puts on right, strike in center', () => {
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);

    // Check table structure - should have CALLS, strike, PUTS section headers
    expect(screen.getByText('CALLS')).toBeInTheDocument();
    expect(screen.getByText('Strike')).toBeInTheDocument();
    expect(screen.getByText('PUTS')).toBeInTheDocument();

    // Verify calls and puts columns exist (each appears twice - for calls and puts)
    const bidHeaders = screen.getAllByText('Bid');
    expect(bidHeaders.length).toBe(2); // One for calls, one for puts

    const askHeaders = screen.getAllByText('Ask');
    expect(askHeaders.length).toBe(2);
  });

  it('should support row selection', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    render(
      <OptionsChainTable
        options={mockOptions}
        spotPrice={150.0}
        onSelectionChange={onSelectionChange}
      />
    );

    // Find a row and click it
    const firstRow = screen.getByText('145.00').closest('tr');
    if (firstRow) {
      await user.click(firstRow);
      expect(onSelectionChange).toHaveBeenCalled();
    }
  });

  it('should support multi-select with Ctrl/Cmd key', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    render(
      <OptionsChainTable
        options={mockOptions}
        spotPrice={150.0}
        onSelectionChange={onSelectionChange}
        multiSelect
      />
    );

    // Click first row
    const firstRow = screen.getByText('145.00').closest('tr');
    if (firstRow) {
      await user.click(firstRow);
    }

    // Ctrl+Click second row
    const secondRow = screen.getByText('150.00').closest('tr');
    if (secondRow) {
      await user.keyboard('{Control>}');
      await user.click(secondRow);
      await user.keyboard('{/Control}');
    }

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
  });

  it('should render with empty options array', () => {
    render(<OptionsChainTable options={[]} spotPrice={150.0} />);

    // Should show headers but no data rows
    expect(screen.getByText('Strike')).toBeInTheDocument();
    expect(screen.queryByText('145.00')).not.toBeInTheDocument();
  });
});
