"""Cached data provider wrapper."""
import json
import hashlib
from typing import List
from datetime import date
from app.models.chain import OptionChain
from app.services.cache.cache_service import CacheService


class CachedDataProvider:
    """Wrapper that caches data provider calls."""
    
    def __init__(
        self,
        provider,
        cache_db_path: str = "backend/data/cache.db",
        option_chain_ttl: int = 10,   # 10 seconds
        spot_price_ttl: int = 10,     # 10 seconds
        historical_ttl: int = 86400    # 1 day
    ):
        """
        Initialize cached provider.
        
        Args:
            provider: Underlying data provider
            cache_db_path: Path to cache database
            option_chain_ttl: TTL for option chain data (seconds)
            spot_price_ttl: TTL for spot prices (seconds)
            historical_ttl: TTL for historical data (seconds)
        """
        self.provider = provider
        self.cache = CacheService(db_path=cache_db_path)
        self.option_chain_ttl = option_chain_ttl
        self.spot_price_ttl = spot_price_ttl
        self.historical_ttl = historical_ttl
    
    def _make_key(self, prefix: str, *args) -> str:
        """Generate cache key from prefix and arguments."""
        key_data = f"{prefix}:{':'.join(str(arg) for arg in args)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def get_spot_price(self, symbol: str) -> float:
        """Get spot price with caching."""
        cache_key = self._make_key("spot", symbol)
        
        # Try cache first
        cached = self.cache.get(cache_key)
        if cached is not None:
            return float(cached.decode())
        
        # Fetch from provider
        price = self.provider.get_spot_price(symbol)
        
        # Cache result
        self.cache.set(cache_key, str(price).encode(), self.spot_price_ttl)
        
        return price
    
    def get_historical_prices(self, symbol: str, days: int = 30) -> List[float]:
        """Get historical prices with caching."""
        cache_key = self._make_key("hist", symbol, days)
        
        # Try cache
        cached = self.cache.get(cache_key)
        if cached is not None:
            return json.loads(cached.decode())
        
        # Fetch from provider
        prices = self.provider.get_historical_prices(symbol, days)
        
        # Cache result
        self.cache.set(cache_key, json.dumps(prices).encode(), self.historical_ttl)
        
        return prices
    
    def get_option_chain(self, symbol: str, expiry: str | None = None) -> OptionChain:
        """Get option chain with caching."""
        cache_key = self._make_key("chain", symbol, expiry or "all")
        
        # Try cache
        cached = self.cache.get(cache_key)
        if cached is not None:
            data = json.loads(cached.decode())
            return OptionChain.model_validate(data)
        
        # Fetch from provider
        chain = self.provider.get_option_chain(symbol, expiry)
        
        # Cache result
        self.cache.set(
            cache_key,
            chain.model_dump_json().encode(),
            self.option_chain_ttl
        )
        
        return chain
