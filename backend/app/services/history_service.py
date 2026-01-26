"""Option history data service."""
from typing import List, Optional
from datetime import datetime, timedelta
from app.services.providers.base import DataProvider
from app.models.option import Option
import yfinance as yf


class OptionHistoryService:
    """Service for fetching historical option data."""
    
    @staticmethod
    def get_option_history(
        symbol: str,
        strike: float,
        expiry: str,
        option_type: str,
        days: int = 30
    ) -> dict:
        """
        Get historical data for a specific option.
        
        Args:
            symbol: Underlying symbol
            strike: Strike price
            expiry: Expiration date
            option_type: 'call' or 'put'
            days: Number of days of history to fetch
            
        Returns:
            Dictionary with dates, IVs, prices, and underlying prices
        """
        try:
            ticker = yf.Ticker(symbol)
            
            # Get historical stock prices
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            hist = ticker.history(start=start_date, end=end_date)
            
            # Build response data structure
            # Note: yfinance doesn't provide historical IV/option prices easily
            # This is a simplified implementation returning stock prices
            # In production, you'd use a premium data provider
            
            dates = hist.index.strftime('%Y-%m-%d').tolist()
            stock_prices = hist['Close'].tolist()
            
            # Calculate simple historical volatility over rolling windows
            returns = hist['Close'].pct_change()
            rolling_hv = returns.rolling(window=20).std() * (252 ** 0.5)
            hv_values = rolling_hv.fillna(0).tolist()
            
            return {
                "symbol": symbol,
                "strike": strike,
                "expiry": expiry,
                "option_type": option_type,
                "days": days,
                "history": {
                    "dates": dates,
                    "stock_prices": [float(p) for p in stock_prices],
                    "historical_volatility": [float(hv) for hv in hv_values],
                    # Note: Actual option prices and IV would come from historical options data
                    # which requires premium data provider
                    "option_prices": [None] * len(dates),  # Placeholder
                    "implied_volatility": [None] * len(dates)  # Placeholder
                }
            }
            
        except Exception as e:
            raise ValueError(f"Failed to fetch option history: {str(e)}")
    
    @staticmethod
    def get_underlying_history(symbol: str, days: int = 30) -> dict:
        """
        Get historical price and volatility data for underlying.
        
        Args:
            symbol: Stock symbol
            days: Number of days of history
            
        Returns:
            Dictionary with dates, prices, and HV
        """
        try:
            ticker = yf.Ticker(symbol)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            hist = ticker.history(start=start_date, end=end_date)
            
            dates = hist.index.strftime('%Y-%m-%d').tolist()
            prices = hist['Close'].tolist()
            volumes = hist['Volume'].tolist()
            
            # Calculate rolling HV
            returns = hist['Close'].pct_change()
            rolling_hv = returns.rolling(window=20).std() * (252 ** 0.5)
            hv_values = rolling_hv.fillna(0).tolist()
            
            return {
                "symbol": symbol,
                "days": days,
                "history": {
                    "dates": dates,
                    "prices": [float(p) for p in prices],
                    "volumes": [int(v) for v in volumes],
                    "historical_volatility": [float(hv) for hv in hv_values]
                }
            }
            
        except Exception as e:
            raise ValueError(f"Failed to fetch underlying history: {str(e)}")
