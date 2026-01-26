"""Options strategy recognition service."""
from typing import List
from datetime import date
from pydantic import BaseModel, Field
from app.models.strategy import OptionLeg


class RecognizedStrategy(BaseModel):
    """Result of strategy recognition."""
    name: str = Field(..., description="Strategy name (e.g., 'Vertical Spread', 'Iron Condor')")
    legs: List[OptionLeg] = Field(..., description="Option legs in the strategy")
    description: str = Field(default="", description="Strategy description")


class StrategyRecognizer:
    """Recognizes common options trading strategies from option legs."""
    
    def recognize(self, legs: List[OptionLeg]) -> RecognizedStrategy:
        """
        Recognize strategy from option legs.
        
        Args:
            legs: List of option legs (option + quantity)
            
        Returns:
            RecognizedStrategy with name and characteristics
        """
        if not legs:
            return RecognizedStrategy(name="Custom", legs=[], description="No legs provided")
        
        if len(legs) == 1:
            return self._recognize_single_leg(legs[0])
        
        if len(legs) == 2:
            return self._recognize_two_legs(legs)
        
        if len(legs) == 3:
            return self._recognize_three_legs(legs)
        
        if len(legs) == 4:
            return self._recognize_four_legs(legs)
        
        return RecognizedStrategy(name="Custom", legs=legs, description="Complex multi-leg strategy")
    
    def _recognize_single_leg(self, leg: OptionLeg) -> RecognizedStrategy:
        """Recognize single option position."""
        opt_type = leg.option.option_type
        direction = "Long" if leg.quantity > 0 else "Short"
        name = f"{direction} {opt_type.capitalize()}"
        return RecognizedStrategy(name=name, legs=[leg])
    
    def _recognize_two_legs(self, legs: List[OptionLeg]) -> RecognizedStrategy:
        """Recognize two-leg strategies."""
        leg1, leg2 = legs[0], legs[1]
        
        # Same expiry check
        same_expiry = leg1.option.expiry == leg2.option.expiry
        same_strike = leg1.option.strike == leg2.option.strike
        same_type = leg1.option.option_type == leg2.option.option_type
        
        # Straddle: Same strike, same expiry, different types, both long or both short
        if same_strike and same_expiry and not same_type:
            if (leg1.quantity > 0 and leg2.quantity > 0) or (leg1.quantity < 0 and leg2.quantity < 0):
                direction = "Long" if leg1.quantity > 0 else "Short"
                return RecognizedStrategy(
                    name="Straddle",
                    legs=legs,
                    description=f"{direction} straddle at strike {leg1.option.strike}"
                )
        
        # Strangle: Different strikes, same expiry, different types
        if not same_strike and same_expiry and not same_type:
            if (leg1.quantity > 0 and leg2.quantity > 0):
                return RecognizedStrategy(
                    name="Strangle",
                    legs=legs,
                    description="Long strangle"
                )
        
        # Calendar Spread: Same strike, different expiries, same type
        if same_strike and not same_expiry and same_type:
            return RecognizedStrategy(
                name="Calendar Spread",
                legs=legs,
                description=f"Calendar spread on {leg1.option.option_type}s"
            )
        
        # Vertical Spread: Same expiry, same type, different strikes
        if same_expiry and same_type and not same_strike:
            if (leg1.quantity > 0 and leg2.quantity < 0) or (leg1.quantity < 0 and leg2.quantity > 0):
                return RecognizedStrategy(
                    name="Vertical Spread",
                    legs=legs,
                    description=f"Vertical {leg1.option.option_type} spread"
                )
        
        return RecognizedStrategy(name="Custom", legs=legs)
    
    def _recognize_three_legs(self, legs: List[OptionLeg]) -> RecognizedStrategy:
        """Recognize three-leg strategies."""
        # Butterfly: 3 strikes, same expiry, same type, 1/-2/1 ratio
        strikes = sorted(set(leg.option.strike for leg in legs))
        expiries = set(leg.option.expiry for leg in legs)
        types = set(leg.option.option_type for leg in legs)
        
        if len(strikes) == 3 and len(expiries) == 1 and len(types) == 1:
            quantities = [leg.quantity for leg in sorted(legs, key=lambda x: x.option.strike)]
            # Check for 1/-2/1 or -1/2/-1 pattern
            if (abs(quantities[0]) == 1 and abs(quantities[1]) == 2 and abs(quantities[2]) == 1):
                if (quantities[0] > 0 and quantities[1] < 0 and quantities[2] > 0):
                    return RecognizedStrategy(
                        name="Butterfly",
                        legs=legs,
                        description="Long butterfly spread"
                    )
        
        return RecognizedStrategy(name="Custom", legs=legs)
    
    def _recognize_four_legs(self, legs: List[OptionLeg]) -> RecognizedStrategy:
        """Recognize four-leg strategies."""
        # Iron Condor: 4 strikes, same expiry, 2 puts and 2 calls
        strikes = sorted(set(leg.option.strike for leg in legs))
        expiries = set(leg.option.expiry for leg in legs)
        
        calls = [leg for leg in legs if leg.option.option_type == "call"]
        puts = [leg for leg in legs if leg.option.option_type == "put"]
        
        if len(strikes) == 4 and len(expiries) == 1 and len(calls) == 2 and len(puts) == 2:
            # Sort puts and calls by strike
            puts_sorted = sorted(puts, key=lambda x: x.option.strike)
            calls_sorted = sorted(calls, key=lambda x: x.option.strike)
            
            # Check pattern: long low put, short higher put, short lower call, long high call
            if (puts_sorted[0].quantity > 0 and puts_sorted[1].quantity < 0 and
                calls_sorted[0].quantity < 0 and calls_sorted[1].quantity > 0):
                return RecognizedStrategy(
                    name="Iron Condor",
                    legs=legs,
                    description="Iron condor spread"
                )
        
        return RecognizedStrategy(name="Custom", legs=legs)
