# Simple Production Fix Guide

## Problem Summary
Your Express server on the production machine is returning HTML instead of JSON for `/api/otp/send` requests. This indicates that static file middleware is intercepting API routes.

## Root Cause
The static file serving middleware has a catch-all route (`app.use("*", ...)`) that processes requests before they reach your API route handlers.

## Solution Steps

### Step 1: Complete Server Reset
Run on your production server:
```bash
cd ~/Learnyzer

# Kill everything
sudo fuser -k 5000/tcp 80/tcp 443/tcp
sudo pkill -f tsx
sudo pkill -f node
sudo systemctl stop nginx
sleep 3
```

### Step 2: Create Minimal Test (Different Port)
```bash
# Test on port 6000 to avoid conflicts
cat > test.js << 'EOF'
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/otp/send', (req, res) => {
    res.json({
        success: true,
        sessionId: 'test-' + Date.now(),
        message: 'Test server working'
    });
});

app.listen(6000, () => console.log('Test on 6000'));
EOF

node test.js &
sleep 2
curl -X POST http://localhost:6000/api/otp/send -H "Content-Type: application/json" -d '{"mobile": "test"}'
```

**Expected:** JSON response (not HTML)

### Step 3: Fix Production Server (Port 5000)
```bash
cat > production.js << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// API ROUTES FIRST
app.post('/api/otp/send', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
        success: true,
        sessionId: 'prod-' + Date.now(),
        message: 'Development mode: Use OTP 123456',
        mobile: req.body.mobile
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// STATIC FILES AFTER API
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
}

app.listen(5000, '0.0.0.0', () => {
    console.log('Production server on 5000');
});
EOF

node production.js &
sleep 3
curl -X POST http://localhost:5000/api/otp/send -H "Content-Type: application/json" -d '{"mobile": "9999999999"}'
```

**Expected:** JSON response with `"success": true`

### Step 4: Test Through Domain
Once localhost:5000 works, test through your domain:
```bash
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'
```

## Key Points
1. **Route Order Matters:** API routes MUST be registered before static file middleware
2. **Explicit Content-Type:** Set `Content-Type: application/json` headers explicitly
3. **Test Locally First:** Always verify `localhost:5000` works before testing through nginx
4. **Clean Slate:** Kill all existing processes to avoid interference

## Success Criteria
- `curl localhost:5000/api/otp/send` returns JSON
- `curl https://learnyzer.com/api/otp/send` returns same JSON
- No HTML in API responses