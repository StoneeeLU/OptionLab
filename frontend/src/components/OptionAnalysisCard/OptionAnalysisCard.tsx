import React from 'react';
import type { OptionAnalysis } from '../../types';
import './OptionAnalysisCard.css';

interface OptionAnalysisCardProps {
  analysis: OptionAnalysis;
}

export function OptionAnalysisCard({ analysis }: OptionAnalysisCardProps) {
  const { option, greeks, theoretical_price, market_price, iv_percentile, historical_volatility, mispricing, valuation } = analysis;

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatPrice = (value: number): string => {
    return `$${value.toFixed(2)}`;
  };

  const getGreekClass = (value: number): string => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  const getValuationClass = (val: string): string => {
    return val.toLowerCase();
  };

  return (
    <div className="option-analysis-card">
      {/* Header */}
      <div className="card-header">
        <h3>{option.symbol} ${option.strike} {option.option_type.toUpperCase()}</h3>
        <p className="expiry">{option.expiry}</p>
        <div className={`valuation-badge ${getValuationClass(valuation)}`}>
          {valuation.toUpperCase()}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section">
        <div className="price-item">
          <span className="label">Theoretical:</span>
          <span className="value">{formatPrice(theoretical_price)}</span>
        </div>
        <div className="price-item">
          <span className="label">Market:</span>
          <span className="value">{formatPrice(market_price)}</span>
        </div>
        <div className="price-item">
          <span className="label">Mispricing:</span>
          <span className={`value ${getGreekClass(mispricing)}`}>
            {formatPrice(mispricing)}
          </span>
        </div>
      </div>

      {/* Volatility Section */}
      <div className="volatility-section">
        <h4>Volatility</h4>
        <div className="vol-grid">
          <div className="vol-item">
            <span className="label">Implied (IV):</span>
            <span className="value">{formatPercent(option.implied_volatility || 0)}</span>
          </div>
          <div className="vol-item">
            <span className="label">Historical (HV):</span>
            <span className="value">{formatPercent(historical_volatility)}</span>
          </div>
          <div className="vol-item">
            <span className="label">IV Percentile:</span>
            <span className="value">{Math.round(iv_percentile * 100)}%</span>
          </div>
        </div>

        {/* IV Percentile Bar */}
        <div className="percentile-bar">
          <div className="percentile-fill" style={{ width: `${iv_percentile * 100}%` }} />
        </div>
      </div>

      {/* Greeks Section */}
      <div className="greeks-section">
        <h4>Greeks</h4>
        <div className="greeks-grid">
          <div className="greek-item">
            <span className="label">Delta:</span>
            <span className={`greek-value ${getGreekClass(greeks.delta)}`}>
              {greeks.delta.toFixed(2)}
            </span>
          </div>
          <div className="greek-item">
            <span className="label">Gamma:</span>
            <span className={`greek-value ${getGreekClass(greeks.gamma)}`}>
              {greeks.gamma.toFixed(3)}
            </span>
          </div>
          <div className="greek-item">
            <span className="label">Theta:</span>
            <span className={`greek-value ${getGreekClass(greeks.theta)}`}>
              {greeks.theta.toFixed(3)}
            </span>
          </div>
          <div className="greek-item">
            <span className="label">Vega:</span>
            <span className={`greek-value ${getGreekClass(greeks.vega)}`}>
              {greeks.vega.toFixed(2)}
            </span>
          </div>
          <div className="greek-item">
            <span className="label">Rho:</span>
            <span className={`greek-value ${getGreekClass(greeks.rho)}`}>
              {greeks.rho.toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
