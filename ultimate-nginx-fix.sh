#!/bin/bash

echo "🔧 ULTIMATE NGINX FIX - FINAL SOLUTION"
echo "====================================="

cd /home/ubuntu/Learnyzer

# 1. Remove the problematic symlink and recreate it
echo "1. Removing and recreating nginx site symlink..."
sudo rm -f /etc/nginx/sites-enabled/learnyzer.com
sudo ln -sf /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-enabled/

# 2. Force restart nginx instead of just reload
echo "2. Force restarting nginx..."
sudo systemctl stop nginx
sleep 2
sudo systemctl start nginx

# 3. Test the configuration
echo "3. Testing nginx status..."
sudo systemctl status nginx --no-pager -l

# 4. Test the API immediately
echo "4. Testing OTP API..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "5. Testing a few more endpoints..."
curl -s https://learnyzer.com/api/auth/me | head -20

echo ""
echo "6. If still returning HTML, check current nginx config:"
sudo cat /etc/nginx/sites-available/learnyzer.com | grep -A 3 -B 3 "proxy_pass"