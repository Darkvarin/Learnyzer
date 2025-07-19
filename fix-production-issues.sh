#!/bin/bash

echo "🔧 FIXING PRODUCTION ISSUES - PORT CONFLICT & DEPENDENCIES"
echo "========================================================"

cd /home/ubuntu/Learnyzer

# 1. Find and kill whatever is using port 5000
echo "1. Finding and killing port 5000 conflicts..."
sudo lsof -ti:5000 | xargs sudo kill -9 2>/dev/null || echo "No processes using port 5000"
sudo netstat -tlnp | grep :5000 || echo "Port 5000 is now free"

# 2. Install all dependencies (including dev dependencies)
echo "2. Installing ALL dependencies..."
npm install --production=false

# 3. Force port 3000 instead of 5000
echo "3. Starting server on port 3000..."
export NODE_ENV=production
export PORT=3000

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Start server
echo "4. Starting server..."
nohup tsx server/index.ts > server.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"

# Wait for startup
sleep 8

# Check if running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server running on port 3000"
    
    # Test server
    echo "5. Testing server..."
    curl -X POST http://127.0.0.1:3000/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
    
    echo ""
    echo "6. Testing through nginx (should work now)..."
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
      
else
    echo "❌ Server failed - checking logs..."
    cat server.log
fi