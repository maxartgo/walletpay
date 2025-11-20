#!/bin/bash

###############################################################################
# WalletStake Deploy Script
# Use this script after every code update to deploy changes
###############################################################################

set -e  # Exit on any error

echo "🚀 Starting WalletStake deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

# Pull latest changes from Git
echo -e "${BLUE}[1/7] Pulling latest changes from Git...${NC}"
git pull origin main || git pull origin master

# Install backend dependencies
echo -e "${BLUE}[2/7] Installing backend dependencies...${NC}"
cd backend
npm install --production

# Build backend
echo -e "${BLUE}[3/7] Building backend...${NC}"
npm run build

# Install frontend dependencies
echo -e "${BLUE}[4/7] Installing frontend dependencies...${NC}"
cd ..
npm install

# Build frontend
echo -e "${BLUE}[5/7] Building frontend...${NC}"
npm run build

# Restart backend with PM2
echo -e "${BLUE}[6/7] Restarting backend...${NC}"
pm2 restart walletpay-backend || pm2 start backend/dist/index.js --name walletpay-backend

# Reload Nginx
echo -e "${BLUE}[7/7] Reloading Nginx...${NC}"
systemctl reload nginx

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Backend Status:${NC}"
pm2 info walletpay-backend --no-daemon | head -n 15

echo ""
echo -e "${BLUE}📋 Recent Logs:${NC}"
pm2 logs walletpay-backend --lines 20 --nostream

echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo "  pm2 logs walletpay-backend  # View live logs"
echo "  pm2 restart walletpay-backend  # Restart backend"
echo "  pm2 monit  # Monitor resources"
echo ""
