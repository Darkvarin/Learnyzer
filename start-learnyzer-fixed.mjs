// ES Module compatible startup for Learnyzer
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== LEARNYZER PRODUCTION STARTUP ===');
console.log('Starting at:', new Date().toString());

// Set working directory
process.chdir('/home/ubuntu/Learnyzer');

// Environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "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";
process.env.TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY || "75c5f204-57d8-11f0-a562-0200cd936042";
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_KofqomcGyXcjRP";
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "dqYO8RMzv4QaEiTOiP97fLka";

console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- Working Directory:', process.cwd());
console.log('- Database URL present:', !!process.env.DATABASE_URL ? 'YES' : 'NO');
console.log('- OpenAI API Key present:', !!process.env.OPENAI_API_KEY ? 'YES' : 'NO');

console.log('Starting server with tsx...');

// Start server using tsx with explicit TypeScript file
const server = spawn('npx', ['tsx', './server/index.ts'], {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd(),
    shell: false
});

server.on('error', (err) => {
    console.error('❌ Server spawn error:', err);
    process.exit(1);
});

server.on('close', (code, signal) => {
    console.log(`Server process closed with code ${code} and signal ${signal}`);
    if (code !== 0 && code !== null) {
        console.error(`Server exited with non-zero code: ${code}`);
        process.exit(code);
    }
});

server.on('exit', (code, signal) => {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
    if (code !== 0 && code !== null) {
        process.exit(code);
    }
});

// Handle shutdown signals gracefully
const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.kill(signal);
    setTimeout(() => {
        console.log('Force killing server process...');
        server.kill('SIGKILL');
        process.exit(1);
    }, 10000); // Give 10 seconds for graceful shutdown
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGUSR2', () => shutdown('SIGUSR2')); // PM2 reload signal

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});