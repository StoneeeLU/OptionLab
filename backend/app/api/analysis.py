"""Analysis endpoints router."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date, datetime
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


class VolatilitySurfaceRequest(BaseModel):
    """Request for volatility surface data."""
    
    options: List[dict] = Field(..., description="List of options for surface")
    spot_price: float = Field(..., gt=0, description="Current underlying price")
    min_strike: Optional[float] = Field(None, description="Minimum strike to include")
    max_strike: Optional[float] = Field(None, description="Maximum strike to include")


class VolatilitySurfaceResponse(BaseModel):
    """Response containing volatility surface data."""
    
    surface_data: List[List[float]] = Field(..., description="3D data points [strike, days, iv]")
    strikes: List[float] = Field(..., description="Unique strike prices")
    expiries: List[str] = Field(..., description="Unique expiration dates")
    days_to_expiry: List[int] = Field(..., description="Days to expiry for each expiration")


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


@router.post("/volatility-surface", response_model=VolatilitySurfaceResponse)
async def get_volatility_surface(request: VolatilitySurfaceRequest):
    """
    Get volatility surface data for 3D visualization.
    
    Returns grid data of IV across strikes and expirations.
    Suitable for ECharts 3D surface chart.
    
    Args:
        request: Surface request with options list and filters
        
    Returns:
        VolatilitySurfaceResponse: 3D surface data
    """
    try:
        surface_data = []
        strikes_set = set()
        expiries_dict = {}  # expiry_str -> days_to_expiry
        
        now = datetime.now().date()
        
        for opt_dict in request.options:
            # Skip if missing IV
            if opt_dict.get("implied_volatility") is None:
                continue
            
            strike = opt_dict["strike"]
            expiry_str = opt_dict["expiry"]
            iv = opt_dict["implied_volatility"]
            
            # Apply strike filter if provided
            if request.min_strike is not None and strike < request.min_strike:
                continue
            if request.max_strike is not None and strike > request.max_strike:
                continue
            
            # Calculate days to expiry
            if isinstance(expiry_str, str):
                expiry_date = datetime.fromisoformat(expiry_str).date()
            else:
                expiry_date = expiry_str
            
            days_to_expiry = (expiry_date - now).days
            
            # Add data point: [strike, days, iv]
            surface_data.append([strike, days_to_expiry, iv])
            
            # Track unique strikes and expiries
            strikes_set.add(strike)
            if expiry_str not in expiries_dict:
                expiries_dict[expiry_str] = days_to_expiry
        
        # Sort strikes
        strikes = sorted(list(strikes_set))
        
        # Sort expiries by date
        expiries_sorted = sorted(expiries_dict.items(), key=lambda x: x[1])
        expiries = [e[0] for e in expiries_sorted]
        days_to_expiry_list = [e[1] for e in expiries_sorted]
        
        return VolatilitySurfaceResponse(
            surface_data=surface_data,
            strikes=strikes,
            expiries=expiries,
            days_to_expiry=days_to_expiry_list
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Surface calculation failed: {str(e)}"
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


