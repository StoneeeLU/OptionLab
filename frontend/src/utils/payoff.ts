/**
 * Payoff helpers for option expiration values.
 */

export type OptionType = 'call' | 'put';

/**
 * Intrinsic value for a call option at expiration.
 */
export function calculateCallPayoff(spot: number, strike: number): number {
  return Math.max(spot - strike, 0);
}

/**
 * Intrinsic value for a put option at expiration.
 */
export function calculatePutPayoff(spot: number, strike: number): number {
  return Math.max(strike - spot, 0);
}

/**
 * Intrinsic value based on option type.
 */
export function calculateIntrinsicValue(
  type: OptionType,
  spot: number,
  strike: number
): number {
  return type === 'call'
    ? calculateCallPayoff(spot, strike)
    : calculatePutPayoff(spot, strike);
}
