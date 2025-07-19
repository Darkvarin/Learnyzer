#!/bin/bash

echo "🚨 EMERGENCY SERVER FIX FOR LEARNYZER PRODUCTION"
echo "=============================================="

cd /home/ubuntu/Learnyzer

# Kill the bash process that's running as "learnyzer"
pm2 delete learnyzer

# Check what files exist in the directory
echo "1. Checking directory structure..."
ls -la
echo ""
echo "Server directory contents:"
ls -la server/ 2>/dev/null || echo "No server directory"
echo ""
echo "Dist directory contents:"
ls -la dist/ 2>/dev/null || echo "No dist directory"

# Check if we have the necessary files
if [ -f "server/index.ts" ]; then
    echo "✅ Found server/index.ts"
    SERVER_FILE="server/index.ts"
    START_CMD="tsx server/index.ts"
elif [ -f "dist/server/index.js" ]; then
    echo "✅ Found dist/server/index.js"
    SERVER_FILE="dist/server/index.js"
    START_CMD="node dist/server/index.js"
elif [ -f "server.js" ]; then
    echo "✅ Found server.js"
    SERVER_FILE="server.js"
    START_CMD="node server.js"
else
    echo "❌ No server file found!"
    echo "Available files:"
    find . -name "*.js" -o -name "*.ts" | grep -E "(server|index)" | head -10
fi

# Create a simple ecosystem.config.js if it doesn't exist
echo "2. Creating ecosystem.config.js..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'learnyzer',
    script: 'tsx',
    args: 'server/index.ts',
    cwd: '/home/ubuntu/Learnyzer',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Load environment variables
echo "3. Loading environment variables..."
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ No .env file found"
fi

# Start the server properly
echo "4. Starting server with correct configuration..."
NODE_ENV=production pm2 start ecosystem.config.js --env production

# Wait and check status
sleep 5
pm2 status

# Test the server
echo "5. Testing server..."
curl -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' | head -5

# Check logs if still not working
echo ""
echo "6. Recent logs:"
pm2 logs learnyzer --lines 10