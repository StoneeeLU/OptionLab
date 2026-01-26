"""Tests for volatility surface endpoint."""
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


class TestVolatilitySurfaceEndpoint:
    """Test suite for volatility surface endpoint."""
    
    def test_volatility_surface_success(self):
        """Test successful volatility surface data retrieval."""
        # Create sample options data
        expiry1 = (datetime.now() + timedelta(days=30)).date().isoformat()
        expiry2 = (datetime.now() + timedelta(days=60)).date().isoformat()
        
        options = [
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 140.0,
                "expiry": expiry1,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 10.0,
                "ask": 10.5,
                "last": 10.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.20
            },
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 150.0,
                "expiry": expiry1,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 5.0,
                "ask": 5.5,
                "last": 5.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.25
            },
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 160.0,
                "expiry": expiry1,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 2.0,
                "ask": 2.5,
                "last": 2.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.30
            },
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 140.0,
                "expiry": expiry2,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 12.0,
                "ask": 12.5,
                "last": 12.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.22
            },
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 150.0,
                "expiry": expiry2,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 7.0,
                "ask": 7.5,
                "last": 7.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.24
            }
        ]
        
        response = client.post("/api/analysis/volatility-surface", json={
            "options": options,
            "spot_price": 150.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "surface_data" in data
        assert "strikes" in data
        assert "expiries" in data
        assert "days_to_expiry" in data
        
        # Check data format
        assert isinstance(data["surface_data"], list)
        assert len(data["surface_data"]) > 0
        
        # Each point should have [strike, days, iv]
        for point in data["surface_data"]:
            assert len(point) == 3
            assert isinstance(point[0], (int, float))  # strike
            assert isinstance(point[1], (int, float))  # days
            assert isinstance(point[2], (int, float))  # iv
    
    def test_volatility_surface_filter_by_strike_range(self):
        """Test filtering surface by strike range."""
        expiry1 = (datetime.now() + timedelta(days=30)).date().isoformat()
        
        options = [
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 100.0,
                "expiry": expiry1,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 50.0,
                "ask": 50.5,
                "last": 50.25,
                "volume": 100,
                "open_interest": 500,
                "implied_volatility": 0.35
            },
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 150.0,
                "expiry": expiry1,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 5.0,
                "ask": 5.5,
                "last": 5.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.25
            },
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 200.0,
                "expiry": expiry1,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 0.1,
                "ask": 0.2,
                "last": 0.15,
                "volume": 100,
                "open_interest": 500,
                "implied_volatility": 0.40
            }
        ]
        
        response = client.post("/api/analysis/volatility-surface", json={
            "options": options,
            "spot_price": 150.0,
            "min_strike": 120.0,
            "max_strike": 180.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should only include strike 150
        for point in data["surface_data"]:
            strike = point[0]
            assert 120.0 <= strike <= 180.0
    
    def test_volatility_surface_empty_options(self):
        """Test handling of empty options list."""
        response = client.post("/api/analysis/volatility-surface", json={
            "options": [],
            "spot_price": 150.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return empty surface data
        assert data["surface_data"] == []
        assert data["strikes"] == []
        assert data["expiries"] == []
    
    def test_volatility_surface_missing_iv(self):
        """Test handling of options with missing IV."""
        expiry = (datetime.now() + timedelta(days=30)).date().isoformat()
        
        options = [
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 150.0,
                "expiry": expiry,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 5.0,
                "ask": 5.5,
                "last": 5.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": None  # Missing IV
            }
        ]
        
        response = client.post("/api/analysis/volatility-surface", json={
            "options": options,
            "spot_price": 150.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should skip options with missing IV
        assert len(data["surface_data"]) == 0
    
    def test_volatility_surface_multiple_expiries(self):
        """Test surface with multiple expiration dates."""
        expiry1 = (datetime.now() + timedelta(days=30)).date().isoformat()
        expiry2 = (datetime.now() + timedelta(days=60)).date().isoformat()
        expiry3 = (datetime.now() + timedelta(days=90)).date().isoformat()
        
        options = [
            # Expiry 1
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 150.0,
                "expiry": expiry1,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 5.0,
                "ask": 5.5,
                "last": 5.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.25
            },
            # Expiry 2
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 150.0,
                "expiry": expiry2,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 7.0,
                "ask": 7.5,
                "last": 7.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.24
            },
            # Expiry 3
            {
                "symbol": "AAPL",
                "underlying_symbol": "AAPL",
                "strike": 150.0,
                "expiry": expiry3,
                "option_type": "call",
                "exercise_style": "american",
                "bid": 9.0,
                "ask": 9.5,
                "last": 9.25,
                "volume": 1000,
                "open_interest": 5000,
                "implied_volatility": 0.23
            }
        ]
        
        response = client.post("/api/analysis/volatility-surface", json={
            "options": options,
            "spot_price": 150.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have 3 different expiries
        assert len(data["expiries"]) == 3
        assert len(data["days_to_expiry"]) == 3
