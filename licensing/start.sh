#!/bin/bash

# Minecraft Plugin Licensing SaaS - Startup Script

echo "🎮 Starting Minecraft Plugin Licensing SaaS..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cat > .env << EOF
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_CHANNEL_ID=your-discord-channel-id-here
ADMIN_ROLE_IDS=role-id-1,role-id-2

# Database Configuration
MONGODB_URI=mongodb://admin:password123@mongodb:27017/licensing_saas?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
NODE_ENV=production
PORT=4000
FRONTEND_URL=http://localhost:3000
EOF
    echo "📝 Please edit .env file with your actual configuration values."
    echo "   Especially update DISCORD_BOT_TOKEN and other Discord settings."
    read -p "Press Enter to continue after updating .env file..."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose down
docker-compose build
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test API health
echo "🏥 Testing API health..."
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API is not responding"
fi

# Test frontend
echo "🌐 Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📊 Access your application:"
echo "   Frontend Dashboard: http://localhost:3000"
echo "   Backend API: http://localhost:4000/api"
echo "   API Health: http://localhost:4000/api/health"
echo ""
echo "📚 Next steps:"
echo "   1. Register a new account on the frontend"
echo "   2. Create your first plugin"
echo "   3. Generate license keys"
echo "   4. Configure Discord bot (optional)"
echo ""
echo "🛠️  Management commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
