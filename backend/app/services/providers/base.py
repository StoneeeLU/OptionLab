"""Data provider protocol - abstract interface for market data sources."""
from typing import Protocol, List
from datetime import date
from app.models.chain import OptionChain


class DataProvider(Protocol):
    """Protocol defining interface for options data providers."""
    
    def get_option_chain(self, symbol: str, expiry: str | None = None) -> OptionChain:
        """
        Fetch options chain for a given symbol.
        
        Args:
            symbol: Underlying symbol (e.g., "AAPL")
            expiry: Optional expiration date filter (YYYY-MM-DD)
            
        Returns:
            OptionChain with all available options
        """
        ...
    
    def get_spot_price(self, symbol: str) -> float:
        """
        Get current spot price for underlying.
        
        Args:
            symbol: Underlying symbol
            
        Returns:
            Current price
        """
        ...
    
    def get_historical_prices(self, symbol: str, days: int = 30) -> List[float]:
        """
        Fetch historical closing prices.
        
        Args:
            symbol: Underlying symbol
            days: Number of days of history
            
        Returns:
            List of historical closing prices
        """
        ...
