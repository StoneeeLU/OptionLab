"""Tests for API router structure."""
import sys
from pathlib import Path

import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.api.options import get_data_provider
from app.models.chain import OptionChain
from app.models.option import Option
from app.models.watchlist import Base
from app.services.watchlist_service import get_db


@pytest.fixture
def client_with_overrides():
    from app.main import app

    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    class StubProvider:
        def __init__(self, chain: OptionChain):
            self._chain = chain

        def get_option_chain(self, symbol: str):
            return self._chain

    stub_chain = OptionChain(
        underlying="AAPL",
        spot_price=150.0,
        options=[
            Option(
                symbol="AAPL",
                strike=150.0,
                expiry=date(2026, 12, 20),
                option_type="call",
                bid=5.0,
                ask=5.5,
                last=5.2,
                volume=100,
                open_interest=500,
                implied_volatility=0.25,
            )
        ],
        expiration_dates=[date(2026, 12, 20)],
    )

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_data_provider] = lambda: StubProvider(stub_chain)

    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def test_health_router():
    """Test health endpoint."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_options_chain_stub(client_with_overrides):
    """Test options chain endpoint returns stub data."""
    response = client_with_overrides.get("/api/options/AAPL/chain")
    
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


def test_watchlist_get_stub(client_with_overrides):
    """Test watchlist GET endpoint stub."""
    response = client_with_overrides.get("/api/watchlist")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_watchlist_post_stub(client_with_overrides):
    """Test watchlist POST endpoint stub."""
    response = client_with_overrides.post(
        "/api/watchlist",
        json={
            "symbol": "AAPL",
            "item_type": "stock",
        },
    )
    
    assert response.status_code == 201


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
