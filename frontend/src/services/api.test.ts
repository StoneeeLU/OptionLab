import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { analyzeOption, getVolatilitySurface, getVolatilitySurfaceForSymbol, getOptionChain } from './api';
import type {
  SingleOptionAnalysisRequest,
  OptionAnalysis,
  VolatilitySurfaceRequest,
  VolatilitySurfaceResponse,
  OptionChain,
  ChainFilters,
} from '../types';

// Mock axios
vi.mock('axios');

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeOption', () => {
    it('should analyze single option successfully', async () => {
      const request: SingleOptionAnalysisRequest = {
        symbol: 'AAPL',
        strike: 150.0,
        expiry: '2027-01-25',
        option_type: 'call',
        exercise_style: 'american',
        spot_price: 150.0,
        risk_free_rate: 0.05,
        bid: 8.0,
        ask: 8.5,
        last: 8.25,
        volume: 1000,
        open_interest: 5000,
        implied_volatility: 0.25,
      };

      const mockResponse: OptionAnalysis = {
        option: {
          symbol: 'AAPL',
          strike: 150.0,
          expiry: '2027-01-25',
          option_type: 'call',
          exercise_style: 'american',
          bid: 8.0,
          ask: 8.5,
          last: 8.25,
          volume: 1000,
          open_interest: 5000,
          implied_volatility: 0.25,
        },
        greeks: {
          delta: 0.5,
          gamma: 0.02,
          theta: -0.05,
          vega: 0.15,
          rho: 0.03,
        },
        theoretical_price: 8.30,
        market_price: 8.25,
        iv_percentile: 0.65,
        historical_volatility: 0.20,
        mispricing: -0.05,
        valuation: 'cheap',
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const result = await analyzeOption(request);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/analysis/single',
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const request: SingleOptionAnalysisRequest = {
        symbol: 'INVALID',
        strike: 150.0,
        expiry: '2027-01-25',
        option_type: 'call',
        exercise_style: 'american',
        spot_price: 150.0,
        risk_free_rate: 0.05,
      };

      const errorMessage = 'Symbol not found';
      vi.mocked(axios.post).mockRejectedValue(new Error(errorMessage));

      await expect(analyzeOption(request)).rejects.toThrow(errorMessage);
    });
  });

  describe('getVolatilitySurface', () => {
    it('should fetch volatility surface data successfully', async () => {
      const request: VolatilitySurfaceRequest = {
        options: [
          {
            symbol: 'AAPL',
            strike: 150.0,
            expiry: '2027-01-25',
            option_type: 'call',
            implied_volatility: 0.25,
          },
          {
            symbol: 'AAPL',
            strike: 155.0,
            expiry: '2027-02-19',
            option_type: 'call',
            implied_volatility: 0.27,
          },
        ],
        spot_price: 150.0,
      };

      const mockResponse: VolatilitySurfaceResponse = {
        surface_data: [
          [150.0, 365, 0.25],
          [155.0, 390, 0.27],
        ],
        strikes: [150.0, 155.0],
        expiries: ['2027-01-25', '2027-02-19'],
        days_to_expiry: [365, 390],
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const result = await getVolatilitySurface(request);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/analysis/volatility-surface',
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle optional filters', async () => {
      const request: VolatilitySurfaceRequest = {
        options: [],
        spot_price: 150.0,
        min_strike: 140,
        max_strike: 160,
      };

      const mockResponse: VolatilitySurfaceResponse = {
        surface_data: [],
        strikes: [],
        expiries: [],
        days_to_expiry: [],
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const result = await getVolatilitySurface(request);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/analysis/volatility-surface',
        request
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getVolatilitySurfaceForSymbol', () => {
    it('should fetch volatility surface data by symbol', async () => {
      const mockResponse: VolatilitySurfaceResponse = {
        surface_data: [[150.0, 30, 0.25]],
        strikes: [150.0],
        expiries: ['2027-01-25'],
        days_to_expiry: [30],
      }

      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse })

      const result = await getVolatilitySurfaceForSymbol('AAPL')

      expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/api/volatility/surface/AAPL')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOptionChain', () => {
    it('should fetch option chain successfully', async () => {
      const symbol = 'AAPL';
      const mockResponse: OptionChain = {
        underlying: 'AAPL',
        spot_price: 150.0,
        options: [
          {
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
          },
        ],
        expiration_dates: ['2027-01-25', '2027-02-19'],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const result = await getOptionChain(symbol);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/options/AAPL/chain',
        { params: {} }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include filters in query params', async () => {
      const symbol = 'AAPL';
      const filters: ChainFilters = {
        expiry: '2027-01-25',
        moneyness: 'atm',
        min_volume: 100,
        min_oi: 500,
      };

      const mockResponse: OptionChain = {
        underlying: 'AAPL',
        spot_price: 150.0,
        options: [],
        expiration_dates: ['2027-01-25'],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const result = await getOptionChain(symbol, filters);

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/options/AAPL/chain',
        { params: filters }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      const symbol = 'INVALID';
      const errorMessage = 'Symbol not found';

      vi.mocked(axios.get).mockRejectedValue(new Error(errorMessage));

      await expect(getOptionChain(symbol)).rejects.toThrow(errorMessage);
    });
  });
});
