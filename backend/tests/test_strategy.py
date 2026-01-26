"""Tests for options strategy recognition."""
from datetime import date
from app.services.analysis.strategy import StrategyRecognizer, RecognizedStrategy
from app.models.option import Option
from app.models.strategy import OptionLeg


def test_recognize_vertical_call_spread():
    """Test recognition of vertical call spread (bull call spread)."""
    recognizer = StrategyRecognizer()
    
    # Buy lower strike call, sell higher strike call
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
                strike=150.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=-1  # Short
        ),
    ]
    
    strategy = recognizer.recognize(legs)
    
    assert strategy.name == "Vertical Spread"
    assert len(strategy.legs) == 2


def test_recognize_straddle():
    """Test recognition of straddle."""
    recognizer = StrategyRecognizer()
    
    # Buy call and put at same strike
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
    
    strategy = recognizer.recognize(legs)
    
    assert strategy.name == "Straddle"
    assert len(strategy.legs) == 2


def test_recognize_strangle():
    """Test recognition of strangle."""
    recognizer = StrategyRecognizer()
    
    # Buy call and put at different strikes
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=145.0,
                expiry=date(2027, 1, 25),
                option_type="put",
                exercise_style="american"
            ),
            quantity=1
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=155.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=1
        ),
    ]
    
    strategy = recognizer.recognize(legs)
    
    assert strategy.name == "Strangle"
    assert len(strategy.legs) == 2


def test_recognize_iron_condor():
    """Test recognition of iron condor."""
    recognizer = StrategyRecognizer()
    
    # Buy OTM put, sell closer put, sell closer call, buy OTM call
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=140.0,
                expiry=date(2027, 1, 25),
                option_type="put",
                exercise_style="american"
            ),
            quantity=1  # Long OTM put
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=145.0,
                expiry=date(2027, 1, 25),
                option_type="put",
                exercise_style="american"
            ),
            quantity=-1  # Short put
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=155.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=-1  # Short call
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=160.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=1  # Long OTM call
        ),
    ]
    
    strategy = recognizer.recognize(legs)
    
    assert strategy.name == "Iron Condor"
    assert len(strategy.legs) == 4


def test_recognize_butterfly():
    """Test recognition of butterfly spread."""
    recognizer = StrategyRecognizer()
    
    # Buy 1 low strike, sell 2 middle strike, buy 1 high strike
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=145.0,
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
                option_type="call",
                exercise_style="american"
            ),
            quantity=-2
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=155.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=1
        ),
    ]
    
    strategy = recognizer.recognize(legs)
    
    assert strategy.name == "Butterfly"
    assert len(strategy.legs) == 3


def test_recognize_calendar_spread():
    """Test recognition of calendar spread."""
    recognizer = StrategyRecognizer()
    
    # Same strike, different expiries
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=150.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=-1  # Sell near-term
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=150.0,
                expiry=date(2027, 3, 19),
                option_type="call",
                exercise_style="american"
            ),
            quantity=1  # Buy far-term
        ),
    ]
    
    strategy = recognizer.recognize(legs)
    
    assert strategy.name == "Calendar Spread"
    assert len(strategy.legs) == 2


def test_recognize_custom_strategy():
    """Test that unrecognized combinations return 'Custom'."""
    recognizer = StrategyRecognizer()
    
    # Unusual combination
    legs = [
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=140.0,
                expiry=date(2027, 1, 25),
                option_type="call",
                exercise_style="american"
            ),
            quantity=2
        ),
        OptionLeg(
            option=Option(
                symbol="AAPL",
                strike=160.0,
                expiry=date(2027, 2, 19),
                option_type="put",
                exercise_style="american"
            ),
            quantity=3
        ),
    ]
    
    strategy = recognizer.recognize(legs)
    
    assert strategy.name == "Custom"
    assert len(strategy.legs) == 2


def test_recognize_single_leg():
    """Test that single option returns name based on direction."""
    recognizer = StrategyRecognizer()
    
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
    ]
    
    strategy = recognizer.recognize(legs)
    
    assert strategy.name == "Long Call"
    assert len(strategy.legs) == 1


def test_empty_legs():
    """Test that empty legs list returns Custom."""
    recognizer = StrategyRecognizer()
    
    strategy = recognizer.recognize([])
    
    assert strategy.name == "Custom"
    assert len(strategy.legs) == 0
