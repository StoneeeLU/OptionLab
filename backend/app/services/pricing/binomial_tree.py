"""Binomial tree pricing for American options."""
from typing import Literal
import math


class BinomialTreePricer:
    """Binomial tree option pricing for American options."""
    
    def price(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float,
        steps: int = 100,
        q: float = 0.0
    ) -> float:
        """
        Price American option using binomial tree (CRR model).
        
        Args:
            option_type: 'call' or 'put'
            S: Spot price
            K: Strike price
            T: Time to expiration (years)
            r: Risk-free rate
            sigma: Volatility
            steps: Number of time steps
            q: Dividend yield
            
        Returns:
            Option price
        """
        if T <= 0:
            intrinsic = max(S - K, 0) if option_type == 'call' else max(K - S, 0)
            return intrinsic
        
        # Time step
        dt = T / steps
        
        # Up and down factors (Cox-Ross-Rubinstein)
        u = math.exp(sigma * math.sqrt(dt))
        d = 1 / u
        
        # Risk-neutral probability
        a = math.exp((r - q) * dt)
        p = (a - d) / (u - d)
        
        # Initialize asset prices at maturity
        prices = [S * (u ** (steps - i)) * (d ** i) for i in range(steps + 1)]
        
        # Initialize option values at maturity
        if option_type == 'call':
            values = [max(price - K, 0) for price in prices]
        else:
            values = [max(K - price, 0) for price in prices]
        
        # Step backwards through tree
        for step in range(steps - 1, -1, -1):
            for i in range(step + 1):
                # Asset price at this node
                price = S * (u ** (step - i)) * (d ** i)
                
                # Continuation value (expected value discounted)
                continuation = math.exp(-r * dt) * (p * values[i] + (1 - p) * values[i + 1])
                
                # Intrinsic value (immediate exercise)
                if option_type == 'call':
                    intrinsic = max(price - K, 0)
                else:
                    intrinsic = max(K - price, 0)
                
                # American option: max of continuation and exercise
                values[i] = max(continuation, intrinsic)
        
        return values[0]
