#!/bin/bash

echo "🔧 FIXING NGINX TO USE PORT 5000 - IMMEDIATE SOLUTION"
echo "===================================================="

cd /home/ubuntu/Learnyzer

# 1. Update nginx to use port 5000 (where server is actually running)
echo "1. Updating nginx configuration to use port 5000..."
sudo sed -i 's/127.0.0.1:3000/127.0.0.1:5000/g' /etc/nginx/sites-available/learnyzer.com

# 2. Test nginx configuration
echo "2. Testing nginx configuration..."
sudo nginx -t

# 3. Reload nginx
echo "3. Reloading nginx..."
sudo systemctl reload nginx

# 4. Test API through nginx
echo "4. Testing OTP API through nginx..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "5. Testing a few more API endpoints..."
curl -s https://learnyzer.com/api/auth/me | head -50

echo ""
echo "6. Checking server status..."
ps aux | grep tsx | grep -v grep