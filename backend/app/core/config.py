"""Configuration management using pydantic-settings."""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Cache settings
    CACHE_TTL_SECONDS: int = 300  # 5 minutes default
    DATABASE_URL: str = "backend/data/cache.db"
    
    # Data provider
    DATA_PROVIDER: str = "yfinance"
    
    # CORS
    CORS_ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    DEBUG_ERRORS: bool = False
    
    # Risk-free rate (can be overridden)
    RISK_FREE_RATE: float = 0.05  # 5% default
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Convert comma-separated string to list of origins."""
        return [
            origin.strip() 
            for origin in self.CORS_ALLOWED_ORIGINS.split(",") 
            if origin.strip()
        ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
