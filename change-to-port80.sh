#!/bin/bash

echo "🔧 DIRECT PORT 80 SOLUTION"
echo "=========================="

cd /home/ubuntu/Learnyzer

# 1. Stop nginx completely
echo "1. Stopping nginx..."
sudo systemctl stop nginx
sudo systemctl disable nginx

# 2. Kill existing processes
echo "2. Cleaning up existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true
sudo fuser -k 80/tcp 2>/dev/null || true

# 3. Start server directly on port 80
echo "3. Starting server on port 80..."
export NODE_ENV=development
export PORT=80
export $(grep -v '^#' .env | xargs)

sudo -E tsx server/index.ts > port80_server.log 2>&1 &
PORT80_PID=$!

echo "Port 80 server PID: $PORT80_PID"
sleep 5

# 4. Test HTTP access
echo "4. Testing HTTP API access..."
curl -X POST http://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "5. Testing health endpoint..."
curl -s http://learnyzer.com/api/health

echo ""
echo "6. Check server logs:"
tail -10 port80_server.log

echo ""
echo "Note: This bypasses SSL, but should fix the API routing immediately."