"""QuantLab FastAPI Main Application."""
from fastapi import FastAPI
from app.api import health, options, analysis, watchlist

app = FastAPI(
    title="QuantLab API",
    description="Options Analysis and Valuation Platform",
    version="0.1.0",
)

# Include routers
app.include_router(health.router)
app.include_router(options.router)
app.include_router(analysis.router)
app.include_router(watchlist.router)
