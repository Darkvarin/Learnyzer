#!/bin/bash

echo "🚀 QUICK SERVER START FOR LEARNYZER"
echo "=================================="

cd /home/ubuntu/Learnyzer

# Stop the broken process
pm2 delete all
pm2 kill

# Start server directly with tsx (TypeScript executor)
echo "Starting server with tsx..."
NODE_ENV=production pm2 start "tsx server/index.ts" --name "learnyzer" --watch false

# Check status
sleep 3
pm2 status

# Test API
echo ""
echo "Testing OTP API..."
curl -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "If still HTML, check logs with: pm2 logs learnyzer"