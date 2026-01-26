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
    """Test single option analysis stub endpoint."""
    from app.main import app
    
    client = TestClient(app)
    response = client.post("/api/analysis/single", json={
        "symbol": "AAPL",
        "strike": 150.0,
        "expiry": "2024-12-20",
        "option_type": "call"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_analysis_combination_stub():
    """Test combination analysis stub endpoint."""
    from app.main import app
    
    client = TestClient(app)
    response = client.post("/api/analysis/combination", json={
        "legs": []
    })
    
    assert response.status_code == 200


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
