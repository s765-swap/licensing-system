@echo off
echo 🤖 Starting Discord Bot...

REM Check if bot config exists
if not exist bot-config.json (
    echo ❌ Bot configuration not found!
    echo Please configure the bot in the dashboard first.
    echo.
    echo Steps:
    echo 1. Go to http://localhost:3000
    echo 2. Login with admin@admin.com / admin
    echo 3. Go to "Bot Configuration" tab
    echo 4. Enter your Discord bot token and channel ID
    echo 5. Click "Start Bot" to save configuration
    echo.
    pause
    exit /b 1
)

echo ✅ Bot configuration found
echo 🚀 Starting bot with configuration...

REM Start the bot using the launcher
node bot-launcher.js start bot-config.json

echo.
echo Bot has stopped. Press any key to exit...
pause
