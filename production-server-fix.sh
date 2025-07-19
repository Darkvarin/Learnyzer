#!/bin/bash

echo "🔧 PRODUCTION SERVER FIX - DIRECT TYPESCRIPT EXECUTION"
echo "====================================================="

cd /home/ubuntu/Learnyzer

# Stop everything
pm2 kill
sudo pkill -f node
sudo pkill -f tsx

# Check project structure
echo "1. Project structure check:"
pwd
ls -la

# Check if server files exist
if [ -f "server/index.ts" ]; then
    echo "✅ server/index.ts found"
else
    echo "❌ server/index.ts not found"
    echo "Available server files:"
    find . -name "*.ts" -o -name "*.js" | grep -i server
    exit 1
fi

# Check if tsx is available
echo "2. Checking tsx availability:"
which tsx || echo "tsx not in PATH"
npm list -g tsx || echo "tsx not installed globally"

# Install tsx if not available
if ! command -v tsx &> /dev/null; then
    echo "Installing tsx globally..."
    sudo npm install -g tsx
fi

# Load environment variables
echo "3. Loading environment variables:"
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Environment loaded"
    echo "NODE_ENV: $NODE_ENV"
    echo "PORT: ${PORT:-5000}"
else
    echo "❌ .env file not found"
fi

# Set production environment
export NODE_ENV=production
export PORT=3000

# Start server directly
echo "4. Starting server directly with tsx:"
echo "Command: tsx server/index.ts"

# Run server in foreground first to see any errors
timeout 10s tsx server/index.ts 2>&1 || echo "Server startup error detected"

# If no immediate errors, start in background
echo "5. Starting server in background:"
nohup tsx server/index.ts > server.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"

# Wait for startup
sleep 5

# Check if process is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server process running"
    
    # Show server logs
    echo "6. Server logs:"
    tail -20 server.log
    
    # Test server
    echo "7. Testing server:"
    curl -X POST http://127.0.0.1:3000/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
      
else
    echo "❌ Server failed to start"
    echo "Error logs:"
    cat server.log
fi