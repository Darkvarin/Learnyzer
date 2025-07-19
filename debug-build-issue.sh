#!/bin/bash

echo "DEBUGGING VITE BUILD ISSUE"
echo "=========================="

cd /home/ubuntu/Learnyzer

echo "1. Checking if Vite build actually ran..."
echo "Current directory contents:"
ls -la

echo ""
echo "2. Running Vite build with verbose output..."
npx vite build --outDir dist --mode production

echo ""
echo "3. Checking what was created..."
if [ -d "dist" ]; then
    echo "✅ dist directory exists"
    ls -la dist/
    
    if [ -f "dist/index.html" ]; then
        echo ""
        echo "✅ index.html exists"
        head -10 dist/index.html
    else
        echo "❌ No index.html"
    fi
    
    if [ -d "dist/assets" ]; then
        echo ""
        echo "✅ assets directory exists"
        ls -la dist/assets/ | head -5
    else
        echo "❌ No assets directory"
    fi
else
    echo "❌ No dist directory created"
    echo ""
    echo "Checking for build errors..."
    npx vite build --outDir dist 2>&1 | tail -20
fi

echo ""
echo "4. If build failed, let's check package.json and vite config..."
echo "Package.json build script:"
grep -A 2 -B 2 '"build"' package.json

echo ""
echo "Vite config exists?"
ls -la vite.config.*

echo ""
echo "5. Trying alternative build approach..."
echo "Testing simple build..."
npm run build

echo ""
echo "6. Final check for any dist content anywhere..."
find . -name "dist" -type d 2>/dev/null
find . -name "index.html" -path "*/dist/*" 2>/dev/null
EOF

chmod +x debug-build-issue.sh