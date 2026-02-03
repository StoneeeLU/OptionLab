import React, { useState, useRef, useEffect } from 'react';
import type { Option } from '../../types';
import { useOptionAnalysis } from './useOptionAnalysis';
import { OptionTooltip } from './OptionTooltip';
import { GlassPanel } from '../common/GlassPanel';
import './OptionsChainTable.css';

interface OptionsChainTableProps {
  options: Option[];
  spotPrice: number;
  onSelectionChange?: (selectedOptions: Option[]) => void;
  multiSelect?: boolean;
}

interface RowData {
  strike: number;
  call?: Option;
  put?: Option;
}

interface ActiveTooltipState {
  type: 'call' | 'put';
  strike: number;
  anchorRect: DOMRect;
}

export function OptionsChainTable({
  options,
  spotPrice,
  onSelectionChange,
  multiSelect = false,
}: OptionsChainTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltipState | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  
  const { analyze, data: analysisData, loading: analysisLoading, error: analysisError } = useOptionAnalysis();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTooltip(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTooltipTrigger = (
    option: Option | undefined,
    event: React.MouseEvent | React.FocusEvent
  ) => {
    if (!option) return;
    
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    const target = event.currentTarget as HTMLElement;
    setActiveTooltip({
      type: option.option_type,
      strike: option.strike,
      anchorRect: target.getBoundingClientRect(),
    });

    analyze({
      symbol: option.symbol,
      strike: option.strike,
      expiry: option.expiry,
      option_type: option.option_type,
      exercise_style: 'american', // Assuming equity options default to American
      bid: option.bid,
      ask: option.ask,
      last: option.last,
      volume: option.volume,
      open_interest: option.open_interest,
      implied_volatility: option.implied_volatility,
      spot_price: spotPrice,
      risk_free_rate: 0.05,
    });
  };

  const handleTooltipHide = () => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      setActiveTooltip(null);
    }, 100);
  };


  // Group options by strike price
  const { rowData, maxCallVol, maxPutVol } = React.useMemo(() => {
    const strikeMap = new Map<number, RowData>();
    let maxC = 0;
    let maxP = 0;

    options.forEach((option) => {
      const existing = strikeMap.get(option.strike) || { strike: option.strike };
      if (option.option_type === 'call') {
        existing.call = option;
        if (option.volume) maxC = Math.max(maxC, option.volume);
      } else {
        existing.put = option;
        if (option.volume) maxP = Math.max(maxP, option.volume);
      }
      strikeMap.set(option.strike, existing);
    });

    return {
      rowData: Array.from(strikeMap.values()).sort((a, b) => a.strike - b.strike),
      maxCallVol: maxC,
      maxPutVol: maxP,
    };
  }, [options]);

  const handleRowClick = (strike: number, event: React.MouseEvent) => {
    let newSelection: Set<number>;

    if (multiSelect && (event.ctrlKey || event.metaKey)) {
      // Ctrl/Cmd + Click: toggle selection
      newSelection = new Set(selectedRows);
      if (newSelection.has(strike)) {
        newSelection.delete(strike);
      } else {
        newSelection.add(strike);
      }
    } else {
      // Normal click: single selection
      newSelection = new Set([strike]);
    }

    setSelectedRows(newSelection);

    // Notify parent of selection change
    if (onSelectionChange) {
      const selectedOptions = rowData
        .filter((row) => newSelection.has(row.strike))
        .flatMap((row) => [row.call, row.put].filter((opt): opt is Option => !!opt));
      onSelectionChange(selectedOptions);
    }
  };

  const isATM = (strike: number): boolean => {
    return Math.abs(strike - spotPrice) < 0.01;
  };

  const getMoneynessClass = (type: 'call' | 'put', strike: number): string => {
    if (type === 'call') {
      return strike < spotPrice ? 'itm' : 'otm';
    }
    return strike > spotPrice ? 'itm' : 'otm';
  };

  const getVolumeIntensity = (vol: number | undefined, maxVol: number): number => {
    if (!vol) return 0;
    const v = Math.log10(vol + 1);
    const m = Math.log10(maxVol + 1);
    return m === 0 ? 0 : Math.min(10, Math.round((v / m) * 10));
  };

  const getSpreadClass = (bid: number | undefined, ask: number | undefined): string | undefined => {
    if (bid === undefined || ask === undefined) return undefined;
    const mid = (bid + ask) / 2;
    if (mid <= 0) return undefined;
    const spreadPct = (ask - bid) / mid;
    if (spreadPct < 0.01) return 'spread-tight';
    if (spreadPct < 0.05) return 'spread-medium';
    return 'spread-wide';
  };

  const renderSpreadIndicator = (bid: number | undefined, ask: number | undefined) => {
    const spreadClass = getSpreadClass(bid, ask);
    if (!spreadClass) return null;
    return <span className={`spread-indicator ${spreadClass}`} />;
  };

  const renderIvBar = (iv: number | undefined) => {
    if (iv === undefined) return null;
    const pct = Math.min(100, Math.max(0, Math.round(iv * 100)));
    let barClass = 'iv-bar-low';
    if (pct > 50) barClass = 'iv-bar-high';
    else if (pct > 20) barClass = 'iv-bar-mid';
    
    return (
      <div className="iv-bar-container">
        <div className={`iv-bar ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  const formatNumber = (value: number | undefined, decimals = 2): string => {
    return value !== undefined ? value.toFixed(decimals) : '-';
  };

  const formatPercent = (value: number | undefined): string => {
    return value !== undefined ? `${(value * 100).toFixed(1)}%` : '-';
  };

  return (
    <GlassPanel className="options-chain-table" variant="strong">
      <table>
        <thead>
          <tr>
            <th colSpan={5} className="call-section-header">
              CALLS
            </th>
            <th rowSpan={2} className="strike-header">
              Strike
            </th>
            <th colSpan={5} className="put-section-header">
              PUTS
            </th>
          </tr>
          <tr>
            {/* Call headers */}
            <th>Bid</th>
            <th>Ask</th>
            <th>Last</th>
            <th>Volume</th>
            <th>IV</th>
            {/* Put headers */}
            <th>IV</th>
            <th>Volume</th>
            <th>Last</th>
            <th>Ask</th>
            <th>Bid</th>
          </tr>
        </thead>
        <tbody>
          {rowData.map((row) => {
            const isSelected = selectedRows.has(row.strike);
            const isAtm = isATM(row.strike);
            const callMoneyness = getMoneynessClass('call', row.strike);
            const putMoneyness = getMoneynessClass('put', row.strike);
            const callVolIntensity = getVolumeIntensity(row.call?.volume, maxCallVol);
            const putVolIntensity = getVolumeIntensity(row.put?.volume, maxPutVol);

            return (
              <tr
                key={row.strike}
                className={`
                  ${isAtm ? 'atm-strike' : ''}
                  ${isSelected ? 'selected' : ''}
                `}
                onClick={(e) => handleRowClick(row.strike, e)}
              >
                {/* Call data */}
                <td className={`call-data ${callMoneyness}`}>
                  {formatNumber(row.call?.bid)}
                  {renderSpreadIndicator(row.call?.bid, row.call?.ask)}
                </td>
                <td className={`call-data ${callMoneyness}`}>
                  {formatNumber(row.call?.ask)}
                  {renderSpreadIndicator(row.call?.bid, row.call?.ask)}
                </td>
                <td className={`call-data ${callMoneyness}`}>{formatNumber(row.call?.last)}</td>
                <td className={`call-data ${callMoneyness}`} data-volume-intensity={callVolIntensity}>
                  {row.call?.volume || '-'}
                </td>
                <td 
                  className={`call-data ${callMoneyness} iv-cell`}
                  onMouseEnter={(e) => handleTooltipTrigger(row.call, e)}
                  onMouseLeave={handleTooltipHide}
                  onFocus={(e) => handleTooltipTrigger(row.call, e)}
                  onBlur={handleTooltipHide}
                  tabIndex={row.call ? 0 : -1}
                  role="gridcell"
                  aria-describedby={activeTooltip?.type === 'call' && activeTooltip?.strike === row.strike ? "option-analysis-tooltip" : undefined}
                >
                  <span>{formatPercent(row.call?.implied_volatility)}</span>
                  {renderIvBar(row.call?.implied_volatility)}
                </td>

                {/* Strike price */}
                <td className="strike-cell">{formatNumber(row.strike)}</td>

                {/* Put data */}
                <td 
                  className={`put-data ${putMoneyness} iv-cell`}
                  onMouseEnter={(e) => handleTooltipTrigger(row.put, e)}
                  onMouseLeave={handleTooltipHide}
                  onFocus={(e) => handleTooltipTrigger(row.put, e)}
                  onBlur={handleTooltipHide}
                  tabIndex={row.put ? 0 : -1}
                  role="gridcell"
                  aria-describedby={activeTooltip?.type === 'put' && activeTooltip?.strike === row.strike ? "option-analysis-tooltip" : undefined}
                >
                  <span>{formatPercent(row.put?.implied_volatility)}</span>
                  {renderIvBar(row.put?.implied_volatility)}
                </td>
                <td className={`put-data ${putMoneyness}`} data-volume-intensity={putVolIntensity}>
                  {row.put?.volume || '-'}
                </td>
                <td className={`put-data ${putMoneyness}`}>{formatNumber(row.put?.last)}</td>
                <td className={`put-data ${putMoneyness}`}>
                  {formatNumber(row.put?.ask)}
                  {renderSpreadIndicator(row.put?.bid, row.put?.ask)}
                </td>
                <td className={`put-data ${putMoneyness}`}>
                  {formatNumber(row.put?.bid)}
                  {renderSpreadIndicator(row.put?.bid, row.put?.ask)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <OptionTooltip
        analysis={analysisData}
        loading={analysisLoading}
        error={analysisError}
        anchorRect={activeTooltip?.anchorRect ?? null}
        visible={!!activeTooltip}
      />
    </GlassPanel>
  );
}
