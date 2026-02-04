import { type StrategyPayoffExampleProps } from '../charts/StrategyPayoffExample';

export interface StrategyExample extends StrategyPayoffExampleProps {
  id: string;
}

export const STRATEGY_EXAMPLES: StrategyExample[] = [
  {
    id: 'bull-call-spread',
    name: { en: 'Bull Call Spread', zh: '牛市认购价差' },
    description: {
      en: 'A moderately bullish strategy with limited risk and capped reward, created by buying a call and selling another call at a higher strike.',
      zh: '一种适度看涨的策略，风险有限且收益有上限，通过买入一个认购期权并卖出另一个行权价更高的认购期权来实现。'
    },
    spot: 100,
    legs: [
      { type: 'call', position: 'long', strike: 95, premium: 7.5 },
      { type: 'call', position: 'short', strike: 105, premium: 2.5 },
    ]
  },
  {
    id: 'bear-put-spread',
    name: { en: 'Bear Put Spread', zh: '熊市认沽价差' },
    description: {
      en: 'A moderately bearish strategy with limited risk and reward, created by buying a put and selling another put at a lower strike.',
      zh: '一种适度看跌的策略，风险和收益都有限，通过买入一个认沽期权并卖出另一个行权价更低的认沽期权来实现。'
    },
    spot: 100,
    legs: [
      { type: 'put', position: 'long', strike: 105, premium: 7.5 },
      { type: 'put', position: 'short', strike: 95, premium: 2.5 },
    ]
  },
  {
    id: 'long-straddle',
    name: { en: 'Long Straddle', zh: '买入跨式' },
    description: {
      en: 'A volatility strategy that profits from large price movements in either direction by buying a call and a put at the same strike.',
      zh: '一种波动率策略，通过买入相同行权价的认购和认沽期权，从任何方向的大幅价格波动中获利。'
    },
    spot: 100,
    legs: [
      { type: 'call', position: 'long', strike: 100, premium: 5.0 },
      { type: 'put', position: 'long', strike: 100, premium: 5.0 },
    ]
  },
  {
    id: 'long-strangle',
    name: { en: 'Long Strangle', zh: '买入宽跨式' },
    description: {
      en: 'Similar to a straddle but cheaper, using out-of-the-money options to profit from very large price swings.',
      zh: '类似于跨式策略但成本更低，使用虚值期权从极大的价格波动中获利。'
    },
    spot: 100,
    legs: [
      { type: 'call', position: 'long', strike: 110, premium: 2.0 },
      { type: 'put', position: 'long', strike: 90, premium: 2.0 },
    ]
  },
  {
    id: 'iron-condor',
    name: { en: 'Iron Condor', zh: '铁鹰式价差' },
    description: {
      en: 'A neutral strategy that profits from low volatility by selling both a put spread and a call spread.',
      zh: '一种中性策略，通过卖出一个认沽价差和一个认购价差，从低波动率中获利。'
    },
    spot: 100,
    legs: [
      { type: 'put', position: 'short', strike: 95, premium: 2.5 },
      { type: 'put', position: 'long', strike: 90, premium: 1.0 },
      { type: 'call', position: 'short', strike: 105, premium: 2.5 },
      { type: 'call', position: 'long', strike: 110, premium: 1.0 },
    ]
  }
];
