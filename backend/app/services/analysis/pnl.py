"""P&L diagram calculator for option strategies."""
from typing import List, Optional, Tuple
from dataclasses import dataclass
from app.models.strategy import OptionLeg


@dataclass
class PnLPoint:
    """Single point on P&L diagram."""
    price: float
    pnl: float


@dataclass
class PnLResult:
    """Complete P&L analysis result."""
    pnl_data: List[PnLPoint]
    max_profit: Optional[float]
    max_loss: Optional[float]
    breakevens: List[float]


class PnLCalculator:
    """Calculate profit/loss diagrams for option strategies at expiration."""
    
    def calculate_pnl(
        self,
        legs: List[OptionLeg],
        price_range: Tuple[float, float],
        points: int = 100
    ) -> PnLResult:
        """
        Calculate P&L at expiration for a strategy across price range.
        
        Args:
            legs: Option legs in the strategy
            price_range: (min_price, max_price) to calculate
            points: Number of price points to calculate
            
        Returns:
            PnLResult with P&L data, max profit/loss, and breakevens
        """
        if not legs:
            # Empty strategy
            prices = [price_range[0] + i * (price_range[1] - price_range[0]) / (points - 1) 
                     for i in range(points)]
            return PnLResult(
                pnl_data=[PnLPoint(price=p, pnl=0.0) for p in prices],
                max_profit=0.0,
                max_loss=0.0,
                breakevens=[]
            )
        
        # Generate price points
        min_price, max_price = price_range
        step = (max_price - min_price) / (points - 1)
        prices = [min_price + i * step for i in range(points)]
        
        # Calculate P&L at each price
        pnl_data: List[PnLPoint] = []
        for price in prices:
            pnl = self._calculate_pnl_at_price(legs, price)
            pnl_data.append(PnLPoint(price=price, pnl=pnl))
        
        # Find max profit and loss
        pnl_values = [p.pnl for p in pnl_data]
        max_pnl = max(pnl_values)
        min_pnl = min(pnl_values)
        
        # Check if profit/loss is unlimited
        max_profit = self._check_unlimited_profit(legs, max_pnl, max_price)
        max_loss = self._check_unlimited_loss(legs, min_pnl, min_price)
        
        # Find breakeven points
        breakevens = self._find_breakevens(pnl_data)
        
        return PnLResult(
            pnl_data=pnl_data,
            max_profit=max_profit,
            max_loss=max_loss,
            breakevens=breakevens
        )
    
    def _calculate_pnl_at_price(self, legs: List[OptionLeg], price: float) -> float:
        """Calculate total P&L at a specific underlying price at expiration."""
        total_pnl = 0.0
        
        for leg in legs:
            # Calculate intrinsic value at expiration
            if leg.option.option_type == "call":
                intrinsic = max(0, price - leg.option.strike)
            else:  # put
                intrinsic = max(0, leg.option.strike - price)
            
            # Determine premium paid/received
            if leg.quantity > 0:
                # Long: pay ask (or last)
                premium = leg.option.ask if leg.option.ask is not None else leg.option.last
                if premium is None:
                    premium = 0.0
                cost = -premium * abs(leg.quantity)
            else:
                # Short: receive bid (or last)
                premium = leg.option.bid if leg.option.bid is not None else leg.option.last
                if premium is None:
                    premium = 0.0
                cost = premium * abs(leg.quantity)
            
            # P&L for this leg = intrinsic value * quantity + premium paid/received
            if leg.quantity > 0:
                # Long: profit from intrinsic, minus premium paid
                leg_pnl = (intrinsic * leg.quantity) + cost
            else:
                # Short: loss from intrinsic, plus premium received
                leg_pnl = (-intrinsic * abs(leg.quantity)) + cost
            
            total_pnl += leg_pnl
        
        return total_pnl
    
    def _check_unlimited_profit(
        self,
        legs: List[OptionLeg],
        max_pnl: float,
        max_price: float
    ) -> Optional[float]:
        """
        Check if profit is unlimited. Returns None if unlimited, else max profit.
        
        Profit is unlimited if there's a net long call position.
        """
        net_calls = sum(leg.quantity for leg in legs if leg.option.option_type == "call")
        
        if net_calls > 0:
            return None  # Unlimited profit
        
        return max_pnl
    
    def _check_unlimited_loss(
        self,
        legs: List[OptionLeg],
        min_pnl: float,
        min_price: float
    ) -> Optional[float]:
        """
        Check if loss is unlimited. Returns None if unlimited, else max loss.
        
        Loss is unlimited if there's a net short call position.
        """
        net_calls = sum(leg.quantity for leg in legs if leg.option.option_type == "call")
        
        if net_calls < 0:
            return None  # Unlimited loss
        
        return min_pnl
    
    def _find_breakevens(self, pnl_data: List[PnLPoint]) -> List[float]:
        """
        Find breakeven points where P&L crosses zero.
        
        Returns list of prices where P&L ≈ 0.
        """
        breakevens: List[float] = []
        
        for i in range(len(pnl_data) - 1):
            current = pnl_data[i]
            next_point = pnl_data[i + 1]
            
            # Check for exact zero
            if abs(current.pnl) < 1e-10:
                # Add if not duplicate
                if not breakevens or abs(current.price - breakevens[-1]) > 0.01:
                    breakevens.append(current.price)
                continue
            
            # Check if P&L crosses zero between these points (sign change)
            if (current.pnl < 0 and next_point.pnl > 0) or \
               (current.pnl > 0 and next_point.pnl < 0):
                # Linear interpolation to find exact breakeven
                if abs(next_point.pnl - current.pnl) > 1e-10:
                    # Interpolate
                    ratio = abs(current.pnl) / abs(next_point.pnl - current.pnl)
                    breakeven = current.price + ratio * (next_point.price - current.price)
                    # Add if not duplicate
                    if not breakevens or abs(breakeven - breakevens[-1]) > 0.01:
                        breakevens.append(breakeven)
        
        return breakevens
