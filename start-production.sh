#!/bin/bash

echo "🚀 STARTING PRODUCTION WITH NGINX FIX"
echo "====================================="

cd ~/Learnyzer

# 1. Clean up existing processes
echo "1. Cleaning up processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

# 2. Update .env for port 3001 (production)
echo "2. Updating .env for production port 3001..."
cp .env .env.backup
sed -i 's/PORT=5000/PORT=3001/' .env
echo "Updated port in .env:"
grep PORT .env

# 3. Update nginx configuration for port 3001
echo "3. Updating nginx configuration..."
sudo sed -i 's/127\.0\.0\.1:5000/127.0.0.1:3001/g' /etc/nginx/sites-available/learnyzer.com

# 4. Test and start nginx
echo "4. Testing and starting nginx..."
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx --no-pager

# 5. Start production server on port 3001
echo "5. Starting production server on port 3001..."
tsx server/index.ts > production_3001.log 2>&1 &
PROD_PID=$!

echo "Production server PID: $PROD_PID"
sleep 10

# 6. Check server status
echo "6. Checking server process..."
ps aux | grep $PROD_PID | grep -v grep

# 7. Test OTP API through nginx
echo "7. Testing OTP API through HTTPS..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "8. Testing health endpoint..."
curl -s https://learnyzer.com/api/health

echo ""
echo "9. Testing direct server access..."
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "10. Production server logs:"
tail -10 production_3001.log

echo ""
echo "11. Nginx access logs:"
sudo tail -5 /var/log/nginx/access.log 2>/dev/null || echo "No nginx logs yet"