#!/bin/bash

echo "🚀 MANUAL LEARNYZER DEPLOYMENT"
echo "============================="

# First, copy this script to your EC2 server and run it there
echo "📋 INSTRUCTIONS:"
echo "1. SSH to your EC2 server"
echo "2. Copy this entire script"
echo "3. Run it on the server"
echo ""
echo "Commands to run on EC2:"
echo "========================"

cat << 'DEPLOYMENT_SCRIPT'
#!/bin/bash

echo "🚀 LEARNYZER MANUAL DEPLOYMENT ON EC2"
echo "======================================"

# Navigate to project
cd ~/Learnyzer || { echo "❌ Project directory not found"; exit 1; }

# Stop everything
echo "1️⃣ Stopping all processes..."
pm2 delete all 2>/dev/null || true
pkill -f "learnyzer" 2>/dev/null || true
pkill -f "tsx.*server" 2>/dev/null || true

# Clean up old startup files
echo "2️⃣ Removing old startup files..."
rm -f start-learnyzer.js
rm -f start-production.mjs
rm -f learnyzer-pm2.mjs
rm -f pm2-startup.mjs
rm -f ecosystem.config.js

# Set environment
echo "3️⃣ Setting environment..."
export NODE_ENV=production
export PORT=5000
export DATABASE_URL="postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
export OPENAI_API_KEY="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"
export TWOFACTOR_API_KEY="75c5f204-57d8-11f0-a562-0200cd936042"
export RAZORPAY_KEY_ID="rzp_test_KofqomcGyXcjRP"
export RAZORPAY_KEY_SECRET="dqYO8RMzv4QaEiTOiP97fLka"

# Check if we have the latest code
echo "4️⃣ Checking code..."
if [ ! -f "start-learnyzer-fixed.mjs" ]; then
    echo "Creating ES module startup script..."
    cat > start-learnyzer-fixed.mjs << 'EOF'
// ES Module compatible startup for Learnyzer
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 LEARNYZER PRODUCTION STARTUP');
console.log('Starting at:', new Date().toString());

// Set working directory
process.chdir('/home/ubuntu/Learnyzer');

// Environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = '5000';

console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- Working Directory:', process.cwd());
console.log('- Database URL present:', !!process.env.DATABASE_URL ? 'YES' : 'NO');
console.log('- OpenAI API Key present:', !!process.env.OPENAI_API_KEY ? 'YES' : 'NO');

console.log('Starting server with tsx...');

// Start server using tsx
const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd()
});

server.on('error', (err) => {
    console.error('❌ Server spawn error:', err);
    process.exit(1);
});

server.on('exit', (code, signal) => {
    console.log(`Server exited with code ${code}, signal ${signal}`);
    if (code !== 0 && code !== null) {
        process.exit(code);
    }
});

// Handle shutdown signals
const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down...`);
    server.kill(signal);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
EOF
fi

# Build frontend if needed
echo "5️⃣ Building frontend..."
if [ ! -f "dist/public/index.html" ]; then
    npm ci --production
    npx vite build
fi

# Start with PM2 using the .mjs file
echo "6️⃣ Starting with PM2..."
pm2 start start-learnyzer-fixed.mjs \
    --name learnyzer \
    --log-date-format="YYYY-MM-DD HH:mm:ss" \
    --merge-logs \
    --restart-delay=5000 \
    --env NODE_ENV=production \
    --env PORT=5000 \
    --env DATABASE_URL="$DATABASE_URL" \
    --env OPENAI_API_KEY="$OPENAI_API_KEY" \
    --env TWOFACTOR_API_KEY="$TWOFACTOR_API_KEY" \
    --env RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID" \
    --env RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET"

# Wait for startup
echo "7️⃣ Waiting for startup..."
sleep 12

# Check status
echo "8️⃣ Checking status..."
pm2 status

# Test server
echo "9️⃣ Testing server..."
for i in {1..3}; do
    echo "Test $i/3..."
    if timeout 10 curl -f http://localhost:5000/api/health; then
        echo -e "\n✅ SUCCESS! Learnyzer is running"
        PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
        echo "🌐 Access at: http://$PUBLIC_IP:5000"
        pm2 save
        exit 0
    fi
    sleep 5
done

echo "❌ Server not responding. Checking logs:"
pm2 logs learnyzer --lines 20 --nostream

echo -e "\n🔧 Manual debugging commands:"
echo "pm2 logs learnyzer"
echo "pm2 restart learnyzer"
echo "curl http://localhost:5000/api/health"

DEPLOYMENT_SCRIPT

echo ""
echo "📝 Copy the script above and run it on your EC2 server"
echo "   ssh -i your-key.pem ubuntu@ec2-13-235-75-64.ap-south-1.compute.amazonaws.com"