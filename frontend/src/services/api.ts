/**
 * API Client - typed axios client for QuantLab backend.
 * Handles all HTTP communication with FastAPI backend.
 */
import axios from 'axios';
import type {
  SingleOptionAnalysisRequest,
  OptionAnalysis,
  VolatilitySurfaceRequest,
  VolatilitySurfaceResponse,
  OptionChain,
  ChainFilters,
} from '../types';

/**
 * Base URL for API requests.
 * Can be configured via environment variable or defaults to localhost.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Analyze a single option contract.
 * 
 * @param request - Single option analysis request
 * @returns Option analysis with Greeks, pricing, and valuation
 * @throws Error if API request fails
 */
export async function analyzeOption(
  request: SingleOptionAnalysisRequest
): Promise<OptionAnalysis> {
  const response = await axios.post<OptionAnalysis>(
    `${BASE_URL}/api/analysis/single`,
    request
  );
  return response.data;
}

/**
 * Get volatility surface data for multiple options.
 * Returns 3D surface data: [strike, days_to_expiry, implied_volatility]
 * 
 * @param request - Volatility surface request with options array
 * @returns Surface data array for 3D visualization
 * @throws Error if API request fails
 */
export async function getVolatilitySurface(
  request: VolatilitySurfaceRequest
): Promise<VolatilitySurfaceResponse> {
  const response = await axios.post<VolatilitySurfaceResponse>(
    `${BASE_URL}/api/analysis/volatility-surface`,
    request
  );
  return response.data;
}

/**
 * Get options chain for a given symbol.
 * 
 * @param symbol - Underlying symbol (e.g., "AAPL")
 * @param filters - Optional filters for expiry, moneyness, volume, OI
 * @returns Options chain with all available contracts
 * @throws Error if API request fails or symbol not found
 */
export async function getOptionChain(
  symbol: string,
  filters?: ChainFilters
): Promise<OptionChain> {
  const response = await axios.get<OptionChain>(
    `${BASE_URL}/api/options/${symbol}/chain`,
    {
      params: filters || {},
    }
  );
  return response.data;
}
