from flask import Flask, render_template, request, jsonify, send_file
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
import yt_dlp
import os
import re
from pathlib import Path
import threading
import uuid
from datetime import datetime, timedelta
import logging
from functools import wraps
import json

# Import utilities
from utils.cache import VideoInfoCache
from utils.queue import DownloadQueue
from utils.validator import URLValidator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['DOWNLOAD_FOLDER'] = 'downloads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 * 1024  # 16GB max
app.config['JSON_SORT_KEYS'] = False

# Enable CORS for API endpoints
CORS(app)

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Create downloads folder
Path(app.config['DOWNLOAD_FOLDER']).mkdir(parents=True, exist_ok=True)

# Initialize utilities
video_cache = VideoInfoCache(max_size=100, ttl=3600)  # Cache for 1 hour
download_queue = DownloadQueue()
url_validator = URLValidator()

# Store download progress and statistics
download_progress = {}
download_stats = {
    'total_downloads': 0,
    'successful_downloads': 0,
    'failed_downloads': 0,
    'total_bytes_downloaded': 0
}

def sanitize_filename(filename):
    """Remove invalid characters from filename"""
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    filename = filename.strip()
    # Limit filename length
    if len(filename) > 200:
        name, ext = os.path.splitext(filename)
        filename = name[:200] + ext
    return filename

def progress_hook(d, download_id):
    """Update download progress"""
    try:
        if d['status'] == 'downloading':
            percent = d.get('_percent_str', '0%').strip()
            speed = d.get('_speed_str', 'N/A').strip()
            eta = d.get('_eta_str', 'N/A').strip()
            downloaded = d.get('downloaded_bytes', 0)
            total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
            
            download_progress[download_id] = {
                'status': 'downloading',
                'percent': percent,
                'speed': speed,
                'eta': eta,
                'downloaded_bytes': downloaded,
                'total_bytes': total,
                'filename': d.get('filename', '')
            }
        elif d['status'] == 'finished':
            download_progress[download_id] = {
                'status': 'processing',
                'percent': '100%',
                'message': 'Processing video...',
                'filename': d.get('filename', '')
            }
    except Exception as e:
        logger.error(f"Error in progress hook: {e}")

@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')

@app.route('/terms')
def terms():
    """Render Terms of Service page"""
    return render_template('terms.html')

@app.route('/privacy')
def privacy():
    """Render Privacy Policy page"""
    return render_template('privacy.html')

