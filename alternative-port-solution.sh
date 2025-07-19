#!/bin/bash

echo "🔄 ALTERNATIVE PORT SOLUTION FOR LEARNYZER"
echo "========================================="

cd /home/ubuntu/Learnyzer

# Stop everything
pm2 delete all 2>/dev/null
sudo pkill -f tsx 2>/dev/null
sudo pkill -f node 2>/dev/null

# Use port 3000 instead of 5000
echo "1. Starting server on port 3000..."
export NODE_ENV=production
export PORT=3000

pm2 start "PORT=3000 tsx server/index.ts" --name "learnyzer"

sleep 5
pm2 status
pm2 logs learnyzer --lines 10

# Test server on port 3000
echo "2. Testing server on port 3000:"
curl -X POST http://127.0.0.1:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

# Update nginx configuration to use port 3000
echo "3. Updating nginx configuration for port 3000..."
sudo sed -i 's/127.0.0.1:5000/127.0.0.1:3000/g' /etc/nginx/sites-available/learnyzer.com

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

# Test through nginx
echo "4. Testing through nginx (should work now):"
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'