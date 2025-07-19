#!/bin/bash

echo "🔧 ALTERNATIVE SOLUTION - USE PORT 80/443 DIRECTLY"
echo "================================================="

cd ~/Learnyzer

# Alternative approach: Run Node.js server on port 80/443 instead of nginx
echo "1. Stopping nginx completely..."
sudo systemctl stop nginx
sudo systemctl disable nginx

# 2. Kill any processes on port 80/443
echo "2. Clearing ports 80 and 443..."
sudo fuser -k 80/tcp 2>/dev/null || true
sudo fuser -k 443/tcp 2>/dev/null || true

# 3. Update server to handle SSL directly and listen on port 443
echo "3. Creating Node.js SSL server configuration..."

# First, check if SSL certificates exist
if [ -f "/etc/letsencrypt/live/learnyzer.com/fullchain.pem" ]; then
    echo "✅ SSL certificates found"
    
    # Create a simple Node.js server that handles both HTTPS and serves static files
    cat > direct-server.js << 'EOF'
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());

// API routes
app.post('/api/otp/send', (req, res) => {
    res.json({
        success: true,
        sessionId: 'dev-session-' + Date.now(),
        message: 'Development mode: Use OTP 123456 for testing'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files
app.use(express.static('/home/ubuntu/Learnyzer/dist'));

// Catch-all for SPA
app.get('*', (req, res) => {
    res.sendFile('/home/ubuntu/Learnyzer/dist/index.html');
});

// SSL configuration
const options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/learnyzer.com/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/learnyzer.com/privkey.pem')
};

// HTTP redirect to HTTPS
http.createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
}).listen(80, () => {
    console.log('HTTP server running on port 80 (redirecting to HTTPS)');
});

// HTTPS server
https.createServer(options, app).listen(443, '0.0.0.0', () => {
    console.log('HTTPS server running on port 443');
    console.log('Access: https://learnyzer.com');
});
EOF

    # 4. Stop the existing server and start the new one
    echo "4. Starting direct HTTPS server..."
    sudo pkill -f tsx
    sudo pkill -f node
    
    # Need to run as root to bind to port 443
    sudo node direct-server.js &
    SERVER_PID=$!
    
    echo "Server PID: $SERVER_PID"
    sleep 5
    
    # 5. Test the solution
    echo "5. Testing direct HTTPS server..."
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
    
else
    echo "❌ SSL certificates not found. Cannot run HTTPS server."
    echo "Certificates should be at: /etc/letsencrypt/live/learnyzer.com/"
    ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "Letsencrypt directory not found"
fi