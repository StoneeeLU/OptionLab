import { useState, useRef, useCallback, useEffect } from 'react';
import { analyzeOption } from '../../services/api';
import { debounce } from '../../utils/lazyLoad';
import type { OptionAnalysis, SingleOptionAnalysisRequest } from '../../types';

interface AnalysisState {
  data: OptionAnalysis | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for analyzing options with debouncing and caching.
 * Used for hover-to-fetch functionality in the options chain.
 */
export function useOptionAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    data: null,
    loading: false,
    error: null,
  });

  // Cache for storing analysis results
  const cache = useRef<Map<string, OptionAnalysis>>(new Map());
  
  // Track request ID to prevent stale updates
  const requestIdRef = useRef<number>(0);

  // The debounced fetcher ref to avoid reading refs in render
  const debouncedFetchRef = useRef<((request: SingleOptionAnalysisRequest, id: number) => void) | null>(null);

  useEffect(() => {
    debouncedFetchRef.current = debounce(async (request: SingleOptionAnalysisRequest, id: number) => {
      try {
        const result = await analyzeOption(request);
        
        // Only update if this is still the latest request
        if (id === requestIdRef.current) {
          cache.current.set(JSON.stringify(request), result);
          setState({
            data: result,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        // Only update if this is still the latest request
        if (id === requestIdRef.current) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error('Failed to analyze option'),
          });
        }
      }
    }, 150);
  }, []);

  const analyze = useCallback((request: SingleOptionAnalysisRequest) => {
    const requestKey = JSON.stringify(request);
    
    // Increment request ID for a new call
    requestIdRef.current += 1;
    const currentId = requestIdRef.current;

    // Check cache first
    if (cache.current.has(requestKey)) {
      setState({
        data: cache.current.get(requestKey) || null,
        loading: false,
        error: null,
      });
      return;
    }

    // New request: set loading and trigger debounced fetch
    setState(prev => ({ ...prev, loading: true, error: null }));
    debouncedFetchRef.current?.(request, currentId);
  }, []);

  return {
    ...state,
    analyze,
  };
}
