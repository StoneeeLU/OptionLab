"""Greeks calculator using py_vollib analytical functions."""
from typing import Literal
from app.models.greeks import Greeks
from py_vollib.black_scholes.greeks.analytical import (
    delta as bs_delta,
    gamma as bs_gamma,
    theta as bs_theta,
    vega as bs_vega,
    rho as bs_rho
)


class GreeksCalculator:
    """Calculate option Greeks using Black-Scholes analytical formulas.
    
    Sign Conventions:
    - Delta: Positive for calls (0 to 1), negative for puts (-1 to 0)
    - Gamma: Always positive (same for calls and puts)
    - Theta: Negative for long options (time decay)
    - Vega: Always positive (volatility increases option value)
    - Rho: Positive for calls, negative for puts
    """
    
    def calculate_all(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float
    ) -> Greeks:
        """
        Calculate all Greeks for an option.
        
        Args:
            option_type: 'call' or 'put'
            S: Spot price
            K: Strike price
            T: Time to expiration (years)
            r: Risk-free rate (annual)
            sigma: Volatility (annual)
            
        Returns:
            Greeks model with all sensitivities
        """
        # py_vollib uses 'c' and 'p' notation
        flag = 'c' if option_type.lower() == 'call' else 'p'
        
        return Greeks(
            delta=bs_delta(flag, S, K, T, r, sigma),
            gamma=bs_gamma(flag, S, K, T, r, sigma),
            theta=bs_theta(flag, S, K, T, r, sigma),
            vega=bs_vega(flag, S, K, T, r, sigma),
            rho=bs_rho(flag, S, K, T, r, sigma)
        )
    
    def delta(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float
    ) -> float:
        """Calculate delta (price sensitivity to underlying)."""
        flag = 'c' if option_type.lower() == 'call' else 'p'
        return bs_delta(flag, S, K, T, r, sigma)
    
    def gamma(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float
    ) -> float:
        """Calculate gamma (rate of change of delta)."""
        flag = 'c' if option_type.lower() == 'call' else 'p'
        return bs_gamma(flag, S, K, T, r, sigma)
    
    def theta(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float
    ) -> float:
        """Calculate theta (time decay)."""
        flag = 'c' if option_type.lower() == 'call' else 'p'
        return bs_theta(flag, S, K, T, r, sigma)
    
    def vega(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float
    ) -> float:
        """Calculate vega (volatility sensitivity)."""
        flag = 'c' if option_type.lower() == 'call' else 'p'
        return bs_vega(flag, S, K, T, r, sigma)
    
    def rho(
        self,
        option_type: Literal['call', 'put'],
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float
    ) -> float:
        """Calculate rho (interest rate sensitivity)."""
        flag = 'c' if option_type.lower() == 'call' else 'p'
        return bs_rho(flag, S, K, T, r, sigma)
