#!/bin/bash

echo "🚨 EMERGENCY NGINX BYPASS - DIRECT PORT ACCESS"
echo "=============================================="

cd /home/ubuntu/Learnyzer

# 1. Stop nginx temporarily
echo "1. Stopping nginx to bypass it completely..."
sudo systemctl stop nginx

# 2. Kill existing server
echo "2. Stopping existing server..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true

# 3. Start server directly on port 443 (HTTPS port)
echo "3. Starting server directly on port 443..."
export NODE_ENV=development
export PORT=443
export $(grep -v '^#' .env | xargs)

# Start server with SSL support directly
sudo -E tsx server/index.ts > emergency_server.log 2>&1 &
SERVER_PID=$!

echo "Emergency server PID: $SERVER_PID"
sleep 5

# 4. Test direct HTTPS access
echo "4. Testing direct HTTPS API access..."
curl -k -X POST https://learnyzer.com:443/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "5. Testing HTTP on port 443..."
curl -X POST http://learnyzer.com:443/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "6. Check emergency server logs:"
tail -10 emergency_server.log

echo ""
echo "7. If this works, we found the solution!"