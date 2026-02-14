# JAV Downloader Pro 🚀

A professional, feature-rich YouTube video and audio downloader with a beautiful Terabox-inspired UI, dark mode, download history, keyboard shortcuts, and advanced rate limiting.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### Core Functionality
- 🎬 **Video Downloads** - Up to 4K (2160p) quality
- 🎵 **Audio Extraction** - High-quality MP3 (192kbps)
- 📊 **Real-time Progress** - Live speed, ETA, and percentage
- 🖼️ **Video Preview** - Thumbnail and metadata before download
- 💾 **Multiple Quality Options** - 360p to 4K

### Advanced Features
- 🌙 **Dark Mode** - Easy on the eyes, toggle anytime
- 📜 **Download History** - Track all your downloads
- ⌨️ **Keyboard Shortcuts** - Work faster with hotkeys
- 🚀 **Smart Loading States** - Smooth UX with loading indicators
- 🔔 **Toast Notifications** - Non-intrusive status updates
- 🎨 **Responsive Design** - Perfect on mobile, tablet, desktop
- 🛡️ **Rate Limiting** - Prevent abuse with smart limits
- 💾 **Local Storage** - History saved locally, private
- 📋 **One-Click Paste** - Paste from clipboard instantly
- 🔄 **Re-download** - Download again from history

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- FFmpeg (for audio conversion)

### Installation

1. **Download and extract** the project folder

2. **Install dependencies**:
   ```bash
   # Windows: Double-click start.bat
   # Mac/Linux: Run ./start.sh
   
   # Or manually:
   pip install -r requirements.txt
   ```

3. **Install FFmpeg**:
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg` (Ubuntu/Debian)

4. **Run the application**:
   ```bash
   # Windows
   start.bat
   
   # Mac/Linux
   ./start.sh
   
   # Or manually
   python app.py
   ```

5. **Open browser** and go to: `http://localhost:5000`

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + V` | Paste URL from clipboard |
| `Ctrl/Cmd + D` | Toggle dark mode |
| `Ctrl/Cmd + H` | Show download history |
| `Enter` | Start download |
| `Escape` | Close modals |

## 📁 Project Structure

```
jav-downloader-pro/
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── .env.example             # Environment configuration template
│
├── utils/                   # Utility modules
│   ├── __init__.py
│   ├── cache.py            # Video info caching
│   ├── queue.py            # Download queue management
│   └── validator.py        # URL validation
│
├── templates/
│   └── index.html          # Main HTML template
│
├── static/
│   ├── css/
│   │   └── style.css       # Styles with dark mode
│   └── js/
│       └── app.js          # Frontend JavaScript
│
├── downloads/              # Downloaded files
│
├── start.bat               # Windows start script
├── start.sh                # Unix/Mac start script
│
└── README.md               # This file
```

## 🎯 Usage

### Basic Download
1. Paste or type YouTube URL
2. Click info button (optional) to preview
3. Select format (Video/Audio)
4. Choose quality
5. Click Download
6. Wait for completion

### Using History
1. Click history icon (top right)
2. View past downloads
3. Click "Download Again" to re-download
4. Clear history if needed

### Dark Mode
1. Click theme toggle (moon/sun icon)
2. Or press `Ctrl/Cmd + D`
3. Theme persists across sessions

## ⚙️ Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Key settings:
- `DEBUG` - Enable/disable debug mode
- `PORT` - Server port (default: 5000)
- `RATE_LIMIT_PER_HOUR` - Downloads per hour limit
- `SECRET_KEY` - Flask secret key

### Rate Limiting

Default limits (can be changed in `app.py`):
- 200 requests per day
- 50 requests per hour
- 10 downloads per hour

## 🐳 Docker Deployment

```bash
# Build image
docker build -t jav-downloader-pro .

# Run container
docker run -d -p 5000:5000 \
  -v $(pwd)/downloads:/app/downloads \
  jav-downloader-pro
```

## 🚀 Production Deployment

### Using Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### SSL/HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

## 🔒 Security Best Practices

### For Public Deployment
1. ✅ Change `SECRET_KEY` in `.env`
2. ✅ Enable rate limiting
3. ✅ Set up HTTPS/SSL
4. ✅ Configure firewall rules
5. ✅ Use environment variables for secrets
6. ✅ Regular security updates
7. ✅ Monitor logs for abuse
8. ✅ Consider adding CAPTCHA

### For Personal Use
- Keep on localhost only
- Don't expose to internet
- Regular backups of settings

## 📊 Features Comparison

| Feature | Basic Version | Pro Version |
|---------|--------------|-------------|
| Video Download | ✅ | ✅ |
| Audio Extraction | ✅ | ✅ |
| Quality Options | 4 | 7 (360p-4K) |
| Dark Mode | ❌ | ✅ |
| Download History | ❌ | ✅ |
| Keyboard Shortcuts | ❌ | ✅ |
| Rate Limiting | ❌ | ✅ |
| Smart Caching | ❌ | ✅ |
| Toast Notifications | Basic | Advanced |
| Loading States | Basic | Advanced |
| URL Validation | Basic | Advanced |
| Error Handling | Basic | Comprehensive |

## 🐛 Troubleshooting

### FFmpeg Not Found
```bash
# Verify installation
ffmpeg -version

# If not found, install:
# Windows: Download and add to PATH
# Mac: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

### Port Already in Use
```bash
# Change port in app.py or .env
PORT=8080

# Or find and kill process
# Linux/Mac: lsof -i :5000
# Windows: netstat -ano | findstr :5000
```

### Downloads Not Working
1. Check internet connection
2. Verify YouTube URL is valid
3. Check console/terminal for errors
4. Try different video
5. Update yt-dlp: `pip install --upgrade yt-dlp`

### Rate Limit Errors
- Wait for cooldown period
- Adjust limits in `app.py` for personal use
- Check if multiple users on same IP

## 📝 API Endpoints

### GET /
Main application page

### POST /api/info
Fetch video information
```json
{
  "url": "https://youtube.com/watch?v=..."
}
```

### POST /api/download
Start download
```json
{
  "url": "https://youtube.com/watch?v=...",
  "format": "video",
  "quality": "1080p"
}
```

### GET /api/progress/:download_id
Get download progress

### GET /api/stats
Get server statistics

### GET /api/health
Health check endpoint

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Make your changes
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## ⚖️ Legal Notice

**IMPORTANT**: This tool is for personal use only.

- ✅ Download content you own
- ✅ Download public domain content
- ✅ Download with proper permissions
- ❌ Don't violate YouTube's ToS
- ❌ Don't distribute copyrighted content
- ❌ Don't use for commercial purposes

Users are solely responsible for ensuring their use complies with all applicable laws and terms of service.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Excellent YouTube downloader
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [FFmpeg](https://ffmpeg.org/) - Media processing
- Terabox - UI/UX inspiration

## 📞 Support

For issues:
1. Check this README
2. Review error logs
3. Search existing issues
4. Create new issue with details

## 🗺️ Roadmap

### v1.1.0
- [ ] Playlist download support
- [ ] Subtitle download
- [ ] Video format selection (WebM, MKV)
- [ ] Batch URL processing

### v1.2.0
- [ ] User authentication
- [ ] Cloud storage integration
- [ ] Browser extension
- [ ] API key system

### v2.0.0
- [ ] Multi-language support
- [ ] Advanced scheduling
- [ ] Video editing features
- [ ] Mobile apps

---

**Made with ❤️ by the JAV Downloader Pro Team**

⭐ Star this project if you find it useful!

🐛 Report bugs and request features in issues

💬 Join discussions and share feedback
