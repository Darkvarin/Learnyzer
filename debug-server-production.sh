#!/bin/bash

echo "🔍 DEBUG SERVER PRODUCTION ISSUE"
echo "================================"

cd ~/Learnyzer

# 1. Check current environment
echo "1. Current environment:"
echo "NODE_ENV: $(grep NODE_ENV .env)"
echo "PORT: $(grep PORT .env)"
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"

# 2. Stop everything cleanly
echo "2. Stopping processes..."
sudo pkill -f tsx 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

# 3. Check if dependencies exist
echo "3. Checking dependencies..."
ls -la server/index.ts
npm list tsx 2>/dev/null | head -3

# 4. Try to start server in foreground to see exact error
echo "4. Starting server in foreground to see errors..."
export $(grep -v '^#' .env | xargs)
echo "Environment loaded - PORT: $PORT, NODE_ENV: $NODE_ENV"

timeout 15 tsx server/index.ts 2>&1 | tee debug_output.log &
SERVER_PID=$!

# 5. Wait and check if it's running
sleep 8
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server is running with PID: $SERVER_PID"
    
    # Test local connection
    echo "5. Testing local connection..."
    curl -v http://localhost:3001/api/health 2>&1 | head -10
    
    # Kill the test server
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ Server crashed. Debug output:"
    cat debug_output.log 2>/dev/null || echo "No debug output available"
    
    # Check for common issues
    echo "6. Checking for common issues..."
    echo "Database connectivity:"
    timeout 5 node -e "
    require('dotenv').config();
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    sql\`SELECT 1\`.then(() => console.log('✅ Database OK')).catch(e => console.log('❌ Database error:', e.message));
    " 2>/dev/null || echo "Database test failed"
    
    echo "Missing files check:"
    ls -la server/ | head -5
    ls -la .env
fi

# 6. If server works, start with PM2 for stability
echo "7. Starting with PM2 for production stability..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

cat > pm2.simple.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'learnyzer-prod',
    script: 'tsx',
    args: 'server/index.ts',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

pm2 start pm2.simple.config.js
sleep 5

echo "8. PM2 Status:"
pm2 status

echo "9. Testing PM2 server:"
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' 2>/dev/null || echo "Local test failed"

echo "10. Testing through nginx:"
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' 2>/dev/null || echo "Nginx test failed"

echo "11. PM2 logs:"
pm2 logs learnyzer-prod --lines 5