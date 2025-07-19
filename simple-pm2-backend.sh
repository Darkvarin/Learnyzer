#!/bin/bash

echo "SIMPLE PM2 BACKEND SETUP"
echo "======================="

cd ~/Learnyzer

# Kill existing processes
sudo pkill -f tsx
sudo pkill -f node
pm2 delete all 2>/dev/null || true
sleep 3

# Create simple backend
cat > simple-backend.mjs << 'EOF'
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/otp/send', (req, res) => {
    res.json({
        success: true,
        sessionId: 'pm2-simple-' + Date.now(),
        message: 'Development mode: Use OTP 123456',
        mobile: req.body.mobile
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', pm2: true });
});

app.listen(5000, () => {
    console.log('Simple backend on 5000');
});
EOF

# Start with PM2
pm2 start simple-backend.mjs --name learnyzer-api

# Test
sleep 3
curl -X POST http://localhost:5000/api/otp/send -H "Content-Type: application/json" -d '{"mobile": "test"}'