"""OptionLab FastAPI Main Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, options, analysis, watchlist, export, volatility
from app.core.error_handlers import setup_exception_handlers
from app.core.performance import add_performance_middleware
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title="OptionLab API",
    description="Options Analysis and Valuation Platform",
    version="0.1.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup error handlers
setup_exception_handlers(app)

# Add performance middleware (GZip, timing, cache headers)
add_performance_middleware(app)

# Include routers
app.include_router(health.router)
app.include_router(options.router)
app.include_router(analysis.router)
app.include_router(volatility.router)
app.include_router(watchlist.router)
app.include_router(export.router)
