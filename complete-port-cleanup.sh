#!/bin/bash

echo "🔧 COMPLETE PORT 5000 CLEANUP AND SERVER RESTART"
echo "=============================================="

# Step 1: Nuclear option - kill everything
echo "1. Stopping all Node.js processes and PM2..."
pm2 kill
sudo pkill -f node
sudo pkill -f tsx
sudo fuser -k 5000/tcp
sleep 3

# Step 2: Verify port is completely free
echo "2. Verifying port 5000 is free..."
PORT_CHECK=$(sudo lsof -i :5000)
if [ -n "$PORT_CHECK" ]; then
    echo "❌ Port still in use, force killing..."
    sudo kill -9 $(sudo lsof -t -i:5000)
    sleep 2
else
    echo "✅ Port 5000 is free"
fi

# Step 3: Clean PM2 logs and processes
echo "3. Cleaning PM2..."
pm2 flush
rm -rf ~/.pm2/logs/*

# Step 4: Navigate to project directory
cd /home/ubuntu/Learnyzer

# Step 5: Load environment variables explicitly
echo "4. Loading environment variables..."
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Environment variables loaded"
    echo "NODE_ENV: $NODE_ENV"
    echo "DATABASE_URL: ${DATABASE_URL:0:20}..."
else
    echo "❌ No .env file found"
fi

# Step 6: Start server with single instance
echo "5. Starting server (single instance)..."
export NODE_ENV=production
pm2 start "tsx server/index.ts" --name "learnyzer" --instances 1 --no-autorestart

# Step 7: Wait and monitor startup
echo "6. Monitoring startup..."
sleep 5

# Check PM2 status
pm2 status

# Check if server started successfully
echo "7. Checking server logs..."
pm2 logs learnyzer --lines 20

# Step 8: Test the server
echo "8. Testing server directly..."
sleep 2

SERVER_TEST=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}')

echo "Server response: $SERVER_TEST"

if echo "$SERVER_TEST" | grep -q "HTTP_CODE:200"; then
    echo "✅ Server responding correctly"
    
    # Test through nginx
    echo "9. Testing through nginx..."
    NGINX_TEST=$(curl -s -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}')
    
    echo "nginx response: $NGINX_TEST" | head -3
    
    if echo "$NGINX_TEST" | grep -q "success"; then
        echo "🎉 SUCCESS! OTP system is working on learnyzer.com"
    else
        echo "❌ nginx still serving HTML"
    fi
else
    echo "❌ Server not responding correctly"
    echo "Checking what's on port 5000:"
    sudo lsof -i :5000
fi