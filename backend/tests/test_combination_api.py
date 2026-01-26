"""Tests for combination analysis API endpoint."""
import pytest
from datetime import date
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_combination_analysis_endpoint_exists():
    """Test that the combination analysis endpoint exists."""
    response = client.post(
        "/api/analysis/combination",
        json={
            "legs": [],
            "spot_price": 150.0,
            "risk_free_rate": 0.05,
            "volatility": 0.25
        }
    )
    # Should not be 404
    assert response.status_code != 404


def test_combination_analysis_vertical_spread():
    """Test combination analysis for a vertical call spread."""
    response = client.post(
        "/api/analysis/combination",
        json={
            "legs": [
                {
                    "option": {
                        "symbol": "AAPL",
                        "strike": 150.0,
                        "expiry": "2027-01-25",
                        "option_type": "call",
                        "exercise_style": "american",
                        "bid": 5.0,
                        "ask": 6.0,
                        "last": 5.5
                    },
                    "quantity": 1
                },
                {
                    "option": {
                        "symbol": "AAPL",
                        "strike": 155.0,
                        "expiry": "2027-01-25",
                        "option_type": "call",
                        "exercise_style": "american",
                        "bid": 3.0,
                        "ask": 3.5,
                        "last": 3.25
                    },
                    "quantity": -1
                }
            ],
            "spot_price": 150.0,
            "risk_free_rate": 0.05,
            "volatility": 0.25
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Should have all required fields
    assert "strategy_name" in data
    assert "combined_greeks" in data
    assert "net_premium" in data
    assert "pnl_data" in data
    assert "max_profit" in data
    assert "max_loss" in data
    assert "breakevens" in data
    
    # Strategy should be recognized
    assert data["strategy_name"] == "Vertical Spread"
    
    # Combined Greeks should have all fields
    greeks = data["combined_greeks"]
    assert "delta" in greeks
    assert "gamma" in greeks
    assert "theta" in greeks
    assert "vega" in greeks
    assert "rho" in greeks


def test_combination_analysis_straddle():
    """Test combination analysis for a straddle."""
    response = client.post(
        "/api/analysis/combination",
        json={
            "legs": [
                {
                    "option": {
                        "symbol": "AAPL",
                        "strike": 150.0,
                        "expiry": "2027-01-25",
                        "option_type": "call",
                        "exercise_style": "american",
                        "ask": 5.0
                    },
                    "quantity": 1
                },
                {
                    "option": {
                        "symbol": "AAPL",
                        "strike": 150.0,
                        "expiry": "2027-01-25",
                        "option_type": "put",
                        "exercise_style": "american",
                        "ask": 5.0
                    },
                    "quantity": 1
                }
            ],
            "spot_price": 150.0,
            "risk_free_rate": 0.05,
            "volatility": 0.25
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Should recognize straddle
    assert data["strategy_name"] == "Straddle"
    
    # Net premium should be negative (debit)
    assert data["net_premium"] < 0
    
    # P&L data should be a list
    assert isinstance(data["pnl_data"], list)
    assert len(data["pnl_data"]) > 0
    
    # Each P&L point should have price and pnl
    for point in data["pnl_data"]:
        assert "price" in point
        assert "pnl" in point


def test_combination_analysis_with_price_range():
    """Test combination analysis with custom price range."""
    response = client.post(
        "/api/analysis/combination",
        json={
            "legs": [
                {
                    "option": {
                        "symbol": "AAPL",
                        "strike": 150.0,
                        "expiry": "2027-01-25",
                        "option_type": "call",
                        "exercise_style": "american",
                        "ask": 5.0
                    },
                    "quantity": 1
                }
            ],
            "spot_price": 150.0,
            "risk_free_rate": 0.05,
            "volatility": 0.25,
            "price_range_min": 130.0,
            "price_range_max": 170.0,
            "price_points": 41
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Should have 41 points
    assert len(data["pnl_data"]) == 41
    
    # First point should be at 130
    assert data["pnl_data"][0]["price"] == 130.0
    
    # Last point should be at 170
    assert data["pnl_data"][-1]["price"] == 170.0


def test_combination_analysis_empty_legs():
    """Test combination analysis with no legs."""
    response = client.post(
        "/api/analysis/combination",
        json={
            "legs": [],
            "spot_price": 150.0,
            "risk_free_rate": 0.05,
            "volatility": 0.25
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Should return zero Greeks
    assert data["combined_greeks"]["delta"] == 0
    assert data["net_premium"] == 0
    assert data["max_profit"] == 0
    assert data["max_loss"] == 0


def test_combination_analysis_missing_fields():
    """Test that missing required fields return 422."""
    response = client.post(
        "/api/analysis/combination",
        json={
            "legs": []
            # Missing spot_price, risk_free_rate, volatility
        }
    )
    
    assert response.status_code == 422
