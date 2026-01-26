import React, { useState } from 'react';
import type { Option } from '../../types';
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

export function OptionsChainTable({
  options,
  spotPrice,
  onSelectionChange,
  multiSelect = false,
}: OptionsChainTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Group options by strike price
  const rowData: RowData[] = React.useMemo(() => {
    const strikeMap = new Map<number, RowData>();

    options.forEach((option) => {
      const existing = strikeMap.get(option.strike) || { strike: option.strike };
      if (option.option_type === 'call') {
        existing.call = option;
      } else {
        existing.put = option;
      }
      strikeMap.set(option.strike, existing);
    });

    return Array.from(strikeMap.values()).sort((a, b) => a.strike - b.strike);
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

  const formatNumber = (value: number | undefined, decimals = 2): string => {
    return value !== undefined ? value.toFixed(decimals) : '-';
  };

  const formatPercent = (value: number | undefined): string => {
    return value !== undefined ? `${(value * 100).toFixed(1)}%` : '-';
  };

  return (
    <div className="options-chain-table">
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
                <td className="call-data">{formatNumber(row.call?.bid)}</td>
                <td className="call-data">{formatNumber(row.call?.ask)}</td>
                <td className="call-data">{formatNumber(row.call?.last)}</td>
                <td className="call-data">{row.call?.volume || '-'}</td>
                <td className="call-data">{formatPercent(row.call?.implied_volatility)}</td>

                {/* Strike price */}
                <td className="strike-cell">{formatNumber(row.strike)}</td>

                {/* Put data */}
                <td className="put-data">{formatPercent(row.put?.implied_volatility)}</td>
                <td className="put-data">{row.put?.volume || '-'}</td>
                <td className="put-data">{formatNumber(row.put?.last)}</td>
                <td className="put-data">{formatNumber(row.put?.ask)}</td>
                <td className="put-data">{formatNumber(row.put?.bid)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
