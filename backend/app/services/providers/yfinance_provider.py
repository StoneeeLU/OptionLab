"""YFinance data provider implementation."""
from datetime import date, datetime, timedelta
from typing import List
import yfinance as yf
from app.models.chain import OptionChain
from app.models.option import Option


class YFinanceProvider:
    """Data provider using yfinance library."""
    
    def get_spot_price(self, symbol: str) -> float:
        """Get current spot price from yfinance."""
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Try multiple fields as yfinance structure varies
        price = info.get('currentPrice') or info.get('regularMarketPrice')
        
        if price is None:
            raise ValueError(f"Could not fetch spot price for {symbol}")
        
        return float(price)
    
    def get_historical_prices(self, symbol: str, days: int = 30) -> List[float]:
        """Fetch historical closing prices."""
        ticker = yf.Ticker(symbol)
        
        # Fetch history
        hist = ticker.history(period=f"{days}d")
        
        if hist.empty:
            raise ValueError(f"No historical data for {symbol}")
        
        return hist['Close'].tolist()
    
    def get_option_chain(self, symbol: str, expiry: str | None = None) -> OptionChain:
        """
        Fetch options chain from yfinance.
        
        Args:
            symbol: Underlying symbol
            expiry: Optional expiration date (YYYY-MM-DD format)
        """
        ticker = yf.Ticker(symbol)
        
        # Get spot price
        spot_price = self.get_spot_price(symbol)
        
        # Get available expiration dates
        expiration_dates = [datetime.strptime(exp, "%Y-%m-%d").date() for exp in ticker.options]
        
        if not expiration_dates:
            raise ValueError(f"No options available for {symbol}")
        
        # Use provided expiry or first available
        target_expiry_str = expiry or ticker.options[0]
        target_expiry = datetime.strptime(target_expiry_str, "%Y-%m-%d").date()
        
        # Fetch option chain for target expiry
        chain_data = ticker.option_chain(target_expiry_str)
        
        options = []
        
        # Process calls
        for _, row in chain_data.calls.iterrows():
            options.append(Option(
                symbol=symbol,
                strike=float(row['strike']),
                expiry=target_expiry,
                option_type="call",
                bid=float(row.get('bid', 0)) if row.get('bid') is not None else None,
                ask=float(row.get('ask', 0)) if row.get('ask') is not None else None,
                last=float(row.get('lastPrice', 0)) if row.get('lastPrice') is not None else None,
                volume=int(row.get('volume', 0)) if row.get('volume') is not None else None,
                open_interest=int(row.get('openInterest', 0)) if row.get('openInterest') is not None else None,
                implied_volatility=float(row.get('impliedVolatility', 0)) if row.get('impliedVolatility') is not None else None,
                exercise_style="american"  # US equity options are American
            ))
        
        # Process puts
        for _, row in chain_data.puts.iterrows():
            options.append(Option(
                symbol=symbol,
                strike=float(row['strike']),
                expiry=target_expiry,
                option_type="put",
                bid=float(row.get('bid', 0)) if row.get('bid') is not None else None,
                ask=float(row.get('ask', 0)) if row.get('ask') is not None else None,
                last=float(row.get('lastPrice', 0)) if row.get('lastPrice') is not None else None,
                volume=int(row.get('volume', 0)) if row.get('volume') is not None else None,
                open_interest=int(row.get('openInterest', 0)) if row.get('openInterest') is not None else None,
                implied_volatility=float(row.get('impliedVolatility', 0)) if row.get('impliedVolatility') is not None else None,
                exercise_style="american"
            ))
        
        return OptionChain(
            underlying=symbol,
            spot_price=spot_price,
            options=options,
            expiration_dates=expiration_dates
        )
