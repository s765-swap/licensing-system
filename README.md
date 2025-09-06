# 🎮 Minecraft Plugin Licensing SaaS

A complete SaaS platform for Minecraft plugin developers to manage licenses, subscriptions, and Discord bot integration.

## 🚀 Features

### Core Features
- **License Management**: Generate, validate, revoke, and track license keys
- **User Authentication**: JWT-based login/register system
- **Plugin Management**: Create and manage your Minecraft plugins
- **Discord Bot Integration**: Manage licenses directly from Discord
- **Real-time Notifications**: Get notified of license events
- **Dashboard**: Beautiful, responsive web interface

### License System
- Generate unique UUID license keys
- Store license data in MongoDB
- Validate licenses with plugin and server information
- Track license usage and expiration
- Support for different license statuses (active, expired, revoked)

### Discord Bot Commands
- `/license check <key> <plugin> <server>` - Validate a license
- `/license info <key>` - Get detailed license information
- `/license revoke <key>` - Revoke a license (Admin only)
- `/license stats` - View license statistics

## 🛠 Tech Stack

- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Discord Bot**: discord.js v14
- **Deployment**: Docker & Docker Compose

## 📦 Project Structure

```
/project-root
  /backend          # Express.js API server
    /config         # Database configuration
    /controllers    # API route handlers
    /middleware     # Authentication middleware
    /models         # MongoDB models
    /routes         # API routes
    server.js       # Main server file
  /frontend         # React-like SPA
    index.html      # Main HTML file
    src/main.js     # Frontend application
  /bot             # Discord bot
    index.js        # Bot main file
  docker-compose.yml # Docker orchestration
  README.md        # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Discord Bot Token (for bot functionality)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd licensing
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
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
```

### 3. Start the Application
```bash
docker-compose up -d
```

### 4. Access the Application
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **API Health Check**: http://localhost:4000/api/health

## 🔧 Development Setup

### Local Development (without Docker)

1. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Bot
cd ../bot
npm install

# Frontend (no dependencies needed - uses CDN)
```

2. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or install MongoDB locally
```

3. **Start Services**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Bot
cd bot
npm run dev

# Terminal 3 - Frontend (serve with any static server)
cd frontend
python -m http.server 8000
# or
npx serve .
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### License Endpoints
- `POST /api/licenses/create` - Create new license (protected)
- `POST /api/licenses/validate` - Validate license (public)
- `GET /api/licenses` - Get user's licenses (protected)
- `GET /api/licenses/:key` - Get specific license (protected)
- `POST /api/licenses/revoke` - Revoke license (protected)
- `PUT /api/licenses/:key` - Update license (protected)
- `GET /api/licenses/stats` - Get license statistics (protected)

### Plugin Endpoints
- `POST /api/plugins` - Create new plugin (protected)
- `GET /api/plugins` - Get user's plugins (protected)
- `GET /api/plugins/:id` - Get specific plugin (protected)
- `PUT /api/plugins/:id` - Update plugin (protected)
- `DELETE /api/plugins/:id` - Delete plugin (protected)

## 🤖 Discord Bot Setup

### 1. Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token

### 2. Invite Bot to Server
1. Go to "OAuth2" > "URL Generator"
2. Select "bot" and "applications.commands" scopes
3. Select necessary permissions (Send Messages, Use Slash Commands, etc.)
4. Use generated URL to invite bot to your server

### 3. Configure Bot
1. Set `DISCORD_BOT_TOKEN` in your `.env` file
2. Set `DISCORD_CHANNEL_ID` for notifications
3. Set `ADMIN_ROLE_IDS` for admin commands

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- MongoDB injection protection
- Helmet.js security headers

## 📊 Database Schema

### Users Collection
```json
{
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "discordId": "string (optional)",
  "tier": "free|premium|enterprise",
  "licenseLimit": "number",
  "createdAt": "date",
  "lastLogin": "date"
}
```

### Licenses Collection
```json
{
  "key": "string (UUID, unique)",
  "plugin": "string",
  "buyer": "string",
  "server": "string",
  "status": "active|expired|revoked",
  "expiresAt": "date",
  "createdBy": "ObjectId (User)",
  "createdAt": "date",
  "lastValidated": "date",
  "validationCount": "number",
  "notes": "string"
}
```

### Plugins Collection
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "version": "string",
  "downloadUrl": "string",
  "isActive": "boolean",
  "createdBy": "ObjectId (User)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## 🚀 Deployment

### Production Deployment
1. Update environment variables for production
2. Use a production MongoDB instance
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging

### Docker Production
```bash
# Build and start in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Features

- Payment integration (Stripe/PayPal)
- Advanced analytics and reporting
- License usage tracking
- Multi-language support
- Mobile app
- Advanced Discord bot features
- Webhook support
- License templates
- Bulk operations
- Advanced user management

---

**Built with ❤️ for the Minecraft plugin development community**
