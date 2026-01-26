"""Tests for combination Greeks calculator."""
from datetime import date
from app.services.analysis.combination import CombinationCalculator
from app.services.pricing.greeks import GreeksCalculator
from app.models.option import Option
from app.models.strategy import OptionLeg


def test_combined_greeks_opposite_positions_cancel():
    """Test that long and short same option cancel out."""
    calc = CombinationCalculator()
    greeks_calc = GreeksCalculator()
    
    option = Option(
        symbol="AAPL",
        strike=150.0,
        expiry=date(2027, 1, 25),
        option_type="call",
        exercise_style="american"
    )
    
    legs = [
        OptionLeg(option=option, quantity=1),   # Long
        OptionLeg(option=option, quantity=-1),  # Short
    ]
    
    # Need market data for Greeks calculation
    spot = 150.0
    risk_free_rate = 0.05
    sigma = 0.25
    
    combined = calc.combined_greeks(legs, spot, risk_free_rate, sigma)
    
    # Delta should be close to zero (may not be exact due to American pricing)
    assert abs(combined.delta) < 0.01
    assert abs(combined.gamma) < 0.001
    assert abs(combined.vega) < 0.01


def test_combined_greeks_multiple_long():
    """Test that multiple long positions sum correctly."""
    calc = CombinationCalculator()
    
    option = Option(
        symbol="AAPL",
        strike=150.0,
        expiry=date(2027, 1, 25),
        option_type="call",
        exercise_style="american"
    )
    
    # 3 long calls
    legs = [
        OptionLeg(option=option, quantity=3),
    ]
    
    spot = 150.0
    risk_free_rate = 0.05
    sigma = 0.25
    
    combined = calc.combined_greeks(legs, spot, risk_free_rate, sigma)
    
    # Single option Greeks
    greeks_calc = GreeksCalculator()
    time_to_expiry = (date(2027, 1, 25) - date.today()).days / 365.0
    single_greeks = greeks_calc.calculate_all("call", spot, 150.0, time_to_expiry, risk_free_rate, sigma)
    
    # Combined should be 3x single
    assert abs(combined.delta - single_greeks.delta * 3) < 0.01
    assert abs(combined.gamma - single_greeks.gamma * 3) < 0.001


def test_combined_greeks_vertical_spread():
    """Test Greeks for a vertical call spread."""
    calc = CombinationCalculator()
    
    # Bull call spread: buy lower strike, sell higher strike
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=145.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=1  # Long
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=155.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=-1  # Short
        ),
    ]
    
    spot = 150.0
    risk_free_rate = 0.05
    sigma = 0.25
    
    combined = calc.combined_greeks(legs, spot, risk_free_rate, sigma)
    
    # Vertical spread should have positive delta (bullish)
    assert combined.delta > 0
    # But less than a single long call at 145
    assert combined.delta < 1.0


def test_net_premium_debit_spread():
    """Test net premium calculation for debit spread."""
    calc = CombinationCalculator()
    
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=145.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american",
                bid=8.0,
                ask=8.5,
                last=8.25
            ),
            quantity=1  # Buy (pay ask)
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=155.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american",
                bid=3.0,
                ask=3.5,
                last=3.25
            ),
            quantity=-1  # Sell (receive bid)
        ),
    ]
    
    premium = calc.net_premium(legs)
    
    # Debit: pay 8.5 (ask) - receive 3.0 (bid) = 5.5 debit
    expected = -5.5  # Negative = debit (money paid out)
    assert abs(premium - expected) < 0.01


def test_net_premium_credit_spread():
    """Test net premium calculation for credit spread."""
    calc = CombinationCalculator()
    
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=155.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american",
                bid=3.0,
                ask=3.5,
                last=3.25
            ),
            quantity=-1  # Sell (receive bid)
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=160.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american",
                bid=1.5,
                ask=2.0,
                last=1.75
            ),
            quantity=1  # Buy (pay ask)
        ),
    ]
    
    premium = calc.net_premium(legs)
    
    # Credit: receive 3.0 (bid) - pay 2.0 (ask) = 1.0 credit
    expected = 1.0  # Positive = credit (money received)
    assert abs(premium - expected) < 0.01


def test_net_premium_uses_last_if_no_bid_ask():
    """Test that net premium falls back to last price."""
    calc = CombinationCalculator()
    
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=150.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american",
                last=5.0  # Only last price available
            ),
            quantity=1
        ),
    ]
    
    premium = calc.net_premium(legs)
    
    # Should use last price: -5.0 (debit)
    expected = -5.0
    assert abs(premium - expected) < 0.01


def test_combined_greeks_straddle():
    """Test Greeks for a straddle."""
    calc = CombinationCalculator()
    
    # Long straddle: buy call and put at same strike
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=150.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=1
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=150.0,
                expiry=date(2027, 1, 25),
                option_type="put",
                exercise_style="american"
            ),
            quantity=1
        ),
    ]
    
    spot = 150.0
    risk_free_rate = 0.05
    sigma = 0.25
    
    combined = calc.combined_greeks(legs, spot, risk_free_rate, sigma)
    
    # At-the-money straddle should have delta between -0.5 and 0.5
    # (Call delta ~0.5, Put delta varies with T and sigma, often ~-0.25 for long-dated)
    assert -0.5 < combined.delta < 0.5
    # But positive gamma and vega
    assert combined.gamma > 0
    assert combined.vega > 0


def test_empty_legs():
    """Test that empty legs return zero Greeks."""
    calc = CombinationCalculator()
    
    combined = calc.combined_greeks([], 150.0, 0.05, 0.25)
    
    assert combined.delta == 0
    assert combined.gamma == 0
    assert combined.theta == 0
    assert combined.vega == 0
    assert combined.rho == 0
