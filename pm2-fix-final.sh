#!/bin/bash

echo "🔧 PM2 PRODUCTION FIX - FINAL SOLUTION"
echo "====================================="

cd ~/Learnyzer

# 1. Stop everything
echo "1. Stopping all processes..."
sudo systemctl stop nginx
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx 2>/dev/null || true
sudo pkill -f node 2>/dev/null || true

# 2. Create PM2 ecosystem file for port 8080
echo "2. Creating PM2 configuration..."
cat > ecosystem-port8080.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'learnyzer-port8080',
    script: 'tsx',
    args: 'server/index.ts',
    cwd: '/home/ubuntu/Learnyzer',
    env: {
      NODE_ENV: 'development',
      PORT: 8080
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_file: '/home/ubuntu/Learnyzer/logs/app.log',
    error_file: '/home/ubuntu/Learnyzer/logs/error.log',
    out_file: '/home/ubuntu/Learnyzer/logs/out.log'
  }]
};
EOF

# 3. Create logs directory
mkdir -p logs

# 4. Start with PM2
echo "3. Starting with PM2..."
export $(grep -v '^#' .env | xargs)
pm2 start ecosystem-port8080.config.js

# 5. Wait for startup
sleep 10

# 6. Check PM2 status
echo "4. PM2 status:"
pm2 status

# 7. Test API
echo "5. Testing OTP API on port 8080..."
curl -X POST http://3.109.251.7:8080/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

# 8. Show logs
echo ""
echo "6. Recent logs:"
pm2 logs learnyzer-port8080 --lines 10

echo ""
echo "7. If this works, update nginx to proxy to port 8080:"
echo "sudo sed -i 's/127\.0\.0\.1:5000/127.0.0.1:8080/g' /etc/nginx/sites-available/learnyzer.com"
echo "sudo systemctl start nginx"