#!/bin/bash

echo "🚀 COMPLETE PRODUCTION FIX - FINAL SOLUTION"
echo "==========================================="

cd /home/ubuntu/Learnyzer

# 1. Check server logs for exact error
echo "1. Checking server startup errors:"
if [ -f "server.log" ]; then
    echo "=== SERVER LOG ==="
    cat server.log
    echo "=================="
else
    echo "No server.log found"
fi

# 2. Kill all conflicting processes
echo "2. Complete process cleanup:"
pm2 kill
sudo pkill -f node
sudo pkill -f tsx
sudo fuser -k 3000/tcp 2>/dev/null
sudo fuser -k 5000/tcp 2>/dev/null

# 3. Check what's actually in the server file
echo "3. Server file check:"
if [ -f "server/index.ts" ]; then
    echo "First 20 lines of server/index.ts:"
    head -20 server/index.ts
else
    echo "server/index.ts not found!"
    exit 1
fi

# 4. Install dependencies completely
echo "4. Installing all dependencies:"
npm install

# 5. Check if tsx works
echo "5. Testing tsx:"
which tsx
tsx --version 2>/dev/null || {
    echo "Installing tsx..."
    sudo npm install -g tsx
}

# 6. Set environment and start server with detailed logging
echo "6. Starting server with detailed error logging:"
export NODE_ENV=production
export PORT=3000

# Load environment variables
if [ -f ".env" ]; then
    echo "Loading .env file..."
    export $(grep -v '^#' .env | xargs)
else
    echo "No .env file found!"
fi

# Start server in foreground first to see errors
echo "Starting server in foreground for debugging..."
timeout 15s tsx server/index.ts 2>&1 | tee debug.log

echo ""
echo "7. Debug log contents:"
cat debug.log

# If no immediate errors, try background start
if ! grep -q "Error\|error" debug.log; then
    echo "8. Starting in background..."
    tsx server/index.ts > server.log 2>&1 &
    SERVER_PID=$!
    
    sleep 5
    
    if ps -p $SERVER_PID > /dev/null; then
        echo "✅ Server running, testing..."
        curl -X POST http://127.0.0.1:3000/api/otp/send \
          -H "Content-Type: application/json" \
          -d '{"mobile": "9999999999"}'
    else
        echo "❌ Server failed to start in background"
        cat server.log
    fi
fi