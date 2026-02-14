#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "================================================"
echo "   JAV Downloader Pro - Starting Server"
echo "================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR] Python 3 is not installed${NC}"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo -e "${GREEN}[1/5]${NC} Checking Python installation..."
python3 --version
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${GREEN}[2/5]${NC} Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created successfully!"
else
    echo -e "${GREEN}[2/5]${NC} Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo -e "${GREEN}[3/5]${NC} Activating virtual environment..."
source venv/bin/activate
echo ""

# Install/upgrade dependencies
echo -e "${GREEN}[4/5]${NC} Installing dependencies..."
pip install -r requirements.txt --quiet --upgrade
echo "Dependencies installed successfully!"
echo ""

# Check if FFmpeg is available
echo -e "${GREEN}[5/5]${NC} Checking FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo ""
    echo -e "${YELLOW}[WARNING] FFmpeg is not installed${NC}"
    echo "Audio conversion will not work without FFmpeg"
    echo ""
    echo "Install FFmpeg:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu/Debian: sudo apt install ffmpeg"
    echo "  Fedora: sudo dnf install ffmpeg"
    echo ""
    echo "Press Enter to continue without FFmpeg..."
    read
else
    echo "FFmpeg is installed and ready!"
fi
echo ""

# Create downloads folder
mkdir -p downloads

# Start the application
echo "================================================"
echo "   Server Starting..."
echo "================================================"
echo ""
echo -e "${GREEN}[INFO]${NC} Server will be available at:"
echo "       http://localhost:5000"
echo ""
echo -e "${GREEN}[INFO]${NC} Press Ctrl+C to stop the server"
echo "================================================"
echo ""

# Set environment for development
export FLASK_ENV=development
export DEBUG=True

python3 app.py
