@echo off
echo 🎮 Starting Minecraft Plugin Licensing SaaS (Simple Mode)...
echo.
echo Choose hosting mode:
echo 1. Local Development (localhost only)
echo 2. Public Access (ngrok tunnel)
echo 3. Router Public (port forwarding)
echo 4. VPS Deployment Helper
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto local
if "%choice%"=="2" goto ngrok
if "%choice%"=="3" goto router
if "%choice%"=="4" goto vps
goto local

:local

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Check if Python is installed (for frontend server)
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

echo ✅ Python found

REM Start backend server
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "cd backend && node server-simple.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🌐 Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && python -m http.server 3000"

REM Wait a moment for frontend to start
timeout /t 2 /nobreak >nul

REM Check if bot dependencies are installed
echo 🤖 Checking bot dependencies...
cd bot
if not exist node_modules (
    echo 📦 Installing bot dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install bot dependencies
        cd ..
        goto :end
    )
)
cd ..

REM Start bot server (will wait for configuration)
echo 🤖 Starting bot server...
start "Bot Server" cmd /k "echo Bot server ready - waiting for configuration... && echo To start the bot, use the dashboard or run: start-bot.bat && echo. && echo Available commands: && echo   start-bot.bat - Start the Discord bot && echo   node bot-launcher.js status - Check bot status && echo. && pause"

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
echo 🤖 Discord Bot Setup:
echo    1. Go to "Bot Configuration" tab in the dashboard
echo    2. Enter your Discord bot token and channel ID
echo    3. Click "Start Bot" to save configuration
echo    4. In the Bot Server terminal, run: start-bot.bat
echo    5. The bot will handle license validation in Discord
echo.
echo 🛒 How to use:
echo    1. Login with admin credentials
echo    2. Go to "Plugin Store" tab
echo    3. Purchase a license (select "Admin Free" for testing)
echo    4. Copy the generated code and embed it in your plugin
echo    5. Your plugin will validate the license automatically
echo    6. Use Discord bot commands to manage licenses
echo.
echo 📁 Sample plugin code is in: sample-plugin.js
echo.
echo 💡 Tips:
echo    - Use the "Bot Configuration" panel to set up Discord integration
echo    - The bot launcher script is available: node bot-launcher.js
echo    - Check bot status in the dashboard
echo    - Three terminals are now running: Backend, Frontend, and Bot
echo.

:ngrok
echo 🌍 Starting with ngrok tunnel...
call start-public.bat
goto end

:router
echo 🌍 Starting with router port forwarding...
call start-router-public.bat
goto end

:vps
echo 🚀 Opening VPS deployment helper...
call deploy-to-vps.bat
goto end

:end
pause
