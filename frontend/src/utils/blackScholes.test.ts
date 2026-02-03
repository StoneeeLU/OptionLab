import { describe, it, expect } from 'vitest';
import { calculateCallPrice, calculateGreeks, calculatePutPrice } from './blackScholes';

const expectWithin = (actual: number, expected: number, tolerance: number) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
};

const expectFinite = (value: number) => {
  expect(Number.isFinite(value)).toBe(true);
};

const expectFiniteGreeks = (greeks: ReturnType<typeof calculateGreeks>) => {
  expectFinite(greeks.delta);
  expectFinite(greeks.gamma);
  expectFinite(greeks.theta);
  expectFinite(greeks.vega);
  expectFinite(greeks.rho);
};

describe('Black-Scholes pricing', () => {
  it('matches reference call and put prices', () => {
    const spot = 100;
    const strike = 100;
    const rate = 0.05;
    const volatility = 0.2;
    const time = 1;

    const call = calculateCallPrice(spot, strike, rate, volatility, time);
    const put = calculatePutPrice(spot, strike, rate, volatility, time);

    expectWithin(call, 10.45, 0.01);
    expectWithin(put, 5.57, 0.01);
  });

  it('returns intrinsic value when time is zero', () => {
    const spot = 110;
    const strike = 100;

    expect(calculateCallPrice(spot, strike, 0.05, 0.2, 0)).toBe(10);
    expect(calculatePutPrice(spot, strike, 0.05, 0.2, 0)).toBe(0);
  });

  it('returns intrinsic value when volatility is zero', () => {
    const spot = 90;
    const strike = 100;

    expect(calculateCallPrice(spot, strike, 0.05, 0, 1)).toBe(0);
    expect(calculatePutPrice(spot, strike, 0.05, 0, 1)).toBe(10);
  });
});

describe('Black-Scholes greeks', () => {
  it('matches reference greek values for calls and puts', () => {
    const spot = 100;
    const strike = 100;
    const rate = 0.05;
    const volatility = 0.2;
    const time = 1;

    const call = calculateGreeks('call', spot, strike, rate, volatility, time);
    const put = calculateGreeks('put', spot, strike, rate, volatility, time);

    expectWithin(call.delta, 0.6368, 0.01);
    expectWithin(call.gamma, 0.01876, 0.01);
    expectWithin(call.theta, -6.41, 0.1);
    expectWithin(call.vega, 37.52, 0.01);
    expectWithin(call.rho, 53.23, 0.01);

    expect(call.delta).toBeGreaterThanOrEqual(0);
    expect(call.delta).toBeLessThanOrEqual(1);

    expectWithin(put.delta, -0.3632, 0.01);
    expectWithin(put.gamma, 0.01876, 0.01);
    expectWithin(put.theta, -1.66, 0.1);
    expectWithin(put.vega, 37.52, 0.01);
    expectWithin(put.rho, -41.89, 0.01);

    expectFiniteGreeks(call);
    expectFiniteGreeks(put);
  });

  it('returns finite greeks for intrinsic cases', () => {
    const greeks = calculateGreeks('call', 120, 100, 0.05, 0, 1);

    expect(greeks.delta).toBe(1);
    expect(greeks.gamma).toBe(0);
    expect(greeks.theta).toBe(0);
    expect(greeks.vega).toBe(0);
    expect(greeks.rho).toBe(0);
  });
});
