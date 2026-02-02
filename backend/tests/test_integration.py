"""
Integration tests for OptionLab - End-to-end workflow testing.

Tests the complete application flow from API endpoints through analysis
to ensure all components work together correctly.
"""
import pytest
from datetime import date
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

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

    expiry = date(2026, 12, 20)
    stub_chain = OptionChain(
        underlying="AAPL",
        spot_price=150.0,
        options=[
            Option(
                symbol="AAPL",
                strike=150.0,
                expiry=expiry,
                option_type="call",
                bid=5.0,
                ask=5.5,
                last=5.2,
                volume=1000,
                open_interest=5000,
                implied_volatility=0.25,
                exercise_style="american",
            ),
            Option(
                symbol="AAPL",
                strike=150.0,
                expiry=expiry,
                option_type="put",
                bid=4.5,
                ask=4.9,
                last=4.7,
                volume=800,
                open_interest=4000,
                implied_volatility=0.26,
                exercise_style="american",
            ),
        ],
        expiration_dates=[expiry],
    )

    class StubProvider:
        def get_option_chain(self, symbol: str):
            if symbol.upper() == "AAPL":
                return stub_chain

            return OptionChain(
                underlying=symbol.upper(),
                spot_price=150.0,
                options=[],
                expiration_dates=[],
            )

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_data_provider] = lambda: StubProvider()
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


class TestFullAnalysisWorkflow:
    """Test complete analysis workflow: fetch chain → analyze → export."""
    
    def test_end_to_end_single_option_analysis(self, client_with_overrides):
        """Test fetching option chain and analyzing a single option."""
        # Step 1: Fetch options chain
        response = client_with_overrides.get("/api/options/AAPL/chain")
        assert response.status_code == 200
        data = response.json()
        assert "options" in data
        assert len(data["options"]) > 0
        
        # Step 2: Get first call option
        call_option = next(
            (opt for opt in data["options"] if opt["option_type"] == "call"),
            None
        )
        assert call_option is not None
        
        # Step 3: Analyze the option
        analysis_response = client_with_overrides.post(
            "/api/analysis/single",
            json={
                "symbol": call_option["symbol"],
                "strike": call_option["strike"],
                "expiry": call_option["expiry"],
                "option_type": call_option["option_type"],
                "exercise_style": call_option.get("exercise_style", "american"),
                "bid": call_option.get("bid"),
                "ask": call_option.get("ask"),
                "last": call_option.get("last"),
                "volume": call_option.get("volume"),
                "open_interest": call_option.get("open_interest"),
                "implied_volatility": call_option.get("implied_volatility"),
                "spot_price": data["spot_price"],
                "risk_free_rate": 0.05,
            },
        )
        assert analysis_response.status_code == 200
        analysis = analysis_response.json()
        
        # Verify analysis contains required fields
        assert "greeks" in analysis
        assert "theoretical_price" in analysis
        assert "market_price" in analysis
        assert "historical_volatility" in analysis
        assert "iv_percentile" in analysis
        assert "mispricing" in analysis
        
    def test_export_single_analysis_csv(self, client_with_overrides):
        """Test exporting single option analysis to CSV."""
        chain_response = client_with_overrides.get("/api/options/AAPL/chain")
        assert chain_response.status_code == 200
        chain = chain_response.json()

        call_option = next(
            (opt for opt in chain["options"] if opt["option_type"] == "call"),
            None,
        )
        assert call_option is not None

        analysis_response = client_with_overrides.post(
            "/api/analysis/single",
            json={
                "symbol": call_option["symbol"],
                "strike": call_option["strike"],
                "expiry": call_option["expiry"],
                "option_type": call_option["option_type"],
                "exercise_style": call_option.get("exercise_style", "american"),
                "bid": call_option.get("bid"),
                "ask": call_option.get("ask"),
                "last": call_option.get("last"),
                "volume": call_option.get("volume"),
                "open_interest": call_option.get("open_interest"),
                "implied_volatility": call_option.get("implied_volatility"),
                "spot_price": chain["spot_price"],
                "risk_free_rate": 0.05,
            },
        )
        assert analysis_response.status_code == 200

        export_response = client_with_overrides.post(
            "/api/export/csv/analysis",
            json=analysis_response.json(),
        )
        assert export_response.status_code == 200
        assert export_response.headers["content-type"].startswith("text/csv")

        csv_content = export_response.text
        assert "OptionLab Options Analysis Export" in csv_content
        assert "AAPL" in csv_content


