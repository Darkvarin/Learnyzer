#!/bin/bash

echo "🔍 DIAGNOSING SERVER FAILURE ON PRODUCTION"
echo "========================================"

cd /home/ubuntu/Learnyzer

# Check server logs for errors
echo "1. Server startup error logs:"
if [ -f "server.log" ]; then
    cat server.log
else
    echo "No server.log found"
fi

# Check if all dependencies are available
echo ""
echo "2. Checking dependencies:"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check if tsx is available
if command -v tsx &> /dev/null; then
    echo "tsx version: $(tsx --version)"
else
    echo "tsx not available - installing..."
    sudo npm install -g tsx
fi

# Check project files
echo ""
echo "3. Project file check:"
ls -la server/
echo ""
echo "Package.json dependencies:"
grep -A 20 '"dependencies"' package.json | head -20

# Check environment variables
echo ""
echo "4. Environment check:"
if [ -f ".env" ]; then
    echo ".env file exists"
    echo "Environment variables:"
    grep -E "(NODE_ENV|PORT|DATABASE_URL)" .env | sed 's/=.*/=***/'
else
    echo "No .env file found"
fi

# Try manual server start to see exact error
echo ""
echo "5. Manual server start test:"
export NODE_ENV=production
export PORT=3000

# Load environment
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "Starting server manually..."
timeout 15s tsx server/index.ts