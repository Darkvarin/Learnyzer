#!/bin/bash

echo "🔧 ALTERNATIVE SOLUTION - DEVELOPMENT MODE ON PRODUCTION"
echo "======================================================="

cd /home/ubuntu/Learnyzer

# 1. Set NODE_ENV to development temporarily to bypass serveStatic
echo "1. Setting NODE_ENV to development temporarily..."
export NODE_ENV=development
export PORT=5000
export $(grep -v '^#' .env | xargs)

# 2. Kill existing server
echo "2. Killing existing server..."
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null
sudo pkill -f tsx
sudo fuser -k 5000/tcp 2>/dev/null

# 3. Start server in development mode (this will use Vite middleware instead of serveStatic)
echo "3. Starting server in development mode..."
nohup tsx server/index.ts > server_dev_mode.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

sleep 8

# 4. Test OTP API
echo "4. Testing OTP API..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "5. Test health endpoint..."
curl -s https://learnyzer.com/api/health

echo ""
echo "6. Check server logs:"
tail -15 server_dev_mode.log

echo ""
echo "7. If this works, we'll need to build the client and serve it differently"