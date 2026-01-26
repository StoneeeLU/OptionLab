"""SQLite-based caching service."""
import sqlite3
from typing import Optional
from datetime import datetime, timedelta
from pathlib import Path


class CacheService:
    """Simple SQLite-based cache with TTL support."""
    
    def __init__(self, db_path: str = "backend/data/cache.db"):
        """Initialize cache service."""
        self.db_path = db_path
        
        # Ensure directory exists
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self._init_db()
    
    def _init_db(self):
        """Create cache table if it doesn't exist."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value BLOB NOT NULL,
                expires_at REAL NOT NULL
            )
        """)
        
        # Create index on expiration for cleanup
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_expires_at 
            ON cache(expires_at)
        """)
        
        conn.commit()
        conn.close()
    
    def get(self, key: str) -> Optional[bytes]:
        """
        Get value from cache.
        
        Returns None if key doesn't exist or is expired.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().timestamp()
        
        cursor.execute(
            "SELECT value, expires_at FROM cache WHERE key = ?",
            (key,)
        )
        
        row = cursor.fetchone()
        conn.close()
        
        if row is None:
            return None
        
        value, expires_at = row
        
        # Check if expired
        if expires_at < now:
            # Clean up expired entry
            self.invalidate(key)
            return None
        
        return value
    
    def set(self, key: str, value: bytes, ttl_seconds: int):
        """
        Store value in cache with TTL.
        
        Args:
            key: Cache key
            value: Value to store (must be bytes)
            ttl_seconds: Time to live in seconds
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        expires_at = (datetime.now() + timedelta(seconds=ttl_seconds)).timestamp()
        
        cursor.execute(
            "INSERT OR REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, ?)",
            (key, value, expires_at)
        )
        
        conn.commit()
        conn.close()
    
    def invalidate(self, key: str):
        """Remove entry from cache."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM cache WHERE key = ?", (key,))
        
        conn.commit()
        conn.close()
    
    def cleanup_expired(self):
        """Remove all expired entries."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().timestamp()
        cursor.execute("DELETE FROM cache WHERE expires_at < ?", (now,))
        
        conn.commit()
        conn.close()
