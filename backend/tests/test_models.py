"""Tests for core Pydantic domain models."""
import sys
from pathlib import Path
from datetime import date, datetime

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from pydantic import ValidationError


def test_option_model_instantiation():
    """Test that Option model can be instantiated with valid data."""
    from app.models.option import Option
    
    option = Option(
        symbol="AAPL",
        strike=150.0,
        expiry=date(2024, 12, 20),
        option_type="call",
        bid=5.10,
        ask=5.30,
        last=5.20,
        volume=1000,
        open_interest=5000,
        implied_volatility=0.25
    )
    
    assert option.symbol == "AAPL"
    assert option.strike == 150.0
    assert option.option_type == "call"


def test_option_model_validation():
    """Test that Option model validates option_type."""
    from app.models.option import Option
    
    with pytest.raises(ValidationError):
        Option(
            symbol="AAPL",
            strike=150.0,
            expiry=date(2024, 12, 20),
            option_type="invalid",  # Should only be 'call' or 'put'
            bid=5.10,
            ask=5.30
        )


def test_greeks_model():
    """Test Greeks model instantiation."""
    from app.models.greeks import Greeks
    
    greeks = Greeks(
        delta=0.5,
        gamma=0.02,
        theta=-0.05,
        vega=0.15,
        rho=0.03
    )
    
    assert greeks.delta == 0.5
    assert greeks.theta < 0  # Theta typically negative for long options


def test_option_analysis_model():
    """Test OptionAnalysis model with nested structures."""
    from app.models.option import Option
    from app.models.greeks import Greeks
    from app.models.analysis import OptionAnalysis
    
    option = Option(
        symbol="AAPL",
        strike=150.0,
        expiry=date(2024, 12, 20),
        option_type="call",
        bid=5.10,
        ask=5.30,
        last=5.20
    )
    
    greeks = Greeks(delta=0.5, gamma=0.02, theta=-0.05, vega=0.15, rho=0.03)
    
    analysis = OptionAnalysis(
        option=option,
        greeks=greeks,
        theoretical_price=5.25,
        market_price=5.20,
        iv_percentile=0.65,
        historical_volatility=0.20,
        mispricing=-0.05,
        valuation="cheap"
    )
    
    assert analysis.mispricing < 0  # Negative means underpriced
    assert analysis.valuation == "cheap"


def test_option_chain_model():
    """Test OptionChain model with list of options."""
    from app.models.option import Option
    from app.models.chain import OptionChain
    
    options = [
        Option(
            symbol="AAPL",
            strike=145.0,
            expiry=date(2024, 12, 20),
            option_type="call",
            bid=7.50,
            ask=7.70
        ),
        Option(
            symbol="AAPL",
            strike=150.0,
            expiry=date(2024, 12, 20),
            option_type="call",
            bid=5.10,
            ask=5.30
        )
    ]
    
    chain = OptionChain(
        underlying="AAPL",
        spot_price=148.50,
        options=options,
        expiration_dates=[date(2024, 12, 20), date(2025, 1, 17)]
    )
    
    assert chain.underlying == "AAPL"
    assert len(chain.options) == 2
    assert chain.spot_price == 148.50


def test_strategy_model():
    """Test Strategy model for multi-leg combinations."""
    from app.models.option import Option
    from app.models.greeks import Greeks
    from app.models.strategy import Strategy, OptionLeg
    
    call_option = Option(
        symbol="AAPL",
        strike=150.0,
        expiry=date(2024, 12, 20),
        option_type="call",
        bid=5.10,
        ask=5.30
    )
    
    put_option = Option(
        symbol="AAPL",
        strike=150.0,
        expiry=date(2024, 12, 20),
        option_type="put",
        bid=4.90,
        ask=5.10
    )
    
    legs = [
        OptionLeg(option=call_option, quantity=1),
        OptionLeg(option=put_option, quantity=1)
    ]
    
    combined_greeks = Greeks(delta=0.0, gamma=0.04, theta=-0.10, vega=0.30, rho=0.0)
    
    strategy = Strategy(
        name="Straddle",
        legs=legs,
        combined_greeks=combined_greeks,
        max_profit=None,  # Unlimited for straddle
        max_loss=10.20,   # Total premium paid
        breakevens=[139.80, 160.20]
    )
    
    assert strategy.name == "Straddle"
    assert len(strategy.legs) == 2
    assert strategy.max_profit is None


def test_model_json_serialization():
    """Test that models serialize to JSON correctly."""
    from app.models.option import Option
    
    option = Option(
        symbol="AAPL",
        strike=150.0,
        expiry=date(2024, 12, 20),
        option_type="call",
        bid=5.10,
        ask=5.30
    )
    
    json_data = option.model_dump()
    
    assert isinstance(json_data, dict)
    assert json_data["symbol"] == "AAPL"
    assert json_data["strike"] == 150.0
