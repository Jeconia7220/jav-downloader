"""
Video Info Cache Module
Caches video information to reduce API calls
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import threading


class VideoInfoCache:
    """Simple in-memory cache with TTL support"""
    
    def __init__(self, max_size: int = 100, ttl: int = 3600):
        """
        Initialize cache
        
        Args:
            max_size: Maximum number of items to cache
            ttl: Time to live in seconds (default 1 hour)
        """
        self.max_size = max_size
        self.ttl = ttl
        self.cache = {}
        self.access_times = {}
        self.lock = threading.Lock()
    
    def get(self, key: str) -> Optional[Dict[Any, Any]]:
        """
        Get item from cache
        
        Args:
            key: Cache key (URL)
            
        Returns:
            Cached value or None if not found/expired
        """
        with self.lock:
            if key not in self.cache:
                return None
            
            # Check if expired
            cache_time = self.access_times.get(key)
            if cache_time and datetime.now() - cache_time > timedelta(seconds=self.ttl):
                # Expired, remove from cache
                del self.cache[key]
                del self.access_times[key]
                return None
            
            # Update access time
            self.access_times[key] = datetime.now()
            return self.cache[key]
    
    def set(self, key: str, value: Dict[Any, Any]) -> None:
        """
        Set item in cache
        
        Args:
            key: Cache key (URL)
            value: Value to cache
        """
        with self.lock:
            # If cache is full, remove oldest item
            if len(self.cache) >= self.max_size and key not in self.cache:
                oldest_key = min(self.access_times, key=self.access_times.get)
                del self.cache[oldest_key]
                del self.access_times[oldest_key]
            
            self.cache[key] = value
            self.access_times[key] = datetime.now()
    
    def clear(self) -> None:
        """Clear all cache"""
        with self.lock:
            self.cache.clear()
            self.access_times.clear()
    
    def size(self) -> int:
        """Get current cache size"""
        return len(self.cache)
    
    def cleanup_expired(self) -> int:
        """
        Remove expired items from cache
        
        Returns:
            Number of items removed
        """
        with self.lock:
            now = datetime.now()
            expired_keys = [
                key for key, time in self.access_times.items()
                if now - time > timedelta(seconds=self.ttl)
            ]
            
            for key in expired_keys:
                del self.cache[key]
                del self.access_times[key]
            
            return len(expired_keys)
