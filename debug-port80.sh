#!/bin/bash

echo "🔍 DEBUGGING PORT 80 ACCESS"
echo "=========================="

echo "Run these commands on your EC2 server:"
echo ""

cat << 'DEBUG_COMMANDS'
# Check what's running on port 80
sudo netstat -tlnp | grep :80

# Check PM2 status
pm2 status

# Test local port 80 access
curl -v http://localhost:80/api/health 2>&1 | head -10

# Check if anything is blocking port 80
sudo lsof -i :80

# Check if nginx or apache is running (they use port 80)
sudo systemctl status nginx 2>/dev/null || echo "nginx not running"
sudo systemctl status apache2 2>/dev/null || echo "apache2 not running"

# Check Ubuntu firewall
sudo ufw status

# Get your public IP for testing
PUBLIC_IP=$(curl -s ifconfig.me)
echo "Your public IP: $PUBLIC_IP"
echo "Try accessing: http://$PUBLIC_IP"
DEBUG_COMMANDS