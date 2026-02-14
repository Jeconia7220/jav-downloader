@echo off
title JAV Downloader Pro - Starting Server
color 0A

echo.
echo ================================================
echo    JAV Downloader Pro - Starting Server
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    echo.
    pause
    exit /b 1
)

echo [1/5] Checking Python installation...
python --version
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo [2/5] Creating virtual environment...
    python -m venv venv
    echo Virtual environment created successfully!
) else (
    echo [2/5] Virtual environment already exists
)
echo.

REM Activate virtual environment
echo [3/5] Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install/upgrade dependencies
echo [4/5] Installing dependencies...
pip install -r requirements.txt --quiet --upgrade
echo Dependencies installed successfully!
echo.

REM Check if FFmpeg is available
echo [5/5] Checking FFmpeg...
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [WARNING] FFmpeg is not installed or not in PATH
    echo Audio conversion will not work without FFmpeg
    echo.
    echo Download FFmpeg from: https://ffmpeg.org/download.html
    echo Then add it to your system PATH
    echo.
    echo Press any key to continue without FFmpeg...
    pause >nul
) else (
    echo FFmpeg is installed and ready!
)
echo.

REM Create downloads folder
if not exist "downloads" mkdir downloads

REM Start the application
echo ================================================
echo    Server Starting...
echo ================================================
echo.
echo [INFO] Server will be available at:
echo        http://localhost:5000
echo.
echo [INFO] Press Ctrl+C to stop the server
echo ================================================
echo.

REM Set environment for development
set FLASK_ENV=development
set DEBUG=True

python app.py

pause
