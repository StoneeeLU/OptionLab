import React, { useState, useEffect, useMemo } from 'react';
import { OptionsChainTable } from '../../components/OptionsChainTable';
import { getOptionChain } from '../../services/api';
import type { OptionChain, Option } from '../../types';
import './OptionsPage.css';

export function OptionsPage() {
  const [symbol, setSymbol] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [optionChain, setOptionChain] = useState<OptionChain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [moneynessFilter, setMoneynessFilter] = useState<string>('all');
  const [minVolume, setMinVolume] = useState<number>(0);
  const [minOI, setMinOI] = useState<number>(0);

  const handleSearch = async (searchSymbol: string) => {
    if (!searchSymbol.trim()) return;

    setSymbol(searchSymbol.toUpperCase());
    setLoading(true);
    setError(null);

    try {
      const chain = await getOptionChain(searchSymbol.toUpperCase());
      setOptionChain(chain);
      
      // Auto-select first expiration
      if (chain.expiration_dates.length > 0) {
        setSelectedExpiry(chain.expiration_dates[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load options chain');
      setOptionChain(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(inputValue);
  };

  // Filter options based on selected expiry and filters
  const filteredOptions = useMemo(() => {
    if (!optionChain) return [];

    let filtered = optionChain.options;

    // Filter by expiration date
    if (selectedExpiry) {
      filtered = filtered.filter((opt) => opt.expiry === selectedExpiry);
    }

    // Filter by moneyness
    if (moneynessFilter !== 'all' && optionChain.spot_price) {
      filtered = filtered.filter((opt) => {
        const spotPrice = optionChain.spot_price;
        const isITM =
          (opt.option_type === 'call' && opt.strike < spotPrice) ||
          (opt.option_type === 'put' && opt.strike > spotPrice);
        const isATM = Math.abs(opt.strike - spotPrice) < spotPrice * 0.02; // Within 2%
        const isOTM =
          (opt.option_type === 'call' && opt.strike > spotPrice) ||
          (opt.option_type === 'put' && opt.strike < spotPrice);

        if (moneynessFilter === 'itm') return isITM;
        if (moneynessFilter === 'atm') return isATM;
        if (moneynessFilter === 'otm') return isOTM;
        return true;
      });
    }

    // Filter by volume
    if (minVolume > 0) {
      filtered = filtered.filter((opt) => (opt.volume || 0) >= minVolume);
    }

    // Filter by open interest
    if (minOI > 0) {
      filtered = filtered.filter((opt) => (opt.open_interest || 0) >= minOI);
    }

    return filtered;
  }, [optionChain, selectedExpiry, moneynessFilter, minVolume, minOI]);

  return (
    <div className="options-page">
      <div className="options-header">
        <h1>Options Chain</h1>
        <form onSubmit={handleSubmit} className="symbol-search">
          <input
            type="text"
            placeholder="Enter symbol (e.g., AAPL)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            className="symbol-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading-state">
          <p>Loading options chain...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>Error: {error}</p>
        </div>
      )}

      {optionChain && !loading && (
        <div className="options-content">
          <div className="chain-info">
            <h2>{optionChain.underlying}</h2>
            <p className="spot-price">
              Spot Price: <strong>${optionChain.spot_price.toFixed(2)}</strong>
            </p>
          </div>

          {/* Expiration Date Tabs */}
          <div className="expiration-tabs">
            {optionChain.expiration_dates.map((expiry) => (
              <button
                key={expiry}
                className={`expiry-tab ${selectedExpiry === expiry ? 'active' : ''}`}
                onClick={() => setSelectedExpiry(expiry)}
              >
                {expiry}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="moneyness">Moneyness:</label>
              <select
                id="moneyness"
                value={moneynessFilter}
                onChange={(e) => setMoneynessFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="itm">In The Money</option>
                <option value="atm">At The Money</option>
                <option value="otm">Out of The Money</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="min-volume">Min Volume:</label>
              <input
                type="number"
                id="min-volume"
                value={minVolume}
                onChange={(e) => setMinVolume(Number(e.target.value))}
                min="0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="min-oi">Min OI:</label>
              <input
                type="number"
                id="min-oi"
                value={minOI}
                onChange={(e) => setMinOI(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>

          {/* Options Chain Table */}
          <OptionsChainTable
            options={filteredOptions}
            spotPrice={optionChain.spot_price}
          />

          {filteredOptions.length === 0 && (
            <p className="no-results">No options match the selected filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
