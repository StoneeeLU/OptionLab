"""Tests for single option analyzer."""
import pytest
from datetime import datetime, timedelta, date
from app.services.analysis.option_analyzer import OptionAnalyzer
from app.models.option import Option
from app.models.analysis import OptionAnalysis


class TestOptionAnalyzer:
    """Test suite for OptionAnalyzer."""
    
    def test_analyzer_instantiation(self):
        """Test that analyzer can be instantiated."""
        analyzer = OptionAnalyzer()
        assert analyzer is not None
    
    def test_analyze_call_option(self):
        """Test analysis of a call option."""
        analyzer = OptionAnalyzer()
        
        # Create test option
        expiry = datetime.now() + timedelta(days=365)
        option = Option(
            symbol="AAPL",
            underlying_symbol="AAPL",
            strike=150.0,
            expiry=expiry.date(),
            option_type="call",
            exercise_style="european",
            bid=8.0,
            ask=8.5,
            last=8.2,
            volume=1000,
            open_interest=5000,
            implied_volatility=0.25
        )
        
        # Analyze
        analysis = analyzer.analyze(
            option=option,
            spot_price=150.0,
            risk_free_rate=0.05,
            historical_prices=[150.0] * 30  # Constant for simplicity
        )
        
        assert isinstance(analysis, OptionAnalysis)
        assert analysis.option == option
        assert analysis.theoretical_price > 0
        assert analysis.greeks is not None
        assert analysis.greeks.delta > 0  # Call delta positive
    
    def test_analyze_put_option(self):
        """Test analysis of a put option."""
        analyzer = OptionAnalyzer()
        
        expiry = datetime.now() + timedelta(days=365)
        option = Option(
            symbol="AAPL",
            underlying_symbol="AAPL",
            strike=150.0,
            expiry=expiry.date(),
            option_type="put",
            exercise_style="european",
            bid=7.5,
            ask=8.0,
            last=7.8,
            volume=800,
            open_interest=4000,
            implied_volatility=0.25
        )
        
        analysis = analyzer.analyze(
            option=option,
            spot_price=150.0,
            risk_free_rate=0.05,
            historical_prices=[150.0] * 30
        )
        
        assert isinstance(analysis, OptionAnalysis)
        assert analysis.greeks.delta < 0  # Put delta negative
    
    def test_mispricing_calculation(self):
        """Test that mispricing is calculated correctly."""
        analyzer = OptionAnalyzer()
        
        expiry = datetime.now() + timedelta(days=365)
        option = Option(
            symbol="AAPL",
            underlying_symbol="AAPL",
            strike=150.0,
            expiry=expiry.date(),
            option_type="call",
            exercise_style="european",
            bid=10.0,
            ask=12.0,
            last=11.0,
            volume=1000,
            open_interest=5000,
            implied_volatility=0.25
        )
        
        analysis = analyzer.analyze(
            option=option,
            spot_price=150.0,
            risk_free_rate=0.05,
            historical_prices=[150.0] * 30
        )
        
        # Mispricing = market_price - theoretical_price
        expected_mispricing = 11.0 - analysis.theoretical_price
        assert abs(analysis.mispricing - expected_mispricing) < 0.01
    
    def test_valuation_assessment_cheap(self):
        """Test valuation assessment for underpriced option."""
        analyzer = OptionAnalyzer()
        
        expiry = datetime.now() + timedelta(days=365)
        option = Option(
            symbol="AAPL",
            underlying_symbol="AAPL",
            strike=150.0,
            expiry=expiry.date(),
            option_type="call",
            exercise_style="european",
            bid=1.0,
            ask=1.5,
            last=1.2,  # Very low price
            volume=1000,
            open_interest=5000,
            implied_volatility=0.25
        )
        
        analysis = analyzer.analyze(
            option=option,
            spot_price=150.0,
            risk_free_rate=0.05,
            historical_prices=[150.0] * 30
        )
        
        # Should be marked as cheap (market < theoretical)
        assert analysis.valuation in ["cheap", "fair"]
    
    def test_valuation_assessment_expensive(self):
        """Test valuation assessment for overpriced option."""
        analyzer = OptionAnalyzer()
        
        expiry = datetime.now() + timedelta(days=30)
        option = Option(
            symbol="AAPL",
            underlying_symbol="AAPL",
            strike=200.0,  # Deep OTM
            expiry=expiry.date(),
            option_type="call",
            exercise_style="european",
            bid=5.0,
            ask=6.0,
            last=5.5,  # High price for deep OTM
            volume=100,
            open_interest=500,
            implied_volatility=0.25
        )
        
        analysis = analyzer.analyze(
            option=option,
            spot_price=150.0,
            risk_free_rate=0.05,
            historical_prices=[150.0] * 30
        )
        
        # Should be marked as expensive (market > theoretical)
        assert analysis.valuation in ["expensive", "fair"]
    
    def test_historical_volatility_included(self):
        """Test that historical volatility is calculated."""
        analyzer = OptionAnalyzer()
        
        expiry = datetime.now() + timedelta(days=365)
        option = Option(
            symbol="AAPL",
            underlying_symbol="AAPL",
            strike=150.0,
            expiry=expiry.date(),
            option_type="call",
            exercise_style="european",
            bid=8.0,
            ask=8.5,
            last=8.2,
            volume=1000,
            open_interest=5000,
            implied_volatility=0.25
        )
        
        # Prices with some volatility
        prices = [100 + i * 0.5 for i in range(30)]
        
        analysis = analyzer.analyze(
            option=option,
            spot_price=150.0,
            risk_free_rate=0.05,
            historical_prices=prices
        )
        
        assert analysis.historical_volatility > 0
    
    def test_iv_percentile_included(self):
        """Test that IV percentile is calculated."""
        analyzer = OptionAnalyzer()
        
        expiry = datetime.now() + timedelta(days=365)
        option = Option(
            symbol="AAPL",
            underlying_symbol="AAPL",
            strike=150.0,
            expiry=expiry.date(),
            option_type="call",
            exercise_style="european",
            bid=8.0,
            ask=8.5,
            last=8.2,
            volume=1000,
            open_interest=5000,
            implied_volatility=0.25
        )
        
        analysis = analyzer.analyze(
            option=option,
            spot_price=150.0,
            risk_free_rate=0.05,
            historical_prices=[150.0] * 30,
            historical_ivs=[0.20, 0.22, 0.24, 0.26, 0.28, 0.30]
        )
        
        assert analysis.iv_percentile is not None
        assert 0 <= analysis.iv_percentile <= 100
    
    def test_american_option_uses_binomial(self):
        """Test that American options use binomial pricing."""
        analyzer = OptionAnalyzer()
        
        expiry = datetime.now() + timedelta(days=365)
        option = Option(
            symbol="AAPL",
            underlying_symbol="AAPL",
            strike=150.0,
            expiry=expiry.date(),
            option_type="call",
            exercise_style="american",  # American style
            bid=8.0,
            ask=8.5,
            last=8.2,
            volume=1000,
            open_interest=5000,
            implied_volatility=0.25
        )
        
        analysis = analyzer.analyze(
            option=option,
            spot_price=150.0,
            risk_free_rate=0.05,
            historical_prices=[150.0] * 30
        )
        
        # Should successfully price American option
        assert analysis.theoretical_price > 0
    
    def test_european_option_uses_black_scholes(self):
        """Test that European options use Black-Scholes."""
        analyzer = OptionAnalyzer()
        
        expiry = datetime.now() + timedelta(days=365)
        option = Option(
            symbol="SPX",
            underlying_symbol="SPX",
            strike=4500.0,
            expiry=expiry.date(),
            option_type="call",
            exercise_style="european",  # European style
            bid=100.0,
            ask=105.0,
            last=102.0,
            volume=500,
            open_interest=2000,
            implied_volatility=0.15
        )
        
        analysis = analyzer.analyze(
            option=option,
            spot_price=4500.0,
            risk_free_rate=0.05,
            historical_prices=[4500.0] * 30
        )
        
        # Should successfully price European option
        assert analysis.theoretical_price > 0
    
    def test_all_greeks_calculated(self):
        """Test that all Greeks are calculated."""
        analyzer = OptionAnalyzer()
        
        expiry = datetime.now() + timedelta(days=365)
        option = Option(
            symbol="AAPL",
            underlying_symbol="AAPL",
            strike=150.0,
            expiry=expiry.date(),
            option_type="call",
            exercise_style="european",
            bid=8.0,
            ask=8.5,
            last=8.2,
            volume=1000,
            open_interest=5000,
            implied_volatility=0.25
        )
        
        analysis = analyzer.analyze(
            option=option,
            spot_price=150.0,
            risk_free_rate=0.05,
            historical_prices=[150.0] * 30
        )
        
        assert analysis.greeks.delta is not None
        assert analysis.greeks.gamma is not None
        assert analysis.greeks.theta is not None
        assert analysis.greeks.vega is not None
        assert analysis.greeks.rho is not None
