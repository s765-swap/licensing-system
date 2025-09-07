# 🚀 Production Deployment Guide

This guide will help you deploy the Licensing SaaS platform to production with proper security, monitoring, and scalability considerations.

## 📋 Prerequisites

- VPS/Cloud Server (Ubuntu 20.04+ recommended)
- Domain name with SSL certificate
- MongoDB Atlas account or self-hosted MongoDB
- Stripe account for payments
- Email service (Gmail, SendGrid, etc.)
- Discord Bot Token

## 🔧 Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Install Nginx (Reverse Proxy)
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4. Install Certbot (SSL Certificates)
```bash
sudo apt install certbot python3-certbot-nginx -y
```

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Create database user
4. Whitelist your server IP
5. Get connection string

### Option 2: Self-hosted MongoDB
```bash
# Add MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🔐 Environment Configuration

Create production environment file:
```bash
cp env.example .env.production
```

Configure production variables:
```env
# Server Configuration
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourdomain.com

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/licensing_saas?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CHANNEL_ID=your-discord-channel-id
ADMIN_ROLE_IDS=role-id-1,role-id-2

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Logging Configuration
LOG_LEVEL=info

# API Configuration
API_URL=https://api.yourdomain.com/api
```

## 🌐 Nginx Configuration

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/licensing-saas
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration (same as above)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # API
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/licensing-saas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Certificate

Get SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## 🐳 Docker Production Configuration

Create production Docker Compose file:
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Backend API
  backend:
    build: ./backend
    container_name: licensing-backend-prod
    restart: unless-stopped
    env_file: .env.production
    ports:
      - "4000:4000"
    volumes:
      - ./logs:/app/logs
    networks:
      - licensing-network

  # Frontend
  frontend:
    build: ./frontend
    container_name: licensing-frontend-prod
    restart: unless-stopped
    ports:
      - "3000:80"
    networks:
      - licensing-network

  # Discord Bot
  bot:
    build: ./bot
    container_name: licensing-bot-prod
    restart: unless-stopped
    env_file: .env.production
    depends_on:
      - backend
    networks:
      - licensing-network

networks:
  licensing-network:
    driver: bridge
```

## 🚀 Deployment

1. **Clone repository:**
```bash
git clone <your-repo-url>
cd licensing
```

2. **Configure environment:**
```bash
cp .env.production .env
# Edit .env with your production values
```

3. **Build and start services:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

4. **Check logs:**
```bash
docker-compose logs -f
```

## 📊 Monitoring & Logging

### 1. Set up log rotation:
```bash
sudo nano /etc/logrotate.d/licensing-saas
```

Add:
```
/var/log/licensing-saas/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

### 2. Set up monitoring with PM2 (optional):
```bash
npm install -g pm2
pm2 install pm2-logrotate
```

### 3. Set up health checks:
```bash
# Create health check script
sudo nano /usr/local/bin/licensing-health-check.sh
```

Add:
```bash
#!/bin/bash
curl -f http://localhost:4000/api/health || exit 1
curl -f http://localhost:3000 || exit 1
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/licensing-health-check.sh
```

## 🔐 Security Considerations

### 1. Firewall Configuration:
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 4000  # Block direct access to API
sudo ufw deny 3000  # Block direct access to frontend
```

### 2. Regular Updates:
```bash
# Create update script
sudo nano /usr/local/bin/update-licensing.sh
```

Add:
```bash
#!/bin/bash
cd /path/to/licensing
git pull origin main
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 3. Backup Strategy:
```bash
# Create backup script
sudo nano /usr/local/bin/backup-licensing.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your-mongodb-uri" --out="/backup/mongodb_$DATE"
tar -czf "/backup/licensing_$DATE.tar.gz" /path/to/licensing
```

## 📈 Performance Optimization

### 1. Enable Gzip compression in Nginx:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Set up caching:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Database optimization:
- Enable MongoDB indexes
- Set up connection pooling
- Monitor query performance

## 🚨 Troubleshooting

### Common Issues:

1. **Services not starting:**
```bash
docker-compose logs <service-name>
```

2. **Database connection issues:**
- Check MongoDB URI
- Verify network connectivity
- Check firewall rules

3. **SSL certificate issues:**
```bash
sudo certbot renew --dry-run
```

4. **High memory usage:**
```bash
docker stats
```

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check network connectivity
4. Review security settings

## 🔄 Updates

To update the application:
```bash
git pull origin main
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 📊 Monitoring Dashboard

Consider setting up:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry, Bugsnag
- **Performance monitoring**: New Relic, DataDog
- **Log aggregation**: ELK Stack, Fluentd

---

**Note**: This is a production deployment guide. Always test in a staging environment first and ensure you have proper backups before deploying to production.
