const express = require('express');
const app = express();

// Essential middleware only
app.use(express.json());

// Simple test route
app.post('/api/otp/send', (req, res) => {
    console.log('OTP endpoint hit with:', req.body);
    res.setHeader('Content-Type', 'application/json');
    res.json({
        success: true,
        sessionId: 'test-' + Date.now(),
        message: 'Test server working',
        mobile: req.body.mobile
    });
});

app.get('/api/health', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ status: 'ok', test: true });
});

// Start on different port to avoid conflicts
app.listen(3001, '0.0.0.0', () => {
    console.log('Test server running on port 3001');
});