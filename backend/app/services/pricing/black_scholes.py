"""Black-Scholes pricing engine for European options."""
from typing import Literal
from py_vollib.black_scholes import black_scholes
from py_vollib.black_scholes.implied_volatility import implied_volatility


class BlackScholesPricer:
    """Black-Scholes option pricing for European options."""
    
    def price(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float,
        q: float = 0.0
    ) -> float:
        """
        Calculate option price using Black-Scholes model.
        
        Args:
            option_type: 'call' or 'put'
            S: Spot price
            K: Strike price
            T: Time to expiration (years)
            r: Risk-free rate (annual)
            sigma: Volatility (annual)
            q: Dividend yield (annual)
            
        Returns:
            Option price
        """
        # py_vollib uses 'c' and 'p' notation
        flag = 'c' if option_type == 'call' else 'p'
        
        # Handle edge case: expired option
        if T <= 0:
            intrinsic = max(S - K, 0) if option_type == 'call' else max(K - S, 0)
            return intrinsic
        
        return black_scholes(flag, S, K, T, r, sigma)
    
    def implied_volatility(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        market_price: float,
        q: float = 0.0
    ) -> float:
        """
        Calculate implied volatility from market price.
        
        Args:
            option_type: 'call' or 'put'
            S: Spot price
            K: Strike price
            T: Time to expiration (years)
            r: Risk-free rate
            market_price: Observed option price
            q: Dividend yield
            
        Returns:
            Implied volatility
        """
        flag = 'c' if option_type == 'call' else 'p'
        
        return implied_volatility(market_price, S, K, T, r, flag)
