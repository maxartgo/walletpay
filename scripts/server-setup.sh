#!/bin/bash

###############################################################################
# WalletStake VPS Setup Script - Hetzner Cloud
# Server IP: 128.140.6.81
# Domain: walletstake.net
###############################################################################

set -e  # Exit on any error

echo "🚀 Starting WalletStake Server Setup..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Generate secure random passwords
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -hex 64)

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Domain: walletstake.net"
echo "   Server IP: 128.140.6.81"
echo "   Database: walletpay_prod"
echo ""

# Update system
echo -e "${GREEN}[1/12] Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential tools
echo -e "${GREEN}[2/12] Installing essential tools...${NC}"
apt install -y curl wget git ufw fail2ban htop nano

# Install Node.js 20.x
echo -e "${GREEN}[3/12] Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL 15
echo -e "${GREEN}[4/12] Installing PostgreSQL 15...${NC}"
apt install -y postgresql postgresql-contrib

# Install Nginx
echo -e "${GREEN}[5/12] Installing Nginx...${NC}"
apt install -y nginx

# Install Certbot for SSL
echo -e "${GREEN}[6/12] Installing Certbot (SSL)...${NC}"
apt install -y certbot python3-certbot-nginx

# Install PM2 globally
echo -e "${GREEN}[7/12] Installing PM2...${NC}"
npm install -g pm2

# Configure Firewall
echo -e "${GREEN}[8/12] Configuring firewall...${NC}"
ufw --force disable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# Configure PostgreSQL
echo -e "${GREEN}[9/12] Configuring PostgreSQL...${NC}"
sudo -u postgres psql <<EOF
CREATE DATABASE walletpay_prod;
CREATE USER walletpay_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE walletpay_prod TO walletpay_user;
ALTER DATABASE walletpay_prod OWNER TO walletpay_user;
\c walletpay_prod
GRANT ALL ON SCHEMA public TO walletpay_user;
EOF

# Create project directory
echo -e "${GREEN}[10/12] Creating project directories...${NC}"
mkdir -p /var/www/walletpay
cd /var/www/walletpay

# Create .env file for backend
echo -e "${GREEN}[11/12] Creating backend .env file...${NC}"
cat > /var/www/walletpay/.env.production <<EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=walletpay_prod
DB_USER=walletpay_user
DB_PASSWORD=$DB_PASSWORD

# Server Configuration
NODE_ENV=production
PORT=3001

# Investment Settings
INVESTMENT_AMOUNT=100
DAILY_YIELD_PERCENTAGE=0.7758
INVESTMENT_YIELD_GOAL=100
WITHDRAWAL_TAX_PERCENTAGE=20
MINIMUM_WITHDRAWAL_NET=50

# Security
JWT_SECRET=$JWT_SECRET

# Admin Configuration (add your admin wallet addresses)
ADMIN_WALLETS=0x1aaccd0ea502d89443d7a70ce68fcff49200292e
EOF

# Set proper permissions
chmod 600 /var/www/walletpay/.env.production

# Configure Nginx (temporary - will be updated after SSL)
echo -e "${GREEN}[12/12] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/walletstake.net <<'EOF'
server {
    listen 80;
    server_name walletstake.net www.walletstake.net;

    # Frontend
    root /var/www/walletpay/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/walletstake.net /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Setup PM2 startup
pm2 startup systemd -u root --hp /root

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Server setup completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Configure DNS for walletstake.net:"
echo "   A Record: @ → 128.140.6.81"
echo "   A Record: www → 128.140.6.81"
echo ""
echo "2. Wait 5-10 minutes for DNS propagation"
echo ""
echo "3. Clone your repository:"
echo "   cd /var/www/walletpay"
echo "   git clone YOUR_REPO_URL ."
echo ""
echo "4. Copy environment file:"
echo "   cp .env.production backend/.env"
echo ""
echo "5. Install and build:"
echo "   cd backend && npm install"
echo "   cd .. && npm install && npm run build"
echo ""
echo "6. Initialize database:"
echo "   cd backend && npm run migrate"
echo ""
echo "7. Start backend with PM2:"
echo "   pm2 start backend/dist/index.js --name walletpay-backend"
echo "   pm2 save"
echo ""
echo "8. Setup SSL certificate:"
echo "   certbot --nginx -d walletstake.net -d www.walletstake.net"
echo ""
echo -e "${RED}⚠️  IMPORTANT - Save these credentials:${NC}"
echo ""
echo "Database Password: $DB_PASSWORD"
echo "JWT Secret: $JWT_SECRET"
echo ""
echo "These are saved in: /var/www/walletpay/.env.production"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "  pm2 logs walletpay-backend  # View logs"
echo "  pm2 restart walletpay-backend  # Restart backend"
echo "  systemctl restart nginx  # Restart Nginx"
echo "  psql -U walletpay_user -d walletpay_prod  # Access database"
echo ""
