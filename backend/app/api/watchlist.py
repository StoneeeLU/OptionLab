"""Watchlist router."""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


class WatchlistItem(BaseModel):
    """Watchlist item."""
    symbol: str


@router.get("")
async def get_watchlist():
    """
    Get user's watchlist.
    
    Stub endpoint - returns empty list.
    """
    return []


@router.post("")
async def add_to_watchlist(item: WatchlistItem):
    """
    Add symbol to watchlist.
    
    Stub endpoint.
    """
    return {"message": "Added to watchlist", "symbol": item.symbol}
