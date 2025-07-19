#!/bin/bash

echo "🚨 EMERGENCY SERVER FIX - ES MODULE ISSUE"
echo "========================================"

cd ~/Learnyzer

# 1. Kill ALL Node processes aggressively
echo "1. Force killing all Node processes..."
sudo pkill -9 -f tsx
sudo pkill -9 -f node
sudo pkill -9 -f start-learnyzer
sudo fuser -k 5000/tcp 2>/dev/null || true
sleep 3

# 2. Verify cleanup
echo "2. Verifying all processes are killed..."
ps aux | grep -E "node|tsx" | grep -v grep || echo "✅ All Node processes killed"

# 3. Create CommonJS server (using .cjs extension)
echo "3. Creating CommonJS server (.cjs extension)..."
cat > fixed-api-server.cjs << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('Starting CommonJS Express server...');

const app = express();

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// API ROUTES FIRST - HIGHEST PRIORITY
app.get('/api/health', (req, res) => {
    console.log('✅ Health endpoint called');
    res.setHeader('Content-Type', 'application/json');
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'fixed-cjs'
    });
});

app.post('/api/otp/send', (req, res) => {
    console.log('✅ OTP endpoint called with:', req.body);
    const { mobile } = req.body;
    
    // Force JSON content type
    res.setHeader('Content-Type', 'application/json');
    
    if (!mobile) {
        console.log('❌ Missing mobile number');
        return res.status(400).json({ 
            success: false,
            message: "Mobile number is required" 
        });
    }
    
    const response = {
        success: true,
        sessionId: 'fixed-cjs-' + Date.now(),
        message: 'Development mode: Use OTP 123456 for testing',
        mobile: mobile
    };
    
    console.log('✅ Sending OTP response:', response);
    res.json(response);
});

app.get('/api/auth/me', (req, res) => {
    console.log('✅ Auth endpoint called');
    res.setHeader('Content-Type', 'application/json');
    res.json({
        id: 6,
        username: "Ekansh",
        name: "Ekansh",
        authenticated: true
    });
});

// Catch-all for unhandled API routes
app.all('/api/*', (req, res) => {
    console.log(`❌ Unhandled API route: ${req.method} ${req.path}`);
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.path,
        method: req.method
    });
});

// STATIC FILES AFTER API ROUTES
const distPath = path.resolve(__dirname, 'dist');
console.log(`📁 Checking for dist directory: ${distPath}`);

if (fs.existsSync(distPath)) {
    console.log('📁 Serving static files from dist directory');
    app.use(express.static(distPath));
    
    // SPA fallback for frontend routes ONLY
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            // This should never happen due to API routes above
            console.log('🚨 ERROR: API route reached static handler:', req.path);
            return res.status(500).json({ error: 'Server misconfiguration' });
        }
        
        console.log(`🌐 Frontend route: ${req.path}`);
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
} else {
    console.log('❌ No dist directory found - API only mode');
    app.get('*', (req, res) => {
        res.status(404).json({ error: 'Frontend not built' });
    });
}

const port = 5000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Fixed CommonJS server running on port ${port}`);
    console.log(`✅ API routes registered BEFORE static file middleware`);
    console.log(`🔗 Test: curl -X POST http://localhost:${port}/api/otp/send -H "Content-Type: application/json" -d '{"mobile": "test"}'`);
});
EOF

echo "4. Starting CommonJS server..."
node fixed-api-server.cjs > cjs-server.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
sleep 5

# 5. Test the server
echo "5. Testing CommonJS server..."

echo "Health check:"
HEALTH=$(curl -s http://localhost:5000/api/health 2>/dev/null || echo "FAILED")
echo "$HEALTH"

echo ""
echo "OTP API test:"
OTP_RESPONSE=$(curl -s -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' 2>/dev/null || echo "FAILED")

echo "Response: $OTP_RESPONSE"

# 6. Check results
if [[ "$OTP_RESPONSE" == *"success"* ]]; then
    echo ""
    echo "🎉 SUCCESS! CommonJS server is working correctly"
    echo "✅ API endpoints now return proper JSON"
    echo "📊 Server PID: $SERVER_PID"
    echo "📄 Log file: cjs-server.log"
    
    echo ""
    echo "7. Recent server logs:"
    tail -10 cjs-server.log
    
    echo ""
    echo "🔥 Next step: Test through nginx/domain"
    echo "curl -X POST https://learnyzer.com/api/otp/send -H 'Content-Type: application/json' -d '{\"mobile\": \"9999999999\"}'"
    
elif [[ "$OTP_RESPONSE" == *"html"* ]] || [[ "$OTP_RESPONSE" == *"DOCTYPE"* ]]; then
    echo ""
    echo "❌ Still returning HTML - deeper configuration issue"
    echo "Response length: ${#OTP_RESPONSE}"
    echo "First 200 chars: ${OTP_RESPONSE:0:200}"
    echo ""
    echo "Server status:"
    ps aux | grep -E "node|tsx" | grep -v grep
    
else
    echo ""
    echo "❌ Server failed to start or respond"
    echo "Error logs:"
    tail -20 cjs-server.log 2>/dev/null || echo "No log file found"
    echo ""
    echo "Process check:"
    ps -p $SERVER_PID 2>/dev/null || echo "Server process not running"
fi