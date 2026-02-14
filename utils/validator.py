"""
URL Validator Module
Validates and sanitizes YouTube URLs
"""
import re
from urllib.parse import urlparse, parse_qs
from typing import Optional


class URLValidator:
    """YouTube URL validator and normalizer"""
    
    # YouTube URL patterns
    YOUTUBE_PATTERNS = [
        r'^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+$',
        r'^(https?://)?(www\.)?youtube\.com/watch\?v=[\w-]+',
        r'^(https?://)?youtu\.be/[\w-]+',
        r'^(https?://)?(www\.)?youtube\.com/embed/[\w-]+',
        r'^(https?://)?(www\.)?youtube\.com/v/[\w-]+',
    ]
    
    # Playlist patterns
    PLAYLIST_PATTERNS = [
        r'^(https?://)?(www\.)?youtube\.com/playlist\?list=[\w-]+',
        r'^(https?://)?(www\.)?youtube\.com/watch\?v=[\w-]+&list=[\w-]+',
    ]
    
    def __init__(self):
        """Initialize validator"""
        self.patterns = [re.compile(p) for p in self.YOUTUBE_PATTERNS]
        self.playlist_patterns = [re.compile(p) for p in self.PLAYLIST_PATTERNS]
    
    def is_valid_youtube_url(self, url: str) -> bool:
        """
        Check if URL is a valid YouTube URL
        
        Args:
            url: URL to validate
            
        Returns:
            True if valid YouTube URL
        """
        if not url or not isinstance(url, str):
            return False
        
        url = url.strip()
        return any(pattern.match(url) for pattern in self.patterns)
    
    def is_playlist_url(self, url: str) -> bool:
        """
        Check if URL is a playlist URL
        
        Args:
            url: URL to check
            
        Returns:
            True if playlist URL
        """
        if not url or not isinstance(url, str):
            return False
        
        url = url.strip()
        return any(pattern.match(url) for pattern in self.playlist_patterns)
    
    def extract_video_id(self, url: str) -> Optional[str]:
        """
        Extract video ID from YouTube URL
        
        Args:
            url: YouTube URL
            
        Returns:
            Video ID or None if not found
        """
        if not url:
            return None
        
        # Parse URL
        parsed = urlparse(url)
        
        # Check for youtu.be format
        if parsed.netloc == 'youtu.be':
            return parsed.path[1:]
        
        # Check for youtube.com format
        if 'youtube.com' in parsed.netloc:
            # Check query parameters
            query = parse_qs(parsed.query)
            if 'v' in query:
                return query['v'][0]
            
            # Check embed format
            if '/embed/' in parsed.path:
                return parsed.path.split('/embed/')[-1].split('?')[0]
            
            # Check /v/ format
            if '/v/' in parsed.path:
                return parsed.path.split('/v/')[-1].split('?')[0]
        
        return None
    
    def normalize_url(self, url: str) -> Optional[str]:
        """
        Normalize YouTube URL to standard format
        
        Args:
            url: YouTube URL
            
        Returns:
            Normalized URL or None if invalid
        """
        video_id = self.extract_video_id(url)
        if not video_id:
            return None
        
        return f"https://www.youtube.com/watch?v={video_id}"
    
    def sanitize_url(self, url: str) -> str:
        """
        Sanitize URL by removing tracking parameters
        
        Args:
            url: URL to sanitize
            
        Returns:
            Sanitized URL
        """
        if not url:
            return url
        
        # Remove common tracking parameters
        tracking_params = ['si', 'feature', 't', 'ab_channel']
        
        parsed = urlparse(url)
        query = parse_qs(parsed.query)
        
        # Remove tracking parameters
        clean_query = {k: v for k, v in query.items() if k not in tracking_params}
        
        # Reconstruct URL
        from urllib.parse import urlencode
        clean_query_string = urlencode(clean_query, doseq=True)
        
        clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        if clean_query_string:
            clean_url += f"?{clean_query_string}"
        
        return clean_url
