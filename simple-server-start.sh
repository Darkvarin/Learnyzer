#!/bin/bash

echo "🔧 SIMPLE DIRECT SERVER START"
echo "=============================="

cd /home/ubuntu/Learnyzer

# 1. Kill existing
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true

# 2. Start with NODE_ENV=development to bypass static serving
export NODE_ENV=development
export PORT=5000
export $(grep -v '^#' .env | xargs)

echo "Starting server in development mode to bypass static file issues..."
tsx server/index.ts > simple_server.log 2>&1 &
PID=$!

echo "Server PID: $PID"
sleep 5

# 3. Test
echo "Testing OTP API..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "Logs:"
tail -10 simple_server.log