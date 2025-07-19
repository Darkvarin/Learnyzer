#!/bin/bash

echo "🚀 SIMPLE SERVER START (NO PM2 CONFLICTS)"
echo "======================================="

cd /home/ubuntu/Learnyzer

# Kill everything and start fresh
pm2 kill
sudo pkill -f node
sudo fuser -k 5000/tcp
sleep 3

# Start server directly (no PM2 for now)
echo "Starting server directly..."
export NODE_ENV=production
nohup tsx server/index.ts > server.log 2>&1 &

# Get the process ID
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to start
sleep 5

# Test server
echo "Testing server..."
curl -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

# Show server logs
echo ""
echo "Server logs:"
tail -20 server.log