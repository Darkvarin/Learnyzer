#!/bin/bash

echo "🔧 FIXING PM2 STARTUP ISSUES"
echo "============================"

echo "Run this on your EC2 server:"
echo ""

cat << 'FIX_SCRIPT'
#!/bin/bash

echo "🔧 Complete PM2 Fix for Learnyzer"
echo "================================="

cd ~/Learnyzer || exit 1

# Clean everything
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Set all environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
export OPENAI_API_KEY="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"
export TWOFACTOR_API_KEY="75c5f204-57d8-11f0-a562-0200cd936042"
export RAZORPAY_KEY_ID="rzp_test_KofqomcGyXcjRP"
export RAZORPAY_KEY_SECRET="dqYO8RMzv4QaEiTOiP97fLka"
export PORT="8080"

# Create working startup script for port 8080
cat > pm2-simple.mjs << 'EOF'
import { spawn } from 'child_process';

console.log('🚀 LEARNYZER STARTING ON PORT 8080');
console.log('Starting at:', new Date().toString());

// Set working directory
process.chdir('/home/ubuntu/Learnyzer');

// Environment variables
const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '8080',
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TWOFACTOR_API_KEY: process.env.TWOFACTOR_API_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET
};

console.log('Environment check:');
console.log('- NODE_ENV:', env.NODE_ENV);
console.log('- PORT:', env.PORT);
console.log('- Database URL present:', !!env.DATABASE_URL ? 'YES' : 'NO');

console.log('Starting server...');

// Start server
const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: env,
    cwd: process.cwd()
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});

server.on('exit', (code, signal) => {
    console.log(`Server exited: code=${code}, signal=${signal}`);
    if (code !== 0 && code !== null) {
        process.exit(code);
    }
});

// Handle shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down...');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down...');
    server.kill('SIGINT');
});
EOF

# Start with PM2 on port 8080
echo "Starting Learnyzer on port 8080..."
pm2 start pm2-simple.mjs --name learnyzer \
    --log-date-format="YYYY-MM-DD HH:mm:ss" \
    --env NODE_ENV=production \
    --env PORT=8080 \
    --env DATABASE_URL="$DATABASE_URL" \
    --env OPENAI_API_KEY="$OPENAI_API_KEY" \
    --env TWOFACTOR_API_KEY="$TWOFACTOR_API_KEY" \
    --env RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID" \
    --env RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET"

# Wait for startup
echo "Waiting for server to start..."
sleep 15

# Check status
pm2 status

# Test server
echo "Testing server..."
if timeout 10 curl -f http://localhost:8080/api/health; then
    echo -e "\n✅ SUCCESS! Learnyzer running on port 8080"
    echo "🌐 Try accessing: http://13.235.75.64:8080"
    
    # Save PM2 config
    pm2 save
    
    echo -e "\nNext step: Add port 8080 to EC2 Security Group:"
    echo "AWS Console → EC2 → Your Instance → Security → Edit inbound rules"
    echo "Add: Custom TCP, Port 8080, Source 0.0.0.0/0"
else
    echo "❌ Server not responding. Checking logs..."
    pm2 logs learnyzer --lines 20 --nostream
    
    echo -e "\nDebug info:"
    netstat -tlnp | grep :8080
fi

FIX_SCRIPT