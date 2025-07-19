#!/bin/bash

echo "🎯 SIMPLE SERVER START - BYPASSING ALL ISSUES"
echo "============================================="

cd /home/ubuntu/Learnyzer

# Kill everything
pm2 kill
sudo pkill -f node
sudo pkill -f tsx

# Use a completely different approach - direct node execution
echo "1. Creating simplified server starter..."

# Create a simple JS file that starts the server
cat > start-production.js << 'EOF'
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Learnyzer Production Server...');

// Set environment
process.env.NODE_ENV = 'production';
process.env.PORT = '3000';

// Load .env file manually
try {
  const fs = require('fs');
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key] = values.join('=');
      }
    }
  });
  console.log('✅ Environment loaded');
} catch (err) {
  console.log('⚠️  No .env file found');
}

// Start the server
const serverPath = path.join(__dirname, 'server', 'index.ts');
console.log('Starting server from:', serverPath);

const server = spawn('tsx', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

server.on('exit', (code) => {
  console.log('Server exited with code:', code);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit();
});
EOF

echo "2. Starting server with custom launcher..."
node start-production.js &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
sleep 8

# Test server
echo "3. Testing server..."
curl -X POST http://127.0.0.1:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "4. Testing through nginx..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'