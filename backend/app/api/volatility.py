"""Volatility endpoints router."""
from fastapi import APIRouter, Depends, HTTPException
from app.api.analysis import (
    VolatilitySurfaceRequest,
    VolatilitySurfaceResponse,
    get_volatility_surface as analysis_get_volatility_surface,
)
from app.api.options import get_data_provider
from app.services.providers.base import DataProvider


router = APIRouter(prefix="/api/volatility", tags=["volatility"])


@router.get("/surface/{symbol}", response_model=VolatilitySurfaceResponse)
async def get_volatility_surface_for_symbol(
    symbol: str,
    provider: DataProvider = Depends(get_data_provider)
):
    """Get volatility surface for a symbol using existing analysis logic."""
    try:
        chain = provider.get_option_chain(symbol)

        if not chain.options:
            raise HTTPException(
                status_code=404,
                detail=f"No options found for symbol {symbol}"
            )

        request = VolatilitySurfaceRequest(
            options=[option.model_dump(mode="json") for option in chain.options],
            spot_price=chain.spot_price,
        )

        return await analysis_get_volatility_surface(request)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Surface retrieval failed: {str(exc)}"
        )