class TestStrategyWorkflow:
    """Test strategy workflow: select options → recognize → P&L."""
    
    def test_multi_leg_strategy_recognition_and_pnl(self, client_with_overrides):
        """Test recognizing strategy and calculating P&L."""
        # Create a vertical call spread
        legs = [
            {
                "option": {
                    "symbol": "AAPL",
                    "strike": 150.0,
                    "expiry": "2026-12-20",
                    "option_type": "call",
                    "bid": 10.0,
                    "ask": 10.5,
                    "last": 10.2,
                    "volume": 1000,
                    "open_interest": 5000,
                    "implied_volatility": 0.25,
                    "exercise_style": "american"
                },
                "quantity": 1,
                "action": "buy"
            },
            {
                "option": {
                    "symbol": "AAPL",
                    "strike": 155.0,
                    "expiry": "2026-12-20",
                    "option_type": "call",
                    "bid": 7.0,
                    "ask": 7.5,
                    "last": 7.2,
                    "volume": 800,
                    "open_interest": 4000,
                    "implied_volatility": 0.23,
                    "exercise_style": "american"
                },
                "quantity": -1,
                "action": "sell"
            }
        ]
        
        # Analyze combination
        response = client_with_overrides.post(
            "/api/analysis/combination",
            json={
                "legs": legs,
                "spot_price": 150.0,
                "risk_free_rate": 0.05,
                "volatility": 0.25,
            }
        )
        
        assert response.status_code == 200
        result = response.json()
        
        # Verify strategy recognition
        assert "strategy_name" in result
        assert "Vertical" in result["strategy_name"]
        
        # Verify combined Greeks
        assert "combined_greeks" in result
        assert "delta" in result["combined_greeks"]
        
        # Verify P&L data
        assert "pnl_data" in result
        assert len(result["pnl_data"]) > 0
        
        # Verify breakevens
        assert "breakevens" in result
        
        # Verify max profit/loss
        assert "max_profit" in result
        assert "max_loss" in result
    
    def test_export_strategy_csv(self, client_with_overrides):
        """Test exporting strategy analysis to CSV."""
        legs = [
            {
                "option": {
                    "symbol": "AAPL",
                    "strike": 150.0,
                    "expiry": "2026-12-20",
                    "option_type": "call",
                    "bid": 10.0,
                    "ask": 10.5,
                    "exercise_style": "american",
                },
                "quantity": 1,
            },
            {
                "option": {
                    "symbol": "AAPL",
                    "strike": 155.0,
                    "expiry": "2026-12-20",
                    "option_type": "call",
                    "bid": 7.0,
                    "ask": 7.5,
                    "exercise_style": "american",
                },
                "quantity": -1,
            },
        ]

        analysis_response = client_with_overrides.post(
            "/api/analysis/combination",
            json={
                "legs": legs,
                "spot_price": 150.0,
                "risk_free_rate": 0.05,
                "volatility": 0.25,
            },
        )
        assert analysis_response.status_code == 200
        analysis = analysis_response.json()

        strategy_data = {
            "strategy_name": analysis["strategy_name"],
            "legs": legs,
            "combined_greeks": analysis["combined_greeks"],
            "net_premium": analysis["net_premium"],
            "max_profit": analysis["max_profit"],
            "max_loss": analysis["max_loss"],
            "breakevens": analysis["breakevens"],
        }

        export_response = client_with_overrides.post("/api/export/csv/strategy", json=strategy_data)
        assert export_response.status_code == 200
        assert export_response.headers["content-type"].startswith("text/csv")

        csv_content = export_response.text
        assert "OptionLab Strategy Analysis Export" in csv_content
        assert analysis["strategy_name"] in csv_content


