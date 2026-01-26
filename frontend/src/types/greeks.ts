/**
 * Greeks type - option sensitivities.
 * Matches backend/app/models/greeks.py
 */
export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}
