#!/bin/bash

echo "🔍 SERVER DEBUG FOR PRODUCTION ENVIRONMENT"
echo "========================================"

cd /home/ubuntu/Learnyzer

# Check what server code is actually running
echo "1. Checking server configuration..."

# Look at ecosystem.config.js
if [ -f "ecosystem.config.js" ]; then
    echo "=== ecosystem.config.js ==="
    cat ecosystem.config.js
    echo ""
fi

# Check server/index.ts for production configuration
if [ -f "server/index.ts" ]; then
    echo "=== server/index.ts (production check) ==="
    grep -n -A 5 -B 5 "PRODUCTION\|NODE_ENV\|static\|express.static" server/index.ts
    echo ""
fi

# Check package.json scripts
echo "=== package.json scripts ==="
grep -A 10 '"scripts"' package.json

# Check current PM2 environment
echo ""
echo "2. Current PM2 environment for learnyzer:"
pm2 env learnyzer | grep -E "(NODE_ENV|exec_mode|script|cwd)"

# Check server logs for any clues
echo ""
echo "3. Recent server logs:"
pm2 logs learnyzer --lines 20

# Check if there are multiple server processes
echo ""
echo "4. All processes on port 5000:"
sudo lsof -i :5000

# Manual restart with explicit environment
echo ""
echo "5. Manual restart with explicit production environment..."
pm2 delete learnyzer
export NODE_ENV=production
export DATABASE_URL="$(grep DATABASE_URL /home/ubuntu/Learnyzer/.env | cut -d'=' -f2-)"
export TWOFACTOR_API_KEY="$(grep TWOFACTOR_API_KEY /home/ubuntu/Learnyzer/.env | cut -d'=' -f2-)"

# Start with explicit environment
pm2 start ecosystem.config.js --env production

echo ""
echo "6. Testing after restart..."
sleep 3
curl -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' | head -5