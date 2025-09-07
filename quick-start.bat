@echo off
echo 🚀 Starting Licensing SaaS Platform Setup...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration before continuing.
    echo    Required: Discord Bot Token, Stripe Keys, Email Configuration
    pause
)

REM Install dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

echo 📦 Installing bot dependencies...
cd bot
call npm install
cd ..

REM Start services
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service health...

REM Check backend
curl -s http://localhost:4000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is running
) else (
    echo ❌ Backend API is not responding
)

REM Check frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running
) else (
    echo ❌ Frontend is not responding
)

echo.
echo 🎉 Setup Complete!
echo.
echo 📱 Access your application:
echo    Frontend Dashboard: http://localhost:3000
echo    Backend API: http://localhost:4000/api
echo    API Documentation: http://localhost:4000/api/docs
echo.
echo 🔑 Default Admin Account:
echo    Email: admin@admin.com
echo    Password: admin
echo.
echo 📚 Next Steps:
echo    1. Configure your Discord Bot Token in .env
echo    2. Set up Stripe keys for payment processing
echo    3. Configure email settings for notifications
echo    4. Invite your Discord bot to your server
echo.
echo 🛠️  To stop the services:
echo    docker-compose down
echo.
echo 📖 For more information, see README.md
pause
