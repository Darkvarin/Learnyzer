#!/bin/bash

echo "🚀 STARTING ESM API SERVER"
echo "=========================="

cd ~/Learnyzer

# 1. Kill all existing processes
echo "1. Killing all existing Node processes..."
sudo pkill -9 -f tsx
sudo pkill -9 -f node
sudo pkill -9 -f start-learnyzer
sudo fuser -k 5000/tcp 2>/dev/null || true
sleep 3

# 2. Verify cleanup
echo "2. Verifying cleanup..."
ps aux | grep -E "node|tsx" | grep -v grep || echo "✅ All processes killed"

# 3. Start ESM server
echo "3. Starting ESM API server..."
node api-server.mjs > esm-server.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
sleep 5

# 4. Test the server
echo "4. Testing ESM server..."

echo "Health check:"
curl -s http://localhost:5000/api/health

echo ""
echo "OTP API test:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}')

echo "Response: $RESPONSE"

# 5. Check if it worked
if [[ "$RESPONSE" == *"success"* ]]; then
    echo ""
    echo "🎉 SUCCESS! ESM server is working"
    echo "✅ API endpoints return proper JSON"
    echo "📊 Server PID: $SERVER_PID"
    
    echo ""
    echo "6. Server logs:"
    tail -10 esm-server.log
    
    echo ""
    echo "🔥 Next: Test through domain"
    echo "curl -X POST https://learnyzer.com/api/otp/send -H 'Content-Type: application/json' -d '{\"mobile\": \"9999999999\"}'"
    
else
    echo ""
    echo "❌ Still not working"
    echo "Response length: ${#RESPONSE}"
    echo "Server logs:"
    tail -20 esm-server.log
    echo ""
    echo "Process status:"
    ps -p $SERVER_PID 2>/dev/null || echo "Server not running"
fi