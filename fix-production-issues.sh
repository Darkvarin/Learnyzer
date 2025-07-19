#!/bin/bash

echo "🔧 IMMEDIATE PRODUCTION FIX"
echo "=========================="

cd ~/Learnyzer

# 1. Kill the running server first
echo "1. Stopping current server..."
sudo pkill -f tsx
sudo fuser -k 5000/tcp 2>/dev/null

# 2. Backup current .env and create new one for port 8080
echo "2. Updating .env file for port 8080..."
cp .env .env.backup
sed -i 's/PORT=5000/PORT=8080/' .env
sed -i 's/NODE_ENV=production/NODE_ENV=development/' .env

# 3. Show the updated .env
echo "3. Updated .env contents:"
grep -E "(PORT|NODE_ENV)" .env

# 4. Start server with new configuration
echo "4. Starting server on port 8080..."
tsx server/index.ts > server_8080_fixed.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
sleep 8

# 5. Check if server is running
echo "5. Checking server status..."
ps aux | grep $SERVER_PID | grep -v grep

# 6. Test local API
echo "6. Testing local OTP API..."
curl -X POST http://localhost:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "7. Testing external IP..."
curl -X POST http://3.109.251.7:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "8. Server logs:"
tail -10 server_8080_fixed.log