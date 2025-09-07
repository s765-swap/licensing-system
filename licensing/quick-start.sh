#!/bin/bash

# Licensing SaaS Quick Start Script
echo "🚀 Starting Licensing SaaS Platform Setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "   Required: Discord Bot Token, Stripe Keys, Email Configuration"
    read -p "Press Enter to continue after editing .env file..."
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "📦 Installing bot dependencies..."
cd bot
npm install
cd ..

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."

# Check backend
if curl -s http://localhost:4000/api/health > /dev/null; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is not responding"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📱 Access your application:"
echo "   Frontend Dashboard: http://localhost:3000"
echo "   Backend API: http://localhost:4000/api"
echo "   API Documentation: http://localhost:4000/api/docs"
echo ""
echo "🔑 Default Admin Account:"
echo "   Email: admin@admin.com"
echo "   Password: admin"
echo ""
echo "📚 Next Steps:"
echo "   1. Configure your Discord Bot Token in .env"
echo "   2. Set up Stripe keys for payment processing"
echo "   3. Configure email settings for notifications"
echo "   4. Invite your Discord bot to your server"
echo ""
echo "🛠️  To stop the services:"
echo "   docker-compose down"
echo ""
echo "📖 For more information, see README.md"
