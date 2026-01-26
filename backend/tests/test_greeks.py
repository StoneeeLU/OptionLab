"""Tests for Greeks calculator."""
import pytest
from app.services.pricing.greeks import GreeksCalculator
from app.models.greeks import Greeks


class TestGreeksCalculator:
    """Test suite for GreeksCalculator."""
    
    def test_calculate_all_returns_greeks_model(self):
        """Test that calculate_all returns a valid Greeks model."""
        calculator = GreeksCalculator()
        greeks = calculator.calculate_all(
            option_type='call',
            S=100,
            K=100,
            T=1,
            r=0.05,
            sigma=0.2
        )
        
        assert isinstance(greeks, Greeks)
        assert hasattr(greeks, 'delta')
        assert hasattr(greeks, 'gamma')
        assert hasattr(greeks, 'theta')
        assert hasattr(greeks, 'vega')
        assert hasattr(greeks, 'rho')
    
    def test_atm_call_delta_approximately_half(self):
        """ATM call delta should be approximately 0.5."""
        calculator = GreeksCalculator()
        greeks = calculator.calculate_all(
            option_type='call',
            S=100,
            K=100,
            T=1,
            r=0.05,
            sigma=0.2
        )
        
        # ATM call delta should be around 0.5 (slightly above due to interest rate)
        assert 0.45 < greeks.delta < 0.65
    
    def test_atm_put_delta_approximately_negative_half(self):
        """ATM put delta should be approximately -0.5."""
        calculator = GreeksCalculator()
        greeks = calculator.calculate_all(
            option_type='put',
            S=100,
            K=100,
            T=1,
            r=0.05,
            sigma=0.2
        )
        
        # ATM put delta should be around -0.5
        assert -0.65 < greeks.delta < -0.35
    
    def test_gamma_peaks_at_atm(self):
        """Gamma should be highest at ATM or near-ATM strikes."""
        calculator = GreeksCalculator()
        
        # Deep ITM call
        itm_greeks = calculator.calculate_all('call', S=100, K=80, T=1, r=0.05, sigma=0.2)
        
        # ATM call
        atm_greeks = calculator.calculate_all('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        # Deep OTM call
        otm_greeks = calculator.calculate_all('call', S=100, K=120, T=1, r=0.05, sigma=0.2)
        
        # ATM should have higher gamma than deep ITM/OTM
        assert atm_greeks.gamma > itm_greeks.gamma
        assert atm_greeks.gamma > otm_greeks.gamma
    
    def test_gamma_always_positive(self):
        """Gamma should always be positive for both calls and puts."""
        calculator = GreeksCalculator()
        
        call_greeks = calculator.calculate_all('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        put_greeks = calculator.calculate_all('put', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        assert call_greeks.gamma > 0
        assert put_greeks.gamma > 0
    
    def test_theta_negative_for_long_options(self):
        """Theta should be negative for long options (time decay)."""
        calculator = GreeksCalculator()
        
        call_greeks = calculator.calculate_all('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        put_greeks = calculator.calculate_all('put', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        # Both should experience time decay
        assert call_greeks.theta < 0
        assert put_greeks.theta < 0
    
    def test_vega_always_positive(self):
        """Vega should always be positive (volatility increases option value)."""
        calculator = GreeksCalculator()
        
        call_greeks = calculator.calculate_all('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        put_greeks = calculator.calculate_all('put', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        assert call_greeks.vega > 0
        assert put_greeks.vega > 0
    
    def test_call_rho_positive(self):
        """Call option rho should be positive (benefits from higher rates)."""
        calculator = GreeksCalculator()
        
        greeks = calculator.calculate_all('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        assert greeks.rho > 0
    
    def test_put_rho_negative(self):
        """Put option rho should be negative (hurt by higher rates)."""
        calculator = GreeksCalculator()
        
        greeks = calculator.calculate_all('put', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        assert greeks.rho < 0
    
    def test_individual_delta_method(self):
        """Test individual delta calculation method."""
        calculator = GreeksCalculator()
        
        delta_value = calculator.delta('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        assert isinstance(delta_value, float)
        assert 0.45 < delta_value < 0.65
    
    def test_individual_gamma_method(self):
        """Test individual gamma calculation method."""
        calculator = GreeksCalculator()
        
        gamma_value = calculator.gamma('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        assert isinstance(gamma_value, float)
        assert gamma_value > 0
    
    def test_individual_theta_method(self):
        """Test individual theta calculation method."""
        calculator = GreeksCalculator()
        
        theta_value = calculator.theta('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        assert isinstance(theta_value, float)
        assert theta_value < 0
    
    def test_individual_vega_method(self):
        """Test individual vega calculation method."""
        calculator = GreeksCalculator()
        
        vega_value = calculator.vega('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        assert isinstance(vega_value, float)
        assert vega_value > 0
    
    def test_individual_rho_method(self):
        """Test individual rho calculation method."""
        calculator = GreeksCalculator()
        
        rho_value = calculator.rho('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        assert isinstance(rho_value, float)
        assert rho_value > 0
    
    def test_put_call_consistency(self):
        """Gamma and vega should be same for call and put with same parameters."""
        calculator = GreeksCalculator()
        
        call_greeks = calculator.calculate_all('call', S=100, K=100, T=1, r=0.05, sigma=0.2)
        put_greeks = calculator.calculate_all('put', S=100, K=100, T=1, r=0.05, sigma=0.2)
        
        # Gamma and vega are position-independent
        assert abs(call_greeks.gamma - put_greeks.gamma) < 0.0001
        assert abs(call_greeks.vega - put_greeks.vega) < 0.0001
