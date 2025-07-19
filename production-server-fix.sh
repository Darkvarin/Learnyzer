#!/bin/bash

echo "🚀 DEFINITIVE PRODUCTION SERVER FIX"
echo "==================================="

cd /home/ubuntu/Learnyzer

# 1. Kill all existing processes
echo "1. Stopping all existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo pkill -f tsx 2>/dev/null || true
sudo pkill -f node 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true

sleep 3

# 2. Create a custom production server script that fixes the middleware order
echo "2. Creating custom production server..."
cat > server-production-fixed.js << 'EOF'
const express = require('express');
const path = require('path');
const { createRequire } = require('module');

// Set up ES module require
const require = createRequire(import.meta.url);

const app = express();
app.use(express.json());

// 1. FIRST: Register API routes BEFORE static serving
console.log('🔧 Registering API routes first...');

// Import and setup authentication and routes
const { default: setupAuth } = await import('./server/auth.js');
const { default: registerRoutes } = await import('./server/routes.js');

// Setup authentication
setupAuth(app);

// Register all API routes
const server = await registerRoutes(app);

// 2. SECOND: Serve static files only for non-API routes
console.log('📁 Setting up static file serving...');
const distPath = path.resolve('./server/public');

// Serve static files
app.use(express.static(distPath));

// 3. LAST: Catch-all for frontend routing (excluding API)
app.use('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    // Let API routes through
    return next();
  }
  // Serve index.html for frontend routes
  res.sendFile(path.resolve(distPath, 'index.html'));
});

const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`🌐 Fixed production server running on port ${port}`);
});
EOF

# 3. Make it executable and run
echo "3. Starting fixed production server..."
export NODE_ENV=production
export PORT=5000
export $(grep -v '^#' .env | xargs)

# Start with node --experimental-modules for ES module support
node --experimental-modules --loader ./server-production-fixed.js > server_fixed.log 2>&1 &
FIXED_PID=$!

echo "Fixed server PID: $FIXED_PID"
sleep 5

# 4. Test the fixed server
echo "4. Testing fixed OTP API..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "5. Testing health endpoint..."
curl -s https://learnyzer.com/api/health

echo ""
echo "6. Check logs:"
tail -10 server_fixed.log