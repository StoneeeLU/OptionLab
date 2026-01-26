"""Option model - represents a single option contract."""
from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


class Option(BaseModel):
    """Represents a single option contract."""
    
    symbol: str = Field(..., description="Underlying symbol (e.g., AAPL)")
    strike: float = Field(..., gt=0, description="Strike price")
    expiry: date = Field(..., description="Expiration date")
    option_type: Literal["call", "put"] = Field(..., description="Call or Put")
    bid: Optional[float] = Field(None, ge=0, description="Bid price")
    ask: Optional[float] = Field(None, ge=0, description="Ask price")
    last: Optional[float] = Field(None, ge=0, description="Last traded price")
    volume: Optional[int] = Field(None, ge=0, description="Trading volume")
    open_interest: Optional[int] = Field(None, ge=0, description="Open interest")
    implied_volatility: Optional[float] = Field(None, ge=0, le=10, description="Implied volatility")
    exercise_style: Literal["american", "european"] = Field(default="american", description="Exercise style")
    
    @field_validator("option_type")
    @classmethod
    def validate_option_type(cls, v: str) -> str:
        """Ensure option_type is lowercase."""
        return v.lower()
    
    class Config:
        json_schema_extra = {
            "example": {
                "symbol": "AAPL",
                "strike": 150.0,
                "expiry": "2024-12-20",
                "option_type": "call",
                "bid": 5.10,
                "ask": 5.30,
                "last": 5.20,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.25,
                "exercise_style": "american"
            }
        }
