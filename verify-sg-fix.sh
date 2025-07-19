#!/bin/bash

echo "✅ VERIFYING COMPLETE FIX"
echo "========================"

echo "1. Testing OTP API (should return JSON):"
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo ""
echo "2. Testing OTP verification (should return JSON):"
curl -X POST https://learnyzer.com/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "otp": "123456", "sessionId": "dev-session-123"}'

echo ""
echo ""
echo "3. Testing main website (should load HTML):"
curl -s https://learnyzer.com/ | head -10

echo ""
echo ""
echo "4. Server status:"
ps aux | grep tsx | grep -v grep || echo "No tsx processes found"

echo ""
echo "5. Port usage:"
sudo netstat -tlnp | grep :5000

echo ""
echo "✅ If OTP API returns JSON above, the fix is complete!"