#!/usr/bin/env node

// Quick test script to verify server startup on production
console.log('🚀 Testing server startup...');

// Set environment
process.env.NODE_ENV = 'production';
process.env.PORT = '3000';

// Load .env manually
const fs = require('fs');
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key] = values.join('=');
      }
    }
  });
  console.log('✅ Environment loaded');
} catch (err) {
  console.log('⚠️  No .env file found');
}

console.log('Port will be:', process.env.PORT);

// Import and start server
require('./server/index.ts');