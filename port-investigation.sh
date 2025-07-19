#!/bin/bash

echo "🔍 INVESTIGATING PORT 5000 USAGE"
echo "==============================="

# Check what's using port 5000
echo "1. Checking what's using port 5000:"
sudo lsof -i :5000
echo ""

# Check all node processes
echo "2. All node processes:"
ps aux | grep node | grep -v grep
echo ""

# Check PM2 processes
echo "3. PM2 processes:"
pm2 list
echo ""

# Check nginx processes
echo "4. nginx processes:"
ps aux | grep nginx | grep -v grep
echo ""

# Check if there's a system service on port 5000
echo "5. Checking system services on port 5000:"
sudo netstat -tlnp | grep :5000
echo ""

# Try different port for testing
echo "6. Starting server on port 5001 for testing..."
cd /home/ubuntu/Learnyzer
export NODE_ENV=production
export PORT=5001

# Kill any existing PM2 processes
pm2 delete all 2>/dev/null

# Start on port 5001
pm2 start "PORT=5001 tsx server/index.ts" --name "learnyzer-test"

sleep 5
pm2 status

# Test on port 5001
echo "7. Testing server on port 5001:"
curl -X POST http://127.0.0.1:5001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'