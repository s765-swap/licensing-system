@echo off
echo 🎮 Starting Minecraft Plugin Licensing SaaS (Simple Mode)...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Start backend server
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "cd backend && node server-simple.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🌐 Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && python -m http.server 3000"

echo.
echo 🎉 Setup complete!
echo.
echo 📊 Access your application:
echo    Frontend Dashboard: http://localhost:3000
echo    Backend API: http://localhost:4000/api
echo.
echo 🔑 Admin Login Credentials:
echo    Email: admin@admin.com
echo    Password: admin
echo.
echo 🛒 How to use:
echo    1. Login with admin credentials
echo    2. Go to "Plugin Store" tab
echo    3. Purchase a license (select "Admin Free" for testing)
echo    4. Copy the generated code and embed it in your plugin
echo    5. Your plugin will validate the license automatically
echo.
echo 📁 Sample plugin code is in: sample-plugin.js
echo.
pause
