"""Watchlist service for CRUD operations."""
from typing import List, Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.watchlist import Base, WatchlistItem, WatchlistItemCreate, WatchlistItemResponse
from app.core.config import get_settings

settings = get_settings()

# Create engine and session
# Convert simple path to SQLite URL if needed
db_url = settings.DATABASE_URL
if not db_url.startswith("sqlite"):
    db_url = f"sqlite:///{db_url}"

engine = create_engine(db_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_watchlist_db():
    """Initialize watchlist database tables. Call this once on app startup."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class WatchlistService:
    """Service for managing watchlist items."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_item(self, item: WatchlistItemCreate) -> WatchlistItemResponse:
        """Create a new watchlist item."""
        # Validate option fields
        if item.item_type == "option":
            if not all([item.strike, item.expiry, item.option_type]):
                raise ValueError("Options must have strike, expiry, and option_type")
            if item.option_type not in ["call", "put"]:
                raise ValueError("option_type must be 'call' or 'put'")
        
        # Create database item
        db_item = WatchlistItem(
            symbol=item.symbol.upper(),
            item_type=item.item_type,
            strike=item.strike,
            expiry=item.expiry,
            option_type=item.option_type,
            notes=item.notes
        )
        
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        
        return WatchlistItemResponse.model_validate(db_item)
    
    def get_all_items(self, include_inactive: bool = False) -> List[WatchlistItemResponse]:
        """Get all watchlist items."""
        query = self.db.query(WatchlistItem)
        if not include_inactive:
            query = query.filter(WatchlistItem.is_active == True)
        
        items = query.order_by(WatchlistItem.created_at.desc()).all()
        return [WatchlistItemResponse.model_validate(item) for item in items]
    
    def get_item_by_id(self, item_id: int) -> Optional[WatchlistItemResponse]:
        """Get a watchlist item by ID."""
        item = self.db.query(WatchlistItem).filter(WatchlistItem.id == item_id).first()
        if not item:
            return None
        return WatchlistItemResponse.model_validate(item)
    
    def get_items_by_symbol(self, symbol: str) -> List[WatchlistItemResponse]:
        """Get all watchlist items for a specific symbol."""
        items = self.db.query(WatchlistItem).filter(
            WatchlistItem.symbol == symbol.upper(),
            WatchlistItem.is_active == True
        ).all()
        return [WatchlistItemResponse.model_validate(item) for item in items]
    
    def update_notes(self, item_id: int, notes: str) -> Optional[WatchlistItemResponse]:
        """Update notes for a watchlist item."""
        item = self.db.query(WatchlistItem).filter(WatchlistItem.id == item_id).first()
        if not item:
            return None
        
        item.notes = notes
        self.db.commit()
        self.db.refresh(item)
        
        return WatchlistItemResponse.model_validate(item)
    
    def delete_item(self, item_id: int) -> bool:
        """Soft delete a watchlist item by setting is_active to False."""
        item = self.db.query(WatchlistItem).filter(WatchlistItem.id == item_id).first()
        if not item:
            return False
        
        item.is_active = False
        self.db.commit()
        return True
    
    def permanently_delete_item(self, item_id: int) -> bool:
        """Permanently delete a watchlist item."""
        item = self.db.query(WatchlistItem).filter(WatchlistItem.id == item_id).first()
        if not item:
            return False
        
        self.db.delete(item)
        self.db.commit()
        return True
    
    def clear_all(self) -> int:
        """Soft delete all watchlist items. Returns count of deleted items."""
        count = self.db.query(WatchlistItem).filter(WatchlistItem.is_active == True).update(
            {WatchlistItem.is_active: False}
        )
        self.db.commit()
        return count
