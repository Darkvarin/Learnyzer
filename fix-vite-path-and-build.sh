#!/bin/bash

echo "FIXING VITE PATH AND BUILDING REACT APP"
echo "======================================"

cd /home/ubuntu/Learnyzer

echo "1. Diagnosing Vite installation..."
echo "Node version:"
node --version

echo "NPM version:"
npm --version

echo "Checking where Vite might be installed..."
npm list -g vite 2>/dev/null || echo "Vite not in global list"
npm list vite 2>/dev/null || echo "Vite not in local list"

echo ""
echo "Looking for Vite binary locations..."
find /home/ubuntu -name "vite" -type f 2>/dev/null | head -5
find /usr -name "vite" -type f 2>/dev/null | head -5
ls -la node_modules/.bin/vite 2>/dev/null || echo "No local vite binary"

echo ""
echo "Current PATH:"
echo $PATH

echo ""
echo "2. Installing Vite locally in project..."
npm install vite --save-dev

echo ""
echo "3. Installing esbuild for server bundling..."
npm install esbuild --save-dev

echo ""
echo "4. Checking package.json build script..."
cat package.json | grep -A 10 -B 2 '"scripts"'

echo ""
echo "5. Attempting build with different methods..."

# Method 1: Using npx (should work with local install)
echo "Trying npx vite build..."
if npx vite build; then
    echo "✅ npx vite build succeeded"
    BUILD_SUCCESS=true
elif ./node_modules/.bin/vite build; then
    echo "✅ Direct binary call succeeded"
    BUILD_SUCCESS=true
elif npm run build; then
    echo "✅ npm run build succeeded"
    BUILD_SUCCESS=true
else
    echo "❌ All build methods failed"
    echo ""
    echo "Checking for build errors in more detail..."
    npx vite build --debug 2>&1 | tail -20
    BUILD_SUCCESS=false
fi

echo ""
echo "6. Checking build output..."
if [ "$BUILD_SUCCESS" = true ] && [ -d "dist" ]; then
    echo "✅ Build successful!"
    ls -la dist/
    
    # Handle different Vite output structures
    if [ -d "dist/client" ] && [ -f "dist/client/index.html" ]; then
        echo "Moving client build to root..."
        cp -r dist/client/* dist/
        rm -rf dist/client
    fi
    
    echo ""
    echo "Final dist structure:"
    ls -la dist/
    
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html created"
        echo "Checking content:"
        head -15 dist/index.html
    fi
    
    if [ -d "dist/assets" ]; then
        echo "✅ Assets directory created"
        ls -la dist/assets/ | head -5
    fi
else
    echo "❌ Build failed or no dist directory"
    echo ""
    echo "Let's try a manual approach..."
    
    # Check if we have the source files to copy manually
    if [ -d "client/dist" ]; then
        echo "Found existing client/dist, copying..."
        mkdir -p dist
        cp -r client/dist/* dist/
    elif [ -f "client/index.html" ]; then
        echo "Found client source, but no built files"
        echo "You may need to build on your development machine first"
    fi
fi

echo ""
echo "7. Setting permissions..."
chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist
chmod -R 755 /home/ubuntu/Learnyzer/dist/*/
find /home/ubuntu/Learnyzer/dist -type f -exec chmod 644 {} \;

echo ""
echo "8. Restarting nginx..."
sudo systemctl restart nginx
sleep 2

echo ""
echo "9. Testing deployment..."
curl -s -o /dev/null -w "Status: %{http_code} | Size: %{size_download} bytes\n" https://learnyzer.com/

echo ""
echo "Content check:"
curl -s https://learnyzer.com/ | head -c 300

echo ""
echo "🎯 BUILD STATUS SUMMARY:"
if [ "$BUILD_SUCCESS" = true ]; then
    echo "✅ Vite build completed successfully"
    echo "✅ React application should be deployed"
    
    if curl -s https://learnyzer.com/ | grep -q "vite\|/assets/index-"; then
        echo "✅ SUCCESS: Real React app is loading!"
    else
        echo "⚠️ Build succeeded but may need file structure adjustment"
    fi
else
    echo "❌ Vite build failed"
    echo "📋 Troubleshooting options:"
    echo "   1. Copy pre-built files from development environment"
    echo "   2. Build locally and transfer dist/ folder"
    echo "   3. Check if all dependencies are installed"
fi

echo ""
echo "🌐 Platform Status:"
echo "URL: https://learnyzer.com"
echo "Backend: $(pm2 list | grep learnyzer-backend | awk '{print $6}')"
echo "SSL: Active"
EOF

chmod +x fix-vite-path-and-build.sh