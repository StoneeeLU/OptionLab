"""Analysis models - option analysis results."""
from typing import Literal
from pydantic import BaseModel, Field
from .option import Option
from .greeks import Greeks


class OptionAnalysis(BaseModel):
    """Complete analysis of a single option."""
    
    option: Option = Field(..., description="The option being analyzed")
    greeks: Greeks = Field(..., description="Calculated Greeks")
    theoretical_price: float = Field(..., description="Theoretical fair value")
    market_price: float = Field(..., description="Current market price")
    iv_percentile: float = Field(..., ge=0, le=1, description="IV percentile (0-1)")
    historical_volatility: float = Field(..., ge=0, description="Historical volatility")
    mispricing: float = Field(..., description="Market price - theoretical price")
    valuation: Literal["cheap", "fair", "expensive"] = Field(..., description="Valuation assessment")
    
    class Config:
        json_schema_extra = {
            "example": {
                "option": {
                    "symbol": "AAPL",
                    "strike": 150.0,
                    "expiry": "2024-12-20",
                    "option_type": "call",
                    "bid": 5.10,
                    "ask": 5.30
                },
                "greeks": {
                    "delta": 0.5,
                    "gamma": 0.02,
                    "theta": -0.05,
                    "vega": 0.15,
                    "rho": 0.03
                },
                "theoretical_price": 5.25,
                "market_price": 5.20,
                "iv_percentile": 0.65,
                "historical_volatility": 0.20,
                "mispricing": -0.05,
                "valuation": "cheap"
            }
        }
