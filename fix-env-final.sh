#!/bin/bash

echo "🔧 FIXING ENV FILE AND RESTARTING SERVER"
echo "========================================"

cd ~/Learnyzer

# 1. Stop the current server running on port 5000
echo "1. Stopping current server..."
sudo pkill -f tsx
sudo fuser -k 5000/tcp 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

# 2. Fix the .env file - add missing NODE_ENV and PORT at the top
echo "2. Fixing .env file..."
cp .env .env.broken

cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://neondb_owner:L5uX8HhbS5XT@ep-empty-flower-a50xh1ka.us-east-2.aws.neon.tech/neondb?sslmode=require
OPENAI_API_KEY=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
RAZORPAY_KEY_ID=rzp_test_KofqomcGyXcjRP
RAZORPAY_KEY_SECRET=dqYO8RMzv4QaEiTOiP97fLka
TWOFACTOR_API_KEY=75c5f204-57d8-11f0-a562-0200cd936042
EOF

echo "3. Updated .env file:"
cat .env

# 3. Start server on port 3001
echo "4. Starting server on port 3001..."
tsx server/index.ts > server_3001_final.log 2>&1 &
NEW_PID=$!

echo "New server PID: $NEW_PID"
sleep 8

# 4. Check if server is running on correct port
echo "5. Checking server status..."
ps aux | grep $NEW_PID | grep -v grep || echo "Server not running"

# 5. Test local connection on port 3001
echo "6. Testing local connection on port 3001..."
curl -s http://localhost:3001/api/health || echo "Local test failed"

# 6. Test OTP API locally
echo "7. Testing OTP API locally..."
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "8. Testing through nginx (https://learnyzer.com)..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "9. Server logs:"
tail -10 server_3001_final.log

echo ""
echo "10. Port check:"
sudo netstat -tlnp | grep :3001 || echo "No process on port 3001"