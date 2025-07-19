#!/bin/bash

echo "🚀 LEARNYZER PRODUCTION DEPLOYMENT (NON-BLOCKING)"
echo "================================================="

# Navigate to project directory
cd ~/Learnyzer || { echo "❌ Project directory not found"; exit 1; }

# Stop existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 delete learnyzer 2>/dev/null || true

# Set environment variables for production
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
export OPENAI_API_KEY="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"
export TWOFACTOR_API_KEY="75c5f204-57d8-11f0-a562-0200cd936042"
export RAZORPAY_KEY_ID="rzp_test_KofqomcGyXcjRP"
export RAZORPAY_KEY_SECRET="dqYO8RMzv4QaEiTOiP97fLka"
export PORT="5000"

echo "1️⃣ Installing production dependencies..."
npm ci --production --silent

echo "2️⃣ Building frontend..."
# Clean previous build
rm -rf dist/

# Build frontend with TypeScript config
npx vite build --config vite.config.ts

# Verify frontend build
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Frontend build failed - index.html not found"
    ls -la dist/ 2>/dev/null || echo "dist/ directory doesn't exist"
    exit 1
fi

echo "✅ Frontend build completed: $(du -sh dist/public/ 2>/dev/null || echo 'Size unknown')"

echo "3️⃣ Creating production startup script..."

# Create production startup script that uses Node.js with TypeScript loader
cat > start-production.mjs << 'SCRIPT_EOF'
// Production server with TypeScript loader
import { register } from 'module';
import { pathToFileURL } from 'url';

// Register TypeScript loader for ES modules
register('tsx/esm', pathToFileURL('./'));

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Learnyzer Production Server Starting...');
console.log('📁 Serving static files from dist/public/');
console.log(`🌐 Server running on port ${process.env.PORT || 5000}`);

// Import and start the server
import('./server/index.ts').catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
SCRIPT_EOF

echo "4️⃣ Starting production server with PM2..."

# Start with PM2 - simpler approach without ecosystem file
pm2 start start-production.mjs --name learnyzer \
  --log-date-format="YYYY-MM-DD HH:mm:ss" \
  --time \
  --restart-delay=5000 \
  --max-restarts=10

# Save PM2 processes (non-blocking)
pm2 save --force

echo "5️⃣ Waiting for server startup..."
sleep 8

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status

echo "6️⃣ Testing production server..."
# Test with timeout to avoid hanging
if timeout 10 curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Production server is running successfully!"
    
    # Get public IP safely
    PUBLIC_IP=$(timeout 5 curl -s ifconfig.me 2>/dev/null || echo "localhost")
    echo "🌐 Learnyzer is LIVE at: http://${PUBLIC_IP}:5000"
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
else
    echo "⚠️ Server might be starting up. Check logs:"
    pm2 logs learnyzer --lines 10 --nostream
fi

echo ""
echo "📋 USEFUL COMMANDS:"
echo "   Monitor: pm2 monit"
echo "   Logs: pm2 logs learnyzer"
echo "   Restart: pm2 restart learnyzer"
echo "   Stop: pm2 stop learnyzer"
echo "   Status: pm2 status"
echo ""
echo "🔗 Access your app: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR-SERVER-IP'):5000"