#!/bin/bash

echo "🔧 PM2 FINAL FIX - ES MODULE COMPATIBLE"
echo "======================================"

# Navigate to project directory
cd ~/Learnyzer || { echo "❌ Project directory not found"; exit 1; }

# Stop all existing processes
echo "1️⃣ Cleaning up processes..."
pm2 delete all 2>/dev/null || true
pkill -f "learnyzer" 2>/dev/null || true
pkill -f "tsx.*server" 2>/dev/null || true

# Set environment variables
echo "2️⃣ Setting environment..."
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
export OPENAI_API_KEY="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"
export TWOFACTOR_API_KEY="75c5f204-57d8-11f0-a562-0200cd936042"
export RAZORPAY_KEY_ID="rzp_test_KofqomcGyXcjRP"
export RAZORPAY_KEY_SECRET="dqYO8RMzv4QaEiTOiP97fLka"
export PORT="5000"

# Check frontend build
echo "3️⃣ Checking frontend..."
if [ ! -f "dist/public/index.html" ]; then
    echo "Building frontend..."
    npm ci --production --silent
    npx vite build --config vite.config.ts
fi

# Remove problematic old startup scripts
echo "4️⃣ Cleaning old scripts..."
rm -f start-learnyzer.js start-production.mjs learnyzer-pm2.mjs pm2-startup.mjs 2>/dev/null

# Create ES Module compatible startup script
echo "5️⃣ Creating ES module startup script..."
cat > start-learnyzer.mjs << 'EOF'
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

// Ensure all environment variables are set
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

# Start with PM2 using proper ES module file
echo "6️⃣ Starting with PM2..."
pm2 start start-learnyzer.mjs --name learnyzer \
    --log-date-format="YYYY-MM-DD HH:mm:ss" \
    --merge-logs \
    --restart-delay=5000 \
    --max-restarts=3 \
    --env NODE_ENV=production \
    --env PORT=5000 \
    --env DATABASE_URL="$DATABASE_URL" \
    --env OPENAI_API_KEY="$OPENAI_API_KEY" \
    --env TWOFACTOR_API_KEY="$TWOFACTOR_API_KEY" \
    --env RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID" \
    --env RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET"

# Wait for startup
echo "7️⃣ Waiting for startup..."
sleep 10

# Check status
pm2 status

# Test server multiple times
echo "8️⃣ Testing server..."
SUCCESS=false
for i in {1..5}; do
    echo "Test attempt $i/5..."
    if timeout 8 curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
        SUCCESS=true
        break
    fi
    sleep 3
done

if [ "$SUCCESS" = true ]; then
    echo "✅ SUCCESS! Learnyzer is running"
    PUBLIC_IP=$(timeout 5 curl -s ifconfig.me 2>/dev/null || echo "localhost")
    echo "🌐 Live at: http://${PUBLIC_IP}:5000"
    
    # Save PM2 config
    pm2 save
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "📊 pm2 status"
    echo "📋 pm2 logs learnyzer"
    echo "🔄 pm2 restart learnyzer"
    
else
    echo "❌ Server still not responding"
    echo "📋 Recent logs:"
    pm2 logs learnyzer --lines 20 --nostream
    
    echo ""
    echo "🔧 Debug commands:"
    echo "pm2 logs learnyzer --lines 50"
    echo "pm2 restart learnyzer"
    echo "netstat -tlnp | grep :5000"
fi