#!/bin/bash

# Pterodactyl Backend Startup Script
# This script starts the licensing backend for Pterodactyl hosting

echo "🚀 Starting Licensing SaaS Backend for Pterodactyl..."

# Set default environment variables if not provided
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-4000}
export JWT_SECRET=${JWT_SECRET:-your-super-secret-jwt-key-change-this-in-production}
export JWT_EXPIRE=${JWT_EXPIRE:-7d}
export FRONTEND_URL=${FRONTEND_URL:-*}

echo "📊 Environment Configuration:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "   JWT_EXPIRE: $JWT_EXPIRE"
echo "   FRONTEND_URL: $FRONTEND_URL"

# Navigate to backend directory
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Start the backend server
echo "🌐 Starting backend server on port $PORT..."
node server.js
