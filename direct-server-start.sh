#!/bin/bash

echo "🚀 DIRECT SERVER START SOLUTION"
echo "==============================="

cd ~/Learnyzer

# 1. Clean up any existing processes
echo "1. Cleaning up existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx 2>/dev/null || true
sudo pkill -f node 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true
sudo fuser -k 8080/tcp 2>/dev/null || true

# 2. Check if nginx is still running and using ports
echo "2. Checking nginx status..."
sudo systemctl status nginx --no-pager | head -5

# 3. Stop nginx if running
echo "3. Stopping nginx..."
sudo systemctl stop nginx

# 4. Set up environment
echo "4. Setting up environment..."
export NODE_ENV=development
export PORT=8080
export $(grep -v '^#' .env | xargs)

# 5. Start server with verbose logging
echo "5. Starting server on port 8080..."
echo "Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."

# Start server in foreground first to see any errors
tsx server/index.ts &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait and monitor
sleep 8

# 6. Check if server is actually running
echo "6. Checking if server is running..."
ps aux | grep $SERVER_PID | grep -v grep

# 7. Test local connection first
echo "7. Testing local connection..."
curl -v http://localhost:8080/api/health 2>&1 | head -15

# 8. Test OTP API locally
echo "8. Testing OTP API locally..."
curl -X POST http://localhost:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

# 9. If local works, test external IP
echo ""
echo "9. Testing external IP access..."
curl -X POST http://3.109.251.7:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' --connect-timeout 10

echo ""
echo "10. Server logs (if any):"
if [ -f server_8080.log ]; then
    tail -20 server_8080.log
fi