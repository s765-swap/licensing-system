@echo off
echo 🌍 Setting up Cloudflare Tunnel for Public Access...

REM Check if cloudflared is installed
cloudflared version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ cloudflared is not installed.
    echo    Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
    echo    Or run: winget install Cloudflare.cloudflared
    pause
    exit /b 1
)

echo ✅ cloudflared found

echo.
echo 📝 Setup Instructions:
echo    1. Go to https://dash.cloudflare.com/
echo    2. Sign up/login to your account
echo    3. Go to "Zero Trust" > "Access" > "Tunnels"
echo    4. Click "Create a tunnel"
echo    5. Name it "licensing-saas"
echo    6. Copy the token that appears
echo.
echo 🔑 After getting your token, run:
echo    cloudflared tunnel --url http://localhost:3000 run --token YOUR_TOKEN_HERE
echo.
echo 📊 This will give you a permanent URL like:
echo    https://licensing-saas-abc123.trycloudflare.com
echo.

pause
