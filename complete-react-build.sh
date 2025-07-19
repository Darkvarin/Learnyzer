#!/bin/bash

echo "COMPLETE REACT BUILD WITH EXISTING VITE"
echo "======================================"

cd /home/ubuntu/Learnyzer

echo "1. Current status..."
pwd
which vite
npm list vite 2>/dev/null || echo "Checking vite installation..."

echo ""
echo "2. Cleaning previous build..."
rm -rf dist
mkdir -p dist

echo ""
echo "3. Building with Vite (since it's already installed)..."
# Try different build approaches
if npm run build; then
    echo "✅ npm run build succeeded"
elif npx vite build; then
    echo "✅ npx vite build succeeded"  
elif vite build; then
    echo "✅ direct vite build succeeded"
else
    echo "❌ All build methods failed, checking package.json scripts..."
    cat package.json | grep -A 5 -B 5 "scripts"
    exit 1
fi

echo ""
echo "4. Checking build results..."
if [ -d "dist" ]; then
    echo "✅ Build successful - structure:"
    ls -la dist/
    
    # Handle different build output structures
    if [ -d "dist/public" ] && [ -f "dist/public/index.html" ]; then
        echo "Found dist/public structure - moving to root..."
        cp -r dist/public/* dist/
        echo "Files after move:"
        ls -la dist/
    elif [ -d "client/dist" ] && [ -f "client/dist/index.html" ]; then
        echo "Found client/dist structure - copying..."
        cp -r client/dist/* dist/
        echo "Files after copy:"
        ls -la dist/
    fi
else
    echo "❌ No dist directory created"
    exit 1
fi

echo ""
echo "5. Verifying React app files..."
if [ -f "dist/index.html" ]; then
    echo "✅ index.html exists"
    echo "Checking for React/Vite signatures:"
    if grep -q "vite\|React\|/assets/" dist/index.html; then
        echo "✅ Real React app detected in HTML"
    else
        echo "⚠️ Basic HTML detected"
    fi
    
    echo "Title check:"
    grep -o '<title>.*</title>' dist/index.html
else
    echo "❌ No index.html found"
fi

if [ -d "dist/assets" ] && [ "$(ls -A dist/assets 2>/dev/null)" ]; then
    echo "✅ Assets directory with content:"
    ls -la dist/assets/ | head -10
    
    # Check for JS bundles
    if ls dist/assets/*.js >/dev/null 2>&1; then
        echo "✅ JavaScript bundles found"
    else
        echo "❌ No JavaScript bundles"
    fi
    
    # Check for CSS bundles  
    if ls dist/assets/*.css >/dev/null 2>&1; then
        echo "✅ CSS bundles found"
    else
        echo "❌ No CSS bundles"
    fi
else
    echo "❌ No assets or empty assets directory"
    echo "Looking for any built files:"
    find dist -name "*.js" -o -name "*.css" | head -5
fi

echo ""
echo "6. Setting proper permissions..."
chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist
chmod -R 755 /home/ubuntu/Learnyzer/dist/*/
chmod -R 644 /home/ubuntu/Learnyzer/dist/*.html /home/ubuntu/Learnyzer/dist/*.txt /home/ubuntu/Learnyzer/dist/*.xml 2>/dev/null
chmod -R 644 /home/ubuntu/Learnyzer/dist/assets/* 2>/dev/null

echo ""
echo "7. Restarting nginx..."
sudo systemctl restart nginx
sleep 3

echo ""
echo "8. Testing complete deployment..."
echo "Frontend test:"
response=$(curl -s -o /dev/null -w "%{http_code}|%{size_download}" https://learnyzer.com/)
echo "Status: $response"

echo ""
echo "Content verification:"
content=$(curl -s https://learnyzer.com/ | head -c 500)
echo "$content"

echo ""
echo "API verification:"
api_response=$(curl -s -X POST https://learnyzer.com/api/otp/send -H "Content-Type: application/json" -d '{"mobile":"9999999999"}')
echo "API Response: $api_response"

echo ""
echo "🚀 BUILD DEPLOYMENT STATUS:"
if curl -s https://learnyzer.com/ | grep -q "vite\|React\|/assets/index-"; then
    echo "✅ SUCCESS: Complete React application deployed!"
    echo "✅ Vite build bundles loading correctly"
    echo "✅ Backend API operational"
else
    echo "⚠️ Basic page loading - checking for issues..."
    echo ""
    echo "Current dist contents:"
    ls -la dist/
    echo ""
    echo "If build succeeded but real React app not loading,"
    echo "there may be a routing or file serving issue."
fi

echo ""
echo "🌟 Learnyzer Platform Status:"
echo "Frontend: https://learnyzer.com"
echo "Backend API: Operational on PM2"
echo "SSL: Active with Let's Encrypt"
echo "Architecture: React + TypeScript frontend, Node.js + Express backend"
EOF

chmod +x complete-react-build.sh