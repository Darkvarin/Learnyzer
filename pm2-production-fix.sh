#!/bin/bash

echo "🚀 PM2 PRODUCTION SOLUTION"
echo "========================="

cd ~/Learnyzer

# 1. Stop everything and clean up
echo "1. Stopping all processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx
sudo fuser -k 5000/tcp 2>/dev/null
sudo fuser -k 3001/tcp 2>/dev/null

# 2. Update .env for production
echo "2. Updating .env for production..."
cp .env .env.backup

# Create production .env with port 3001
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://neondb_owner:L5uX8HhbS5XT@ep-empty-flower-a50xh1ka.us-east-2.aws.neon.tech/neondb?sslmode=require
EOF

# Add API keys from backup
echo "OPENAI_API_KEY=$(grep OPENAI_API_KEY .env.backup | cut -d= -f2)" >> .env
echo "RAZORPAY_KEY_ID=$(grep RAZORPAY_KEY_ID .env.backup | cut -d= -f2)" >> .env
echo "RAZORPAY_KEY_SECRET=$(grep RAZORPAY_KEY_SECRET .env.backup | cut -d= -f2)" >> .env
echo "TWOFACTOR_API_KEY=$(grep TWOFACTOR_API_KEY .env.backup | cut -d= -f2)" >> .env

echo "Updated .env:"
grep -E "(NODE_ENV|PORT)" .env

# 3. Update nginx to use port 3001
echo "3. Updating nginx configuration..."
sudo sed -i 's/127\.0\.0\.1:5000/127.0.0.1:3001/g' /etc/nginx/sites-available/learnyzer.com
sudo nginx -t && sudo systemctl reload nginx

# 4. Create PM2 ecosystem for production
echo "4. Creating PM2 production config..."
cat > ecosystem.production.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'learnyzer-production',
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
    log_file: '/home/ubuntu/Learnyzer/logs/production.log',
    error_file: '/home/ubuntu/Learnyzer/logs/error.log',
    out_file: '/home/ubuntu/Learnyzer/logs/out.log'
  }]
};
EOF

# 5. Create logs directory and start with PM2
mkdir -p logs
echo "5. Starting with PM2..."
pm2 start ecosystem.production.config.js

# 6. Wait and check status
sleep 10
echo "6. PM2 status:"
pm2 status

# 7. Test OTP API
echo "7. Testing OTP API..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "8. Testing health endpoint..."
curl -s https://learnyzer.com/api/health

echo ""
echo "9. PM2 logs:"
pm2 logs learnyzer-production --lines 10