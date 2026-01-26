"""Strategy models - multi-leg option combinations."""
from typing import List, Optional
from pydantic import BaseModel, Field
from .option import Option
from .greeks import Greeks


class OptionLeg(BaseModel):
    """Single leg of an option strategy."""
    
    option: Option = Field(..., description="The option contract")
    quantity: int = Field(..., description="Quantity (positive=long, negative=short)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "option": {
                    "symbol": "AAPL",
                    "strike": 150.0,
                    "expiry": "2024-12-20",
                    "option_type": "call"
                },
                "quantity": 1
            }
        }


class Strategy(BaseModel):
    """Multi-leg option strategy."""
    
    name: str = Field(..., description="Strategy name (e.g., Straddle, Iron Condor)")
    legs: List[OptionLeg] = Field(..., description="Individual option legs")
    combined_greeks: Greeks = Field(..., description="Net Greeks for the strategy")
    max_profit: Optional[float] = Field(None, description="Maximum profit (None if unlimited)")
    max_loss: Optional[float] = Field(None, description="Maximum loss (None if unlimited)")
    breakevens: List[float] = Field(default_factory=list, description="Breakeven prices")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Straddle",
                "legs": [
                    {"option": {"symbol": "AAPL", "strike": 150.0, "option_type": "call"}, "quantity": 1},
                    {"option": {"symbol": "AAPL", "strike": 150.0, "option_type": "put"}, "quantity": 1}
                ],
                "combined_greeks": {
                    "delta": 0.0,
                    "gamma": 0.04,
                    "theta": -0.10,
                    "vega": 0.30,
                    "rho": 0.0
                },
                "max_profit": None,
                "max_loss": 10.20,
                "breakevens": [139.80, 160.20]
            }
        }