@app.route('/api/info', methods=['POST'])
@limiter.limit("30 per minute")
def get_video_info():
    """Get video information"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'No URL provided'}), 400
        
        # Validate URL
        if not url_validator.is_valid_youtube_url(url):
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # Check cache first
        cached_info = video_cache.get(url)
        if cached_info:
            logger.info(f"Cache hit for URL: {url}")
            return jsonify(cached_info)
        
        logger.info(f"Fetching info for URL: {url}")
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Get available formats
            formats = []
            if 'formats' in info:
                seen_heights = set()
                for fmt in info['formats']:
                    height = fmt.get('height')
                    if height and height not in seen_heights and height >= 360:
                        formats.append({
                            'quality': f"{height}p",
                            'height': height,
                            'ext': fmt.get('ext', 'mp4')
                        })
                        seen_heights.add(height)
            
            formats.sort(key=lambda x: x['height'], reverse=True)
            
            video_info = {
                'title': info.get('title', 'Unknown'),
                'duration': info.get('duration', 0),
                'thumbnail': info.get('thumbnail', ''),
                'uploader': info.get('uploader', 'Unknown'),
                'view_count': info.get('view_count', 0),
                'upload_date': info.get('upload_date', ''),
                'description': info.get('description', '')[:200] + '...' if info.get('description') else '',
                'formats': formats,
                'filesize_approx': info.get('filesize', 0) or info.get('filesize_approx', 0)
            }
            
            # Cache the result
            video_cache.set(url, video_info)
            
            return jsonify(video_info)
            
    except Exception as e:
        logger.error(f"Error fetching video info: {str(e)}")
        return jsonify({'error': f'Failed to fetch video info: {str(e)}'}), 400

@app.route('/api/download', methods=['POST'])
@limiter.limit("10 per hour")
def download():
    """Start download"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        format_type = data.get('format', 'video')
        quality = data.get('quality', 'best')
        audio_format = data.get('audioFormat', 'mp3')
        
        if not url:
            return jsonify({'error': 'No URL provided'}), 400
        
        # Validate URL
        if not url_validator.is_valid_youtube_url(url):
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        download_id = str(uuid.uuid4())
        download_progress[download_id] = {
            'status': 'queued',
            'percent': '0%',
            'message': 'Download queued...'
        }
        
        logger.info(f"Starting download: {download_id} for URL: {url}")
        
        def download_task():
    try:
                ydl_opts = {
                    'outtmpl': os.path.join(app.config['DOWNLOAD_FOLDER'], '%(title)s.%(ext)s'),
                    'progress_hooks': [lambda d: progress_hook(d, download_id)],
                    'quiet': False,
                    'no_warnings': False,
                    'extractor_args': {'youtube': {'player_client': ['android', 'web']}},
                }
                
                if format_type == 'audio':
                    # Audio format mapping
                    audio_codec_map = {
                        'mp3': 'mp3',
                        'm4a': 'm4a',
                        'opus': 'opus',
                        'flac': 'flac',
                        'wav': 'wav'
                    }
                    
                    selected_codec = audio_codec_map.get(audio_format, 'mp3')
                    
                    ydl_opts.update({
                        'format': 'bestaudio/best',
                        'postprocessors': [{
                            'key': 'FFmpegExtractAudio',
                            'preferredcodec': selected_codec,
                            'preferredquality': '320' if selected_codec != 'flac' else None,
                        }],
                    })
                else:
                    # Video format selection
                    format_map = {
                        'best': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                        '2160p': 'bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160][ext=mp4]/best',
                        '1440p': 'bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best[height<=1440][ext=mp4]/best',
                        '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best',
                        '720p': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
                        '480p': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best',
                        '360p': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best',
                    }
                    ydl_opts['format'] = format_map.get(quality, format_map['best'])
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    title = info.get('title', 'video')
                    filesize = info.get('filesize', 0) or info.get('filesize_approx', 0)
                    
                    download_progress[download_id] = {
                        'status': 'completed',
                        'percent': '100%',
                        'title': title,
                        'filesize': filesize,
                        'format': format_type,
                        'quality': quality if format_type == 'video' else audio_format
                    }
                    
                    # Update statistics
                    download_stats['total_downloads'] += 1
                    download_stats['successful_downloads'] += 1
                    download_stats['total_bytes_downloaded'] += filesize
                    
                    logger.info(f"Download completed: {download_id} - {title}")
                    
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Download failed: {download_id} - {error_msg}")
                download_progress[download_id] = {
                    'status': 'error',
                    'error': error_msg
                }
                download_stats['total_downloads'] += 1
                download_stats['failed_downloads'] += 1
        
        # Start download in background thread
        thread = threading.Thread(target=download_task, daemon=True)
        thread.start()
        
        return jsonify({
            'download_id': download_id,
            'message': 'Download started successfully'
        })
        
    except Exception as e:
        logger.error(f"Error starting download: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/progress/<download_id>')
def get_progress(download_id):
    """Get download progress"""
    progress = download_progress.get(download_id, {
        'status': 'unknown',
        'error': 'Download ID not found'
    })
    return jsonify(progress)

@app.route('/api/stats')
def get_stats():
    """Get download statistics"""
    return jsonify(download_stats)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'active_downloads': len([p for p in download_progress.values() if p.get('status') == 'downloading'])
    })

@app.errorhandler(429)
def ratelimit_handler(e):
    """Rate limit error handler"""
    return jsonify({
        'error': 'Rate limit exceeded. Please try again later.',
        'retry_after': e.description
    }), 429

@app.errorhandler(404)
def not_found(e):
    """404 error handler"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    """500 error handler"""
    logger.error(f"Internal error: {str(e)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting JAV Downloader on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
