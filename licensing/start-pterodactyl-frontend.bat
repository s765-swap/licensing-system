@echo off
REM Pterodactyl Frontend Startup Script for Windows
REM This script starts the licensing frontend for Pterodactyl hosting

echo 🚀 Starting Licensing SaaS Frontend for Pterodactyl...

REM Set default environment variables if not provided
if not defined FRONTEND_PORT set FRONTEND_PORT=3000
if not defined API_URL set API_URL=http://localhost:4000/api

echo 📊 Environment Configuration:
echo    FRONTEND_PORT: %FRONTEND_PORT%
echo    API_URL: %API_URL%

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Start the frontend server
echo 🌐 Starting frontend server on port %FRONTEND_PORT%...
node frontend-server.js
