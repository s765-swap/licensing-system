# Pterodactyl Deployment Guide

This guide will help you deploy the Licensing SaaS platform on Pterodactyl Panel.

## Overview

The platform consists of two main components:
- **Backend API** (Node.js) - Handles authentication, license management, and plugin management
- **Frontend** (Express + Static Files) - User interface for the platform

## Prerequisites

- Pterodactyl Panel installed and configured
- Docker support enabled
- Basic knowledge of Pterodactyl server management

## Deployment Steps

### 1. Backend Server Setup

1. **Create a new server** in Pterodactyl with these settings:
   - **Egg**: Node.js
   - **Docker Image**: `node:18-alpine`
   - **Startup Command**: `bash start-pterodactyl-backend.sh`
   - **Port**: `4000` (or your preferred port)

2. **Upload the project files** to the server directory

3. **Set environment variables** in Pterodactyl:
   ```
   NODE_ENV=production
   PORT=4000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=*
   ```

4. **Start the backend server**

### 2. Frontend Server Setup

1. **Create a new server** in Pterodactyl with these settings:
   - **Egg**: Node.js
   - **Docker Image**: `node:18-alpine`
   - **Startup Command**: `bash start-pterodactyl-frontend.sh`
   - **Port**: `3000` (or your preferred port)

2. **Upload the project files** to the server directory

3. **Set environment variables** in Pterodactyl:
   ```
   FRONTEND_PORT=3000
   API_URL=http://your-backend-server-ip:4000/api
   ```

4. **Start the frontend server**

## Configuration

### Backend Configuration

The backend uses an in-memory database for simplicity in Pterodactyl hosting. Key features:

- **No MongoDB required** - Uses simple in-memory database
- **Default admin account** created automatically:
  - Email: `admin@admin.com`
  - Password: `admin`
- **JWT authentication** for API security
- **CORS enabled** for frontend communication

### Frontend Configuration

The frontend automatically connects to the backend using the `API_URL` environment variable.

### Environment Variables

#### Backend Variables
- `NODE_ENV`: Environment mode (production/development)
- `PORT`: Server port (default: 4000)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time
- `FRONTEND_URL`: Allowed frontend origins for CORS

#### Frontend Variables
- `FRONTEND_PORT`: Frontend server port (default: 3000)
- `API_URL`: Backend API URL for communication

## Accessing the Platform

1. **Frontend**: Access via your frontend server's IP and port
2. **Backend API**: Access via your backend server's IP and port
3. **Health Check**: Visit `http://your-backend-ip:4000/api/health`

## Default Login

After deployment, you can log in with:
- **Email**: `admin@admin.com`
- **Password**: `admin`

**Important**: Change the default password after first login!

## Features

- ✅ User authentication and registration
- ✅ License key generation and management
- ✅ Plugin management
- ✅ Server management for licenses
- ✅ Discord bot integration (optional)
- ✅ Store subdomain support
- ✅ In-memory database (no external dependencies)

## Troubleshooting

### Backend Issues
- Check if the server is running on the correct port
- Verify environment variables are set correctly
- Check server logs for error messages

### Frontend Issues
- Ensure `API_URL` points to the correct backend server
- Check if the backend is accessible from the frontend server
- Verify CORS settings if getting CORS errors

### Database Issues
- The platform uses an in-memory database, so data resets on server restart
- For persistent data, consider implementing a file-based database or external database

## Security Notes

1. **Change default JWT secret** in production
2. **Change default admin password** after first login
3. **Use HTTPS** in production environments
4. **Configure firewall** rules appropriately
5. **Regular backups** if using persistent storage

## Support

For issues or questions:
1. Check the server logs in Pterodactyl
2. Verify environment variables are set correctly
3. Ensure both servers can communicate with each other
4. Check network connectivity and firewall rules

## File Structure

```
├── backend/                 # Backend API server
│   ├── server.js           # Main server file
│   ├── config/             # Database configuration
│   ├── controllers/        # API controllers
│   ├── models/             # Data models
│   └── routes/             # API routes
├── frontend/               # Frontend application
│   ├── src/main.js         # Main frontend code
│   └── index.html          # HTML template
├── start-pterodactyl-backend.sh    # Backend startup script
├── start-pterodactyl-frontend.sh   # Frontend startup script
├── pterodactyl-backend.env         # Backend environment template
└── pterodactyl-frontend.env        # Frontend environment template
```
