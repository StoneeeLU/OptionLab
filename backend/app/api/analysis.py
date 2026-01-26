"""Analysis endpoints router."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class SingleOptionRequest(BaseModel):
    """Request for single option analysis."""
    symbol: str
    strike: float
    expiry: str
    option_type: str


class CombinationRequest(BaseModel):
    """Request for combination analysis."""
    legs: List[dict]


@router.post("/single")
async def analyze_single_option(request: SingleOptionRequest):
    """
    Analyze a single option.
    
    Stub endpoint - returns mock response.
    """
    return {
        "message": "Analysis stub",
        "symbol": request.symbol,
        "strike": request.strike
    }


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
