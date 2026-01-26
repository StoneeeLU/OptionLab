"""Combination Greeks calculator for multi-leg option strategies."""
from datetime import date
from typing import List
from app.models.greeks import Greeks
from app.models.strategy import OptionLeg
from app.services.pricing.greeks import GreeksCalculator


class CombinationCalculator:
    """Calculate combined Greeks and net premium for multi-leg strategies."""
    
    def __init__(self):
        self.greeks_calc = GreeksCalculator()
    
    def combined_greeks(
        self,
        legs: List[OptionLeg],
        spot: float,
        risk_free_rate: float,
        sigma: float
    ) -> Greeks:
        """
        Calculate combined Greeks for a multi-leg position.
        
        Args:
            legs: List of option legs with quantities
            spot: Current spot price of underlying
            risk_free_rate: Annual risk-free rate
            sigma: Volatility of underlying
            
        Returns:
            Combined Greeks summed across all legs
        """
        # Initialize zero Greeks
        total_delta = 0.0
        total_gamma = 0.0
        total_theta = 0.0
        total_vega = 0.0
        total_rho = 0.0
        
        # Sum Greeks across all legs
        for leg in legs:
            # Calculate time to expiry in years
            time_to_expiry = (leg.option.expiry - date.today()).days / 365.0
            
            # Handle edge case: expired or near-expiry options
            if time_to_expiry <= 0:
                continue
            
            # Get Greeks for single option
            single_greeks = self.greeks_calc.calculate_all(
                option_type=leg.option.option_type,
                S=spot,
                K=leg.option.strike,
                T=time_to_expiry,
                r=risk_free_rate,
                sigma=sigma
            )
            
            # Multiply by quantity (handles +/- automatically)
            total_delta += single_greeks.delta * leg.quantity
            total_gamma += single_greeks.gamma * leg.quantity
            total_theta += single_greeks.theta * leg.quantity
            total_vega += single_greeks.vega * leg.quantity
            total_rho += single_greeks.rho * leg.quantity
        
        return Greeks(
            delta=total_delta,
            gamma=total_gamma,
            theta=total_theta,
            vega=total_vega,
            rho=total_rho
        )
    
    def net_premium(self, legs: List[OptionLeg]) -> float:
        """
        Calculate net premium (debit/credit) for a combination.
        
        Convention:
        - Negative value = debit (money paid out)
        - Positive value = credit (money received)
        
        For long positions (quantity > 0): pay ask price (or last)
        For short positions (quantity < 0): receive bid price (or last)
        
        Args:
            legs: List of option legs with quantities
            
        Returns:
            Net premium (negative = debit, positive = credit)
        """
        total_premium = 0.0
        
        for leg in legs:
            # Determine price to use
            if leg.quantity > 0:
                # Long position: pay ask (or last as fallback)
                price = leg.option.ask if leg.option.ask is not None else leg.option.last
                if price is None:
                    price = 0.0
                cost = -price * abs(leg.quantity)  # Negative = debit
            else:
                # Short position: receive bid (or last as fallback)
                price = leg.option.bid if leg.option.bid is not None else leg.option.last
                if price is None:
                    price = 0.0
                cost = price * abs(leg.quantity)  # Positive = credit
            
            total_premium += cost
        
        return total_premium
