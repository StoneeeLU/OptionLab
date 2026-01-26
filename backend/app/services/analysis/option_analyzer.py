"""Single option analyzer - integrates pricing, Greeks, and volatility."""
from typing import List, Optional, Literal
from datetime import datetime
from app.models.option import Option
from app.models.analysis import OptionAnalysis
from app.services.pricing.hybrid_pricer import HybridPricer
from app.services.pricing.greeks import GreeksCalculator
from app.services.analysis.volatility import VolatilityCalculator


class OptionAnalyzer:
    """Analyze single options with theoretical pricing and valuation.
    
    Integrates:
    - HybridPricer: Black-Scholes (European) / Binomial (American)
    - GreeksCalculator: Delta, Gamma, Theta, Vega, Rho
    - VolatilityCalculator: HV, IV Percentile, IV Rank
    """
    
    def __init__(self):
        self.pricer = HybridPricer()
        self.greeks_calculator = GreeksCalculator()
        self.volatility_calculator = VolatilityCalculator()
    
    def analyze(
        self,
        option: Option,
        spot_price: float,
        risk_free_rate: float,
        historical_prices: List[float],
        historical_ivs: Optional[List[float]] = None
    ) -> OptionAnalysis:
        """
        Perform comprehensive analysis of a single option.
        
        Args:
            option: Option to analyze
            spot_price: Current underlying price
            risk_free_rate: Risk-free rate (annual)
            historical_prices: Historical underlying prices for HV calculation
            historical_ivs: Historical IV values for percentile (optional)
            
        Returns:
            OptionAnalysis with theoretical price, Greeks, and valuation
        """
        # Calculate time to expiration in years
        now = datetime.now().date()
        time_delta = (option.expiry - now).days
        time_to_expiry = time_delta / 365.25
        
        # Ensure positive time to expiry
        if time_to_expiry <= 0:
            time_to_expiry = 0.001  # Nearly expired
        
        # 1. Calculate theoretical price using hybrid pricer
        theoretical_price = self.pricer.price(
            option_type=option.option_type,
            S=spot_price,
            K=option.strike,
            T=time_to_expiry,
            r=risk_free_rate,
            sigma=option.implied_volatility,
            exercise_style=option.exercise_style
        )
        
        # 2. Calculate Greeks
        greeks = self.greeks_calculator.calculate_all(
            option_type=option.option_type,
            S=spot_price,
            K=option.strike,
            T=time_to_expiry,
            r=risk_free_rate,
            sigma=option.implied_volatility
        )
        
        # 3. Calculate historical volatility
        hv = self.volatility_calculator.historical_volatility(
            prices=historical_prices,
            window=min(20, len(historical_prices) - 1)
        )
        
        # 4. Calculate IV percentile if historical IVs provided
        if historical_ivs:
            iv_percentile = self.volatility_calculator.iv_percentile(
                current_iv=option.implied_volatility,
                historical_ivs=historical_ivs
            )
        else:
            iv_percentile = 50.0  # Default to 50th percentile if no history
        
        # 5. Calculate mispricing
        # Use mid-price as market price
        market_price = (option.bid + option.ask) / 2 if option.bid and option.ask else option.last
        mispricing = market_price - theoretical_price
        
        # 6. Determine valuation assessment
        valuation = self._assess_valuation(mispricing, theoretical_price)
        
        return OptionAnalysis(
            option=option,
            theoretical_price=theoretical_price,
            market_price=market_price,
            greeks=greeks,
            historical_volatility=hv,
            iv_percentile=iv_percentile / 100.0,  # Convert to 0-1 range
            mispricing=mispricing,
            valuation=valuation
        )
    
    def _assess_valuation(
        self,
        mispricing: float,
        theoretical_price: float
    ) -> Literal["cheap", "fair", "expensive"]:
        """
        Assess whether option is cheap, fair, or expensive.
        
        Uses percentage mispricing threshold:
        - Cheap: market < theoretical - 5%
        - Expensive: market > theoretical + 5%
        - Fair: within ±5%
        
        Args:
            mispricing: market_price - theoretical_price
            theoretical_price: Theoretical fair value
            
        Returns:
            Valuation label
        """
        if theoretical_price == 0:
            return "fair"
        
        # Calculate percentage mispricing
        pct_mispricing = (mispricing / theoretical_price) * 100
        
        if pct_mispricing < -5:
            return "cheap"
        elif pct_mispricing > 5:
            return "expensive"
        else:
            return "fair"
