#!/bin/bash

echo "🔧 IMMEDIATE PRODUCTION FIX - RESTART PM2"
echo "======================================="

cd /home/ubuntu/Learnyzer

# 1. Stop PM2 completely
echo "1. Stopping PM2..."
pm2 stop all
pm2 delete all

# 2. Force kill any remaining processes
echo "2. Force killing any remaining node processes..."
sudo pkill -f tsx
sudo pkill -f node
sudo fuser -k 5000/tcp 2>/dev/null

# 3. Export environment variables
echo "3. Setting up environment..."
export NODE_ENV=production
export PORT=5000
export $(grep -v '^#' .env | xargs)

# 4. Start server directly with tsx (bypass PM2 for now)
echo "4. Starting server directly..."
nohup tsx server/index.ts > server_direct.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

sleep 5

# 5. Test OTP API
echo "5. Testing OTP API..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "6. Test health endpoint..."
curl -s https://learnyzer.com/api/health

echo ""
echo "7. Check server logs:"
tail -10 server_direct.log