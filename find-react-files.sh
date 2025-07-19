#!/bin/bash

echo "FINDING YOUR REACT BUILD FILES"
echo "============================="

cd /home/ubuntu/Learnyzer

echo "1. Current project structure:"
ls -la

echo ""
echo "2. Checking dist directory:"
if [ -d "dist" ]; then
    ls -la dist/
    if [ -d "dist/public" ]; then
        echo ""
        echo "Found dist/public:"
        ls -la dist/public/
    fi
else
    echo "No dist directory"
fi

echo ""
echo "3. Checking client directory (where React source might be):"
if [ -d "client" ]; then
    ls -la client/
    if [ -d "client/dist" ]; then
        echo ""
        echo "Found client/dist:"
        ls -la client/dist/
    fi
    if [ -d "client/build" ]; then
        echo ""
        echo "Found client/build:"
        ls -la client/build/
    fi
else
    echo "No client directory"
fi

echo ""
echo "4. Looking for any built React files anywhere:"
find . -name "index.html" -type f 2>/dev/null | head -5
find . -name "*.js" -path "*/assets/*" -type f 2>/dev/null | head -3
find . -name "*.css" -path "*/assets/*" -type f 2>/dev/null | head -3

echo ""
echo "5. Checking package.json build script:"
if [ -f "package.json" ]; then
    echo "Build script:"
    grep -A 3 -B 1 '"build"' package.json
else
    echo "No package.json found"
fi

echo ""
echo "6. Check if Vite can build now:"
echo "Testing: npx vite build --outDir /tmp/test-build"
npx vite build --outDir /tmp/test-build

if [ -d "/tmp/test-build" ]; then
    echo ""
    echo "✅ Vite build successful! Contents:"
    ls -la /tmp/test-build/
    if [ -d "/tmp/test-build/assets" ]; then
        echo "Assets:"
        ls -la /tmp/test-build/assets/ | head -3
    fi
    
    echo ""
    echo "Copying successful build to dist:"
    rm -rf dist
    cp -r /tmp/test-build dist
    
    echo "Setting permissions:"
    chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist
    chmod -R 644 /home/ubuntu/Learnyzer/dist/*
    find /home/ubuntu/Learnyzer/dist -type d -exec chmod 755 {} \;
    
    echo "Restarting nginx:"
    sudo systemctl restart nginx
    
    echo ""
    echo "Testing deployment:"
    sleep 2
    curl -s -o /dev/null -w "Status: %{http_code} | Size: %{size_download} bytes\n" https://learnyzer.com/
    
    if curl -s https://learnyzer.com/ | grep -q "vite\|/assets/index-"; then
        echo "✅ SUCCESS: React app is now live!"
    else
        echo "⚠️ Still basic page"
    fi
    
    rm -rf /tmp/test-build
else
    echo "❌ Vite build failed"
    echo "Error details:"
    npx vite build --outDir /tmp/test-build 2>&1 | tail -10
fi

echo ""
echo "7. Final status:"
echo "Your React files are located in: $(pwd)/dist"
echo "Backend status: $(pm2 list | grep learnyzer-backend | awk '{print $6}' || echo 'Not running')"
EOF

chmod +x find-react-files.sh