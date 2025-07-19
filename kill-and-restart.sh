#!/bin/bash

echo "🔧 KILLING ALL PROCESSES AND STARTING FIXED SERVER"
echo "================================================="

cd ~/Learnyzer

# Kill all Node processes
echo "1. Killing all Node.js processes..."
sudo kill -9 98199 98222 98233 2>/dev/null || true
sudo pkill -f tsx 
sudo pkill -f node
sudo pkill -f start-learnyzer-production
sleep 3

# Verify nothing is running
echo "2. Verifying cleanup..."
ps aux | grep -E "node|tsx" | grep -v grep || echo "All processes killed"

# Create the properly ordered server
echo "3. Creating properly ordered Express server..."
cat > api-first-server.js << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('Starting API-first server...');

const app = express();

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Request logging for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// API ROUTES FIRST - ABSOLUTE PRIORITY
app.get('/api/health', (req, res) => {
    console.log('Health endpoint called');
    res.setHeader('Content-Type', 'application/json');
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'api-first'
    });
});

app.post('/api/otp/send', (req, res) => {
    console.log('OTP endpoint called with:', req.body);
    const { mobile } = req.body;
    
    res.setHeader('Content-Type', 'application/json');
    
    if (!mobile) {
        return res.status(400).json({ 
            success: false,
            message: "Mobile number is required" 
        });
    }
    
    const response = {
        success: true,
        sessionId: 'api-first-' + Date.now(),
        message: 'Development mode: Use OTP 123456 for testing',
        mobile: mobile
    };
    
    console.log('Sending OTP response:', response);
    res.json(response);
});

app.get('/api/auth/me', (req, res) => {
    console.log('Auth me endpoint called');
    res.setHeader('Content-Type', 'application/json');
    res.json({
        id: 6,
        username: "Ekansh",
        name: "Ekansh",
        authenticated: true
    });
});

// Catch-all for other API routes
app.all('/api/*', (req, res) => {
    console.log(`Unhandled API route: ${req.method} ${req.path}`);
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.path,
        method: req.method
    });
});

// STATIC FILES AFTER API ROUTES
const distPath = path.resolve(__dirname, 'dist');
console.log(`Checking for dist directory: ${distPath}`);

if (fs.existsSync(distPath)) {
    console.log('Serving static files from dist directory');
    app.use(express.static(distPath));
    
    // SPA fallback for frontend routes
    app.get('*', (req, res) => {
        console.log(`Frontend route requested: ${req.path}`);
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
} else {
    console.log('No dist directory found - API only mode');
    app.get('*', (req, res) => {
        res.status(404).json({ error: 'Frontend not built' });
    });
}

const port = 5000;
app.listen(port, '0.0.0.0', () => {
    console.log(`API-first server running on port ${port}`);
    console.log('✅ API routes registered BEFORE static file middleware');
    console.log('Ready for testing...');
});
EOF

echo "4. Starting API-first server..."
node api-first-server.js > api-server.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
sleep 5

echo "5. Testing API endpoints..."

echo "Health check:"
curl -s http://localhost:5000/api/health

echo ""
echo "OTP API test:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}')

echo "Response: $RESPONSE"

if [[ "$RESPONSE" == *"success"* ]]; then
    echo ""
    echo "✅ SUCCESS! API is now returning JSON"
    echo "Server PID: $SERVER_PID"
    echo "Log file: api-server.log"
    
    echo ""
    echo "6. Server logs:"
    tail -10 api-server.log
    
else
    echo ""
    echo "❌ Still returning HTML. Response length: ${#RESPONSE}"
    echo "First 200 characters:"
    echo "$RESPONSE" | head -c 200
    echo ""
    echo "Server logs:"
    tail -20 api-server.log
fi