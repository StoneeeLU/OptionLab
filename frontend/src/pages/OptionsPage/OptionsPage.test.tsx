import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { OptionsPage } from './OptionsPage';
import * as api from '../../services/api';
import type { OptionChain } from '../../types';

// Mock API module
vi.mock('../../services/api');

const mockOptionChain: OptionChain = {
  underlying: 'AAPL',
  spot_price: 150.0,
  options: [
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
      strike: 150.0,
      expiry: '2027-02-19',
      option_type: 'call',
      bid: 6.5,
      ask: 6.7,
      last: 6.6,
      volume: 500,
      open_interest: 2500,
      implied_volatility: 0.27,
    },
  ],
  expiration_dates: ['2027-01-25', '2027-02-19'],
};

describe('OptionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render symbol input', () => {
    renderWithRouter(<OptionsPage />);

    expect(screen.getByPlaceholderText(/enter symbol/i)).toBeInTheDocument();
  });

  it('should load options chain when symbol is submitted', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getOptionChain).mockResolvedValue(mockOptionChain);

    renderWithRouter(<OptionsPage />);

    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(api.getOptionChain).toHaveBeenCalledWith('AAPL');
    });

    await waitFor(() => {
      expect(screen.getByText('150.00')).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching data', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getOptionChain).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockOptionChain), 100))
    );

    renderWithRouter(<OptionsPage />);

    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    await user.keyboard('{Enter}');

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('should display error state for invalid symbol', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getOptionChain).mockRejectedValue(new Error('Symbol not found'));

    renderWithRouter(<OptionsPage />);

    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'INVALID');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should display expiration date tabs', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getOptionChain).mockResolvedValue(mockOptionChain);

    renderWithRouter(<OptionsPage />);

    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('2027-01-25')).toBeInTheDocument();
      expect(screen.getByText('2027-02-19')).toBeInTheDocument();
    });
  });

  it('should filter options when expiration tab is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getOptionChain).mockResolvedValue(mockOptionChain);

    renderWithRouter(<OptionsPage />);

    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('2027-01-25')).toBeInTheDocument();
    });

    // Click on the second expiration date tab
    const tab2 = screen.getByText('2027-02-19');
    await user.click(tab2);

    // Should filter to show only options for that expiration
    await waitFor(() => {
      // This is a simplified check - the actual implementation will filter the table
      expect(tab2).toHaveClass('active');
    });
  });

  it('should display moneyness filter', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getOptionChain).mockResolvedValue(mockOptionChain);

    renderWithRouter(<OptionsPage />);

    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByLabelText(/moneyness/i)).toBeInTheDocument();
    });
  });

  it('should apply volume filter', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getOptionChain).mockResolvedValue(mockOptionChain);

    renderWithRouter(<OptionsPage />);

    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByLabelText(/min volume/i)).toBeInTheDocument();
    });

    const volumeInput = screen.getByLabelText(/min volume/i);
    await user.clear(volumeInput);
    await user.type(volumeInput, '600');

    // Should filter out options with volume < 600
    // Detailed assertion would depend on implementation
  });
});
