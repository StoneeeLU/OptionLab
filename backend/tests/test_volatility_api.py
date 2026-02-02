"""Tests for simplified volatility surface endpoint."""
from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.api.options import get_data_provider
from app.main import app
from app.models.chain import OptionChain
from app.models.option import Option


client = TestClient(app)


class StubProvider:
    """Stub data provider for volatility surface tests."""

    def __init__(self, chain: OptionChain | None = None, error: Exception | None = None):
        self._chain = chain
        self._error = error

    def get_option_chain(self, symbol: str, expiry: str | None = None) -> OptionChain:
        if self._error is not None:
            raise self._error

        chain = self._chain
        if chain is None:
            raise ValueError(f"No options available for {symbol}")

        return chain


class TestVolatilitySurfaceGetEndpoint:
    """Test suite for GET /api/volatility/surface/{symbol}."""

    def test_volatility_surface_success(self):
        expiry_near = date.today() + timedelta(days=30)
        expiry_far = date.today() + timedelta(days=60)

        chain = OptionChain(
            underlying="AAPL",
            spot_price=150.0,
            options=[
                Option(
                    symbol="AAPL",
                    strike=140.0,
                    expiry=expiry_near,
                    option_type="call",
                    bid=1.0,
                    ask=1.1,
                    last=1.05,
                    volume=100,
                    open_interest=500,
                    implied_volatility=0.22,
                ),
                Option(
                    symbol="AAPL",
                    strike=150.0,
                    expiry=expiry_near,
                    option_type="call",
                    bid=1.0,
                    ask=1.1,
                    last=1.05,
                    volume=100,
                    open_interest=500,
                    implied_volatility=0.25,
                ),
                Option(
                    symbol="AAPL",
                    strike=150.0,
                    expiry=expiry_far,
                    option_type="put",
                    bid=1.0,
                    ask=1.1,
                    last=1.05,
                    volume=100,
                    open_interest=500,
                    implied_volatility=0.28,
                ),
            ],
            expiration_dates=[expiry_near, expiry_far],
        )

        stub = StubProvider(chain=chain)

        app.dependency_overrides[get_data_provider] = lambda: stub
        try:
            response = client.get("/api/volatility/surface/AAPL")
        finally:
            app.dependency_overrides.clear()

        assert response.status_code == 200
        data = response.json()

        assert "surface_data" in data
        assert "strikes" in data
        assert "expiries" in data
        assert "days_to_expiry" in data
        assert len(data["surface_data"]) == 3

    def test_volatility_surface_invalid_symbol(self):
        stub = StubProvider(error=ValueError("No options available for INVALID"))

        app.dependency_overrides[get_data_provider] = lambda: stub
        try:
            response = client.get("/api/volatility/surface/INVALID")
        finally:
            app.dependency_overrides.clear()

        assert response.status_code == 404
        assert "No options available for INVALID" in response.json()["error"]["message"]
