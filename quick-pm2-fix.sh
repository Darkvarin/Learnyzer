#!/bin/bash

echo "🔧 QUICK PM2 FIX FOR LEARNYZER"
echo "=============================="

# Navigate to project directory
cd ~/Learnyzer || { echo "❌ Project directory not found"; exit 1; }

# Clean up existing processes
echo "1️⃣ Cleaning existing processes..."
pm2 delete learnyzer 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Set environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
export OPENAI_API_KEY="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"
export TWOFACTOR_API_KEY="75c5f204-57d8-11f0-a562-0200cd936042"
export RAZORPAY_KEY_ID="rzp_test_KofqomcGyXcjRP"
export RAZORPAY_KEY_SECRET="dqYO8RMzv4QaEiTOiP97fLka"
export PORT="5000"

echo "2️⃣ Environment variables set"

# Check if frontend is built
if [ ! -f "dist/public/index.html" ]; then
    echo "3️⃣ Building frontend..."
    npm ci --production --silent
    npx vite build --config vite.config.ts
else
    echo "3️⃣ Frontend already built"
fi

# Create simple startup script
echo "4️⃣ Creating startup script..."
cat > start-learnyzer.js << 'EOF'
// Simple Node.js startup for Learnyzer
const { spawn } = require('child_process');

// Set working directory
process.chdir('/home/ubuntu/Learnyzer');

// Environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = '5000';

console.log('🚀 Starting Learnyzer with tsx...');

// Start server using tsx
const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd()
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    if (code !== 0) {
        process.exit(code);
    }
});

// Handle shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down...');
    server.kill('SIGTERM');
});
EOF

# Start with PM2
echo "5️⃣ Starting with PM2..."
pm2 start start-learnyzer.js --name learnyzer \
    --log-date-format="YYYY-MM-DD HH:mm:ss" \
    --restart-delay=3000

# Wait and test
echo "6️⃣ Testing server..."
sleep 8
pm2 status

if timeout 10 curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "✅ SUCCESS! Learnyzer is running"
    echo "🌐 Live at: http://$(curl -s ifconfig.me 2>/dev/null):5000"
    pm2 save
else
    echo "❌ Server not responding. Checking logs..."
    pm2 logs learnyzer --lines 15 --nostream
fi

echo ""
echo "Commands:"
echo "  pm2 status"
echo "  pm2 logs learnyzer"
echo "  pm2 restart learnyzer"