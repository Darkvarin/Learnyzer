#!/bin/bash

echo "🔧 COMPLETE PRODUCTION FIX - FINAL SOLUTION"
echo "==========================================="

cd ~/Learnyzer

# 1. Check if server process is actually running
echo "1. Checking server process 90414..."
if ps -p 90414 > /dev/null 2>&1; then
    echo "✅ Server process 90414 is running"
    echo "Process details:"
    ps aux | grep 90414 | grep -v grep
else
    echo "❌ Server process 90414 is not running - it crashed"
fi

# 2. Check server logs
echo "2. Checking server logs..."
if [ -f production_3001_fixed.log ]; then
    echo "Server log contents:"
    cat production_3001_fixed.log
else
    echo "No server log file found"
fi

# 3. Kill any existing processes and clean up
echo "3. Cleaning up processes..."
sudo pkill -f tsx 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true

# 4. Verify .env file
echo "4. Current .env file:"
cat .env
echo ""

# 5. Test if we can start server manually
echo "5. Testing server startup manually..."
export $(grep -v '^#' .env | xargs)
echo "Environment: PORT=$PORT, NODE_ENV=$NODE_ENV"

# Try to start server in foreground for 10 seconds to see any errors
timeout 10s tsx server/index.ts 2>&1 | tee manual_test.log &
MANUAL_PID=$!

sleep 5

if ps -p $MANUAL_PID > /dev/null 2>&1; then
    echo "✅ Server started successfully in manual test"
    
    # Test local connection
    echo "6. Testing local connection..."
    curl -s http://localhost:3001/api/health || echo "Local health check failed"
    
    # Kill manual test
    kill $MANUAL_PID 2>/dev/null
    wait $MANUAL_PID 2>/dev/null
else
    echo "❌ Server failed in manual test. Error log:"
    cat manual_test.log 2>/dev/null
fi

# 6. Start with PM2 for better process management
echo "7. Starting with PM2..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Create PM2 config
cat > pm2.final.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'learnyzer-final',
    script: 'tsx',
    args: 'server/index.ts',
    cwd: '/home/ubuntu/Learnyzer',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_file: '/home/ubuntu/Learnyzer/logs/combined.log',
    error_file: '/home/ubuntu/Learnyzer/logs/error.log',
    out_file: '/home/ubuntu/Learnyzer/logs/out.log'
  }]
};
EOF

mkdir -p logs
pm2 start pm2.final.config.js

sleep 10

echo "8. PM2 Status:"
pm2 status

echo "9. Testing PM2 server..."
curl -s http://localhost:3001/api/health | head -3

echo "10. Testing OTP API directly..."
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' 2>/dev/null | head -3

echo "11. Testing through nginx..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' 2>/dev/null | head -3

echo "12. Recent PM2 logs:"
pm2 logs learnyzer-final --lines 5

echo "13. Nginx status:"
sudo systemctl status nginx --no-pager | head -5

echo "14. Port usage:"
sudo netstat -tlnp | grep :3001 || echo "No process on port 3001"
sudo netstat -tlnp | grep :5000 || echo "No process on port 5000"