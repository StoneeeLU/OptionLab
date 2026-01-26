"""Performance optimization middleware for OptionLab backend."""
from fastapi import Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.gzip import GZipMiddleware
import time
import logging

logger = logging.getLogger(__name__)


class TimingMiddleware(BaseHTTPMiddleware):
    """Log request timing for performance monitoring."""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log slow requests (>1s)
        if process_time > 1.0:
            logger.warning(
                f"Slow request: {request.method} {request.url.path} took {process_time:.2f}s"
            )
        else:
            logger.info(
                f"{request.method} {request.url.path} completed in {process_time:.3f}s"
            )
        
        # Add timing header
        response.headers["X-Process-Time"] = str(process_time)
        return response


class CacheHeadersMiddleware(BaseHTTPMiddleware):
    """Add caching headers for static responses."""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Cache static API responses
        if request.url.path.startswith("/api/"):
            # Options chain data: 5 minutes
            if "/chain" in request.url.path:
                response.headers["Cache-Control"] = "public, max-age=300"
            # Volatility surface: 5 minutes
            elif "/volatility-surface" in request.url.path:
                response.headers["Cache-Control"] = "public, max-age=300"
            # Analysis endpoints: no cache (dynamic)
            elif "/analysis/" in request.url.path:
                response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            # History: 1 hour
            elif "/history" in request.url.path:
                response.headers["Cache-Control"] = "public, max-age=3600"
        
        return response


def add_performance_middleware(app):
    """Add all performance middleware to FastAPI app."""
    # GZip compression for responses >1KB
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Request timing
    app.add_middleware(TimingMiddleware)
    
    # Cache headers
    app.add_middleware(CacheHeadersMiddleware)
    
    logger.info("Performance middleware added: GZip, Timing, Cache Headers")
