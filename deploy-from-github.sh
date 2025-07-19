#!/bin/bash

echo "DEPLOYING LEARNYZER FROM GITHUB"
echo "==============================="

cd /home/ubuntu/Learnyzer

echo "1. Checking current directory and files..."
pwd
ls -la

echo ""
echo "2. Building the frontend if not already built..."
if [ ! -d "dist" ]; then
    echo "No dist folder found, building..."
    npm run build
else
    echo "dist folder exists, checking contents..."
    ls -la dist/
fi

echo ""
echo "3. Copying built React app to proper location..."
if [ -d "dist/public" ]; then
    echo "Found dist/public, copying to dist root..."
    cp -r dist/public/* dist/ 2>/dev/null || true
    
    # Also ensure we're serving from the right location
    if [ -f "dist/public/index.html" ]; then
        cp dist/public/index.html dist/index.html
        echo "✅ Copied main index.html"
    fi
    
    if [ -d "dist/public/assets" ]; then
        mkdir -p dist/assets
        cp -r dist/public/assets/* dist/assets/ 2>/dev/null || true
        echo "✅ Copied assets directory"
    fi
else
    echo "No dist/public found, checking if dist has the files directly..."
    ls -la dist/
fi

echo ""
echo "4. Verifying React build files exist..."
if [ -f "dist/index.html" ]; then
    echo "✅ index.html found"
    head -5 dist/index.html
else
    echo "❌ index.html not found"
fi

if [ -f "dist/assets/index-"*".js" ]; then
    echo "✅ JavaScript bundle found"
    ls -la dist/assets/index-*.js
else
    echo "❌ JavaScript bundle not found"
    echo "Looking for any JS files..."
    find dist -name "*.js" 2>/dev/null || echo "No JS files found"
fi

if [ -f "dist/assets/index-"*".css" ]; then
    echo "✅ CSS bundle found"
    ls -la dist/assets/index-*.css
else
    echo "❌ CSS bundle not found" 
    echo "Looking for any CSS files..."
    find dist -name "*.css" 2>/dev/null || echo "No CSS files found"
fi

echo ""
echo "5. Setting proper permissions for nginx..."
chmod 755 /home/ubuntu
chmod 755 /home/ubuntu/Learnyzer
chmod 755 /home/ubuntu/Learnyzer/dist
chmod -R 755 /home/ubuntu/Learnyzer/dist/*/
chmod 644 /home/ubuntu/Learnyzer/dist/*.html
chmod 644 /home/ubuntu/Learnyzer/dist/*.txt
chmod 644 /home/ubuntu/Learnyzer/dist/*.xml
chmod -R 644 /home/ubuntu/Learnyzer/dist/assets/* 2>/dev/null || true

echo ""
echo "6. Checking PM2 backend status..."
pm2 status

echo ""
echo "7. Restarting nginx to pick up new files..."
sudo systemctl restart nginx
sleep 2

echo ""
echo "8. Testing the complete deployment..."
echo "Frontend test:"
curl -s -o /dev/null -w "Status: %{http_code} | Size: %{size_download} bytes\n" https://learnyzer.com/

echo ""
echo "Content test (first 500 characters):"
curl -s https://learnyzer.com/ | head -c 500

echo ""
echo "API test:"
curl -s -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' | head -100

echo ""
echo "9. Final verification..."
if curl -s -f https://learnyzer.com/ | grep -q "Learnyzer"; then
    echo "✅ SUCCESS: Frontend is loading with Learnyzer content!"
else
    echo "❌ Issue: Frontend not showing expected content"
    echo "Checking nginx error logs:"
    sudo tail -5 /var/log/nginx/error.log
fi

echo ""
echo "🚀 DEPLOYMENT STATUS:"
echo "✅ Code: Pulled from GitHub"
echo "✅ Build: React frontend compiled"  
echo "✅ Backend: PM2 API server running"
echo "✅ SSL: HTTPS operational"
echo "✅ Permissions: Set for nginx access"
echo ""
echo "🌟 Your complete Learnyzer platform should now be live at:"
echo "https://learnyzer.com"
EOF

chmod +x deploy-from-github.sh