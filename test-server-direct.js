// Direct server test to bypass PM2 issues
import { register } from 'module';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Register TypeScript loader for ES modules
register('tsx/esm', pathToFileURL('./'));

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🔧 DIRECT SERVER TEST');
console.log('=====================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 5000);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

console.log('\n🚀 Starting server directly...');

try {
    // Import and start the server
    await import('./server/index.ts');
    console.log('✅ Server imported successfully');
} catch (error) {
    console.error('❌ Server startup failed:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
}