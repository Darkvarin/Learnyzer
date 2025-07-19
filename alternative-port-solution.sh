#!/bin/bash

echo "🔄 ALTERNATIVE SOLUTION - COMPLETE PORT CLEANUP"
echo "=============================================="

cd /home/ubuntu/Learnyzer

# Kill everything related to Node.js/PM2
echo "1. Complete process cleanup..."
pm2 kill
sudo pkill -f node
sudo pkill -f tsx
sudo pkill -f npm
sleep 3

# Find what's actually using port 5000
echo "2. Investigating port 5000 usage..."
sudo ss -tulnp | grep :5000
sudo lsof -i :5000

# Force kill any remaining processes on port 5000
sudo fuser -k 5000/tcp 2>/dev/null || echo "No processes to kill on port 5000"

# Install dependencies without dev restrictions
echo "3. Installing complete dependency set..."
npm install

# Use port 8080 as safe alternative
echo "4. Using port 8080 as safe alternative..."
export NODE_ENV=production
export PORT=8080

# Load environment
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Start server on port 8080
echo "5. Starting server on port 8080..."
tsx server/index.ts &
SERVER_PID=$!

sleep 5

# Test server
echo "6. Testing server on port 8080..."
curl -X POST http://127.0.0.1:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

# Update nginx to use port 8080
echo "7. Updating nginx to use port 8080..."
sudo sed -i 's/127.0.0.1:3000/127.0.0.1:8080/g' /etc/nginx/sites-available/learnyzer.com
sudo nginx -t && sudo systemctl reload nginx

# Final test
echo "8. Final test through nginx..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'