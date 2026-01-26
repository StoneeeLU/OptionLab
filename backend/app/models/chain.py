"""Option chain model - collection of options for an underlying."""
from datetime import date
from typing import List
from pydantic import BaseModel, Field
from .option import Option


class OptionChain(BaseModel):
    """Collection of options for an underlying symbol."""
    
    underlying: str = Field(..., description="Underlying symbol")
    spot_price: float = Field(..., gt=0, description="Current price of underlying")
    options: List[Option] = Field(default_factory=list, description="List of option contracts")
    expiration_dates: List[date] = Field(default_factory=list, description="Available expiration dates")
    
    class Config:
        json_schema_extra = {
            "example": {
                "underlying": "AAPL",
                "spot_price": 148.50,
                "options": [
                    {
                        "symbol": "AAPL",
                        "strike": 150.0,
                        "expiry": "2024-12-20",
                        "option_type": "call",
                        "bid": 5.10,
                        "ask": 5.30
                    }
                ],
                "expiration_dates": ["2024-12-20", "2025-01-17"]
            }
        }
