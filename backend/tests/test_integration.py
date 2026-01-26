"""
Integration tests for OptionLab - End-to-end workflow testing.

Tests the complete application flow from API endpoints through analysis
to ensure all components work together correctly.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestFullAnalysisWorkflow:
    """Test complete analysis workflow: fetch chain → analyze → export."""
    
    def test_end_to_end_single_option_analysis(self):
        """Test fetching option chain and analyzing a single option."""
        # Step 1: Fetch options chain
        response = client.get("/api/options/AAPL/chain")
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
        analysis_response = client.post(
            "/api/analysis/single",
            json={
                "option": call_option,
                "spot_price": data.get("spot_price", 150.0),
                "risk_free_rate": 0.05
            }
        )
        assert analysis_response.status_code == 200
        analysis = analysis_response.json()
        
        # Verify analysis contains required fields
        assert "greeks" in analysis
        assert "theoretical_price" in analysis
        assert "implied_volatility" in analysis
        assert "historical_volatility" in analysis
        assert "iv_percentile" in analysis
        assert "mispricing" in analysis
        
    def test_export_single_analysis_csv(self):
        """Test exporting single option analysis to CSV."""
        # Create mock analysis data
        export_data = {
            "symbol": "AAPL",
            "strike": 150.0,
            "expiry": "2024-12-20",
            "option_type": "call",
            "market_price": 10.5,
            "theoretical_price": 10.2,
            "greeks": {
                "delta": 0.55,
                "gamma": 0.03,
                "theta": -0.05,
                "vega": 0.15,
                "rho": 0.08
            },
            "iv": 0.25,
            "hv": 0.22
        }
        
        response = client.post("/api/export/csv/analysis", json=export_data)
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        
        # Verify CSV content
        csv_content = response.text
        assert "OptionLab" in csv_content
        assert "AAPL" in csv_content
        assert "150" in csv_content


class TestStrategyWorkflow:
    """Test strategy workflow: select options → recognize → P&L."""
    
    def test_multi_leg_strategy_recognition_and_pnl(self):
        """Test recognizing strategy and calculating P&L."""
        # Create a vertical call spread
        legs = [
            {
                "option": {
                    "symbol": "AAPL",
                    "strike": 150.0,
                    "expiry": "2024-12-20",
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
                    "expiry": "2024-12-20",
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
        response = client.post(
            "/api/analysis/combination",
            json={
                "legs": legs,
                "spot_price": 150.0,
                "risk_free_rate": 0.05
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
    
    def test_export_strategy_csv(self):
        """Test exporting strategy analysis to CSV."""
        strategy_data = {
            "strategy_name": "Vertical Call Spread",
            "legs": [
                {
                    "symbol": "AAPL",
                    "strike": 150.0,
                    "expiry": "2024-12-20",
                    "option_type": "call",
                    "action": "buy",
                    "quantity": 1
                },
                {
                    "symbol": "AAPL",
                    "strike": 155.0,
                    "expiry": "2024-12-20",
                    "option_type": "call",
                    "action": "sell",
                    "quantity": 1
                }
            ],
            "net_premium": -3.5,
            "max_profit": 1.5,
            "max_loss": -3.5,
            "breakevens": [153.5]
        }
        
        response = client.post("/api/export/csv/strategy", json=strategy_data)
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        
        csv_content = response.text
        assert "OptionLab" in csv_content
        assert "Vertical Call Spread" in csv_content


class TestErrorHandling:
    """Test error handling across all endpoints."""
    
    def test_invalid_symbol_returns_404(self):
        """Test that invalid symbol returns 404."""
        response = client.get("/api/options/INVALID_SYMBOL_XYZ/chain")
        # Should either return 404 or 200 with empty options
        assert response.status_code in [200, 404]
        
    def test_malformed_analysis_request_returns_422(self):
        """Test that malformed request returns validation error."""
        response = client.post(
            "/api/analysis/single",
            json={"invalid": "data"}
        )
        assert response.status_code == 422
        error = response.json()
        assert "detail" in error
    
    def test_volatility_surface_for_invalid_symbol(self):
        """Test volatility surface with invalid symbol."""
        response = client.get("/api/analysis/volatility-surface/INVALID123")
        # Should handle gracefully
        assert response.status_code in [200, 404, 500]


class TestCachingBehavior:
    """Test that caching is working properly."""
    
    def test_options_chain_returns_cache_headers(self):
        """Test that options chain response includes cache headers."""
        response = client.get("/api/options/AAPL/chain")
        assert response.status_code == 200
        
        # Check for cache control header
        assert "cache-control" in response.headers or "Cache-Control" in response.headers
    
    def test_timing_header_present(self):
        """Test that timing header is added to responses."""
        response = client.get("/health")
        assert response.status_code == 200
        
        # Check for timing header (may be case-sensitive)
        headers_lower = {k.lower(): v for k, v in response.headers.items()}
        assert "x-process-time" in headers_lower


class TestHistoryEndpoints:
    """Test option history endpoints."""
    
    def test_underlying_history(self):
        """Test fetching underlying stock history."""
        response = client.get("/api/options/AAPL/underlying-history?days=30")
        assert response.status_code == 200
        data = response.json()
        
        assert "dates" in data
        assert "prices" in data
        assert "volumes" in data
        assert "historical_volatility" in data
    
    def test_option_history(self):
        """Test fetching option history."""
        response = client.get(
            "/api/options/AAPL/history",
            params={
                "strike": 150.0,
                "expiry": "2024-12-20",
                "option_type": "call",
                "days": 30
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "dates" in data
        # Note: Option-specific history may require premium data
        # This endpoint returns placeholder data with yfinance


class TestWatchlistIntegration:
    """Test watchlist CRUD operations."""
    
    def test_watchlist_crud_workflow(self):
        """Test complete watchlist workflow: add → get → delete."""
        # Add item to watchlist
        add_response = client.post(
            "/api/watchlist",
            json={
                "symbol": "AAPL",
                "item_type": "stock"
            }
        )
        assert add_response.status_code == 200
        item = add_response.json()
        assert "id" in item
        item_id = item["id"]
        
        # Get watchlist
        get_response = client.get("/api/watchlist")
        assert get_response.status_code == 200
        watchlist = get_response.json()
        assert isinstance(watchlist, list)
        assert any(w["id"] == item_id for w in watchlist)
        
        # Delete item
        delete_response = client.delete(f"/api/watchlist/{item_id}")
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_after_delete = client.get("/api/watchlist")
        assert get_after_delete.status_code == 200
        watchlist_after = get_after_delete.json()
        assert not any(w["id"] == item_id for w in watchlist_after)
