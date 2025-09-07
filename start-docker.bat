@echo off
echo 🎮 Starting Minecraft Plugin Licensing SaaS...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from example...
    (
        echo # Discord Bot Configuration
        echo DISCORD_BOT_TOKEN=your-discord-bot-token-here
        echo DISCORD_CHANNEL_ID=your-discord-channel-id-here
        echo ADMIN_ROLE_IDS=role-id-1,role-id-2
        echo.
        echo # Database Configuration
        echo MONGODB_URI=mongodb://admin:password123@mongodb:27017/licensing_saas?authSource=admin
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo JWT_EXPIRE=7d
        echo.
        echo # Server Configuration
        echo NODE_ENV=production
        echo PORT=4000
        echo FRONTEND_URL=http://localhost:3000
    ) > .env
    echo 📝 Please edit .env file with your actual configuration values.
    echo    Especially update DISCORD_BOT_TOKEN and other Discord settings.
    pause
)

REM Build and start services
echo 🔨 Building and starting services...
docker-compose down
docker-compose build
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps

echo.
echo 🎉 Setup complete!
echo.
echo 📊 Access your application:
echo    Frontend Dashboard: http://localhost:3000
echo    Backend API: http://localhost:4000/api
echo    API Health: http://localhost:4000/api/health
echo.
echo 📚 Next steps:
echo    1. Register a new account on the frontend
echo    2. Create your first plugin
echo    3. Generate license keys
echo    4. Configure Discord bot (optional)
echo.
echo 🛠️  Management commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo.
pause
