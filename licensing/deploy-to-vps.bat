@echo off
echo 🚀 VPS Deployment Helper for Licensing SaaS...

echo.
echo 📋 VPS Deployment Options:
echo.
echo 1. DigitalOcean Droplet ($5/month)
echo    - Ubuntu 20.04 LTS
echo    - 1GB RAM, 1 CPU, 25GB SSD
echo    - Sign up: https://digitalocean.com
echo.
echo 2. Linode Nanode ($5/month)
echo    - Ubuntu 20.04 LTS
echo    - 1GB RAM, 1 CPU, 25GB SSD
echo    - Sign up: https://linode.com
echo.
echo 3. Vultr High Frequency ($6/month)
echo    - Ubuntu 20.04 LTS
echo    - 1GB RAM, 1 CPU, 25GB SSD
echo    - Sign up: https://vultr.com
echo.
echo 4. AWS EC2 t2.micro (Free tier eligible)
echo    - Ubuntu 20.04 LTS
echo    - 1GB RAM, 1 CPU
echo    - Sign up: https://aws.amazon.com
echo.

echo 📝 After creating your VPS:
echo    1. Note down your VPS IP : 54.86.145.188
echo    2. SSH into your VPS: ssh root@YOUR_VPS_IP
echo    3. Run the setup commands below
echo.

echo 🔧 VPS Setup Commands:
echo.
echo # Update system
echo apt update && apt upgrade -y
echo.
echo # Install Docker
echo curl -fsSL https://get.docker.com -o get-docker.sh
echo sh get-docker.sh
echo.
echo # Install Docker Compose
echo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
echo chmod +x /usr/local/bin/docker-compose
echo.
echo # Clone your repository
echo git clone YOUR_REPO_URL
echo cd licensing
echo.
echo # Configure environment
echo cp env.example .env
echo nano .env  # Edit with your settings
echo.
echo # Start the application
echo docker-compose up -d
echo.

echo 🌐 Domain Setup (Optional):
echo    1. Buy a domain from Namecheap, GoDaddy, etc.
echo    2. Point A record to your VPS IP
echo    3. Set up SSL with Let's Encrypt
echo.

echo 📊 Your application will be available at:
echo    http://YOUR_VPS_IP:3000 (Frontend)
echo    http://YOUR_VPS_IP:4000/api (API)
echo    Or with domain: https://yourdomain.com
echo.

pause
