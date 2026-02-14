"""
Download Queue Module
Manages download queue with priority support
"""
from queue import Queue, PriorityQueue
from typing import Dict, Any, Optional
import threading
from datetime import datetime


class DownloadQueue:
    """Download queue manager with priority support"""
    
    def __init__(self, max_concurrent: int = 3):
        """
        Initialize download queue
        
        Args:
            max_concurrent: Maximum concurrent downloads
        """
        self.max_concurrent = max_concurrent
        self.queue = PriorityQueue()
        self.active_downloads = {}
        self.completed_downloads = {}
        self.failed_downloads = {}
        self.lock = threading.Lock()
    
    def add(self, download_id: str, url: str, priority: int = 5) -> None:
        """
        Add download to queue
        
        Args:
            download_id: Unique download identifier
            url: Video URL
            priority: Priority (1-10, lower is higher priority)
        """
        task = {
            'id': download_id,
            'url': url,
            'added_at': datetime.now(),
            'status': 'queued'
        }
        self.queue.put((priority, download_id, task))
    
    def get_next(self) -> Optional[Dict[str, Any]]:
        """
        Get next download from queue
        
        Returns:
            Download task or None if queue is empty
        """
        if self.queue.empty():
            return None
        
        priority, download_id, task = self.queue.get()
        
        with self.lock:
            self.active_downloads[download_id] = task
        
        return task
    
    def mark_completed(self, download_id: str, result: Dict[str, Any]) -> None:
        """
        Mark download as completed
        
        Args:
            download_id: Download identifier
            result: Download result data
        """
        with self.lock:
            if download_id in self.active_downloads:
                task = self.active_downloads.pop(download_id)
                task['completed_at'] = datetime.now()
                task['result'] = result
                self.completed_downloads[download_id] = task
    
    def mark_failed(self, download_id: str, error: str) -> None:
        """
        Mark download as failed
        
        Args:
            download_id: Download identifier
            error: Error message
        """
        with self.lock:
            if download_id in self.active_downloads:
                task = self.active_downloads.pop(download_id)
                task['failed_at'] = datetime.now()
                task['error'] = error
                self.failed_downloads[download_id] = task
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get queue status
        
        Returns:
            Status information
        """
        return {
            'queued': self.queue.qsize(),
            'active': len(self.active_downloads),
            'completed': len(self.completed_downloads),
            'failed': len(self.failed_downloads)
        }
    
    def is_full(self) -> bool:
        """Check if maximum concurrent downloads reached"""
        return len(self.active_downloads) >= self.max_concurrent
    
    def clear_completed(self, older_than_hours: int = 24) -> int:
        """
        Clear old completed downloads
        
        Args:
            older_than_hours: Remove downloads older than this many hours
            
        Returns:
            Number of downloads removed
        """
        with self.lock:
            now = datetime.now()
            to_remove = [
                did for did, task in self.completed_downloads.items()
                if (now - task.get('completed_at', now)).total_seconds() > older_than_hours * 3600
            ]
            
            for did in to_remove:
                del self.completed_downloads[did]
            
            return len(to_remove)
