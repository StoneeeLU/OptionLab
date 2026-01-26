"""Tests for options API endpoints."""
import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from datetime import date
from app.main import app
from app.models.option import Option
from app.models.chain import OptionChain

client = TestClient(app)


@pytest.fixture
def mock_option_chain():
    """Mock option chain data."""
    options = [
        Option(
            symbol="AAPL",
            strike=140.0,
            expiry="2024-01-19",
            option_type="call",
            bid=11.0,
            ask=11.5,
            last=11.2,
            volume=100,
            open_interest=500,
            implied_volatility=0.25,
            exercise_style="american"
        ),
        Option(
            symbol="AAPL",
            strike=150.0,
            expiry="2024-01-19",
            option_type="call",
            bid=5.0,
            ask=5.5,
            last=5.2,
            volume=1000,
            open_interest=5000,
            implied_volatility=0.22,
            exercise_style="american"
        ),
        Option(
            symbol="AAPL",
            strike=160.0,
            expiry="2024-01-19",
            option_type="call",
            bid=1.0,
            ask=1.5,
            last=1.2,
            volume=50,
            open_interest=200,
            implied_volatility=0.30,
            exercise_style="american"
        ),
        Option(
            symbol="AAPL",
            strike=150.0,
            expiry="2024-02-16",
            option_type="call",
            bid=6.0,
            ask=6.5,
            last=6.2,
            volume=500,
            open_interest=2000,
            implied_volatility=0.23,
            exercise_style="american"
        )
    ]
    
    return OptionChain(
        underlying="AAPL",
        spot_price=150.0,
        options=options,
        expiration_dates=["2024-01-19", "2024-02-16"]
    )


def test_get_option_chain_success(mock_option_chain):
    """Test getting option chain successfully."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = mock_option_chain
        
        response = client.get("/api/options/AAPL/chain")
        assert response.status_code == 200
        
        data = response.json()
        assert data["underlying"] == "AAPL"
        assert data["spot_price"] == 150.0
        assert len(data["options"]) == 4
        assert len(data["expiration_dates"]) == 2


def test_get_option_chain_filter_by_expiry(mock_option_chain):
    """Test filtering options by expiry date."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = mock_option_chain
        
        response = client.get("/api/options/AAPL/chain?expiry=2024-01-19")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["options"]) == 3  # Only Jan 19 options
        assert all(opt["expiry"] == "2024-01-19" for opt in data["options"])


def test_get_option_chain_filter_by_volume(mock_option_chain):
    """Test filtering options by minimum volume."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = mock_option_chain
        
        response = client.get("/api/options/AAPL/chain?min_volume=100")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["options"]) == 3  # Excludes option with volume=50
        assert all(opt["volume"] >= 100 for opt in data["options"])


def test_get_option_chain_filter_by_oi(mock_option_chain):
    """Test filtering options by minimum open interest."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = mock_option_chain
        
        response = client.get("/api/options/AAPL/chain?min_oi=1000")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["options"]) == 2  # Only options with OI >= 1000
        assert all(opt["open_interest"] >= 1000 for opt in data["options"])


def test_get_option_chain_filter_atm(mock_option_chain):
    """Test filtering ATM options (within 2% of spot)."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = mock_option_chain
        
        response = client.get("/api/options/AAPL/chain?moneyness=atm")
        assert response.status_code == 200
        
        data = response.json()
        # Spot is 150, ATM should be 150 strike only (within 2%)
        assert len(data["options"]) == 2  # Both 150 strike options
        assert all(opt["strike"] == 150.0 for opt in data["options"])


def test_get_option_chain_filter_itm(mock_option_chain):
    """Test filtering ITM options."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = mock_option_chain
        
        response = client.get("/api/options/AAPL/chain?moneyness=itm")
        assert response.status_code == 200
        
        data = response.json()
        # For calls with spot=150, ITM is strike < 150
        assert len(data["options"]) == 1
        assert data["options"][0]["strike"] == 140.0


def test_get_option_chain_filter_otm(mock_option_chain):
    """Test filtering OTM options."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = mock_option_chain
        
        response = client.get("/api/options/AAPL/chain?moneyness=otm")
        assert response.status_code == 200
        
        data = response.json()
        # For calls with spot=150, OTM is strike > 150
        assert len(data["options"]) == 1
        assert data["options"][0]["strike"] == 160.0


def test_get_option_chain_invalid_moneyness(mock_option_chain):
    """Test that invalid moneyness filter returns 400."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = mock_option_chain
        
        response = client.get("/api/options/AAPL/chain?moneyness=invalid")
        assert response.status_code == 400


def test_get_option_chain_symbol_not_found():
    """Test that invalid symbol returns 404."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = OptionChain(
            underlying="INVALID",
            spot_price=0.0,
            options=[],
            expiration_dates=[]
        )
        
        response = client.get("/api/options/INVALID/chain")
        assert response.status_code == 404


def test_get_option_chain_sorted_by_strike(mock_option_chain):
    """Test that options are sorted by strike price."""
    with patch("app.api.options.get_data_provider") as mock_provider:
        mock_provider.return_value.get_option_chain.return_value = mock_option_chain
        
        response = client.get("/api/options/AAPL/chain")
        assert response.status_code == 200
        
        data = response.json()
        strikes = [opt["strike"] for opt in data["options"]]
        assert strikes == sorted(strikes)
