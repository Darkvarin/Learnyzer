#!/bin/bash

echo "🚀 QUICK PM2 SOLUTION - PORT 8080"
echo "================================="

cd ~/Learnyzer

# 1. Stop everything
echo "1. Stopping all processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx
sudo fuser -k 5000/tcp 2>/dev/null

# 2. Update .env for port 8080
echo "2. Updating .env for port 8080..."
cp .env .env.backup
cat > .env << EOF
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://neondb_owner:L5uX8HhbS5XT@ep-empty-flower-a50xh1ka.us-east-2.aws.neon.tech/neondb?sslmode=require
OPENAI_API_KEY=${OPENAI_API_KEY}
RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
TWOFACTOR_API_KEY=${TWOFACTOR_API_KEY}
EOF

# 3. Start with PM2
echo "3. Starting with PM2..."
pm2 start tsx --name learnyzer-8080 -- server/index.ts

# 4. Wait and check status
sleep 10
echo "4. PM2 status:"
pm2 status

# 5. Test API
echo "5. Testing OTP API..."
curl -X POST http://localhost:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "6. Testing external access..."
curl -X POST http://3.109.251.7:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "7. PM2 logs:"
pm2 logs learnyzer-8080 --lines 5