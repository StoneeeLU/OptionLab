"""Volatility calculation utilities."""
import math
from typing import List


class VolatilityCalculator:
    """Calculate historical volatility, IV percentile, and IV rank.
    
    Formulas:
    - HV: Standard deviation of log returns, annualized (× sqrt(252))
    - IV Percentile: Percentage of historical IVs below current IV
    - IV Rank: (Current - Low) / (High - Low) × 100
    """
    
    def historical_volatility(
        self,
        prices: List[float],
        window: int = 20
    ) -> float:
        """
        Calculate historical volatility using log returns.
        
        Args:
            prices: List of historical prices
            window: Number of periods to calculate over (default 20 days)
            
        Returns:
            Annualized historical volatility
        """
        if len(prices) < 2:
            return 0.0
        
        # Use only the last window+1 prices (to get window returns)
        if len(prices) > window + 1:
            prices = prices[-(window + 1):]
        
        # Calculate log returns
        log_returns = []
        for i in range(1, len(prices)):
            if prices[i] > 0 and prices[i-1] > 0:
                log_returns.append(math.log(prices[i] / prices[i-1]))
        
        if len(log_returns) < 2:
            return 0.0
        
        # Calculate standard deviation
        mean = sum(log_returns) / len(log_returns)
        variance = sum((r - mean) ** 2 for r in log_returns) / len(log_returns)
        std_dev = math.sqrt(variance)
        
        # Annualize: multiply by sqrt(252 trading days)
        annualized_vol = std_dev * math.sqrt(252)
        
        return annualized_vol
    
    def iv_percentile(
        self,
        current_iv: float,
        historical_ivs: List[float]
    ) -> float:
        """
        Calculate IV percentile.
        
        Returns percentage of historical IVs that are below current IV.
        
        Args:
            current_iv: Current implied volatility
            historical_ivs: List of historical IV values
            
        Returns:
            Percentile (0-100)
        """
        if not historical_ivs:
            return 50.0  # No context, return neutral
        
        # Count how many historical IVs are below current
        below_count = sum(1 for iv in historical_ivs if iv < current_iv)
        
        # Calculate percentile
        percentile = (below_count / len(historical_ivs)) * 100
        
        return percentile
    
    def iv_rank(
        self,
        current_iv: float,
        high: float,
        low: float
    ) -> float:
        """
        Calculate IV rank.
        
        Shows where current IV sits in the historical range.
        
        Args:
            current_iv: Current implied volatility
            high: Highest IV in period
            low: Lowest IV in period
            
        Returns:
            IV rank (0-100)
        """
        if high == low:
            return 50.0  # No range, return neutral
        
        # Clamp current_iv to range
        clamped_iv = max(low, min(high, current_iv))
        
        # Calculate rank
        rank = ((clamped_iv - low) / (high - low)) * 100
        
        return rank
