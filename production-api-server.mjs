import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting Production ESM Express server...');

const app = express();

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`${new Date().toISOString()} API: ${req.method} ${req.path}`);
    }
    next();
});

// API ROUTES FIRST - BEFORE ANY STATIC SERVING
app.get('/api/health', (req, res) => {
    console.log('Health endpoint hit');
    res.setHeader('Content-Type', 'application/json');
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'production-esm'
    });
});

app.post('/api/otp/send', (req, res) => {
    console.log('OTP endpoint hit with:', req.body);
    const { mobile } = req.body;
    
    res.setHeader('Content-Type', 'application/json');
    
    if (!mobile) {
        console.log('Missing mobile number');
        return res.status(400).json({ 
            success: false,
            message: "Mobile number is required" 
        });
    }
    
    const response = {
        success: true,
        sessionId: 'production-esm-' + Date.now(),
        message: 'Development mode: Use OTP 123456 for testing',
        mobile: mobile
    };
    
    console.log('Sending OTP response:', response);
    res.json(response);
});

app.get('/api/auth/me', (req, res) => {
    console.log('Auth endpoint hit');
    res.setHeader('Content-Type', 'application/json');
    res.json({
        id: 6,
        username: "Ekansh",
        name: "Ekansh",
        authenticated: true
    });
});

// Handle other API routes
app.all('/api/*', (req, res) => {
    console.log(`Unhandled API: ${req.method} ${req.path}`);
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.path
    });
});

// STATIC FILES COME AFTER API ROUTES
const distPath = path.resolve(__dirname, 'dist');
console.log(`Dist path: ${distPath}`);

if (fs.existsSync(distPath)) {
    console.log('Serving static files from dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            console.log('ERROR: API route in static handler:', req.path);
            return res.status(500).json({ error: 'Configuration error' });
        }
        
        console.log(`Frontend: ${req.path}`);
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
} else {
    console.log('No dist directory - API only');
    app.get('*', (req, res) => {
        res.status(404).json({ error: 'Frontend not built' });
    });
}

const port = 5000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Production ESM server running on port ${port}`);
    console.log('API routes have priority over static files');
});