"""Hybrid pricing engine - routes to appropriate pricer."""
from typing import Literal
from .black_scholes import BlackScholesPricer
from .binomial_tree import BinomialTreePricer


class HybridPricer:
    """
    Hybrid pricing engine that routes to appropriate model.
    
    - European options: Black-Scholes (fast, analytical)
    - American options: Binomial tree (handles early exercise)
    """
    
    def __init__(self):
        self.bs_pricer = BlackScholesPricer()
        self.binomial_pricer = BinomialTreePricer()
    
    def price(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float,
        exercise_style: Literal['american', 'european'] = 'american',
        q: float = 0.0,
        steps: int = 100
    ) -> float:
        """
        Price option using appropriate model.
        
        Args:
            option_type: 'call' or 'put'
            S: Spot price
            K: Strike price
            T: Time to expiration (years)
            r: Risk-free rate
            sigma: Volatility
            exercise_style: 'american' or 'european'
            q: Dividend yield
            steps: Binomial tree steps (for American)
            
        Returns:
            Option price
        """
        if exercise_style == 'european':
            return self.bs_pricer.price(option_type, S, K, T, r, sigma, q)
        else:
            return self.binomial_pricer.price(option_type, S, K, T, r, sigma, steps, q)
    
    def implied_volatility(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        market_price: float,
        exercise_style: Literal['american', 'european'] = 'european',
        q: float = 0.0
    ) -> float:
        """
        Calculate implied volatility.
        
        Note: Only supports European options for IV calculation.
        American IV would require iterative search with binomial.
        """
        if exercise_style != 'european':
            # For American options, fall back to BS approximation
            # (Full American IV calc would be very slow)
            pass
        
        return self.bs_pricer.implied_volatility(option_type, S, K, T, r, market_price, q)
