#!/bin/bash

echo "TESTING API ROUTING ON DIFFERENT PORT"
echo "====================================="

cd ~/Learnyzer

# Create test server on port 3001
cat > test-port.mjs << 'EOF'
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

console.log('Starting test server on port 3001...');

// API Routes FIRST
app.post('/api/otp/send', (req, res) => {
    console.log('OTP API called on port 3001');
    res.setHeader('Content-Type', 'application/json');
    res.json({
        success: true,
        sessionId: 'test-port-' + Date.now(),
        message: 'Development mode: Use OTP 123456',
        mobile: req.body.mobile,
        port: 3001
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', port: 3001 });
});

app.get('/api/auth/me', (req, res) => {
    res.json({ id: 6, username: "Ekansh", name: "Ekansh", port: 3001 });
});

// Static files after API
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
}

const port = 3001;
app.listen(port, '0.0.0.0', () => {
    console.log(`Test server running on port ${port}`);
    console.log('API routes registered BEFORE static files');
});
EOF

# Start test server
node test-port.mjs > test-port.log 2>&1 &
TEST_PID=$!

sleep 3

echo "Test server PID: $TEST_PID"

# Test the API on port 3001
echo "Testing OTP API on port 3001:"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}')

echo "Response: $RESPONSE"

if [[ "$RESPONSE" == *"success"* ]]; then
    echo ""
    echo "✅ SUCCESS! Port 3001 returns proper JSON"
    echo "This proves the route ordering fix works"
    echo ""
    echo "Now we need to:"
    echo "1. Stop your main server on port 5000"
    echo "2. Start the fixed server on port 5000"
    echo "3. Update nginx to work with the fixed backend"
    
    echo ""
    echo "Test server logs:"
    tail -5 test-port.log
    
else
    echo ""
    echo "❌ Still not working on port 3001"
    echo "Server logs:"
    tail -10 test-port.log
fi

# Keep test server running for now
echo ""
echo "Test server is running on PID: $TEST_PID"
echo "To kill it later: kill $TEST_PID"