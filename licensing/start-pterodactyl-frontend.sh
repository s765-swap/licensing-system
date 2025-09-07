#!/bin/bash

# Pterodactyl Frontend Startup Script
# This script starts the licensing frontend for Pterodactyl hosting

echo "🚀 Starting Licensing SaaS Frontend for Pterodactyl..."

# Set default environment variables if not provided
export FRONTEND_PORT=${FRONTEND_PORT:-3000}
export API_URL=${API_URL:-http://localhost:4000/api}

echo "📊 Environment Configuration:"
echo "   FRONTEND_PORT: $FRONTEND_PORT"
echo "   API_URL: $API_URL"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the frontend server
echo "🌐 Starting frontend server on port $FRONTEND_PORT..."
node frontend-server.js
