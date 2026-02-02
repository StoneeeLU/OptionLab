/**
 * Analysis types - option analysis results.
 * Matches backend/app/models/analysis.py
 */
import type { Option } from './option';
import type { Greeks } from './greeks';

export interface OptionAnalysis {
  option: Option;
  greeks: Greeks;
  theoretical_price: number;
  market_price: number;
  iv_percentile: number;
  historical_volatility: number;
  mispricing: number;
  valuation: 'cheap' | 'fair' | 'expensive';
}

/**
 * Request body for single option analysis endpoint.
 */
export interface SingleOptionAnalysisRequest {
  symbol: string;
  strike: number;
  expiry: string; // ISO date
  option_type: 'call' | 'put';
  exercise_style: 'american' | 'european';
  bid?: number;
  ask?: number;
  last?: number;
  volume?: number;
  open_interest?: number;
  implied_volatility?: number;
  spot_price: number;
  risk_free_rate: number;
  historical_prices?: number[];
  historical_ivs?: number[];
}

/**
 * Request body for volatility surface endpoint.
 */
export interface VolatilitySurfaceRequest {
  options: Option[];
  spot_price: number;
  min_strike?: number;
  max_strike?: number;
}

/**
 * Response from volatility surface endpoint.
 * surface_data is array of [strike, days_to_expiry, iv] tuples.
 */
export interface VolatilitySurfaceResponse {
  surface_data: Array<[number, number, number]>;
}
