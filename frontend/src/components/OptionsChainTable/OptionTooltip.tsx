import React, { useEffect, useRef } from 'react';
import type { OptionAnalysis } from '../../types/analysis';
import './OptionTooltip.css';

interface OptionTooltipProps {
  analysis: OptionAnalysis | null;
  loading: boolean;
  error: Error | null;
  anchorRect: DOMRect | null;
  visible: boolean;
}

export const OptionTooltip: React.FC<OptionTooltipProps> = ({
  analysis,
  loading,
  error,
  anchorRect,
  visible,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && anchorRect && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const { width, height } = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Default: Center bottom
      let top = anchorRect.bottom + 8;
      let left = anchorRect.left + anchorRect.width / 2 - width / 2;

      // Clamp horizontally
      if (left < 10) left = 10;
      if (left + width > viewportWidth - 10) left = viewportWidth - width - 10;

      // Flip to top if not enough space below
      if (top + height > viewportHeight - 10) {
        top = anchorRect.top - height - 8;
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    }
  }, [visible, anchorRect, analysis, loading, error]);

  if (!visible || !anchorRect) return null;

  return (
    <div
      ref={tooltipRef}
      className="option-analysis-tooltip"
      role="tooltip"
      id="option-analysis-tooltip"
      style={{
        position: 'fixed',
        top: '-9999px', // Initial off-screen position
        left: '-9999px',
      }}
    >
      {loading && <div className="tooltip-loading">Analyzing...</div>}
      
      {error && <div className="tooltip-error">Analysis failed</div>}

      {!loading && !error && analysis && (
        <div className="tooltip-content">
          <div className="tooltip-header">
            <span className={`valuation-badge ${analysis.valuation}`}>
              {analysis.valuation.toUpperCase()}
            </span>
            <span className="tooltip-title">
              {analysis.option.strike} {analysis.option.option_type.toUpperCase()}
            </span>
          </div>

          <div className="tooltip-grid">
            <div className="tooltip-section">
              <h4>Greeks</h4>
              <div className="data-row">
                <span>Δ</span>
                <span>{analysis.greeks.delta.toFixed(3)}</span>
              </div>
              <div className="data-row">
                <span>Γ</span>
                <span>{analysis.greeks.gamma.toFixed(3)}</span>
              </div>
              <div className="data-row">
                <span>Θ</span>
                <span>{analysis.greeks.theta.toFixed(3)}</span>
              </div>
              <div className="data-row">
                <span>V</span>
                <span>{analysis.greeks.vega.toFixed(3)}</span>
              </div>
            </div>

            <div className="tooltip-section">
              <h4>Pricing</h4>
              <div className="data-row">
                <span>Market</span>
                <span>${analysis.market_price.toFixed(2)}</span>
              </div>
              <div className="data-row">
                <span>Theo</span>
                <span>${analysis.theoretical_price.toFixed(2)}</span>
              </div>
              <div className="data-row">
                <span>Diff</span>
                <span className={analysis.mispricing > 0 ? 'text-green' : 'text-red'}>
                  {analysis.mispricing > 0 ? '+' : ''}{(analysis.mispricing * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="tooltip-section full-width">
              <div className="data-row">
                <span>IV Percentile</span>
                <span>{(analysis.iv_percentile * 100).toFixed(1)}%</span>
              </div>
              <div className="data-row">
                <span>Hist. Vol</span>
                <span>{(analysis.historical_volatility * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
