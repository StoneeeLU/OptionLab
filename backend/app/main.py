"""QuantLab FastAPI Main Application."""
from fastapi import FastAPI

app = FastAPI(
    title="QuantLab API",
    description="Options Analysis and Valuation Platform",
    version="0.1.0",
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
