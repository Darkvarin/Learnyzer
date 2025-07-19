#!/bin/bash

echo "COPYING REAL REACT FRONTEND FILES"
echo "================================="

cd /home/ubuntu/Learnyzer

echo "1. Current dist contents:"
ls -la dist/

echo ""
echo "2. Looking for built React files..."
# Check if we have the real React build somewhere
if [ -d "client/dist" ]; then
    echo "Found client/dist directory"
    ls -la client/dist/
elif [ -f "dist/public/index.html" ]; then
    echo "Found dist/public structure"
    ls -la dist/public/
else
    echo "No pre-built React files found"
fi

echo ""
echo "3. Creating proper React structure from existing Replit build..."
# Remove old files
rm -rf dist
mkdir -p dist/assets

# Copy the real React files that worked this morning
# These should be in your project somewhere
if [ -f "../dist/public/index.html" ]; then
    echo "Copying from ../dist/public/"
    cp -r ../dist/public/* dist/
elif [ -f "client/dist/index.html" ]; then
    echo "Copying from client/dist/"
    cp -r client/dist/* dist/
else
    echo "Building from source files..."
    # Try to build using the working method from this morning
    npx vite build --outDir dist
fi

echo ""
echo "4. Checking if we have proper React app..."
if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
    echo "✅ React structure exists"
    echo "Files in dist:"
    ls -la dist/
    echo ""
    echo "Assets:"
    ls -la dist/assets/ | head -5
    
    # Check if it's the real React app
    if grep -q "vite\|React\|/assets/index-" dist/index.html; then
        echo "✅ Real React app detected"
    else
        echo "⚠️ Basic HTML - need to copy real files"
    fi
else
    echo "❌ No proper React build found"
fi

echo ""
echo "5. Setting permissions..."
chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist
chmod -R 644 /home/ubuntu/Learnyzer/dist/*
find /home/ubuntu/Learnyzer/dist -type d -exec chmod 755 {} \;

echo ""
echo "6. Quick nginx restart..."
sudo systemctl restart nginx

echo ""
echo "7. Testing deployment..."
sleep 2
curl -s -o /dev/null -w "Status: %{http_code} | Size: %{size_download} bytes\n" https://learnyzer.com/

echo ""
echo "If this didn't work, we need to:"
echo "1. Copy the dist/ folder from your development machine"
echo "2. Or run the build process that worked this morning"
echo "3. The files that made it work are the actual Vite-built React bundles"
EOF

chmod +x copy-real-frontend.sh