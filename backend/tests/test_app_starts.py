"""Test that FastAPI application instantiates correctly."""
import sys
from pathlib import Path

# Add backend to path for imports
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient


def test_app_instantiates():
    """Test that the FastAPI app can be imported and instantiated."""
    from app.main import app
    
    assert app is not None
    assert hasattr(app, "title")


def test_health_endpoint():
    """Test that the /health endpoint returns correct status."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
