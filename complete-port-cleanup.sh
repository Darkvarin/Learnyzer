#!/bin/bash

echo "🔧 COMPLETE PORT CLEANUP - FIXING SERVER CODE"
echo "=============================================="

cd /home/ubuntu/Learnyzer

# 1. Kill all processes using ports
echo "1. Killing all port conflicts..."
sudo fuser -k 5000/tcp 2>/dev/null
sudo fuser -k 3000/tcp 2>/dev/null
pm2 kill
sudo pkill -f node
sudo pkill -f tsx
sleep 3

# 2. Check what's still using port 5000
echo "2. Checking port usage:"
sudo lsof -i :5000 || echo "Port 5000 is free"
sudo lsof -i :3000 || echo "Port 3000 is free"

# 3. Force start on port 3000 with explicit port override
echo "3. Starting server with explicit port override..."
export NODE_ENV=production
export PORT=3000

# Load environment
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Override any hardcoded port in the server
echo "4. Starting server..."
PORT=3000 tsx server/index.ts > server_output.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
sleep 8

# Check if server started
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server process running"
    
    # Check server logs
    echo "5. Server startup logs:"
    tail -20 server_output.log
    
    # Test server
    echo "6. Testing server on port 3000:"
    curl -X POST http://127.0.0.1:3000/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
    
    echo ""
    echo "7. Testing through nginx:"
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
      
else
    echo "❌ Server failed to start"
    echo "Error logs:"
    cat server_output.log
fi