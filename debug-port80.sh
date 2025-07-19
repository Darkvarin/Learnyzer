#!/bin/bash

echo "🔍 ALTERNATIVE SOLUTION - DIRECT PORT 80 ACCESS"
echo "=============================================="

cd /home/ubuntu/Learnyzer

# 1. Test different approach - bypass nginx entirely
echo "1. Kill current server on port 5000..."
sudo pkill -f tsx
sudo fuser -k 5000/tcp 2>/dev/null

# 2. Start server directly on port 80 (requires sudo)
echo "2. Starting server directly on port 80..."
export NODE_ENV=production
export PORT=80
export $(grep -v '^#' .env | xargs)

# Start with sudo for port 80
sudo -E tsx server/index.ts > server_port80.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
sleep 5

# 3. Test direct port 80 access
echo "3. Testing OTP API on port 80..."
curl -X POST http://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "4. Testing HTTPS with port 80 backend..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "5. Check server logs:"
tail -10 server_port80.log