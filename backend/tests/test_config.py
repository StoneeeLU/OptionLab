"""Tests for configuration management."""
import sys
from pathlib import Path
import os
import tempfile

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import pytest


def test_settings_loads_defaults():
    """Test that settings load with default values."""
    from app.core.config import Settings
    
    settings = Settings()
    
    assert settings.CACHE_TTL_SECONDS == 300
    assert settings.LOG_LEVEL == "INFO"
    assert settings.DATA_PROVIDER == "yfinance"


def test_settings_from_env(monkeypatch):
    """Test that settings can be overridden by environment variables."""
    from app.core.config import Settings
    
    monkeypatch.setenv("CACHE_TTL_SECONDS", "600")
    monkeypatch.setenv("LOG_LEVEL", "DEBUG")
    
    settings = Settings()
    
    assert settings.CACHE_TTL_SECONDS == 600
    assert settings.LOG_LEVEL == "DEBUG"


def test_settings_database_url_default():
    """Test default database URL."""
    from app.core.config import Settings
    
    settings = Settings()
    
    assert "cache.db" in settings.DATABASE_URL


def test_settings_singleton():
    """Test that get_settings returns same instance."""
    from app.core.config import get_settings
    
    settings1 = get_settings()
    settings2 = get_settings()
    
    assert settings1 is settings2
