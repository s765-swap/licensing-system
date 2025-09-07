# 🎮 Minecraft Plugin Licensing SaaS

A complete SaaS platform for Minecraft plugin developers to manage licenses, subscriptions, and Discord bot integration.

## 🚀 Features

### Core Features
- **License Management**: Generate, validate, revoke, and track license keys
- **User Authentication**: JWT-based login/register system with role-based access
- **Plugin Management**: Create and manage your Minecraft plugins with categories and tags
- **Payment Integration**: Stripe-powered payment processing with multiple license types
- **Advanced Analytics**: Comprehensive dashboard with charts, trends, and insights
- **Discord Bot Integration**: Manage licenses directly from Discord with slash commands
- **Email Notifications**: Automated email alerts for license events
- **Admin Panel**: Complete admin dashboard for user and system management
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Real-time Monitoring**: Structured logging and performance tracking

### Advanced License System
- Generate unique UUID license keys with hardware fingerprinting
- Multi-server support with IP/port restrictions
- License usage tracking and validation history
- Support for different license types (1-month, 3-months, 6-months, 1-year, lifetime)
- Automatic license expiration handling
- License transfer and management capabilities

### Payment & Subscription Features
- Stripe Checkout integration for secure payments
- Multiple license pricing tiers
- Customer portal for subscription management
- Payment history and invoice tracking
- Automated license creation after successful payment
- Webhook handling for payment events

### Analytics & Reporting
- Real-time dashboard with key metrics
- License creation trends and patterns
- Plugin performance analytics
- User behavior tracking
- Revenue reporting and insights
- Data export capabilities (CSV/JSON)
- Custom date range filtering

### Discord Bot Commands
- `/license check <key> <plugin> <server>` - Validate a license
- `/license info <key>` - Get detailed license information
- `/license revoke <key>` - Revoke a license (Admin only)
- `/license stats` - View license statistics
- `/license create <plugin> <buyer> <server>` - Create new license (Admin only)
- `/license list` - List all licenses (Admin only)

## 🛠 Tech Stack

- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with role-based access
- **Payment Processing**: Stripe API integration
- **Email Service**: Nodemailer with HTML templates
- **Logging**: Winston with structured logging
- **API Documentation**: Swagger/OpenAPI 3.0
- **Discord Bot**: discord.js v14
- **Testing**: Jest with Supertest
- **Deployment**: Docker & Docker Compose

## 📦 Project Structure

```
/project-root
  /backend          # Express.js API server
    /config         # Database and Swagger configuration
    /controllers    # API route handlers (auth, licenses, plugins, payments, analytics, admin)
    /middleware     # Authentication and validation middleware
    /models         # MongoDB models (User, License, Plugin)
    /routes         # API routes
    /utils          # Utility functions (email, logging)
    /tests          # Test suite
    server.js       # Main server file
  /frontend         # Vanilla JS SPA
    index.html      # Main HTML file
    src/
      main.js       # Frontend application
      components/   # Reusable components (Analytics, Payments)
  /bot             # Discord bot
    index.js        # Bot main file
  docker-compose.yml # Docker orchestration
  env.example      # Environment variables template
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
Copy `env.example` to `.env` and configure your environment variables:
```env
# Server Configuration
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://admin:password123@mongodb:27017/licensing_saas?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_CHANNEL_ID=your-discord-channel-id-here
ADMIN_ROLE_IDS=role-id-1,role-id-2

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@licensingsaas.com

# Logging Configuration
LOG_LEVEL=info

# API Configuration
API_URL=http://localhost:4000/api
```

### 3. Start the Application

**Option 1: Simple Mode (Recommended for Development)**
```bash
# Windows
start.bat

# Linux/Mac
./start-simple.sh
```

**Option 2: Docker Mode (Production-like)**
```bash
# Windows
start-docker.bat

# Linux/Mac
docker-compose up -d
```

### 4. Access the Application
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **API Documentation**: http://localhost:4000/api/docs
- **API Health Check**: http://localhost:4000/api/health

### 5. Default Admin Account
- **Email**: admin@admin.com
- **Password**: admin
- **Tier**: Enterprise (unlimited licenses)

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

### Interactive API Documentation
Visit http://localhost:4000/api/docs for interactive Swagger documentation with all endpoints, request/response schemas, and testing capabilities.

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

### Payment Endpoints
- `POST /api/payments/create-checkout-session` - Create Stripe checkout session (protected)
- `POST /api/payments/webhook` - Handle Stripe webhooks (public)
- `GET /api/payments/history` - Get payment history (protected)
- `POST /api/payments/create-portal-session` - Create customer portal session (protected)

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Get comprehensive analytics dashboard (protected)
- `GET /api/analytics/license-usage` - Get license usage analytics (protected)
- `GET /api/analytics/plugin-performance` - Get plugin performance analytics (protected)
- `GET /api/analytics/export` - Export analytics data (protected)

### Admin Endpoints (Admin only)
- `GET /api/admin/dashboard` - Get admin dashboard statistics
- `GET /api/admin/users` - Get all users with pagination
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/licenses` - Get all licenses with admin view
- `POST /api/admin/announcement` - Send announcement email to all users

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
