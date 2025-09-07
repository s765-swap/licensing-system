@echo off
REM Pterodactyl Backend Startup Script for Windows
REM This script starts the licensing backend for Pterodactyl hosting

echo 🚀 Starting Licensing SaaS Backend for Pterodactyl...

REM Set default environment variables if not provided
if not defined NODE_ENV set NODE_ENV=production
if not defined PORT set PORT=4000
if not defined JWT_SECRET set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
if not defined JWT_EXPIRE set JWT_EXPIRE=7d
if not defined FRONTEND_URL set FRONTEND_URL=*

echo 📊 Environment Configuration:
echo    NODE_ENV: %NODE_ENV%
echo    PORT: %PORT%
echo    JWT_SECRET: %JWT_SECRET:~0,10%...
echo    JWT_EXPIRE: %JWT_EXPIRE%
echo    FRONTEND_URL: %FRONTEND_URL%

REM Navigate to backend directory
cd backend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install --production
)

REM Start the backend server
echo 🌐 Starting backend server on port %PORT%...
node server.js
