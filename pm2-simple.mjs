// Simplified PM2 startup script for Learnyzer
import { register } from 'module';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

// Get current working directory
const cwd = process.cwd();
console.log('🔧 PM2 Startup - Current directory:', cwd);
console.log('🔧 PM2 Startup - Node version:', process.version);
console.log('🔧 PM2 Startup - NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('🔧 PM2 Startup - PORT:', process.env.PORT || 'undefined');

// Ensure we're in the right directory
process.chdir('/home/ubuntu/Learnyzer');
console.log('🔧 Changed to directory:', process.cwd());

// Set required environment variables if not set
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}
if (!process.env.PORT) {
    process.env.PORT = '5000';
}

// Set all required environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "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";
process.env.TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY || "75c5f204-57d8-11f0-a562-0200cd936042";
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_KofqomcGyXcjRP";
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "dqYO8RMzv4QaEiTOiP97fLka";

console.log('🔧 Environment variables set');
console.log('🔧 Database URL exists:', !!process.env.DATABASE_URL);
console.log('🔧 OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

// Register TypeScript loader
try {
    const projectRoot = resolve(process.cwd());
    register('tsx/esm', pathToFileURL(projectRoot));
    console.log('✅ TypeScript loader registered successfully');
} catch (error) {
    console.error('❌ Failed to register TypeScript loader:', error.message);
    process.exit(1);
}

// Add error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

console.log('🚀 Starting Learnyzer server...');

// Import and start the server
try {
    await import('./server/index.ts');
    console.log('✅ Server module imported successfully');
} catch (error) {
    console.error('❌ Failed to import server:', error.message);
    console.error('❌ Error details:', error);
    console.error('❌ Stack trace:', error.stack);
    process.exit(1);
}