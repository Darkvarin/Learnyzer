#!/bin/bash

echo "🔧 PRODUCTION NGINX FIX for learnyzer.com OTP issue"
echo "==============================================="

# Check if Node.js backend is running
echo "1. Checking Node.js backend status..."
if pgrep -f "node.*5000" > /dev/null; then
    echo "✅ Node.js backend is running on port 5000"
else
    echo "❌ Node.js backend is NOT running on port 5000"
    echo "Starting backend with PM2..."
    cd /home/ubuntu/Learnyzer && pm2 start ecosystem.config.js --env production
fi

# Check current nginx configuration
echo ""
echo "2. Current nginx configuration issue:"
echo "   - nginx config expects: server app:5000 (Docker)"
echo "   - Actual server runs on: 127.0.0.1:5000 (Direct)"
echo ""

# Fix nginx upstream configuration
echo "3. Fixing nginx upstream configuration..."
sudo sed -i 's/server app:5000;/server 127.0.0.1:5000;/' /etc/nginx/sites-available/learnyzer.com

# Test nginx configuration
echo "4. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ nginx configuration is valid"
    
    # Reload nginx
    echo "5. Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ nginx reloaded"
    
    # Wait and test API
    echo "6. Testing OTP API endpoint..."
    sleep 3
    
    API_RESPONSE=$(curl -s -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}')
    
    echo "API Response: $API_RESPONSE"
    
    if echo "$API_RESPONSE" | grep -q "success"; then
        echo "🎉 SUCCESS! OTP API is now working on learnyzer.com"
        echo "✅ Users can now register with mobile verification"
    else
        echo "❌ API still returning HTML - checking backend logs..."
        pm2 logs learnyzer --lines 10
    fi
    
else
    echo "❌ nginx configuration has errors"
    exit 1
fi

echo ""
echo "🔍 Quick diagnosis commands:"
echo "- Check backend: pm2 status"
echo "- View backend logs: pm2 logs learnyzer"
echo "- Test API directly: curl http://127.0.0.1:5000/api/otp/send"
echo "- Check nginx: sudo nginx -t && sudo systemctl status nginx"