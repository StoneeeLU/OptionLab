"""Analysis endpoints router."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date
from app.models.option import Option
from app.models.analysis import OptionAnalysis
from app.services.analysis.option_analyzer import OptionAnalyzer

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

# Initialize analyzer (singleton pattern)
_analyzer = OptionAnalyzer()


class SingleOptionAnalysisRequest(BaseModel):
    """Request for single option analysis."""
    
    # Option details
    symbol: str = Field(..., description="Option symbol")
    underlying_symbol: str = Field(..., description="Underlying symbol")
    strike: float = Field(..., gt=0, description="Strike price")
    expiry: date = Field(..., description="Expiration date")
    option_type: Literal["call", "put"] = Field(..., description="Call or Put")
    exercise_style: Literal["american", "european"] = Field(default="american")
    
    # Market data
    bid: Optional[float] = Field(None, ge=0)
    ask: Optional[float] = Field(None, ge=0)
    last: Optional[float] = Field(None, ge=0)
    volume: Optional[int] = Field(None, ge=0)
    open_interest: Optional[int] = Field(None, ge=0)
    implied_volatility: Optional[float] = Field(None, ge=0, le=10)
    
    # Analysis parameters
    spot_price: float = Field(..., gt=0, description="Current underlying price")
    risk_free_rate: float = Field(default=0.05, description="Risk-free rate (annual)")
    
    # Historical data (optional)
    historical_prices: Optional[List[float]] = Field(
        None, 
        description="Historical prices for HV calculation"
    )
    historical_ivs: Optional[List[float]] = Field(
        None,
        description="Historical IVs for percentile"
    )


class CombinationRequest(BaseModel):
    """Request for combination analysis."""
    legs: List[dict]


@router.post("/single", response_model=OptionAnalysis)
async def analyze_single_option(request: SingleOptionAnalysisRequest):
    """
    Analyze a single option.
    
    Performs comprehensive analysis including:
    - Theoretical pricing (Black-Scholes or Binomial)
    - Greeks calculation
    - Historical volatility
    - IV percentile
    - Mispricing detection
    - Valuation assessment
    
    Returns:
        OptionAnalysis: Complete analysis result
    """
    try:
        # Create Option model from request
        option = Option(
            symbol=request.symbol,
            underlying_symbol=request.underlying_symbol,
            strike=request.strike,
            expiry=request.expiry,
            option_type=request.option_type,
            exercise_style=request.exercise_style,
            bid=request.bid,
            ask=request.ask,
            last=request.last,
            volume=request.volume,
            open_interest=request.open_interest,
            implied_volatility=request.implied_volatility
        )
        
        # Use provided historical prices or generate default
        historical_prices = request.historical_prices
        if historical_prices is None:
            # Generate 30 days of constant prices as default
            historical_prices = [request.spot_price] * 30
        
        # Perform analysis
        analysis = _analyzer.analyze(
            option=option,
            spot_price=request.spot_price,
            risk_free_rate=request.risk_free_rate,
            historical_prices=historical_prices,
            historical_ivs=request.historical_ivs
        )
        
        return analysis
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/combination")
async def analyze_combination(request: CombinationRequest):
    """
    Analyze option combination/strategy.
    
    Stub endpoint - returns mock response.
    """
    return {
        "message": "Combination analysis stub",
        "legs_count": len(request.legs)
    }

