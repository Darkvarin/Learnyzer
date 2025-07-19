#!/bin/bash

echo "🚀 DIRECT SERVER START - BYPASSING PM2 ISSUES"
echo "============================================"

cd /home/ubuntu/Learnyzer

# Kill PM2 completely 
pm2 kill
sleep 2

# Start server directly without PM2
echo "1. Starting server directly on port 3000..."
export NODE_ENV=production
export PORT=3000

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Start server in background
nohup tsx server/index.ts > server.log 2>&1 &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"

# Wait for server to initialize
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server process is running"
    
    # Check server logs
    echo "2. Server startup logs:"
    tail -15 server.log
    
    # Test server
    echo "3. Testing server on port 3000:"
    curl -X POST http://127.0.0.1:3000/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
    
    echo ""
    echo "4. Testing through nginx:"
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
      
else
    echo "❌ Server failed to start"
    echo "Error logs:"
    cat server.log
fi