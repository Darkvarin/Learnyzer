#!/bin/bash

echo "🔧 COMPLETE PORT CLEANUP AND RESTART"
echo "===================================="

cd /home/ubuntu/Learnyzer

# 1. Force stop everything
echo "1. Force stopping all services..."
sudo systemctl stop nginx
sudo pkill -f nginx
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx
sudo pkill -f node
sudo fuser -k 80/tcp 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true
sudo fuser -k 443/tcp 2>/dev/null || true

sleep 3

# 2. Check what's using ports
echo "2. Checking port usage..."
sudo netstat -tlnp | grep -E ":(80|443|5000)\s"

# 3. Start server on an alternative port first (8080)
echo "3. Starting server on port 8080..."
export NODE_ENV=development
export PORT=8080
export $(grep -v '^#' .env | xargs)

tsx server/index.ts > server_8080.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
sleep 5

# 4. Test on port 8080
echo "4. Testing OTP API on port 8080..."
curl -X POST http://learnyzer.com:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "5. Testing direct IP on port 8080..."
curl -X POST http://3.109.251.7:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "6. Check server logs:"
tail -10 server_8080.log