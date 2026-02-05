"""Tests for data provider interface and yfinance implementation."""
import sys
import os
from pathlib import Path
from datetime import date
from unittest.mock import Mock, patch

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import pytest


def test_data_provider_protocol():
    """Test that DataProvider protocol is properly defined."""
    from app.services.providers.base import DataProvider
    
    # Protocol should define required methods
    assert hasattr(DataProvider, 'get_option_chain')
    assert hasattr(DataProvider, 'get_spot_price')
    assert hasattr(DataProvider, 'get_historical_prices')


def test_get_data_provider_yfinance(monkeypatch):
    """Test that yfinance provider is correctly wired."""
    from app.api.options import get_data_provider
    from app.core.config import get_settings
    from app.services.cache.cached_provider import CachedDataProvider
    from app.services.providers.yfinance_provider import YFinanceProvider
    
    monkeypatch.setenv("DATA_PROVIDER", "yfinance")
    get_settings.cache_clear()
    
    provider = get_data_provider()
    assert isinstance(provider, CachedDataProvider)
    assert isinstance(provider.provider, YFinanceProvider)


def test_get_data_provider_invalid(monkeypatch):
    """Test that invalid provider raises ValueError."""
    from app.api.options import get_data_provider
    from app.core.config import get_settings
    
    monkeypatch.setenv("DATA_PROVIDER", "invalid_provider")
    get_settings.cache_clear()
    
    with pytest.raises(ValueError, match="Unsupported DATA_PROVIDER"):
        get_data_provider()


def test_yfinance_provider_instantiation():
    """Test that YFinanceProvider can be instantiated."""
    from app.services.providers.yfinance_provider import YFinanceProvider
    
    provider = YFinanceProvider()
    assert provider is not None


@patch('yfinance.Ticker')
def test_yfinance_get_spot_price(mock_ticker):
    """Test getting spot price from yfinance."""
    from app.services.providers.yfinance_provider import YFinanceProvider
    
    # Mock yfinance response
    mock_ticker_instance = Mock()
    mock_ticker_instance.info = {'currentPrice': 150.25}
    mock_ticker.return_value = mock_ticker_instance
    
    provider = YFinanceProvider()
    price = provider.get_spot_price("AAPL")
    
    assert price == 150.25
    mock_ticker.assert_called_once_with("AAPL")


@patch('yfinance.Ticker')
def test_yfinance_get_historical_prices(mock_ticker):
    """Test getting historical prices from yfinance."""
    from app.services.providers.yfinance_provider import YFinanceProvider
    import pandas as pd
    
    # Mock yfinance historical data
    mock_ticker_instance = Mock()
    mock_ticker_instance.history.return_value = pd.DataFrame({
        'Close': [148.0, 149.0, 150.0, 151.0, 150.5]
    })
    mock_ticker.return_value = mock_ticker_instance
    
    provider = YFinanceProvider()
    prices = provider.get_historical_prices("AAPL", days=5)
    
    assert len(prices) == 5
    assert prices[-1] == 150.5
    mock_ticker_instance.history.assert_called_once()


@patch('yfinance.Ticker')
def test_yfinance_get_option_chain(mock_ticker):
    """Test getting option chain from yfinance."""
    from app.services.providers.yfinance_provider import YFinanceProvider
    import pandas as pd
    
    # Mock yfinance option chain response
    mock_ticker_instance = Mock()
    mock_ticker_instance.options = ['2024-12-20', '2025-01-17']
    
    # Mock option chain data
    mock_calls = pd.DataFrame({
        'strike': [145.0, 150.0, 155.0],
        'lastPrice': [7.50, 5.20, 3.10],
        'bid': [7.40, 5.10, 3.00],
        'ask': [7.60, 5.30, 3.20],
        'volume': [1000, 2000, 500],
        'openInterest': [5000, 10000, 3000],
        'impliedVolatility': [0.25, 0.23, 0.22]
    })
    
    mock_puts = pd.DataFrame({
        'strike': [145.0, 150.0, 155.0],
        'lastPrice': [2.10, 4.90, 7.20],
        'bid': [2.00, 4.80, 7.10],
        'ask': [2.20, 5.00, 7.30],
        'volume': [800, 1500, 600],
        'openInterest': [4000, 8000, 2500],
        'impliedVolatility': [0.24, 0.23, 0.25]
    })
    
    mock_chain = Mock()
    mock_chain.calls = mock_calls
    mock_chain.puts = mock_puts
    
    mock_ticker_instance.option_chain.return_value = mock_chain
    mock_ticker_instance.info = {'currentPrice': 148.50}
    mock_ticker.return_value = mock_ticker_instance
    
    provider = YFinanceProvider()
    chain = provider.get_option_chain("AAPL")
    
    assert chain.underlying == "AAPL"
    assert chain.spot_price == 148.50
    assert len(chain.options) == 6  # 3 calls + 3 puts
    assert len(chain.expiration_dates) == 2
    
    # Verify first call option
    call_150 = [opt for opt in chain.options if opt.strike == 150.0 and opt.option_type == "call"][0]
    assert call_150.last == 5.20
    assert call_150.bid == 5.10
    assert call_150.implied_volatility == 0.23


@patch('yfinance.Ticker')
def test_yfinance_handles_missing_data(mock_ticker):
    """Test that provider handles missing data gracefully."""
    from app.services.providers.yfinance_provider import YFinanceProvider
    
    # Mock ticker with missing currentPrice
    mock_ticker_instance = Mock()
    mock_ticker_instance.info = {}
    mock_ticker.return_value = mock_ticker_instance
    
    provider = YFinanceProvider()
    
    # Should raise an appropriate error or return None
    with pytest.raises((KeyError, ValueError)):
        provider.get_spot_price("INVALID")


@patch('yfinance.Ticker')
def test_provider_integration_mocked(mock_ticker, monkeypatch):
    """Integration test for the provider stack with mocked network."""
    from app.api.options import get_data_provider
    from app.core.config import get_settings
    from app.services.cache.cached_provider import CachedDataProvider
    
    # Ensure yfinance is selected
    monkeypatch.setenv("DATA_PROVIDER", "yfinance")
    get_settings.cache_clear()
    
    # Mock yfinance response
    mock_ticker_instance = Mock()
    mock_ticker_instance.info = {'currentPrice': 150.0}
    mock_ticker.return_value = mock_ticker_instance
    
    # Get provider via wiring
    provider = get_data_provider()
    assert isinstance(provider, CachedDataProvider)

    # Ensure we hit the underlying provider (not a persisted SQLite cache).
    # CachedDataProvider stores spot prices in backend/data/cache.db with a short TTL,
    # which may be populated by other tests.
    provider.cache.invalidate(provider._make_key("spot", "AAPL"))
    
    # Test execution through the stack (API -> Cache -> Provider -> Mock)
    price = provider.get_spot_price("AAPL")
    
    assert price == 150.0
    mock_ticker.assert_called_with("AAPL")


def test_yfinance_integration_real_data():
    """Integration test with real yfinance data (slow, skipped by default)."""
    if not os.environ.get("RUN_LIVE_TESTS"):
        pytest.skip("Skipping live yfinance test - set RUN_LIVE_TESTS=1 to enable")
    
    from app.services.providers.yfinance_provider import YFinanceProvider
    
    provider = YFinanceProvider()
    
    # Test with real data
    price = provider.get_spot_price("AAPL")
    assert price > 0
    
    chain = provider.get_option_chain("AAPL")
    assert chain.underlying == "AAPL"
    assert len(chain.options) > 0
