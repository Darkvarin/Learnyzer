#!/bin/bash

echo "🔍 CHECKING SERVER FILES AND DEPENDENCIES"
echo "======================================="

cd /home/ubuntu/Learnyzer

# Check if all necessary files exist
echo "1. Checking project structure..."
echo "Current directory: $(pwd)"
echo ""
echo "Project files:"
ls -la
echo ""

if [ -f "server/index.ts" ]; then
    echo "✅ server/index.ts exists"
    echo "Server file preview:"
    head -20 server/index.ts
else
    echo "❌ server/index.ts not found"
    echo "Looking for server files:"
    find . -name "*.ts" -o -name "*.js" | grep -i server
fi

echo ""
echo "2. Checking package.json scripts..."
if [ -f "package.json" ]; then
    grep -A 10 '"scripts"' package.json
else
    echo "❌ package.json not found"
fi

echo ""
echo "3. Checking if tsx is available..."
which tsx
tsx --version 2>/dev/null || echo "tsx not found in PATH"

echo ""
echo "4. Checking Node.js version..."
node --version

echo ""
echo "5. Checking .env file..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "Environment variables (redacted):"
    grep -E "(NODE_ENV|PORT|DATABASE_URL|TWOFACTOR)" .env | sed 's/=.*/=***/'
else
    echo "❌ .env file not found"
fi

echo ""
echo "6. Manual server start test..."
export NODE_ENV=production
export PORT=3000
timeout 10s tsx server/index.ts 2>&1 | head -20