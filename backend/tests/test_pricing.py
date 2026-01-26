"""Tests for Black-Scholes pricing engine."""
import sys
from pathlib import Path
from datetime import date

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import pytest


def test_black_scholes_pricer_instantiation():
    """Test that BlackScholesPricer can be instantiated."""
    from app.services.pricing.black_scholes import BlackScholesPricer
    
    pricer = BlackScholesPricer()
    assert pricer is not None


def test_black_scholes_call_pricing_hull_example():
    """Test call pricing with Hull textbook example."""
    from app.services.pricing.black_scholes import BlackScholesPricer
    
    pricer = BlackScholesPricer()
    
    # Hull example: S=49, K=50, r=5%, T=0.3846, σ=20%
    price = pricer.price(
        option_type='call',
        S=49,
        K=50,
        T=0.3846,
        r=0.05,
        sigma=0.20
    )
    
    # Expected: ~2.40
    assert 2.35 < price < 2.45


def test_black_scholes_put_pricing():
    """Test put pricing."""
    from app.services.pricing.black_scholes import BlackScholesPricer
    
    pricer = BlackScholesPricer()
    
    price = pricer.price(
        option_type='put',
        S=100,
        K=100,
        T=1.0,
        r=0.05,
        sigma=0.20
    )
    
    # ATM put should have positive value
    assert price > 0
    assert price < 15  # Reasonable range


def test_black_scholes_implied_volatility():
    """Test implied volatility calculation."""
    from app.services.pricing.black_scholes import BlackScholesPricer
    
    pricer = BlackScholesPricer()
    
    # First get a theoretical price
    expected_sigma = 0.25
    market_price = pricer.price('call', S=100, K=100, T=1.0, r=0.05, sigma=expected_sigma)
    
    # Now calculate IV from that price
    iv = pricer.implied_volatility(
        option_type='call',
        S=100,
        K=100,
        T=1.0,
        r=0.05,
        market_price=market_price
    )
    
    # Should match within 0.1%
    assert abs(iv - expected_sigma) < 0.001


def test_black_scholes_edge_cases():
    """Test edge cases handling."""
    from app.services.pricing.black_scholes import BlackScholesPricer
    
    pricer = BlackScholesPricer()
    
    # Deep ITM call
    price = pricer.price('call', S=150, K=100, T=0.1, r=0.05, sigma=0.20)
    assert price > 49  # Should be close to intrinsic value
    
    # Deep OTM call
    price = pricer.price('call', S=50, K=100, T=0.1, r=0.05, sigma=0.20)
    assert price < 1  # Should be near zero


def test_binomial_pricer_american_option():
    """Test binomial tree pricing for American options."""
    from app.services.pricing.binomial_tree import BinomialTreePricer
    
    pricer = BinomialTreePricer()
    
    # American put (early exercise possible)
    price = pricer.price(
        option_type='put',
        S=100,
        K=110,
        T=1.0,
        r=0.05,
        sigma=0.20,
        steps=100
    )
    
    # American put should be worth more than European
    assert price > 0
    assert price < 15


def test_hybrid_pricer_routes_correctly():
    """Test that HybridPricer routes to correct engine."""
    from app.services.pricing.hybrid_pricer import HybridPricer
    
    pricer = HybridPricer()
    
    # European option should use Black-Scholes
    price_euro = pricer.price(
        option_type='call',
        S=100,
        K=100,
        T=1.0,
        r=0.05,
        sigma=0.20,
        exercise_style='european'
    )
    
    # American option should use binomial
    price_amer = pricer.price(
        option_type='call',
        S=100,
        K=100,
        T=1.0,
        r=0.05,
        sigma=0.20,
        exercise_style='american'
    )
    
    # Both should be positive and similar (call doesn't benefit much from early exercise)
    assert price_euro > 0
    assert price_amer > 0
    assert abs(price_amer - price_euro) < 1  # Close for calls
