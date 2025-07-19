#!/bin/bash

echo "🔧 REBUILDING PRODUCTION SERVER SETUP"
echo "===================================="

cd /home/ubuntu/Learnyzer

# Install/update all dependencies
echo "1. Installing dependencies..."
npm install

# Install tsx globally
echo "2. Installing tsx globally..."
sudo npm install -g tsx

# Check if server file exists and is correct
echo "3. Checking server file..."
if [ -f "server/index.ts" ]; then
    echo "✅ server/index.ts exists"
    echo "First 10 lines:"
    head -10 server/index.ts
else
    echo "❌ server/index.ts missing"
    exit 1
fi

# Create proper environment
echo "4. Setting up environment..."
export NODE_ENV=production
export PORT=3000

# Load all environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Environment loaded"
else
    echo "❌ .env missing"
fi

# Try building if build script exists
echo "5. Checking for build script..."
if grep -q '"build"' package.json; then
    echo "Build script found, running build..."
    npm run build
fi

# Start server with proper error handling
echo "6. Starting server with error handling..."
tsx server/index.ts 2>&1 | tee server_debug.log &
SERVER_PID=$!

# Wait and check
sleep 10

if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server started successfully"
    
    # Test server
    echo "7. Testing server..."
    curl -X POST http://127.0.0.1:3000/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
      
else
    echo "❌ Server failed to start"
    echo "Debug logs:"
    cat server_debug.log
fi