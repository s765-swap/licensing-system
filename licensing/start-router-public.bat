@echo off
echo 🌍 Starting Minecraft Plugin Licensing SaaS (Router Public Mode)...

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

echo ✅ Dependencies found

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP: =%

echo 📍 Your local IP: %LOCAL_IP%

REM Start backend server
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "cd backend && node server-simple.js"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🌐 Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && python -m http.server 3000"

REM Wait for frontend to start
timeout /t 2 /nobreak >nobreak

echo.
echo 🎉 Local servers started!
echo.
echo 📊 Your application URLs:
echo    Local Frontend: http://%LOCAL_IP%:3000
echo    Local API: http://%LOCAL_IP%:4000/api
echo.
echo 🌍 For PUBLIC access, you need to:
echo    1. Set up port forwarding on your router:
echo       - Port 3000 → %LOCAL_IP%:3000 (Frontend)
echo       - Port 4000 → %LOCAL_IP%:4000 (API)
echo    2. Find your public IP at: https://whatismyipaddress.com/
echo    3. Your public URLs will be:
echo       - Frontend: http://YOUR_PUBLIC_IP:3000
echo       - API: http://YOUR_PUBLIC_IP:4000/api
echo.
echo 🔑 Admin Login Credentials:
echo    Email: admin@admin.com
echo    Password: admin
echo.
echo ⚠️  Security Warning:
echo    - Change default admin password immediately
echo    - Consider using HTTPS (Let's Encrypt)
echo    - Enable firewall protection
echo    - Monitor access logs
echo.

pause
