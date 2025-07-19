#!/bin/bash

echo "🔍 DEBUGGING NGINX API ROUTING FOR LEARNYZER.COM"
echo "==============================================="

# Check nginx site configuration
echo "1. Checking nginx site configuration..."
sudo cat /etc/nginx/sites-available/learnyzer.com | grep -A 5 -B 5 "server.*5000"

echo ""
echo "2. Checking which nginx sites are enabled..."
ls -la /etc/nginx/sites-enabled/

echo ""
echo "3. Checking if learnyzer.com site is properly linked..."
if [ -L /etc/nginx/sites-enabled/learnyzer.com ]; then
    echo "✅ learnyzer.com site is enabled"
else
    echo "❌ learnyzer.com site is NOT enabled - enabling it..."
    sudo ln -s /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-enabled/
fi

echo ""
echo "4. Checking nginx main configuration..."
sudo nginx -T | grep -A 10 -B 10 "server.*5000"

echo ""
echo "5. Testing backend directly..."
curl -s -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' | head -3

echo ""
echo "6. Checking PM2 process status..."
pm2 list

echo ""
echo "7. Checking if backend is actually on port 5000..."
sudo netstat -tlnp | grep :5000

echo ""
echo "8. Testing with different approach - check nginx error logs..."
sudo tail -10 /var/log/nginx/error.log

echo ""
echo "🔧 If backend is running but API still returns HTML, try:"
echo "   sudo systemctl restart nginx"
echo "   pm2 restart learnyzer"