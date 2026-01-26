"""Tests for analysis API endpoints."""
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


class TestSingleOptionAnalysisEndpoint:
    """Test suite for single option analysis endpoint."""
    
    def test_analyze_single_option_success(self):
        """Test successful single option analysis."""
        expiry = (datetime.now() + timedelta(days=365)).date().isoformat()
        
        request_data = {
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
        }
        
        response = client.post("/api/analysis/single", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "option" in data
        assert "theoretical_price" in data
        assert "market_price" in data
        assert "greeks" in data
        assert "historical_volatility" in data
        assert "iv_percentile" in data
        assert "mispricing" in data
        assert "valuation" in data
        
        # Check Greeks structure
        assert "delta" in data["greeks"]
        assert "gamma" in data["greeks"]
        assert "theta" in data["greeks"]
        assert "vega" in data["greeks"]
        assert "rho" in data["greeks"]
        
        # Check valuation is valid
        assert data["valuation"] in ["cheap", "fair", "expensive"]
    
    def test_analyze_single_option_with_historical_data(self):
        """Test analysis with historical prices and IVs."""
        expiry = (datetime.now() + timedelta(days=365)).date().isoformat()
        
        request_data = {
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
            "risk_free_rate": 0.05,
            "historical_prices": [150.0 + i * 0.5 for i in range(30)],
            "historical_ivs": [0.20, 0.22, 0.24, 0.26, 0.28, 0.30]
        }
        
        response = client.post("/api/analysis/single", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["historical_volatility"] > 0
        assert 0 <= data["iv_percentile"] <= 1
    
    def test_analyze_put_option(self):
        """Test analysis of put option."""
        expiry = (datetime.now() + timedelta(days=365)).date().isoformat()
        
        request_data = {
            "symbol": "AAPL",
            "underlying_symbol": "AAPL",
            "strike": 150.0,
            "expiry": expiry,
            "option_type": "put",
            "exercise_style": "european",
            "bid": 7.5,
            "ask": 8.0,
            "last": 7.75,
            "volume": 800,
            "open_interest": 4000,
            "implied_volatility": 0.25,
            "spot_price": 150.0,
            "risk_free_rate": 0.05
        }
        
        response = client.post("/api/analysis/single", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Put should have negative delta
        assert data["greeks"]["delta"] < 0
    
    def test_analyze_american_option(self):
        """Test analysis of American option."""
        expiry = (datetime.now() + timedelta(days=365)).date().isoformat()
        
        request_data = {
            "symbol": "AAPL",
            "underlying_symbol": "AAPL",
            "strike": 150.0,
            "expiry": expiry,
            "option_type": "call",
            "exercise_style": "american",
            "bid": 8.2,
            "ask": 8.7,
            "last": 8.45,
            "volume": 1000,
            "open_interest": 5000,
            "implied_volatility": 0.25,
            "spot_price": 150.0,
            "risk_free_rate": 0.05
        }
        
        response = client.post("/api/analysis/single", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have valid theoretical price from binomial model
        assert data["theoretical_price"] > 0
    
    def test_analyze_missing_required_fields(self):
        """Test validation of required fields."""
        request_data = {
            "symbol": "AAPL",
            "strike": 150.0
            # Missing expiry, option_type, etc.
        }
        
        response = client.post("/api/analysis/single", json=request_data)
        
        assert response.status_code == 422  # Validation error
    
    def test_analyze_invalid_option_type(self):
        """Test validation of option type."""
        expiry = (datetime.now() + timedelta(days=365)).date().isoformat()
        
        request_data = {
            "symbol": "AAPL",
            "underlying_symbol": "AAPL",
            "strike": 150.0,
            "expiry": expiry,
            "option_type": "invalid",  # Invalid type
            "exercise_style": "european",
            "bid": 8.0,
            "ask": 8.5,
            "last": 8.25,
            "volume": 1000,
            "open_interest": 5000,
            "implied_volatility": 0.25,
            "spot_price": 150.0,
            "risk_free_rate": 0.05
        }
        
        response = client.post("/api/analysis/single", json=request_data)
        
        assert response.status_code == 422  # Validation error
    
    def test_analyze_default_historical_prices(self):
        """Test that endpoint works without historical prices."""
        expiry = (datetime.now() + timedelta(days=365)).date().isoformat()
        
        request_data = {
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
            # No historical_prices provided
        }
        
        response = client.post("/api/analysis/single", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Should still have HV (will be 0 for constant default prices)
        assert "historical_volatility" in data
