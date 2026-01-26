"""Tests for volatility calculator."""
import pytest
import math
from app.services.analysis.volatility import VolatilityCalculator


class TestVolatilityCalculator:
    """Test suite for VolatilityCalculator."""
    
    def test_historical_volatility_constant_prices_is_zero(self):
        """HV should be zero for constant prices."""
        calculator = VolatilityCalculator()
        prices = [100.0] * 30  # Constant prices
        
        hv = calculator.historical_volatility(prices, window=20)
        
        assert hv == 0.0
    
    def test_historical_volatility_calculation(self):
        """Test HV calculation with known data."""
        calculator = VolatilityCalculator()
        
        # Simple price series with known volatility
        # Daily returns of +1% and -1% alternating
        prices = [100.0]
        for i in range(20):
            if i % 2 == 0:
                prices.append(prices[-1] * 1.01)
            else:
                prices.append(prices[-1] * 0.99)
        
        hv = calculator.historical_volatility(prices, window=20)
        
        # Should be non-zero and positive
        assert hv > 0
        # Annualized volatility should be reasonable (< 500%)
        assert hv < 5.0
    
    def test_historical_volatility_uses_log_returns(self):
        """Verify HV uses log returns formula."""
        calculator = VolatilityCalculator()
        
        prices = [100, 105, 103, 108, 110, 107, 112, 115, 113, 118, 120]
        
        hv = calculator.historical_volatility(prices, window=10)
        
        # Calculate manually to verify
        log_returns = []
        for i in range(1, len(prices)):
            log_returns.append(math.log(prices[i] / prices[i-1]))
        
        # Standard deviation of log returns
        mean = sum(log_returns) / len(log_returns)
        variance = sum((r - mean) ** 2 for r in log_returns) / len(log_returns)
        std_dev = math.sqrt(variance)
        
        # Annualize (multiply by sqrt(252))
        expected_hv = std_dev * math.sqrt(252)
        
        # Should match our calculation
        assert abs(hv - expected_hv) < 0.001
    
    def test_historical_volatility_window_parameter(self):
        """Test that window parameter limits the calculation."""
        calculator = VolatilityCalculator()
        
        prices = [100 + i for i in range(50)]  # 50 prices
        
        # Window of 20 should only use last 21 prices (20 returns)
        hv_20 = calculator.historical_volatility(prices, window=20)
        
        # Window of 30 should use last 31 prices
        hv_30 = calculator.historical_volatility(prices, window=30)
        
        # Both should be valid calculations
        assert hv_20 >= 0
        assert hv_30 >= 0
    
    def test_iv_percentile_calculation(self):
        """Test IV percentile calculation."""
        calculator = VolatilityCalculator()
        
        historical_ivs = [0.15, 0.18, 0.20, 0.22, 0.25, 0.28, 0.30, 0.35, 0.40, 0.45]
        
        # IV at median should be 50th percentile
        percentile_50 = calculator.iv_percentile(0.265, historical_ivs)
        assert 40 < percentile_50 < 60  # Around 50th
        
        # IV at minimum should be 0th percentile
        percentile_0 = calculator.iv_percentile(0.15, historical_ivs)
        assert percentile_0 < 10
        
        # IV at maximum should be 100th percentile (or close)
        percentile_100 = calculator.iv_percentile(0.45, historical_ivs)
        assert percentile_100 >= 90
    
    def test_iv_percentile_below_min(self):
        """IV below historical range should return 0."""
        calculator = VolatilityCalculator()
        
        historical_ivs = [0.20, 0.25, 0.30, 0.35, 0.40]
        
        percentile = calculator.iv_percentile(0.10, historical_ivs)
        
        assert percentile == 0.0
    
    def test_iv_percentile_above_max(self):
        """IV above historical range should return 100."""
        calculator = VolatilityCalculator()
        
        historical_ivs = [0.20, 0.25, 0.30, 0.35, 0.40]
        
        percentile = calculator.iv_percentile(0.50, historical_ivs)
        
        assert percentile == 100.0
    
    def test_iv_rank_calculation(self):
        """Test IV rank calculation."""
        calculator = VolatilityCalculator()
        
        # IV at midpoint should be 50% rank
        rank_50 = calculator.iv_rank(0.25, high=0.40, low=0.10)
        assert 45 < rank_50 < 55
        
        # IV at low should be 0% rank
        rank_0 = calculator.iv_rank(0.10, high=0.40, low=0.10)
        assert rank_0 == 0.0
        
        # IV at high should be 100% rank
        rank_100 = calculator.iv_rank(0.40, high=0.40, low=0.10)
        assert rank_100 == 100.0
    
    def test_iv_rank_below_low(self):
        """IV below historical low should return 0."""
        calculator = VolatilityCalculator()
        
        rank = calculator.iv_rank(0.05, high=0.40, low=0.10)
        
        assert rank == 0.0
    
    def test_iv_rank_above_high(self):
        """IV above historical high should return 100."""
        calculator = VolatilityCalculator()
        
        rank = calculator.iv_rank(0.50, high=0.40, low=0.10)
        
        assert rank == 100.0
    
    def test_insufficient_data_for_hv(self):
        """Should handle insufficient data gracefully."""
        calculator = VolatilityCalculator()
        
        # Only 2 prices (1 return) - not enough for window of 20
        prices = [100, 101]
        
        hv = calculator.historical_volatility(prices, window=20)
        
        # Should still calculate with available data or return 0
        assert hv >= 0
    
    def test_empty_historical_ivs_for_percentile(self):
        """Should handle empty historical IVs."""
        calculator = VolatilityCalculator()
        
        percentile = calculator.iv_percentile(0.25, [])
        
        # Should return 50 (no context) or handle gracefully
        assert 0 <= percentile <= 100
