import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { OptionsChainTable } from './OptionsChainTable';
import type { Option } from '../../types';
import type { OptionAnalysis } from '../../types/analysis';
import { analyzeOption } from '../../services/api';

// Mock API
vi.mock('../../services/api', () => ({
  analyzeOption: vi.fn(),
}));

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

  const mockAnalysis: OptionAnalysis = {
    option: mockOptions[0],
    greeks: { delta: 0.5, gamma: 0.05, theta: -0.05, vega: 0.1, rho: 0.01 },
    theoretical_price: 7.65,
    market_price: 7.6,
    iv_percentile: 0.45,
    historical_volatility: 0.20,
    mispricing: 0.006,
    valuation: 'fair',
  };

  beforeEach(() => {
    vi.mocked(analyzeOption).mockReset();
  });

  it('should trigger analysis on hover', async () => {
    vi.mocked(analyzeOption).mockResolvedValue(mockAnalysis);
    
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);

    // Find IV cell for first call option (0.23 -> 23.0%)
    const ivCell = screen.getByText('23.0%').closest('td');
    expect(ivCell).toBeInTheDocument();

    // Hover
    fireEvent.mouseEnter(ivCell!);

    // Should show loading after debounce
    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Wait for promise to resolve (debounce in useOptionAnalysis + async fetch)
    await waitFor(() => {
      expect(analyzeOption).toHaveBeenCalled();
    }, { timeout: 1000 });

    // Should show analysis data
    expect(screen.getByText('Greeks')).toBeInTheDocument();
    expect(screen.getByText('0.500')).toBeInTheDocument(); // Delta
    expect(screen.getByText('FAIR')).toBeInTheDocument(); // Valuation
  });

  it('should handle API errors', async () => {
    vi.mocked(analyzeOption).mockRejectedValue(new Error('API Error'));
    
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);
    const ivCell = screen.getByText('23.0%').closest('td');
    
    fireEvent.mouseEnter(ivCell!);

    await waitFor(() => {
      expect(screen.getByText('Analysis failed')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should support keyboard focus', async () => {
    vi.mocked(analyzeOption).mockResolvedValue(mockAnalysis);
    
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);
    const ivCell = screen.getByText('23.0%').closest('td');
    
    // Focus
    fireEvent.focus(ivCell!);

    await waitFor(() => {
      expect(screen.getByText('Greeks')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Blur should hide (with delay)
    fireEvent.blur(ivCell!);
    
    // Wait for hide timeout (100ms)
    await waitFor(() => {
      expect(screen.queryByText('Greeks')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

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

  it('should apply ITM/OTM classes correctly', () => {
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);

    // Spot price 150.0
    // Call Strike 145 (<150) -> ITM
    const itmRow = screen.getByText('145.00').closest('tr');
    expect(itmRow).toBeInTheDocument();
    
    // Check call cells in this row have 'itm' class
    const callCells = itmRow?.querySelectorAll('.call-data');
    expect(callCells?.length).toBeGreaterThan(0);
    callCells?.forEach(cell => expect(cell).toHaveClass('itm'));

    // Put Strike 155 (>150) -> ITM
    const itmPutRow = screen.getByText('155.00').closest('tr');
    const putCells = itmPutRow?.querySelectorAll('.put-data');
    expect(putCells?.length).toBeGreaterThan(0);
    putCells?.forEach(cell => expect(cell).toHaveClass('itm'));
  });

  it('should render IV bars', () => {
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);

    // Find IV cell (0.23 -> 23.0%)
    const ivCell = screen.getByText('23.0%').closest('td');
    expect(ivCell).toHaveClass('iv-cell');
    
    // Check for bar element
    const bar = ivCell?.querySelector('.iv-bar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveStyle('width: 23%');
  });

  it('should set volume intensity attributes', () => {
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);

    // Max volume is 1000 (Call 150.0) -> Intensity 10
    const volCell = screen.getByText('1000').closest('td');
    expect(volCell).toHaveAttribute('data-volume-intensity', '10');
  });

  it('should render spread indicators', () => {
    render(<OptionsChainTable options={mockOptions} spotPrice={150.0} />);

    // 145 Call: Bid 7.5, Ask 7.7. Mid 7.6. Spread 0.2. 0.2/7.6 = 2.6% -> Medium
    const bidCell = screen.getByText('7.50').closest('td');
    const indicator = bidCell?.querySelector('.spread-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('spread-medium');
  });
});