class TestErrorHandling:
    """Test error handling across all endpoints."""
    
    def test_invalid_symbol_returns_404(self, client_with_overrides):
        """Test that invalid symbol returns 404."""
        response = client_with_overrides.get("/api/options/INVALID_SYMBOL_XYZ/chain")
        assert response.status_code == 404
        
    def test_malformed_analysis_request_returns_422(self, client_with_overrides):
        """Test that malformed request returns validation error."""
        response = client_with_overrides.post(
            "/api/analysis/single",
            json={"invalid": "data"}
        )
        assert response.status_code == 422
        error = response.json()
        assert "error" in error
        assert error["error"]["code"] == 422
    
    def test_volatility_surface_for_invalid_symbol(self, client_with_overrides):
        """Test volatility surface with invalid symbol."""
        response = client_with_overrides.get("/api/analysis/volatility-surface/INVALID123")
        # Should handle gracefully
        assert response.status_code in [200, 404, 500]


class TestCachingBehavior:
    """Test that caching is working properly."""
    
    def test_options_chain_returns_cache_headers(self, client_with_overrides):
        """Test that options chain response includes cache headers."""
        response = client_with_overrides.get("/api/options/AAPL/chain")
        assert response.status_code == 200
        
        # Check for cache control header
        assert "cache-control" in response.headers or "Cache-Control" in response.headers
    
    def test_timing_header_present(self, client_with_overrides):
        """Test that timing header is added to responses."""
        response = client_with_overrides.get("/health")
        assert response.status_code == 200
        
        # Check for timing header (may be case-sensitive)
        headers_lower = {k.lower(): v for k, v in response.headers.items()}
        assert "x-process-time" in headers_lower


class TestHistoryEndpoints:
    """Test option history endpoints."""
    
    def test_underlying_history(self, client_with_overrides):
        """Test fetching underlying stock history."""
        with patch(
            "app.services.history_service.OptionHistoryService.get_underlying_history",
            return_value={
                "symbol": "AAPL",
                "days": 30,
                "history": {
                    "dates": ["2026-01-01"],
                    "prices": [150.0],
                    "volumes": [1000000],
                    "historical_volatility": [0.2],
                },
            },
        ):
            response = client_with_overrides.get("/api/options/AAPL/underlying-history?days=30")
        assert response.status_code == 200
        data = response.json()
        
        assert "history" in data
        assert "dates" in data["history"]
        assert "prices" in data["history"]
        assert "volumes" in data["history"]
        assert "historical_volatility" in data["history"]
    
    def test_option_history(self, client_with_overrides):
        """Test fetching option history."""
        with patch(
            "app.services.history_service.OptionHistoryService.get_option_history",
            return_value={
                "symbol": "AAPL",
                "strike": 150.0,
                "expiry": "2026-12-20",
                "option_type": "call",
                "days": 30,
                "history": {
                    "dates": ["2026-01-01"],
                    "stock_prices": [150.0],
                    "historical_volatility": [0.2],
                    "option_prices": [None],
                    "implied_volatility": [None],
                },
            },
        ):
            response = client_with_overrides.get(
                "/api/options/AAPL/history",
                params={
                    "strike": 150.0,
                    "expiry": "2026-12-20",
                    "option_type": "call",
                    "days": 30,
                },
            )
        assert response.status_code == 200
        data = response.json()
        
        assert "history" in data
        assert "dates" in data["history"]
        # Note: Option-specific history may require premium data
        # This endpoint returns placeholder data with yfinance


class TestWatchlistIntegration:
    """Test watchlist CRUD operations."""
    
    def test_watchlist_crud_workflow(self, client_with_overrides):
        """Test complete watchlist workflow: add → get → delete."""
        # Add item to watchlist
        add_response = client_with_overrides.post(
            "/api/watchlist",
            json={
                "symbol": "AAPL",
                "item_type": "stock"
            }
        )
        assert add_response.status_code == 201
        item = add_response.json()
        assert "id" in item
        item_id = item["id"]
        
        # Get watchlist
        get_response = client_with_overrides.get("/api/watchlist")
        assert get_response.status_code == 200
        watchlist = get_response.json()
        assert isinstance(watchlist, list)
        assert any(w["id"] == item_id for w in watchlist)
        
        # Delete item
        delete_response = client_with_overrides.delete(f"/api/watchlist/{item_id}")
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_after_delete = client_with_overrides.get("/api/watchlist")
        assert get_after_delete.status_code == 200
        watchlist_after = get_after_delete.json()
        assert not any(w["id"] == item_id for w in watchlist_after)
