#!/usr/bin/env node

/**
 * Production Build Script for Learnyzer
 * Handles proper CommonJS compilation for production deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Learnyzer for Production...\n');

// Step 1: Clean previous builds
console.log('1️⃣ Cleaning previous builds...');
try {
  execSync('rm -rf dist/', { stdio: 'inherit' });
  console.log('✅ Previous builds cleaned\n');
} catch (error) {
  console.log('ℹ️ No previous builds to clean\n');
}

// Step 2: Build frontend with Vite
console.log('2️⃣ Building frontend assets...');
try {
  execSync('npx vite build --config vite.config.ts', { stdio: 'inherit' });
  console.log('✅ Frontend build completed\n');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Step 3: Create production server using esbuild with CommonJS
console.log('3️⃣ Building server for production...');
try {
  // Create temporary package.json for CommonJS
  const tempPackageJson = {
    "type": "commonjs"
  };
  fs.writeFileSync('temp-package.json', JSON.stringify(tempPackageJson, null, 2));

  // Build server with CommonJS format and external packages
  execSync(`npx esbuild server/index.ts \\
    --platform=node \\
    --target=node18 \\
    --bundle \\
    --format=cjs \\
    --outfile=dist/server.js \\
    --external:@sparticuz/chromium \\
    --external:puppeteer \\
    --external:puppeteer-core \\
    --external:@neondatabase/serverless \\
    --external:drizzle-orm \\
    --external:bcrypt \\
    --external:express \\
    --external:dotenv \\
    --external:openai \\
    --external:razorpay \\
    --external:ws \\
    --external:passport \\
    --external:express-session \\
    --external:connect-pg-simple \\
    --external:helmet \\
    --external:cors \\
    --external:express-rate-limit \\
    --external:multer \\
    --external:node-fetch \\
    --external:axios \\
    --external:zod \\
    --external:drizzle-zod \\
    --sourcemap`, { stdio: 'inherit' });

  // Cleanup temp file
  fs.unlinkSync('temp-package.json');
  
  console.log('✅ Server build completed\n');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  // Cleanup temp file on error
  try { fs.unlinkSync('temp-package.json'); } catch {}
  process.exit(1);
}

// Step 4: Create production starter script
console.log('4️⃣ Creating production starter...');
const starterScript = `#!/usr/bin/env node

// Production Server Starter for Learnyzer
// Ensures environment variables and starts CommonJS server

require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'OPENAI_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(\`❌ Missing required environment variable: \${envVar}\`);
    process.exit(1);
  }
}

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Learnyzer Production Server...');
console.log('📁 Serving static files from dist/public/');
console.log(\`🌐 Server will run on port \${process.env.PORT || 5000}\`);

// Start the server
require('./server.js');
`;

fs.writeFileSync('dist/start.js', starterScript);
fs.chmodSync('dist/start.js', 0o755); // Make executable

console.log('✅ Production starter created\n');

// Step 5: Verify build
console.log('5️⃣ Verifying build...');
const serverExists = fs.existsSync('dist/server.js');
const starterExists = fs.existsSync('dist/start.js');
const frontendExists = fs.existsSync('dist/public/index.html');

if (serverExists && starterExists && frontendExists) {
  console.log('✅ Build verification passed');
  console.log('\n🎉 Production build completed successfully!');
  console.log('\n📦 Build artifacts:');
  console.log('   📄 dist/server.js      - Compiled server (CommonJS)');
  console.log('   🚀 dist/start.js       - Production starter script');
  console.log('   🌐 dist/public/        - Frontend assets');
  
  console.log('\n🚀 Deploy to EC2 with:');
  console.log('   export NODE_ENV=production');
  console.log('   export DATABASE_URL="your-db-url"');
  console.log('   export OPENAI_API_KEY="your-openai-key"');
  console.log('   # ... other env vars');
  console.log('   pm2 start dist/start.js --name learnyzer');
  
} else {
  console.error('❌ Build verification failed');
  console.error('Missing files:', {
    server: !serverExists,
    starter: !starterExists,
    frontend: !frontendExists
  });
  process.exit(1);
}