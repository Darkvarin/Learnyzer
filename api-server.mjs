import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting ESM Express server...');

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
        server: 'esm-api-server'
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
        sessionId: 'esm-server-' + Date.now(),
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

// Catch-all for other API routes
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
    console.log(`🚀 ESM API server running on port ${port}`);
    console.log(`✅ API routes registered BEFORE static file middleware`);
    console.log(`🔗 Test: curl -X POST http://localhost:${port}/api/otp/send -H "Content-Type: application/json" -d '{"mobile": "test"}'`);
});