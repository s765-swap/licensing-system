@echo off
echo 🌍 Starting Minecraft Plugin Licensing SaaS (Public Mode)...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if ngrok is installed
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ngrok is not installed. Please install ngrok first.
    echo    Download from: https://ngrok.com/download
    echo    Add to PATH or place in project folder
    pause
    exit /b 1
)

echo ✅ All dependencies found

REM Start backend server
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "cd backend && node server-simple.js"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🌐 Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && python -m http.server 3000"

REM Wait for frontend to start
timeout /t 2 /nobreak >nul

REM Start ngrok for backend API
echo 🌍 Starting ngrok tunnel for API...
start "API Tunnel" cmd /k "ngrok http 4000 --log=stdout"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start ngrok for frontend
echo 🌍 Starting ngrok tunnel for Frontend...
start "Frontend Tunnel" cmd /k "ngrok http 3000 --log=stdout"

REM Wait for tunnels to establish
timeout /t 5 /nobreak >nul

echo.
echo 🎉 Public hosting setup complete!
echo.
echo 📊 Your application is now publicly accessible:
echo    Check the ngrok terminals for your public URLs
echo    They will look like: https://abc123.ngrok.io
echo.
echo 🔑 Admin Login Credentials:
echo    Email: admin@admin.com
echo    Password: admin
echo.
echo 📝 Important Notes:
echo    1. ngrok URLs change each time you restart (free plan)
echo    2. For permanent URLs, upgrade to ngrok paid plan
echo    3. Share the frontend URL with your users
echo    4. Use the API URL for Discord bot configuration
echo.
echo 🔧 To get your URLs:
echo    1. Check the ngrok terminal windows
echo    2. Look for "Forwarding" lines
echo    3. Copy the HTTPS URLs
echo.
echo 🛡️  Security Note:
echo    Your app is now public - ensure you have:
echo    - Strong admin password
echo    - Rate limiting enabled
echo    - Input validation working
echo.

pause
