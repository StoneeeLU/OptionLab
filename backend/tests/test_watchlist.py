"""Tests for watchlist API endpoints."""
import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.models.watchlist import Base, WatchlistItem
from app.services.watchlist_service import get_db

# Use in-memory database for tests
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    """Override database dependency for testing."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test and drop after."""
    Base.metadata.create_all(bind=test_engine)
    # Override dependency
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()


def test_create_stock_item():
    """Test creating a stock watchlist item."""
    response = client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "stock",
        "notes": "My favorite stock"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert data["item_type"] == "stock"
    assert data["notes"] == "My favorite stock"
    assert "id" in data
    assert "created_at" in data


def test_create_option_item():
    """Test creating an option watchlist item."""
    response = client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "option",
        "strike": 150.0,
        "expiry": "2024-01-19",
        "option_type": "call",
        "notes": "Bullish play"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert data["item_type"] == "option"
    assert data["strike"] == 150.0
    assert data["expiry"] == "2024-01-19"
    assert data["option_type"] == "call"


def test_create_option_missing_fields():
    """Test that creating option without required fields fails."""
    response = client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "option",
        "notes": "Missing fields"
    })
    assert response.status_code == 400
    assert "must have strike" in response.json()["error"]["message"]


def test_create_option_invalid_type():
    """Test that invalid option_type fails."""
    response = client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "option",
        "strike": 150.0,
        "expiry": "2024-01-19",
        "option_type": "invalid"
    })
    assert response.status_code == 400


def test_get_all_items():
    """Test getting all watchlist items."""
    # Create two items
    client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "stock"
    })
    client.post("/api/watchlist", json={
        "symbol": "TSLA",
        "item_type": "stock"
    })
    
    response = client.get("/api/watchlist")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Should be ordered by created_at desc (newest first)
    assert data[0]["symbol"] == "TSLA"
    assert data[1]["symbol"] == "AAPL"


def test_get_item_by_id():
    """Test getting a specific item by ID."""
    # Create an item
    create_response = client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "stock",
        "notes": "Test note"
    })
    item_id = create_response.json()["id"]
    
    # Get the item
    response = client.get(f"/api/watchlist/{item_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == item_id
    assert data["symbol"] == "AAPL"
    assert data["notes"] == "Test note"


def test_get_item_not_found():
    """Test getting non-existent item returns 404."""
    response = client.get("/api/watchlist/999")
    assert response.status_code == 404


def test_get_items_by_symbol():
    """Test getting all items for a specific symbol."""
    # Create items for different symbols
    client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "stock"
    })
    client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "option",
        "strike": 150.0,
        "expiry": "2024-01-19",
        "option_type": "call"
    })
    client.post("/api/watchlist", json={
        "symbol": "TSLA",
        "item_type": "stock"
    })
    
    response = client.get("/api/watchlist/symbol/AAPL")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(item["symbol"] == "AAPL" for item in data)


def test_update_notes():
    """Test updating notes for an item."""
    # Create an item
    create_response = client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "stock",
        "notes": "Old note"
    })
    item_id = create_response.json()["id"]
    
    # Update notes
    response = client.put(f"/api/watchlist/{item_id}/notes?notes=New note")
    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == "New note"


def test_soft_delete():
    """Test soft deleting an item."""
    # Create an item
    create_response = client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "stock"
    })
    item_id = create_response.json()["id"]
    
    # Soft delete
    response = client.delete(f"/api/watchlist/{item_id}")
    assert response.status_code == 200
    assert response.json()["permanent"] == False
    
    # Item should not appear in normal get
    all_items = client.get("/api/watchlist").json()
    assert len(all_items) == 0
    
    # But should appear with include_inactive
    all_items_with_inactive = client.get("/api/watchlist?include_inactive=true").json()
    assert len(all_items_with_inactive) == 1


def test_permanent_delete():
    """Test permanently deleting an item."""
    # Create an item
    create_response = client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "stock"
    })
    item_id = create_response.json()["id"]
    
    # Permanent delete
    response = client.delete(f"/api/watchlist/{item_id}?permanent=true")
    assert response.status_code == 200
    assert response.json()["permanent"] == True
    
    # Item should not exist even with include_inactive
    all_items = client.get("/api/watchlist?include_inactive=true").json()
    assert len(all_items) == 0


def test_clear_watchlist():
    """Test clearing all items from watchlist."""
    # Create multiple items
    client.post("/api/watchlist", json={"symbol": "AAPL", "item_type": "stock"})
    client.post("/api/watchlist", json={"symbol": "TSLA", "item_type": "stock"})
    client.post("/api/watchlist", json={"symbol": "MSFT", "item_type": "stock"})
    
    # Clear all
    response = client.post("/api/watchlist/clear")
    assert response.status_code == 200
    assert response.json()["count"] == 3
    
    # Should be empty
    all_items = client.get("/api/watchlist").json()
    assert len(all_items) == 0


def test_persistence_across_requests():
    """Test that watchlist items persist across requests (SQLite storage)."""
    # Create an item
    create_response = client.post("/api/watchlist", json={
        "symbol": "AAPL",
        "item_type": "stock",
        "notes": "Persistent note"
    })
    item_id = create_response.json()["id"]
    
    # Get in a different request
    get_response = client.get(f"/api/watchlist/{item_id}")
    assert get_response.status_code == 200
    assert get_response.json()["notes"] == "Persistent note"
    
    # Get in all items list
    all_items = client.get("/api/watchlist").json()
    assert len(all_items) == 1
    assert all_items[0]["id"] == item_id
