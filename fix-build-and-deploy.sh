#!/bin/bash

echo "FIXING VITE BUILD AND DEPLOYING REAL REACT APP"
echo "=============================================="

cd /home/ubuntu/Learnyzer

echo "1. Installing Vite and build tools globally..."
npm install -g vite esbuild

echo ""
echo "2. Installing all project dependencies including dev dependencies..."
npm install --include=dev

echo ""
echo "3. Checking if client directory exists for React app..."
if [ -d "client" ]; then
    echo "✅ Client directory found - React app source code exists"
    ls -la client/
    
    echo ""
    echo "Installing client dependencies..."
    cd client
    npm install --include=dev
    cd ..
else
    echo "❌ No client directory - checking package.json structure"
    cat package.json | grep -A 10 -B 5 "scripts"
fi

echo ""
echo "4. Removing old broken dist..."
rm -rf dist
mkdir -p dist

echo ""
echo "5. Building React frontend properly..."
NODE_ENV=production npm run build

echo ""
echo "6. Checking build output..."
if [ -d "dist" ]; then
    echo "✅ Build successful - checking contents:"
    ls -la dist/
    
    # Check for different possible build structures
    if [ -d "dist/public" ]; then
        echo "Found dist/public structure"
        ls -la dist/public/
    elif [ -d "dist/client" ]; then
        echo "Found dist/client structure" 
        ls -la dist/client/
    else
        echo "Checking for any built assets:"
        find dist -name "*.js" -o -name "*.css" -o -name "index.html"
    fi
else
    echo "❌ Build still failed"
    echo "Checking for build errors:"
    npm run build 2>&1 | tail -20
    exit 1
fi

echo ""
echo "7. Locating and copying React app files..."
# Find the actual built React files
if [ -f "dist/public/index.html" ]; then
    echo "Copying from dist/public/"
    cp -r dist/public/* dist/ 2>/dev/null
elif [ -f "dist/client/index.html" ]; then
    echo "Copying from dist/client/"
    cp -r dist/client/* dist/ 2>/dev/null
elif [ -d "client/dist" ]; then
    echo "Found client/dist - copying from there"
    cp -r client/dist/* dist/ 2>/dev/null
fi

echo ""
echo "8. Final verification of React files..."
echo "index.html check:"
if [ -f "dist/index.html" ]; then
    echo "✅ index.html exists"
    # Check if it's a real React app
    if grep -q "vite\|React\|/assets/" dist/index.html; then
        echo "✅ Real React app detected"
    else
        echo "⚠️ Basic HTML detected"
    fi
else
    echo "❌ No index.html found"
fi

echo ""
echo "Assets check:"
if [ -d "dist/assets" ] && [ "$(ls -A dist/assets)" ]; then
    echo "✅ Assets directory with files:"
    ls -la dist/assets/
else
    echo "❌ No assets found"
    echo "Searching for any JS/CSS files:"
    find dist -name "*.js" -o -name "*.css" | head -10
fi

echo ""
echo "9. Setting permissions..."
chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist
chmod -R 644 /home/ubuntu/Learnyzer/dist/*
chmod -R 755 /home/ubuntu/Learnyzer/dist/*/

echo ""
echo "10. Restarting services..."
sudo systemctl restart nginx
sleep 2

echo ""
echo "11. Testing deployment..."
curl -s -o /dev/null -w "Status: %{http_code} | Size: %{size_download} bytes\n" https://learnyzer.com/

echo ""
echo "Content check:"
curl -s https://learnyzer.com/ | head -c 200

echo ""
echo "🚀 BUILD AND DEPLOYMENT STATUS:"
if curl -s https://learnyzer.com/ | grep -q "vite\|React\|/assets/"; then
    echo "✅ SUCCESS: Real React application deployed!"
else
    echo "⚠️ Basic HTML still showing - may need manual file copy"
    echo ""
    echo "Files currently in dist:"
    ls -la dist/
    echo ""
    echo "You may need to manually copy the React build files to dist/"
fi
EOF

chmod +x fix-build-and-deploy.sh