"""Options data router - Full implementation."""
from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List
from app.services.providers.base import DataProvider
from app.services.cache.cached_provider import CachedDataProvider
from app.services.providers.yfinance_provider import YFinanceProvider
from app.models.chain import OptionChain
from app.models.option import Option

router = APIRouter(prefix="/api/options", tags=["options"])


def get_data_provider() -> DataProvider:
    """Get cached data provider instance."""
    base_provider = YFinanceProvider()
    return CachedDataProvider(base_provider)


@router.get("/{symbol}/chain", response_model=OptionChain)
async def get_option_chain(
    symbol: str,
    expiry: Optional[str] = Query(None, description="Expiration date (YYYY-MM-DD)"),
    moneyness: Optional[str] = Query(None, description="Filter: otm, atm, itm"),
    min_volume: Optional[int] = Query(None, description="Minimum volume"),
    min_oi: Optional[int] = Query(None, description="Minimum open interest"),
    provider: DataProvider = Depends(get_data_provider)
):
    """
    Get options chain for a symbol with optional filtering.
    
    Args:
        symbol: Stock symbol (e.g., AAPL)
        expiry: Filter by specific expiration date
        moneyness: Filter by moneyness (otm/atm/itm)
        min_volume: Minimum volume filter
        min_oi: Minimum open interest filter
    
    Returns:
        OptionChain with filtered options
    
    Raises:
        HTTPException 404: Symbol not found or no options available
        HTTPException 400: Invalid filters
    """
    try:
        # Get full option chain
        chain = provider.get_option_chain(symbol)
        
        if not chain.options:
            raise HTTPException(
                status_code=404,
                detail=f"No options found for symbol {symbol}"
            )
        
        # Apply filters
        filtered_options = chain.options
        
        # Filter by expiry
        if expiry:
            filtered_options = [opt for opt in filtered_options if opt.expiry == expiry]
        
        # Filter by moneyness
        if moneyness:
            moneyness = moneyness.lower()
            if moneyness not in ["otm", "atm", "itm"]:
                raise HTTPException(
                    status_code=400,
                    detail="moneyness must be one of: otm, atm, itm"
                )
            
            spot = chain.spot_price
            filtered_options = [
                opt for opt in filtered_options
                if _check_moneyness(opt, spot, moneyness)
            ]
        
        # Filter by volume
        if min_volume is not None:
            filtered_options = [
                opt for opt in filtered_options
                if opt.volume and opt.volume >= min_volume
            ]
        
        # Filter by open interest
        if min_oi is not None:
            filtered_options = [
                opt for opt in filtered_options
                if opt.open_interest and opt.open_interest >= min_oi
            ]
        
        # Sort by strike price
        filtered_options.sort(key=lambda x: x.strike)
        
        return OptionChain(
            underlying=chain.underlying,
            spot_price=chain.spot_price,
            options=filtered_options,
            expiration_dates=chain.expiration_dates
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching option chain: {str(e)}"
        )


def _check_moneyness(option: Option, spot: float, moneyness: str) -> bool:
    """Check if option matches moneyness filter."""
    is_call = option.option_type == "call"
    strike = option.strike
    
    # ATM: within 2% of spot
    if moneyness == "atm":
        return abs(strike - spot) / spot <= 0.02
    
    # ITM: strike < spot for calls, strike > spot for puts
    if moneyness == "itm":
        return (strike < spot) if is_call else (strike > spot)
    
    # OTM: strike > spot for calls, strike < spot for puts
    if moneyness == "otm":
        return (strike > spot) if is_call else (strike < spot)
    
    return True
