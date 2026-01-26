"""Tests for P&L diagram calculator."""
from datetime import date
from app.services.analysis.pnl import PnLCalculator, PnLPoint
from app.models.option import Option
from app.models.strategy import OptionLeg


def test_pnl_calculator_instantiation():
    """Test that PnLCalculator can be instantiated."""
    calc = PnLCalculator()
    assert calc is not None


def test_long_call_pnl():
    """Test P&L for a long call."""
    calc = PnLCalculator()
    
    # Buy call at strike 150, premium paid = 5.0
    leg = OptionLeg(
        option=Option(
            symbol="AAPL",
            strike=150.0,
            expiry=date(2027, 1, 25),
            option_type="call",
            exercise_style="american",
            ask=5.0
        ),
        quantity=1
    )
    
    result = calc.calculate_pnl([leg], price_range=(140.0, 160.0), points=21)
    
    # Verify structure
    assert len(result.pnl_data) == 21
    assert result.max_profit is None  # Unlimited
    assert result.max_loss == -5.0  # Premium paid
    assert len(result.breakevens) == 1
    assert abs(result.breakevens[0] - 155.0) < 0.1  # Breakeven at strike + premium
    
    # Check specific points
    pnl_dict = {p.price: p.pnl for p in result.pnl_data}
    
    # Below strike: lose premium
    assert pnl_dict[140.0] == -5.0
    assert pnl_dict[150.0] == -5.0
    
    # Above strike: profit increases
    assert pnl_dict[155.0] == 0.0  # Breakeven
    assert pnl_dict[160.0] == 5.0  # 10 intrinsic - 5 premium


def test_long_put_pnl():
    """Test P&L for a long put."""
    calc = PnLCalculator()
    
    # Buy put at strike 150, premium paid = 4.0
    leg = OptionLeg(
        option=Option(
            symbol="AAPL",
            strike=150.0,
            expiry=date(2027, 1, 25),
            option_type="put",
            exercise_style="american",
            ask=4.0
        ),
        quantity=1
    )
    
    result = calc.calculate_pnl([leg], price_range=(140.0, 160.0), points=21)
    
    # Max loss = premium
    assert result.max_loss == -4.0
    
    # Max profit within range (at price=140): (150-140) - 4 = 6.0
    # NOTE: True max profit would be 146 if price went to 0, but we're limited by price_range
    assert result.max_profit == 6.0
    
    # Breakeven at strike - premium = 146
    assert len(result.breakevens) == 1
    assert abs(result.breakevens[0] - 146.0) < 0.1


def test_short_call_pnl():
    """Test P&L for a short call."""
    calc = PnLCalculator()
    
    # Sell call at strike 150, premium received = 5.0
    leg = OptionLeg(
        option=Option(
            symbol="AAPL",
            strike=150.0,
            expiry=date(2027, 1, 25),
            option_type="call",
            exercise_style="american",
            bid=5.0
        ),
        quantity=-1  # Short
    )
    
    result = calc.calculate_pnl([leg], price_range=(140.0, 160.0), points=21)
    
    # Max profit = premium received
    assert result.max_profit == 5.0
    
    # Max loss = unlimited
    assert result.max_loss is None
    
    # Breakeven at strike + premium
    assert len(result.breakevens) == 1
    assert abs(result.breakevens[0] - 155.0) < 0.1


def test_vertical_call_spread_pnl():
    """Test P&L for a bull call spread (capped profit and loss)."""
    calc = PnLCalculator()
    
    # Buy 150 call at 6.0, sell 155 call at 3.0
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=150.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american",
                ask=6.0
            ),
            quantity=1
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=155.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american",
                bid=3.0
            ),
            quantity=-1
        ),
    ]
    
    result = calc.calculate_pnl(legs, price_range=(145.0, 160.0), points=31)
    
    # Net debit = 6.0 - 3.0 = 3.0
    # Max loss = net debit = -3.0
    assert result.max_loss == -3.0
    
    # Max profit = width - debit = (155 - 150) - 3.0 = 2.0
    assert result.max_profit == 2.0
    
    # Two breakevens (one is at 153)
    assert len(result.breakevens) >= 1
    # Main breakeven at 150 + 3 = 153
    assert any(abs(b - 153.0) < 0.1 for b in result.breakevens)


def test_straddle_pnl():
    """Test P&L for a long straddle."""
    calc = PnLCalculator()
    
    # Buy call and put at same strike
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=150.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american",
                ask=5.0
            ),
            quantity=1
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=150.0,
                expiry=date(2027, 1, 25),
                option_type="put",
                exercise_style="american",
                ask=5.0
            ),
            quantity=1
        ),
    ]
    
    result = calc.calculate_pnl(legs, price_range=(130.0, 170.0), points=41)
    
    # Max loss = total premium = 10.0
    assert result.max_loss == -10.0
    
    # Unlimited profit
    assert result.max_profit is None
    
    # Two breakevens: 140 and 160
    assert len(result.breakevens) == 2
    assert any(abs(b - 140.0) < 0.5 for b in result.breakevens)
    assert any(abs(b - 160.0) < 0.5 for b in result.breakevens)


def test_iron_condor_pnl():
    """Test P&L for an iron condor (4 legs, capped P&L)."""
    calc = PnLCalculator()
    
    # Iron condor: sell 145/150 put spread, sell 155/160 call spread
    legs = [
        # Put spread
        OptionLeg(
            option=Option(
                symbol="AAPL", strike=145.0, expiry=date(2027, 1, 25),
                option_type="put", exercise_style="american", bid=2.0
            ),
            quantity=-1  # Sell
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL", strike=150.0, expiry=date(2027, 1, 25),
                option_type="put", exercise_style="american", ask=4.0
            ),
            quantity=1  # Buy
        ),
        # Call spread
        OptionLeg(
            option=Option(
                symbol="AAPL", strike=155.0, expiry=date(2027, 1, 25),
                option_type="call", exercise_style="american", bid=4.0
            ),
            quantity=-1  # Sell
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL", strike=160.0, expiry=date(2027, 1, 25),
                option_type="call", exercise_style="american", ask=2.0
            ),
            quantity=1  # Buy
        ),
    ]
    
    result = calc.calculate_pnl(legs, price_range=(140.0, 165.0), points=51)
    
    # Net credit = (2 + 4) - (4 + 2) = 0 (simplified, usually small credit)
    # Max profit should be >= 0 (credit received)
    # Max loss should be negative (width of spread - credit)
    assert result.max_profit is not None
    assert result.max_loss is not None
    assert result.max_loss < 0


def test_breakeven_calculation():
    """Test breakeven point calculation."""
    calc = PnLCalculator()
    
    # Simple long call
    leg = OptionLeg(
        option=Option(
            symbol="AAPL",
            strike=100.0,
            expiry=date(2027, 1, 25),
            option_type="call",
            exercise_style="american",
            ask=10.0
        ),
        quantity=1
    )
    
    result = calc.calculate_pnl([leg], price_range=(90.0, 120.0), points=31)
    
    # Breakeven should be at 110 (strike + premium)
    assert len(result.breakevens) == 1
    assert abs(result.breakevens[0] - 110.0) < 0.5


def test_empty_legs():
    """Test that empty legs return zero P&L."""
    calc = PnLCalculator()
    
    result = calc.calculate_pnl([], price_range=(100.0, 200.0), points=11)
    
    assert len(result.pnl_data) == 11
    assert all(p.pnl == 0 for p in result.pnl_data)
    assert result.max_profit == 0
    assert result.max_loss == 0
    assert len(result.breakevens) == 0
