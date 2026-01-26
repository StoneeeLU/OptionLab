"""Watchlist router - Full CRUD operations for managing user watchlist."""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.watchlist import WatchlistItemCreate, WatchlistItemResponse
from app.services.watchlist_service import WatchlistService, get_db

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


def get_watchlist_service(db: Session = Depends(get_db)) -> WatchlistService:
    """Dependency to get watchlist service."""
    return WatchlistService(db)


@router.get("", response_model=List[WatchlistItemResponse])
async def get_all_watchlist_items(
    include_inactive: bool = False,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """
    Get all watchlist items.
    
    Args:
        include_inactive: Include soft-deleted items (default: False)
    
    Returns:
        List of watchlist items ordered by creation date (newest first)
    """
    return service.get_all_items(include_inactive=include_inactive)


@router.post("", response_model=WatchlistItemResponse, status_code=201)
async def create_watchlist_item(
    item: WatchlistItemCreate,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """
    Add a new item to watchlist.
    
    Args:
        item: Watchlist item to create (stock or option)
    
    Returns:
        Created watchlist item with ID
    
    Raises:
        HTTPException 400: Invalid item data
    """
    try:
        return service.create_item(item)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{item_id}", response_model=WatchlistItemResponse)
async def get_watchlist_item(
    item_id: int,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """
    Get a specific watchlist item by ID.
    
    Args:
        item_id: Watchlist item ID
    
    Returns:
        Watchlist item
    
    Raises:
        HTTPException 404: Item not found
    """
    item = service.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Watchlist item {item_id} not found")
    return item


@router.get("/symbol/{symbol}", response_model=List[WatchlistItemResponse])
async def get_watchlist_by_symbol(
    symbol: str,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """
    Get all watchlist items for a specific symbol.
    
    Args:
        symbol: Stock symbol (e.g., AAPL)
    
    Returns:
        List of watchlist items for the symbol
    """
    return service.get_items_by_symbol(symbol)


@router.put("/{item_id}/notes", response_model=WatchlistItemResponse)
async def update_watchlist_notes(
    item_id: int,
    notes: str,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """
    Update notes for a watchlist item.
    
    Args:
        item_id: Watchlist item ID
        notes: New notes text
    
    Returns:
        Updated watchlist item
    
    Raises:
        HTTPException 404: Item not found
    """
    item = service.update_notes(item_id, notes)
    if not item:
        raise HTTPException(status_code=404, detail=f"Watchlist item {item_id} not found")
    return item


@router.delete("/{item_id}")
async def delete_watchlist_item(
    item_id: int,
    permanent: bool = False,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """
    Delete a watchlist item.
    
    Args:
        item_id: Watchlist item ID
        permanent: If True, permanently delete; if False, soft delete (default)
    
    Returns:
        Success message
    
    Raises:
        HTTPException 404: Item not found
    """
    if permanent:
        success = service.permanently_delete_item(item_id)
    else:
        success = service.delete_item(item_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Watchlist item {item_id} not found")
    
    return {"message": f"Watchlist item {item_id} deleted", "permanent": permanent}


@router.post("/clear")
async def clear_watchlist(
    service: WatchlistService = Depends(get_watchlist_service)
):
    """
    Clear all items from watchlist (soft delete).
    
    Returns:
        Count of items deleted
    """
    count = service.clear_all()
    return {"message": f"Cleared {count} items from watchlist", "count": count}
