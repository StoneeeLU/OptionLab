/**
 * Option chain types.
 * Matches backend/app/models/chain.py
 */
import { Option } from './option';

export interface OptionChain {
  underlying: string;
  spot_price: number;
  options: Option[];
  expiration_dates: string[]; // ISO date strings
}

/**
 * Query parameters for option chain endpoint.
 */
export interface ChainFilters {
  expiry?: string; // ISO date
  moneyness?: 'otm' | 'atm' | 'itm';
  min_volume?: number;
  min_oi?: number;
}
