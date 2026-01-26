"""Greeks model - option sensitivities."""
from pydantic import BaseModel, Field


class Greeks(BaseModel):
    """Option Greeks - sensitivities to various factors."""
    
    delta: float = Field(..., description="Price sensitivity to underlying (0-1 for calls, -1-0 for puts)")
    gamma: float = Field(..., description="Rate of change of delta")
    theta: float = Field(..., description="Time decay (typically negative)")
    vega: float = Field(..., description="Volatility sensitivity")
    rho: float = Field(..., description="Interest rate sensitivity")
    
    class Config:
        json_schema_extra = {
            "example": {
                "delta": 0.5,
                "gamma": 0.02,
                "theta": -0.05,
                "vega": 0.15,
                "rho": 0.03
            }
        }
