import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());

// API Routes FIRST
app.post('/api/otp/send', (req, res) => {
    const { mobile } = req.body;
    res.json({
        success: true,
        sessionId: 'working-' + Date.now(),
        message: 'Development mode: Use OTP 123456',
        mobile: mobile || 'test'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'working' });
});

app.get('/api/auth/me', (req, res) => {
    res.json({ id: 6, username: "Ekansh", name: "Ekansh" });
});

// Static files after API
const distPath = resolve(__dirname, 'dist');
if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(resolve(distPath, 'index.html'));
    });
}

app.listen(5000, () => {
    console.log('Working server on 5000');
});