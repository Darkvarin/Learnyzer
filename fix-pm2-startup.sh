#!/bin/bash

echo "🔧 LEARNYZER PM2 STARTUP FIX"
echo "============================="

# Navigate to project directory
cd ~/Learnyzer || { echo "❌ Project directory not found"; exit 1; }

# Kill all existing processes
echo "1️⃣ Cleaning up existing processes..."
pm2 delete all 2>/dev/null || true
pkill -f "learnyzer" 2>/dev/null || true
pkill -f "node.*Learnyzer" 2>/dev/null || true

# Set environment variables
echo "2️⃣ Setting environment variables..."
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
export OPENAI_API_KEY="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"
export TWOFACTOR_API_KEY="75c5f204-57d8-11f0-a562-0200cd936042"
export RAZORPAY_KEY_ID="rzp_test_KofqomcGyXcjRP"
export RAZORPAY_KEY_SECRET="dqYO8RMzv4QaEiTOiP97fLka"
export PORT="5000"

# Check if frontend is built
echo "3️⃣ Checking frontend build..."
if [ ! -f "dist/public/index.html" ]; then
    echo "⚠️ Frontend not built. Building now..."
    npm ci --production --silent
    npx vite build --config vite.config.ts
    
    if [ ! -f "dist/public/index.html" ]; then
        echo "❌ Frontend build failed"
        exit 1
    fi
    echo "✅ Frontend built successfully"
else
    echo "✅ Frontend already built"
fi

# Test Node.js version and tsx
echo "4️⃣ Testing Node.js setup..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Check if tsx is available
if command -v tsx >/dev/null 2>&1; then
    echo "✅ tsx is available globally"
elif npx tsx --version >/dev/null 2>&1; then
    echo "✅ tsx is available via npx"
else
    echo "⚠️ tsx not found, installing..."
    npm install -g tsx
fi

# Test database connection
echo "5️⃣ Testing database connection..."
if timeout 10 node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: '$DATABASE_URL' });
pool.query('SELECT 1')
  .then(() => { console.log('✅ Database connection successful'); process.exit(0); })
  .catch((err) => { console.error('❌ Database connection failed:', err.message); process.exit(1); });
" 2>/dev/null; then
    echo "✅ Database connection verified"
else
    echo "⚠️ Database connection test failed, but continuing..."
fi

# Create optimized PM2 startup script
echo "6️⃣ Creating optimized startup script..."
cat > learnyzer-pm2.mjs << 'EOF'
// Optimized PM2 startup for Learnyzer
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set working directory
process.chdir('/home/ubuntu/Learnyzer');

// Ensure environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 Learnyzer PM2 Launcher');
console.log('Working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Start server using tsx directly
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd()
});

serverProcess.on('error', (error) => {
    console.error('❌ Server process error:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    console.log(`🔄 Server process exited with code ${code}`);
    if (code !== 0) {
        process.exit(code);
    }
});

// Handle shutdown signals
process.on('SIGTERM', () => {
    console.log('📡 SIGTERM received, shutting down...');
    serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('📡 SIGINT received, shutting down...');
    serverProcess.kill('SIGINT');
});
EOF

# Start with PM2
echo "7️⃣ Starting with PM2..."
pm2 start learnyzer-pm2.mjs --name learnyzer \
    --log-date-format="YYYY-MM-DD HH:mm:ss" \
    --merge-logs \
    --restart-delay=3000 \
    --max-restarts=5 \
    --env NODE_ENV=production \
    --env PORT=5000 \
    --env DATABASE_URL="$DATABASE_URL" \
    --env OPENAI_API_KEY="$OPENAI_API_KEY" \
    --env TWOFACTOR_API_KEY="$TWOFACTOR_API_KEY" \
    --env RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID" \
    --env RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET"

# Wait for startup
echo "8️⃣ Waiting for startup..."
sleep 10

# Check status
echo "9️⃣ Checking PM2 status..."
pm2 status

# Test endpoint
echo "🔟 Testing server endpoint..."
for i in {1..6}; do
    echo "Attempt $i/6..."
    if timeout 5 curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
        echo "✅ SERVER IS RUNNING!"
        echo "🌐 Learnyzer is live at: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):5000"
        
        # Save PM2 configuration
        pm2 save
        
        echo ""
        echo "🎉 SUCCESS! Learnyzer is now running with PM2"
        echo ""
        echo "📊 Useful commands:"
        echo "   pm2 status"
        echo "   pm2 logs learnyzer"
        echo "   pm2 restart learnyzer"
        echo "   pm2 monit"
        exit 0
    fi
    sleep 5
done

echo "❌ Server endpoint still not responding after 30 seconds"
echo "📋 Recent logs:"
pm2 logs learnyzer --lines 20 --nostream

echo ""
echo "🔧 Troubleshooting:"
echo "1. Check logs: pm2 logs learnyzer"
echo "2. Check status: pm2 status" 
echo "3. Try restart: pm2 restart learnyzer"
echo "4. Check port: netstat -tlnp | grep :5000"