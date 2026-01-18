@echo off
echo Starting MEDIBOT Server...
echo.
echo Open your browser and go to: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"

REM Try Python first
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python HTTP Server...
    python -m http.server 8000
    goto :end
)

REM Try Python3
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python3 HTTP Server...
    python3 -m http.server 8000
    goto :end
)

REM Try Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Node.js HTTP Server...
    npx serve . -p 8000
    goto :end
)

echo ERROR: Neither Python nor Node.js found!
echo Please install Python or Node.js to run the server.
echo.
echo Alternative: Use Live Server extension in VS Code
pause

:end