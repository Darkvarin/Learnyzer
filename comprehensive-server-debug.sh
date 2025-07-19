#!/bin/bash

echo "🔍 COMPREHENSIVE SERVER DEBUG FOR LEARNYZER OTP"
echo "=============================================="

echo "1. Checking Node.js backend process..."
echo "PM2 Status:"
pm2 status

echo ""
echo "Port 5000 processes:"
sudo netstat -tlnp | grep :5000

echo ""
echo "2. Testing backend DIRECTLY (bypassing nginx)..."
BACKEND_TEST=$(curl -s -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}')

echo "Direct backend response:"
echo "$BACKEND_TEST" | head -5

if echo "$BACKEND_TEST" | grep -q "success\|error"; then
    echo "✅ Backend is working correctly - returning JSON"
else
    echo "❌ Backend is returning HTML or not responding"
    echo "Restarting backend..."
    cd /home/ubuntu/Learnyzer
    pm2 restart learnyzer
    sleep 5
    
    # Test again
    BACKEND_TEST2=$(curl -s -X POST http://127.0.0.1:5000/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}')
    echo "After restart:"
    echo "$BACKEND_TEST2" | head -3
fi

echo ""
echo "3. Checking nginx configuration files..."
echo "Sites enabled:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "Current nginx config for learnyzer.com:"
if [ -f /etc/nginx/sites-available/learnyzer.com ]; then
    grep -A 20 "location /api" /etc/nginx/sites-available/learnyzer.com
else
    echo "❌ No learnyzer.com config found"
fi

echo ""
echo "4. Checking nginx error logs..."
sudo tail -20 /var/log/nginx/error.log

echo ""
echo "5. Testing through nginx proxy..."
NGINX_TEST=$(curl -s -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}')

echo "nginx proxy response:"
echo "$NGINX_TEST" | head -5

echo ""
echo "🔧 DIAGNOSIS:"
if echo "$BACKEND_TEST" | grep -q "success\|error"; then
    if echo "$NGINX_TEST" | grep -q "success\|error"; then
        echo "✅ Both backend and nginx are working correctly"
    else
        echo "❌ Backend works, nginx routing is broken"
        echo "📋 Issue: nginx is not properly proxying /api requests"
    fi
else
    echo "❌ Backend is not responding correctly"
    echo "📋 Issue: Node.js backend needs to be fixed first"
fi