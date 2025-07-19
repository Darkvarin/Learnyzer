#!/bin/bash

echo "🚨 EMERGENCY SERVER FIX"
echo "======================="

cd ~/Learnyzer

# 1. Stop everything
sudo pkill -f tsx
sudo pkill -f node
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 2. Check what's in .env
echo "Current .env:"
cat .env

# 3. Force update .env with working values
echo "Updating .env..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://neondb_owner:L5uX8HhbS5XT@ep-empty-flower-a50xh1ka.us-east-2.aws.neon.tech/neondb?sslmode=require
EOF

# Add API keys from environment or backup
if [ -f .env.backup ]; then
    grep "OPENAI_API_KEY=" .env.backup >> .env 2>/dev/null || echo "OPENAI_API_KEY=sk-placeholder" >> .env
    grep "RAZORPAY_KEY_ID=" .env.backup >> .env 2>/dev/null || echo "RAZORPAY_KEY_ID=rzp_placeholder" >> .env
    grep "RAZORPAY_KEY_SECRET=" .env.backup >> .env 2>/dev/null || echo "RAZORPAY_KEY_SECRET=secret_placeholder" >> .env
    grep "TWOFACTOR_API_KEY=" .env.backup >> .env 2>/dev/null || echo "TWOFACTOR_API_KEY=api_placeholder" >> .env
fi

echo "Updated .env:"
cat .env

# 4. Test server startup in foreground
echo "Testing server startup..."
export $(grep -v '^#' .env | xargs)
echo "PORT: $PORT"

# Start server and capture output
tsx server/index.ts > startup_test.log 2>&1 &
TEST_PID=$!

sleep 8

if ps -p $TEST_PID > /dev/null; then
    echo "✅ Server is running on PID $TEST_PID"
    
    # Test API
    echo "Testing API..."
    curl -v http://localhost:3001/api/health 2>&1 | head -10
    
    echo "Testing OTP..."
    curl -X POST http://localhost:3001/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}' | head -3
    
    echo "✅ Server working! Now testing through nginx..."
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}' | head -3
      
    # Keep server running
    echo "Server is working! Keeping it running..."
    wait $TEST_PID
else
    echo "❌ Server crashed. Log:"
    cat startup_test.log
fi