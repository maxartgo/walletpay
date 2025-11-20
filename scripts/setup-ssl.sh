#!/bin/bash

###############################################################################
# SSL Certificate Setup Script
# Run this AFTER DNS is configured and propagated
###############################################################################

set -e

echo "🔒 Setting up SSL certificate for walletstake.net..."

# Check if DNS is configured
echo "Checking DNS configuration..."
CURRENT_IP=$(dig +short walletstake.net @8.8.8.8 | tail -n1)

if [ "$CURRENT_IP" != "128.140.6.81" ]; then
    echo "❌ DNS not configured correctly!"
    echo "   Current DNS points to: $CURRENT_IP"
    echo "   Expected: 128.140.6.81"
    echo ""
    echo "Please configure DNS first:"
    echo "  A Record: @ → 128.140.6.81"
    echo "  A Record: www → 128.140.6.81"
    exit 1
fi

echo "✅ DNS configured correctly!"
echo ""

# Request SSL certificate
echo "Requesting SSL certificate from Let's Encrypt..."
certbot --nginx -d walletstake.net -d www.walletstake.net --non-interactive --agree-tos --email info@madeinperugia.eu --redirect

# Test auto-renewal
echo "Testing certificate auto-renewal..."
certbot renew --dry-run

echo ""
echo "✅ SSL certificate installed successfully!"
echo ""
echo "🌐 Your site is now available at:"
echo "   https://walletstake.net"
echo "   https://www.walletstake.net"
echo ""
echo "📅 Certificate auto-renewal is configured"
