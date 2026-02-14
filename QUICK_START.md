# Quick Start Guide - JAV Downloader Pro

Get started in 5 minutes! 🚀

## Step 1: Install Python (if needed)

### Windows
1. Download from [python.org](https://www.python.org/downloads/)
2. ✅ **CHECK** "Add Python to PATH" during installation
3. Click Install

### Mac
```bash
# Install with Homebrew
brew install python3
```

### Linux
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install python3 python3-pip

# Fedora
sudo dnf install python3 python3-pip
```

## Step 2: Install FFmpeg

### Windows
1. Download from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to system PATH

### Mac
```bash
brew install ffmpeg
```

### Linux
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# Fedora
sudo dnf install ffmpeg
```

## Step 3: Run the Application

### Windows
1. Double-click `start.bat`
2. Wait for "Server Starting..."
3. Browser opens automatically

### Mac/Linux
```bash
chmod +x start.sh
./start.sh
```

## Step 4: Open in Browser

Go to: **http://localhost:5000**

## Step 5: Download Your First Video

1. **Copy** a YouTube URL
2. **Paste** it (or press Ctrl+V)
3. **Click** the info button (👁️) to preview
4. **Select** Video or Audio
5. **Choose** quality
6. **Click** Download
7. **Wait** for completion
8. **Find** your file in the `downloads/` folder

## 🎉 You're Done!

## Tips & Tricks

### Keyboard Shortcuts
- `Ctrl/Cmd + V` - Paste URL
- `Ctrl/Cmd + D` - Toggle dark mode
- `Ctrl/Cmd + H` - View history
- `Enter` - Start download

### Features to Try
- 🌙 Click moon icon for dark mode
- 📜 Click history icon to see past downloads
- 🔄 Re-download from history
- 📋 Use paste button for quick access

## Troubleshooting

### "Python not found"
- Reinstall Python with "Add to PATH" checked
- Restart your terminal/command prompt

### "FFmpeg not found"
- Audio downloads won't work
- Video downloads still work fine
- Install FFmpeg to enable audio

### "Port 5000 already in use"
Edit `app.py`, change:
```python
port = int(os.environ.get('PORT', 8080))  # Changed from 5000
```

### "Download failed"
- Check internet connection
- Try different video
- Some videos may be restricted
- Update: `pip install --upgrade yt-dlp`

## Next Steps

- Read the full [README.md](README.md) for advanced features
- Configure rate limiting in `.env` file
- Set up for production deployment
- Check out keyboard shortcuts

## Need Help?

1. Check [README.md](README.md) for detailed docs
2. Look at error messages in terminal
3. Try the troubleshooting section above
4. Create an issue with details

## Configuration (Optional)

Create `.env` file:
```bash
cp .env.example .env
```

Edit to customize:
- Port number
- Rate limits
- Download location
- Debug mode

## Production Deployment

For production use:

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Or use Docker:
```bash
docker-compose up -d
```

---

**That's it! Enjoy downloading! 🎊**

For more details, see [README.md](README.md)
