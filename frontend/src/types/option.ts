/**
 * Option type - represents a single option contract.
 * Matches backend/app/models/option.py
 */
export interface Option {
  symbol: string;
  strike: number;
  expiry: string; // ISO date string (YYYY-MM-DD)
  option_type: 'call' | 'put';
  bid?: number;
  ask?: number;
  last?: number;
  volume?: number;
  open_interest?: number;
  implied_volatility?: number;
  exercise_style?: 'american' | 'european';
}
