#!/bin/bash

echo "🔧 COMPREHENSIVE PRODUCTION SERVER FIX"
echo "===================================="

# Step 1: Check what's actually running on port 5000
echo "1. Checking what's running on port 5000..."
sudo lsof -i :5000

# Step 2: Stop all processes on port 5000
echo "2. Stopping all processes on port 5000..."
sudo fuser -k 5000/tcp
sleep 2

# Step 3: Clean PM2 and start fresh
echo "3. Cleaning PM2 processes..."
pm2 delete all
pm2 kill

# Step 4: Navigate to correct directory and check files
echo "4. Checking Learnyzer directory structure..."
cd /home/ubuntu/Learnyzer
pwd
ls -la

# Check if server files exist
if [ -f "server/index.ts" ]; then
    echo "✅ server/index.ts found"
elif [ -f "dist/server/index.js" ]; then
    echo "✅ dist/server/index.js found"
elif [ -f "server.js" ]; then
    echo "✅ server.js found"
else
    echo "❌ No server file found"
    ls -la server/ dist/
fi

# Step 5: Start server correctly
echo "5. Starting server in production mode..."

# Try different startup methods
if [ -f "ecosystem.config.js" ]; then
    echo "Using ecosystem.config.js..."
    NODE_ENV=production pm2 start ecosystem.config.js
elif [ -f "server/index.ts" ]; then
    echo "Using tsx to start TypeScript server..."
    NODE_ENV=production pm2 start "tsx server/index.ts" --name "learnyzer"
elif [ -f "dist/server/index.js" ]; then
    echo "Using compiled server..."
    NODE_ENV=production pm2 start dist/server/index.js --name "learnyzer"
else
    echo "Using npm start..."
    NODE_ENV=production pm2 start npm --name "learnyzer" -- start
fi

# Step 6: Check PM2 status
echo "6. Checking PM2 status..."
sleep 3
pm2 status
pm2 logs learnyzer --lines 10

# Step 7: Test server directly
echo "7. Testing server directly on localhost..."
sleep 2

# Test different endpoints
echo "Testing /api/otp/send:"
curl -s -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' | head -3

echo ""
echo "Testing root endpoint:"
curl -s http://127.0.0.1:5000/ | head -3

echo ""
echo "Testing /api/health (if exists):"
curl -s http://127.0.0.1:5000/api/health | head -3

# Step 8: Check environment variables
echo "8. Checking environment variables..."
pm2 env learnyzer | grep -E "(NODE_ENV|DATABASE_URL|TWOFACTOR_API_KEY)"

echo ""
echo "🔍 If still serving HTML, the issue is likely:"
echo "1. Server is running in wrong mode (development vs production)"
echo "2. Static file middleware is catching all routes"
echo "3. Environment variables not loaded properly"
echo "4. Wrong server file being executed"