"""Put-Call Parity checker for European options."""
from typing import Literal
from datetime import datetime
from pydantic import BaseModel
import math
from app.models.option import Option


class ParityResult(BaseModel):
    """Result of put-call parity check."""
    
    call_price: float
    put_price: float
    actual_parity_value: float  # C - P
    expected_parity_value: float  # S - K*e^(-rT)
    deviation: float  # Actual - Expected
    deviation_pct: float  # (Deviation / Expected) * 100
    is_valid_parity: bool  # Within threshold
    arbitrage_opportunity: Literal["none", "synthetic_call_cheaper", "synthetic_put_cheaper"]


class ParityChecker:
    """Check Put-Call Parity for European options.
    
    Formula: C - P = S - K*e^(-rT)
    
    Where:
    - C: Call price
    - P: Put price
    - S: Spot price
    - K: Strike price
    - r: Risk-free rate
    - T: Time to expiration
    
    If violated, suggests arbitrage opportunity:
    - If C - P > S - K*e^(-rT): Call overpriced or Put underpriced
      → Buy put, sell call (synthetic short)
    - If C - P < S - K*e^(-rT): Put overpriced or Call underpriced
      → Buy call, sell put (synthetic long)
    """
    
    def check_parity(
        self,
        call: Option,
        put: Option,
        spot_price: float,
        risk_free_rate: float,
        threshold_pct: float = 0.5
    ) -> ParityResult:
        """
        Check put-call parity for a pair of options.
        
        Args:
            call: Call option
            put: Put option (same strike, expiry as call)
            spot_price: Current underlying price
            risk_free_rate: Risk-free rate (annual)
            threshold_pct: Deviation threshold in % (default 0.5%)
            
        Returns:
            ParityResult with parity analysis
            
        Raises:
            ValueError: If options don't match (strike/expiry)
        """
        # Validate options match
        if call.strike != put.strike:
            raise ValueError("Call and put must have same strike price")
        if call.expiry != put.expiry:
            raise ValueError("Call and put must have same expiry date")
        
        # Calculate time to expiration
        now = datetime.now().date()
        time_delta = (call.expiry - now).days
        T = time_delta / 365.25
        
        # Get mid prices
        call_price = (call.bid + call.ask) / 2 if call.bid and call.ask else call.last
        put_price = (put.bid + put.ask) / 2 if put.bid and put.ask else put.last
        
        # Calculate actual parity value: C - P
        actual = call_price - put_price
        
        # Calculate expected parity value: S - K*e^(-rT)
        K = call.strike
        r = risk_free_rate
        discount_factor = math.exp(-r * T)
        expected = spot_price - K * discount_factor
        
        # Calculate deviation
        deviation = actual - expected
        deviation_pct = (deviation / expected) * 100 if expected != 0 else 0
        
        # Determine if parity holds
        is_valid = abs(deviation_pct) <= threshold_pct
        
        # Determine arbitrage opportunity
        if is_valid:
            arbitrage = "none"
        elif deviation > 0:
            # C - P > S - K*e^(-rT)
            # Call relatively expensive, put relatively cheap
            arbitrage = "synthetic_call_cheaper"
        else:
            # C - P < S - K*e^(-rT)
            # Put relatively expensive, call relatively cheap
            arbitrage = "synthetic_put_cheaper"
        
        return ParityResult(
            call_price=call_price,
            put_price=put_price,
            actual_parity_value=actual,
            expected_parity_value=expected,
            deviation=deviation,
            deviation_pct=deviation_pct,
            is_valid_parity=is_valid,
            arbitrage_opportunity=arbitrage
        )
