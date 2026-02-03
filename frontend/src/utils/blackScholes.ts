/**
 * Black-Scholes utilities for European options (no dividends).
 */

import type { Greeks } from '../types/greeks';
import { calculateIntrinsicValue, type OptionType } from './payoff';

const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

const ERF_A1 = 0.254829592;
const ERF_A2 = -0.284496736;
const ERF_A3 = 1.421413741;
const ERF_A4 = -1.453152027;
const ERF_A5 = 1.061405429;
const ERF_P = 0.3275911;

const ZERO_GREEKS: Greeks = {
  delta: 0,
  gamma: 0,
  theta: 0,
  vega: 0,
  rho: 0,
};

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

function hasInvalidInputs(values: number[]): boolean {
  return values.some((value) => !isFiniteNumber(value));
}

function sanitizeNumber(value: number, fallback = 0): number {
  return isFiniteNumber(value) ? value : fallback;
}

function sanitizeGreeks(greeks: Greeks): Greeks {
  return {
    delta: sanitizeNumber(greeks.delta),
    gamma: sanitizeNumber(greeks.gamma),
    theta: sanitizeNumber(greeks.theta),
    vega: sanitizeNumber(greeks.vega),
    rho: sanitizeNumber(greeks.rho),
  };
}

// Abramowitz and Stegun 7.1.26 approximation for erf(x).
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + ERF_P * absX);
  const y = 1 - (((((ERF_A5 * t + ERF_A4) * t + ERF_A3) * t + ERF_A2) * t + ERF_A1) * t)
    * Math.exp(-absX * absX);
  return sign * y;
}

function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT_TWO_PI;
}

function calculateD1D2(
  spot: number,
  strike: number,
  rate: number,
  volatility: number,
  time: number
): { d1: number; d2: number; sqrtTime: number } {
  const sqrtTime = Math.sqrt(time);
  const denominator = volatility * sqrtTime;
  const numerator = Math.log(spot / strike) + (rate + 0.5 * volatility * volatility) * time;
  const d1 = numerator / denominator;
  const d2 = d1 - volatility * sqrtTime;
  return { d1, d2, sqrtTime };
}

function intrinsicOrZero(
  type: OptionType,
  spot: number,
  strike: number
): number {
  if (!isFiniteNumber(spot) || !isFiniteNumber(strike)) {
    return 0;
  }
  return calculateIntrinsicValue(type, spot, strike);
}

function isIntrinsicCase(
  spot: number,
  strike: number,
  volatility: number,
  time: number
): boolean {
  return time <= 0 || volatility <= 0 || spot <= 0 || strike <= 0;
}

function calculateOptionPrice(
  type: OptionType,
  spot: number,
  strike: number,
  rate: number,
  volatility: number,
  time: number
): number {
  if (hasInvalidInputs([spot, strike, rate, volatility, time])) {
    return 0;
  }

  const intrinsic = intrinsicOrZero(type, spot, strike);

  if (isIntrinsicCase(spot, strike, volatility, time)) {
    return intrinsic;
  }

  const { d1, d2 } = calculateD1D2(spot, strike, rate, volatility, time);
  const discountFactor = Math.exp(-rate * time);

  const price = type === 'call'
    ? spot * normalCdf(d1) - strike * discountFactor * normalCdf(d2)
    : strike * discountFactor * normalCdf(-d2) - spot * normalCdf(-d1);

  return sanitizeNumber(price, intrinsic);
}

function intrinsicDelta(type: OptionType, spot: number, strike: number): number {
  if (spot === strike) {
    return type === 'call' ? 0.5 : -0.5;
  }

  const isInTheMoney = type === 'call' ? spot > strike : spot < strike;
  if (!isInTheMoney) {
    return 0;
  }

  return type === 'call' ? 1 : -1;
}

/**
 * Black-Scholes price for a European call option.
 */
export function calculateCallPrice(
  spot: number,
  strike: number,
  rate: number,
  volatility: number,
  time: number
): number {
  return calculateOptionPrice('call', spot, strike, rate, volatility, time);
}

/**
 * Black-Scholes price for a European put option.
 */
export function calculatePutPrice(
  spot: number,
  strike: number,
  rate: number,
  volatility: number,
  time: number
): number {
  return calculateOptionPrice('put', spot, strike, rate, volatility, time);
}

/**
 * Black-Scholes Greeks for European options.
 * Theta is annualized (per-year) and uses standard sign conventions.
 */
export function calculateGreeks(
  type: OptionType,
  spot: number,
  strike: number,
  rate: number,
  volatility: number,
  time: number
): Greeks {
  if (hasInvalidInputs([spot, strike, rate, volatility, time])) {
    return ZERO_GREEKS;
  }

  if (isIntrinsicCase(spot, strike, volatility, time)) {
    return {
      delta: intrinsicDelta(type, spot, strike),
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    };
  }

  const { d1, d2, sqrtTime } = calculateD1D2(spot, strike, rate, volatility, time);
  const pdfD1 = normalPdf(d1);
  const discountFactor = Math.exp(-rate * time);

  const delta = type === 'call' ? normalCdf(d1) : normalCdf(d1) - 1;
  const gamma = pdfD1 / (spot * volatility * sqrtTime);
  const thetaBase = -(spot * pdfD1 * volatility) / (2 * sqrtTime);
  const theta = type === 'call'
    ? thetaBase - rate * strike * discountFactor * normalCdf(d2)
    : thetaBase + rate * strike * discountFactor * normalCdf(-d2);
  const vega = spot * pdfD1 * sqrtTime;
  const rho = type === 'call'
    ? strike * time * discountFactor * normalCdf(d2)
    : -strike * time * discountFactor * normalCdf(-d2);

  return sanitizeGreeks({ delta, gamma, theta, vega, rho });
}
