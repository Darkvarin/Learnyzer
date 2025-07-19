#!/bin/bash

echo "BUILDING REACT APP WITH NPX VITE"
echo "==============================="

cd /home/ubuntu/Learnyzer

echo "1. Cleaning previous build..."
rm -rf dist
echo "✅ Cleaned dist directory"

echo ""
echo "2. Building with npx vite..."
npx vite build

echo ""
echo "3. Checking build results..."
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "Dist contents:"
    ls -la dist/
    
    # Check for assets
    if [ -d "dist/assets" ]; then
        echo ""
        echo "Assets found:"
        ls -la dist/assets/ | head -10
    fi
    
    # Check index.html
    if [ -f "dist/index.html" ]; then
        echo ""
        echo "✅ index.html created"
        echo "Content preview:"
        head -10 dist/index.html
    fi
else
    echo "❌ Build failed - no dist directory"
    exit 1
fi

echo ""
echo "4. Setting permissions..."
chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist
chmod -R 644 /home/ubuntu/Learnyzer/dist/*
chmod -R 755 /home/ubuntu/Learnyzer/dist/*/

echo ""
echo "5. Restarting nginx..."
sudo systemctl restart nginx

echo ""
echo "6. Testing deployment..."
sleep 3
curl -s -o /dev/null -w "Status: %{http_code} | Size: %{size_download} bytes\n" https://learnyzer.com/

echo ""
echo "🚀 Testing if React app loads..."
if curl -s https://learnyzer.com/ | grep -q "vite\|/assets/index-"; then
    echo "✅ SUCCESS: Real React application is live!"
else
    echo "⚠️ Basic page loading - checking content..."
    curl -s https://learnyzer.com/ | head -c 200
fi

echo ""
echo "🎯 DEPLOYMENT COMPLETE!"
echo "Visit: https://learnyzer.com"
EOF

chmod +x simple-vite-build.sh