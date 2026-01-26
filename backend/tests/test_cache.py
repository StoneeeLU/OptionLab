"""Tests for SQLite caching layer."""
import sys
from pathlib import Path
from time import sleep
import tempfile
import os

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import pytest


@pytest.fixture
def temp_cache_db():
    """Create a temporary cache database for testing."""
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
        db_path = f.name
    yield db_path
    # Cleanup
    if os.path.exists(db_path):
        os.unlink(db_path)


def test_cache_service_instantiation(temp_cache_db):
    """Test that CacheService can be instantiated."""
    from app.services.cache.cache_service import CacheService
    
    cache = CacheService(db_path=temp_cache_db)
    assert cache is not None


def test_cache_set_and_get(temp_cache_db):
    """Test basic cache set and get operations."""
    from app.services.cache.cache_service import CacheService
    
    cache = CacheService(db_path=temp_cache_db)
    
    # Set a value
    cache.set("test_key", b"test_value", ttl_seconds=60)
    
    # Get the value back
    result = cache.get("test_key")
    assert result == b"test_value"


def test_cache_get_nonexistent_key(temp_cache_db):
    """Test that getting a nonexistent key returns None."""
    from app.services.cache.cache_service import CacheService
    
    cache = CacheService(db_path=temp_cache_db)
    result = cache.get("nonexistent_key")
    
    assert result is None


def test_cache_ttl_expiration(temp_cache_db):
    """Test that cache entries expire after TTL."""
    from app.services.cache.cache_service import CacheService
    
    cache = CacheService(db_path=temp_cache_db)
    
    # Set with 1 second TTL
    cache.set("expiring_key", b"will_expire", ttl_seconds=1)
    
    # Should be available immediately
    assert cache.get("expiring_key") == b"will_expire"
    
    # Wait for expiration
    sleep(1.5)
    
    # Should be expired now
    assert cache.get("expiring_key") is None


def test_cache_invalidate(temp_cache_db):
    """Test manual cache invalidation."""
    from app.services.cache.cache_service import CacheService
    
    cache = CacheService(db_path=temp_cache_db)
    
    cache.set("key_to_invalidate", b"data", ttl_seconds=60)
    assert cache.get("key_to_invalidate") == b"data"
    
    cache.invalidate("key_to_invalidate")
    assert cache.get("key_to_invalidate") is None


def test_cache_overwrites_existing_key(temp_cache_db):
    """Test that setting an existing key updates the value."""
    from app.services.cache.cache_service import CacheService
    
    cache = CacheService(db_path=temp_cache_db)
    
    cache.set("update_key", b"old_value", ttl_seconds=60)
    cache.set("update_key", b"new_value", ttl_seconds=60)
    
    assert cache.get("update_key") == b"new_value"


def test_cached_data_provider_reduces_calls(temp_cache_db):
    """Test that CachedDataProvider caches provider calls."""
    from app.services.cache.cached_provider import CachedDataProvider
    from unittest.mock import Mock
    
    # Create mock provider
    mock_provider = Mock()
    mock_provider.get_spot_price.return_value = 150.25
    
    cached_provider = CachedDataProvider(
        provider=mock_provider,
        cache_db_path=temp_cache_db
    )
    
    # First call - should hit provider
    price1 = cached_provider.get_spot_price("AAPL")
    assert price1 == 150.25
    assert mock_provider.get_spot_price.call_count == 1
    
    # Second call - should use cache
    price2 = cached_provider.get_spot_price("AAPL")
    assert price2 == 150.25
    assert mock_provider.get_spot_price.call_count == 1  # No additional call


def test_cached_provider_option_chain_caching(temp_cache_db):
    """Test that option chain data is cached."""
    from app.services.cache.cached_provider import CachedDataProvider
    from app.models.chain import OptionChain
    from unittest.mock import Mock
    
    # Create mock chain
    mock_chain = OptionChain(
        underlying="AAPL",
        spot_price=150.0,
        options=[],
        expiration_dates=[]
    )
    
    mock_provider = Mock()
    mock_provider.get_option_chain.return_value = mock_chain
    
    cached_provider = CachedDataProvider(
        provider=mock_provider,
        cache_db_path=temp_cache_db,
        option_chain_ttl=300
    )
    
    # First call
    chain1 = cached_provider.get_option_chain("AAPL")
    assert chain1.underlying == "AAPL"
    assert mock_provider.get_option_chain.call_count == 1
    
    # Second call - should be cached
    chain2 = cached_provider.get_option_chain("AAPL")
    assert chain2.underlying == "AAPL"
    assert mock_provider.get_option_chain.call_count == 1


def test_cached_provider_historical_prices_caching(temp_cache_db):
    """Test that historical prices are cached with longer TTL."""
    from app.services.cache.cached_provider import CachedDataProvider
    from unittest.mock import Mock
    
    mock_provider = Mock()
    mock_provider.get_historical_prices.return_value = [148.0, 149.0, 150.0]
    
    cached_provider = CachedDataProvider(
        provider=mock_provider,
        cache_db_path=temp_cache_db,
        historical_ttl=86400  # 1 day
    )
    
    # First call
    prices1 = cached_provider.get_historical_prices("AAPL", days=30)
    assert len(prices1) == 3
    assert mock_provider.get_historical_prices.call_count == 1
    
    # Second call - cached
    prices2 = cached_provider.get_historical_prices("AAPL", days=30)
    assert len(prices2) == 3
    assert mock_provider.get_historical_prices.call_count == 1
