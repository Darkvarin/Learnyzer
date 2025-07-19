#!/bin/bash

echo "🔧 FIXING PORT 5000 CONFLICT ON PRODUCTION SERVER"
echo "=============================================="

# Step 1: Kill everything on port 5000
echo "1. Killing all processes on port 5000..."
sudo fuser -k 5000/tcp
sleep 2

# Step 2: Clean PM2 completely
echo "2. Cleaning PM2..."
pm2 delete all
pm2 kill
sleep 2

# Step 3: Check that port 5000 is free
echo "3. Verifying port 5000 is free..."
if sudo lsof -i :5000; then
    echo "❌ Port 5000 still in use, force killing..."
    sudo killall -9 node
    sleep 2
else
    echo "✅ Port 5000 is free"
fi

# Step 4: Navigate to correct directory
cd /home/ubuntu/Learnyzer

# Step 5: Check if we have the server files
echo "4. Checking server files..."
if [ -f "server/index.ts" ]; then
    echo "✅ Found server/index.ts"
else
    echo "❌ server/index.ts not found"
    ls -la server/ 2>/dev/null || echo "No server directory"
fi

# Step 6: Start server with explicit environment
echo "5. Starting server with production environment..."
export NODE_ENV=production
pm2 start "tsx server/index.ts" --name "learnyzer" --env production

# Step 7: Wait and check status
echo "6. Checking server status..."
sleep 5
pm2 status

# Step 8: Check logs
echo "7. Recent server logs:"
pm2 logs learnyzer --lines 15

# Step 9: Test API endpoint
echo "8. Testing OTP API..."
sleep 2
API_RESPONSE=$(curl -s -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}')

echo "API Response:"
echo "$API_RESPONSE" | head -5

if echo "$API_RESPONSE" | grep -q "success\|error"; then
    echo ""
    echo "🎉 SUCCESS! Server is now responding with JSON"
    echo "✅ Testing through nginx..."
    
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}' | head -3
else
    echo ""
    echo "❌ Still getting HTML response"
    echo "📋 Checking what's running on port 5000:"
    sudo lsof -i :5000
fi