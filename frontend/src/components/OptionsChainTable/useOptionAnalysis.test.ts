import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useOptionAnalysis } from './useOptionAnalysis';
import { analyzeOption } from '../../services/api';
import type { SingleOptionAnalysisRequest, OptionAnalysis } from '../../types';

// Mock the API service
vi.mock('../../services/api', () => ({
  analyzeOption: vi.fn(),
}));

const mockRequest: SingleOptionAnalysisRequest = {
  symbol: 'AAPL',
  strike: 150,
  expiry: '2024-12-20',
  option_type: 'call',
  exercise_style: 'american',
  spot_price: 150,
  risk_free_rate: 0.05,
};

const mockResponse: OptionAnalysis = {
  option: { 
    symbol: 'AAPL', 
    strike: 150, 
    expiry: '2024-12-20', 
    option_type: 'call', 
    exercise_style: 'american' 
  },
  greeks: { delta: 0.5, gamma: 0.02, theta: -0.1, vega: 0.2, rho: 0.01 },
  theoretical_price: 5.5,
  market_price: 5.6,
  iv_percentile: 0.4,
  historical_volatility: 0.25,
  mispricing: 0.1,
  valuation: 'fair',
};

describe('useOptionAnalysis', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with null state', () => {
    const { result } = renderHook(() => useOptionAnalysis());
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should debounce rapid calls and only execute the last one', async () => {
    vi.mocked(analyzeOption).mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useOptionAnalysis());

    act(() => {
      result.current.analyze(mockRequest);
      result.current.analyze({ ...mockRequest, strike: 160 });
      result.current.analyze({ ...mockRequest, strike: 170 });
    });

    // Loading should be true immediately
    expect(result.current.loading).toBe(true);
    
    // API should not have been called yet
    expect(analyzeOption).not.toHaveBeenCalled();

    // Fast-forward 150ms
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    // Now API should have been called exactly once with the last request
    expect(analyzeOption).toHaveBeenCalledTimes(1);
    expect(analyzeOption).toHaveBeenCalledWith({ ...mockRequest, strike: 170 });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should return cached result immediately for repeated requests', async () => {
    vi.mocked(analyzeOption).mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useOptionAnalysis());

    // First call
    await act(async () => {
      result.current.analyze(mockRequest);
      vi.advanceTimersByTime(150);
    });
    
    expect(analyzeOption).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();

    // Second call with same request
    act(() => {
      result.current.analyze(mockRequest);
    });

    // Should return immediately from cache, not loading, no API call
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockResponse);
    expect(analyzeOption).not.toHaveBeenCalled();
  });

  it('should handle API errors correctly', async () => {
    const error = new Error('API Error');
    vi.mocked(analyzeOption).mockRejectedValue(error);
    const { result } = renderHook(() => useOptionAnalysis());

    await act(async () => {
      result.current.analyze(mockRequest);
      vi.advanceTimersByTime(150);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeNull();
  });

  it('should prevent stale updates from previous requests', async () => {
    let resolveFirst: (value: OptionAnalysis) => void;
    const firstPromise = new Promise<OptionAnalysis>((resolve) => {
      resolveFirst = resolve;
    });

    vi.mocked(analyzeOption)
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({ ...mockResponse, theoretical_price: 10 });

    const { result } = renderHook(() => useOptionAnalysis());

    // Trigger first request
    act(() => {
      result.current.analyze(mockRequest);
    });
    
    // Advance time to trigger API call
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    
    expect(analyzeOption).toHaveBeenCalledTimes(1);

    // Trigger second request with different parameters (so it's not a cache hit)
    const secondRequest = { ...mockRequest, strike: 200 };
    act(() => {
      result.current.analyze(secondRequest);
    });
    
    // Advance time to trigger second API call
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    
    expect(analyzeOption).toHaveBeenCalledTimes(2);

    // Resolve first promise (it's now stale)
    await act(async () => {
      resolveFirst!(mockResponse);
    });

    // State should still be loading or reflect the second request, not the first
    // Since the second request resolved normally (mockResolvedValueOnce), 
    // it should already be showing the second result or still be loading if it hasn't resolved yet.
    // In our case, the second call was `mockResolvedValueOnce`, so it resolves immediately after the timer.
    
    expect(result.current.data?.theoretical_price).toBe(10);
  });
});
