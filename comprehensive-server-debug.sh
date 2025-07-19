#!/bin/bash

echo "🔍 COMPREHENSIVE SERVER DEBUG"
echo "============================="

cd ~/Learnyzer

# 1. Check current processes
echo "1. Current processes:"
ps aux | grep tsx | grep -v grep || echo "No tsx processes"
ps aux | grep node | grep -v grep || echo "No node processes"

# 2. Check ports in use
echo "2. Ports in use:"
sudo netstat -tlnp | grep :3001 || echo "Port 3001 not in use"
sudo netstat -tlnp | grep :5000 || echo "Port 5000 not in use"

# 3. Stop everything cleanly
echo "3. Stopping all processes..."
sudo pkill -f tsx 2>/dev/null || true
sudo pkill -f node 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

sleep 3

# 4. Check .env file
echo "4. Current .env file:"
cat .env
echo ""

# 5. Test environment loading
echo "5. Testing environment loading..."
export $(grep -v '^#' .env | xargs)
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."

# 6. Test basic Node.js functionality
echo "6. Testing basic Node.js..."
node -e "console.log('Node.js works:', process.version)" || echo "Node.js test failed"

# 7. Test tsx
echo "7. Testing tsx..."
which tsx || echo "tsx not found"
tsx --version 2>/dev/null || echo "tsx version failed"

# 8. Check server files
echo "8. Checking server files..."
ls -la server/index.ts || echo "server/index.ts not found"
ls -la server/routes.ts || echo "server/routes.ts not found"

# 9. Try to start server with detailed logging
echo "9. Starting server with detailed logging..."
tsx server/index.ts > detailed_debug.log 2>&1 &
DEBUG_PID=$!

echo "Server PID: $DEBUG_PID"
sleep 10

# 10. Check if server process is running
if ps -p $DEBUG_PID > /dev/null 2>&1; then
    echo "✅ Server is running on PID $DEBUG_PID"
    
    # Test local connections
    echo "10. Testing local connections..."
    
    echo "Health check:"
    curl -v http://localhost:3001/api/health 2>&1 | head -15
    
    echo ""
    echo "OTP API test:"
    curl -X POST http://localhost:3001/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}' 2>&1 | head -10
    
    echo ""
    echo "✅ Local server works! Testing nginx..."
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}' 2>&1 | head -10
    
    # Keep server running in background
    echo ""
    echo "Server is working! Check the results above."
    echo "If nginx test failed, the issue is nginx configuration."
    echo "Server will continue running in background..."
    
else
    echo "❌ Server crashed. Debug log:"
    cat detailed_debug.log 2>/dev/null || echo "No debug log available"
    
    echo ""
    echo "11. Checking for dependency issues..."
    npm list | head -10
    
    echo ""
    echo "12. Checking database connectivity..."
    timeout 10s node -e "
    require('dotenv').config();
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    sql\`SELECT 1 as test\`.then(result => {
      console.log('✅ Database connection works:', result);
      process.exit(0);
    }).catch(error => {
      console.log('❌ Database error:', error.message);
      process.exit(1);
    });
    " || echo "Database test failed"
fi

echo ""
echo "13. Nginx configuration check:"
sudo nginx -t 2>&1 | head -5

echo ""
echo "14. Nginx status:"
sudo systemctl status nginx --no-pager | head -5