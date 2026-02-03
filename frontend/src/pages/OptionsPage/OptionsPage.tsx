import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { OptionsChainTable } from '../../components/OptionsChainTable';
import { OptionAnalysisCard } from '../../components/OptionAnalysisCard';
import { GlassPanel } from '../../components/common/GlassPanel';
import { Skeleton } from '../../components/common/Skeleton';
import { AnimatedContainer } from '../../components/common/AnimatedContainer';
import { analyzeOption, getOptionChain } from '../../services/api';
import type { Option, OptionAnalysis, OptionChain } from '../../types';
import './OptionsPage.css';

export function OptionsPage() {
  const location = useLocation();
  const [inputValue, setInputValue] = useState('');
  const [optionChain, setOptionChain] = useState<OptionChain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [moneynessFilter, setMoneynessFilter] = useState<string>('all');
  const [minVolume, setMinVolume] = useState<number>(0);
  const [minOI, setMinOI] = useState<number>(0);

  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [analysis, setAnalysis] = useState<OptionAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const lastLoadedSymbolRef = useRef<string>('');

  const handleSymbolSearch = async (searchSymbol: string) => {
    if (!searchSymbol.trim()) return

    setLoading(true)
    setError(null)

    try {
      const upper = searchSymbol.toUpperCase()
      const chain = await getOptionChain(upper)

      setOptionChain(chain)
      setSelectedOption(null)
      setAnalysis(null)
      setAnalysisError(null)

      if (chain.expiration_dates.length > 0) {
        setSelectedExpiry(chain.expiration_dates[0])
      } else {
        setSelectedExpiry('')
      }

      lastLoadedSymbolRef.current = upper
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load options chain')
      setOptionChain(null)
    } finally {
      setLoading(false)
    }
  }

  const handleExpirySelect = async (expiry: string) => {
    const symbol = lastLoadedSymbolRef.current
    if (!symbol) return
    if (!expiry) return
    if (expiry === selectedExpiry) return

    const prevExpiry = selectedExpiry
    setSelectedExpiry(expiry)

    // Keep the page stable: only the chain/table area shows loading.
    setLoading(true)
    setError(null)
    setSelectedOption(null)
    setAnalysis(null)
    setAnalysisError(null)

    try {
      const chain = await getOptionChain(symbol, { expiry })
      setOptionChain(chain)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load options chain')
      setSelectedExpiry(prevExpiry)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const symbolParam = params.get('symbol');
    if (!symbolParam) return;

    const upper = symbolParam.toUpperCase();
    if (lastLoadedSymbolRef.current === upper) return;

    setInputValue(upper);
    void handleSymbolSearch(upper);
  }, [location.search]);

  const handleSelectionChange = async (selectedOptions: Option[]) => {
    if (!optionChain) return
    if (selectedOptions.length === 0) return

    const preferred =
      selectedOptions.find((opt) => opt.option_type === 'call') ??
      selectedOptions.find((opt) => opt.option_type === 'put') ??
      selectedOptions[0]

    setSelectedOption(preferred)
    setAnalysis(null)
    setAnalysisError(null)
    setAnalysisLoading(true)

    try {
      const res = await analyzeOption({
        symbol: preferred.symbol,
        strike: preferred.strike,
        expiry: preferred.expiry,
        option_type: preferred.option_type,
        exercise_style: preferred.exercise_style ?? 'american',
        bid: preferred.bid,
        ask: preferred.ask,
        last: preferred.last,
        volume: preferred.volume,
        open_interest: preferred.open_interest,
        implied_volatility: preferred.implied_volatility,
        spot_price: optionChain.spot_price,
        risk_free_rate: 0.05,
      })
      setAnalysis(res)
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze option')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSymbolSearch(inputValue);
  };

  // Filter options based on selected expiry and filters
  const filteredOptions = useMemo(() => {
    if (!optionChain) return [];

    let filtered = optionChain.options;

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
  }, [optionChain, moneynessFilter, minVolume, minOI]);

  const hasChain = optionChain !== null
  const showInitialSkeleton = loading && !hasChain
  const showContent = hasChain || loading

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

      {error && (
        <div className="error-state">
          <p>Error: {error}</p>
        </div>
      )}

      {showContent && (
        <AnimatedContainer className="options-content" animation="slideUp">
          <div className="options-split">
            <section className="options-left" aria-label="Options chain">
              <GlassPanel className="chain-info" variant="subtle">
                {hasChain ? (
                  <>
                    <h2>{optionChain.underlying}</h2>
                    <p className="spot-price">
                      Spot Price: <strong>${optionChain.spot_price.toFixed(2)}</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton variant="text" width="40%" height={32} style={{ marginBottom: 8 }} />
                    <Skeleton variant="text" width="20%" height={24} />
                  </>
                )}
              </GlassPanel>

              <div className="expiration-tabs">
                {hasChain ? (
                  optionChain.expiration_dates.map((expiry) => (
                    <button
                      key={expiry}
                      className={`expiry-tab ${selectedExpiry === expiry ? 'active' : ''}`}
                      onClick={() => {
                        void handleExpirySelect(expiry)
                      }}
                    >
                      {expiry}
                    </button>
                  ))
                ) : (
                  [1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="rect" width={80} height={40} style={{ borderRadius: 4 }} />
                  ))
                )}
              </div>

              <GlassPanel className="filters" variant="subtle">
                {hasChain ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="filter-group">
                      <Skeleton variant="text" width={60} style={{ marginBottom: 4 }} />
                      <Skeleton variant="rect" width={150} height={35} />
                    </div>
                    <div className="filter-group">
                      <Skeleton variant="text" width={80} style={{ marginBottom: 4 }} />
                      <Skeleton variant="rect" width={100} height={35} />
                    </div>
                    <div className="filter-group">
                      <Skeleton variant="text" width={60} style={{ marginBottom: 4 }} />
                      <Skeleton variant="rect" width={100} height={35} />
                    </div>
                  </>
                )}
              </GlassPanel>

              {optionChain && !loading ? (
                <>
                  <OptionsChainTable
                    options={filteredOptions}
                    spotPrice={optionChain.spot_price}
                    onSelectionChange={handleSelectionChange}
                  />

                  {filteredOptions.length === 0 && (
                    <p className="no-results">No options match the selected filters.</p>
                  )}
                </>
              ) : (
                <GlassPanel
                  className="options-chain-table-skeleton"
                  style={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Skeleton variant="rect" width="95%" height="90%" />
                </GlassPanel>
              )}
            </section>

            <aside className="options-right" aria-label="Option analysis">
              <GlassPanel className="analysis-panel">
                {showInitialSkeleton ? (
                  <>
                    <div className="analysis-panel-header">
                      <Skeleton variant="text" width="50%" height={24} />
                    </div>
                    <Skeleton variant="rect" width="100%" height={200} />
                  </>
                ) : (
                  <>
                    <div className="analysis-panel-header">
                      <h3>Analysis</h3>
                      {selectedOption && (
                        <div className="analysis-selected" aria-label="Selected option">
                          {selectedOption.symbol} ${selectedOption.strike.toFixed(2)} {selectedOption.option_type}
                        </div>
                      )}
                    </div>

                    {analysisLoading && (
                      <div className="analysis-loading-skeleton">
                        <Skeleton variant="rect" width="100%" height={300} style={{ borderRadius: 8 }} />
                      </div>
                    )}
                    {analysisError && <div className="analysis-error">Error: {analysisError}</div>}
                    {!analysisLoading && !analysisError && !analysis && (
                      <div className="analysis-empty">Select a strike to see Greeks and valuation.</div>
                    )}
                    {analysis && <OptionAnalysisCard analysis={analysis} />}
                  </>
                )}
              </GlassPanel>
            </aside>
          </div>
        </AnimatedContainer>
      )}
    </div>
  );
}
