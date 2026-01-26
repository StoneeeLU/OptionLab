"""Options data router."""
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/options", tags=["options"])


@router.get("/{symbol}/chain")
async def get_option_chain(
    symbol: str,
    expiry: Optional[str] = Query(None, description="Expiration date (YYYY-MM-DD)"),
    moneyness: Optional[str] = Query(None, description="Filter: otm, atm, itm"),
    min_volume: Optional[int] = Query(None, description="Minimum volume"),
    min_oi: Optional[int] = Query(None, description="Minimum open interest")
):
    """
    Get options chain for a symbol.
    
    Stub endpoint - returns mock data.
    """
    return {
        "underlying": symbol,
        "spot_price": 150.0,
        "options": [],
        "expiration_dates": []
    }
