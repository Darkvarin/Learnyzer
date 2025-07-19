#!/bin/bash

echo "🔧 FIXING OTP SYSTEM ON LEARNYZER.COM (3.109.251.7)"
echo "================================================="

# SSH into server and fix nginx configuration
ssh -i "Learnyzer key_1752898338282.ppk" ubuntu@3.109.251.7 << 'ENDSSH'

echo "📍 Connected to production server 3.109.251.7"

# Check if backend is running
echo "1. Checking Node.js backend status..."
if pgrep -f "node.*5000" > /dev/null || pm2 list | grep -q "learnyzer.*online"; then
    echo "✅ Backend is running"
else
    echo "⚠️ Starting backend..."
    cd /home/ubuntu/Learnyzer
    pm2 start ecosystem.config.js --env production
fi

# Check current nginx config
echo ""
echo "2. Checking nginx configuration..."
if grep -q "server app:5000" /etc/nginx/sites-available/learnyzer.com; then
    echo "❌ Found Docker-style upstream: server app:5000"
    echo "🔧 Fixing to direct server: server 127.0.0.1:5000"
    
    # Fix the upstream configuration
    sudo sed -i 's/server app:5000;/server 127.0.0.1:5000;/' /etc/nginx/sites-available/learnyzer.com
    echo "✅ nginx upstream configuration updated"
else
    echo "✅ nginx upstream looks correct"
fi

# Test nginx config
echo ""
echo "3. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ nginx config is valid"
    
    # Reload nginx
    echo "4. Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ nginx reloaded"
    
    # Test API endpoint
    echo ""
    echo "5. Testing OTP API endpoint..."
    sleep 2
    
    API_TEST=$(curl -s -X POST http://127.0.0.1:5000/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}')
    
    echo "Local API test: $API_TEST"
    
    # Test through nginx
    NGINX_TEST=$(curl -s -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}')
    
    echo "nginx proxy test:"
    echo "$NGINX_TEST" | head -3
    
    if echo "$NGINX_TEST" | grep -q "success"; then
        echo ""
        echo "🎉 SUCCESS! OTP API is now working on learnyzer.com"
        echo "✅ Mobile registration should work for users"
    else
        echo ""
        echo "❌ Still getting HTML response - checking logs..."
        pm2 logs learnyzer --lines 5
    fi
    
else
    echo "❌ nginx configuration has errors"
    sudo nginx -t
fi

echo ""
echo "📋 Status Summary:"
echo "- Backend: $(pm2 list | grep learnyzer | awk '{print $12}')"
echo "- nginx: $(sudo systemctl is-active nginx)"
echo "- SSL: $(curl -s -I https://learnyzer.com | grep HTTP)"

ENDSSH

echo ""
echo "🔍 If OTP still doesn't work, the issue might be:"
echo "1. Environment variables not loaded in production"
echo "2. PM2 process needs restart"
echo "3. Different nginx site config being used"