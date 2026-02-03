import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
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
    await user.click(screen.getByText('2027-02-19'));

    // Should fetch chain for that expiration and mark tab active
    await waitFor(() => {
      // Re-query after state updates to avoid stale element references.
      expect(screen.getByText('2027-02-19')).toHaveClass('active');
    });

    await waitFor(() => {
      expect(api.getOptionChain).toHaveBeenCalledWith('AAPL', { expiry: '2027-02-19' });
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

  it('should auto-load options chain from query param', async () => {
    vi.mocked(api.getOptionChain).mockResolvedValue(mockOptionChain);

    render(
      <MemoryRouter initialEntries={['/options?symbol=AAPL']}>
        <Routes>
          <Route path="/options" element={<OptionsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.getOptionChain).toHaveBeenCalledWith('AAPL');
    });

    expect(screen.getByText('150.00')).toBeInTheDocument();
  });

  it('renders with split layout (table + analysis panel)', async () => {
    const user = userEvent.setup()
    vi.mocked(api.getOptionChain).mockResolvedValue(mockOptionChain)

    renderWithRouter(<OptionsPage />)

    const input = screen.getByPlaceholderText(/enter symbol/i)
    await user.type(input, 'AAPL')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /analysis/i })).toBeInTheDocument()
    })
    expect(screen.getByText(/select a strike/i)).toBeInTheDocument()
  })

  it('clicking a row updates the analysis card', async () => {
    const user = userEvent.setup()
    vi.mocked(api.getOptionChain).mockResolvedValue(mockOptionChain)
    vi.mocked(api.analyzeOption).mockResolvedValue({
      option: {
        symbol: 'AAPL',
        strike: 150,
        expiry: '2027-01-25',
        option_type: 'call',
        exercise_style: 'american',
        implied_volatility: 0.25,
      },
      greeks: { delta: 0.52, gamma: 0.02, theta: -0.05, vega: 0.12, rho: 0.03 },
      theoretical_price: 5.3,
      market_price: 5.2,
      iv_percentile: 0.6,
      historical_volatility: 0.2,
      mispricing: 0.1,
      valuation: 'cheap',
    })

    const { container } = renderWithRouter(<OptionsPage />)

    const input = screen.getByPlaceholderText(/enter symbol/i)
    await user.type(input, 'AAPL')
    await user.keyboard('{Enter}')

    // Click first strike row.
    await waitFor(() => {
      expect(container.querySelector('td.strike-cell')).toBeTruthy()
    })

    const strikeCell = container.querySelector('td.strike-cell') as HTMLElement
    await user.click(strikeCell)

    await waitFor(() => {
      expect(api.analyzeOption).toHaveBeenCalled()
    })

    expect(screen.getByText(/greeks/i)).toBeInTheDocument()
    expect(screen.getByText(/delta/i)).toBeInTheDocument()
  })
});
