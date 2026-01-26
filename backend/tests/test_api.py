"""Tests for API router structure."""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient


def test_health_router():
    """Test health endpoint."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_options_chain_stub():
    """Test options chain endpoint returns stub data."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/api/options/AAPL/chain")
    
    assert response.status_code == 200
    data = response.json()
    assert "underlying" in data
    assert data["underlying"] == "AAPL"


def test_analysis_single_stub():
    """Test single option analysis endpoint."""
    from app.main import app
    from datetime import datetime, timedelta
    
    client = TestClient(app)
    expiry = (datetime.now() + timedelta(days=365)).date().isoformat()
    
    response = client.post("/api/analysis/single", json={
        "symbol": "AAPL",
        "underlying_symbol": "AAPL",
        "strike": 150.0,
        "expiry": expiry,
        "option_type": "call",
        "exercise_style": "european",
        "bid": 8.0,
        "ask": 8.5,
        "last": 8.25,
        "volume": 1000,
        "open_interest": 5000,
        "implied_volatility": 0.25,
        "spot_price": 150.0,
        "risk_free_rate": 0.05
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "theoretical_price" in data
    assert "greeks" in data


def test_analysis_combination_stub():
    """Test combination analysis endpoint."""
    from app.main import app
    
    client = TestClient(app)
    response = client.post("/api/analysis/combination", json={
        "legs": [],
        "spot_price": 150.0,
        "risk_free_rate": 0.05,
        "volatility": 0.25
    })
    
    assert response.status_code == 200
    # Now returns full analysis, not stub
    assert "strategy_name" in response.json()


def test_watchlist_get_stub():
    """Test watchlist GET endpoint stub."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/api/watchlist")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_watchlist_post_stub():
    """Test watchlist POST endpoint stub."""
    from app.main import app
    
    client = TestClient(app)
    response = client.post("/api/watchlist", json={
        "symbol": "AAPL"
    })
    
    assert response.status_code == 200


def test_openapi_docs_available():
    """Test that OpenAPI docs are available."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/docs")
    
    assert response.status_code == 200


def test_openapi_spec():
    """Test that OpenAPI spec includes all routes."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/openapi.json")
    
    assert response.status_code == 200
    spec = response.json()
    
    # Check that our routes are defined
    assert "/health" in spec["paths"]
    assert "/api/options/{symbol}/chain" in spec["paths"]
    assert "/api/analysis/single" in spec["paths"]
    assert "/api/watchlist" in spec["paths"]
