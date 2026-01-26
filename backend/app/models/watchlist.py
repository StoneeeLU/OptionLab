"""Watchlist model for persisting user-saved symbols and options."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class WatchlistItem(Base):
    """SQLAlchemy model for watchlist items."""
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    symbol = Column(String, nullable=False, index=True)
    item_type = Column(String, nullable=False)  # "stock" or "option"
    
    # Option-specific fields (null for stocks)
    strike = Column(Integer, nullable=True)
    expiry = Column(String, nullable=True)
    option_type = Column(String, nullable=True)  # "call" or "put"
    
    # Metadata
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    def __repr__(self):
        if self.item_type == "stock":
            return f"<WatchlistItem(symbol={self.symbol})>"
        else:
            return f"<WatchlistItem(symbol={self.symbol} ${self.strike} {self.option_type} {self.expiry})>"


class WatchlistItemCreate(BaseModel):
    """Schema for creating a new watchlist item."""
    symbol: str = Field(..., description="Stock symbol (e.g., AAPL)")
    item_type: str = Field(..., description="Type: 'stock' or 'option'")
    
    # Optional fields for options
    strike: Optional[float] = Field(None, description="Strike price (for options)")
    expiry: Optional[str] = Field(None, description="Expiry date (for options)")
    option_type: Optional[str] = Field(None, description="'call' or 'put' (for options)")
    notes: Optional[str] = Field(None, description="User notes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "symbol": "AAPL",
                "item_type": "option",
                "strike": 150.0,
                "expiry": "2024-01-19",
                "option_type": "call",
                "notes": "Bullish play"
            }
        }


class WatchlistItemResponse(BaseModel):
    """Schema for watchlist item response."""
    id: int
    symbol: str
    item_type: str
    strike: Optional[float] = None
    expiry: Optional[str] = None
    option_type: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True
