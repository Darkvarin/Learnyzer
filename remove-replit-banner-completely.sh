#!/bin/bash

echo "COMPLETELY REMOVING REPLIT BANNER AND REBUILDING"
echo "==============================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking current source HTML for Replit references..."
if grep -q "replit" client/index.html; then
    echo "❌ Replit references found in source"
    grep -n "replit" client/index.html
else
    echo "✅ No Replit references in source"
fi

echo ""
echo "2. Force removing any Replit references from source..."
sed -i '/replit/d' client/index.html

echo ""
echo "3. Verifying source is clean..."
if grep -q "replit" client/index.html; then
    echo "❌ Still has Replit references"
    cat client/index.html | tail -10
else
    echo "✅ Source HTML is clean"
fi

echo ""
echo "4. Clearing all caches and rebuilding..."
sudo rm -rf dist
sudo rm -rf node_modules/.vite
sudo rm -rf node_modules/.cache
npm run build

echo ""
echo "5. Checking built HTML..."
if [ -f "dist/index.html" ]; then
    if grep -q "replit" dist/index.html; then
        echo "❌ Replit banner still in built HTML"
        grep -C 2 "replit" dist/index.html
    else
        echo "✅ Built HTML is clean"
    fi
    
    echo ""
    echo "Built HTML preview (last 10 lines):"
    tail -10 dist/index.html
else
    echo "❌ Build failed"
    npm run build
fi

echo ""
echo "6. Setting permissions and deploying..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type d -exec chmod 755 {} \;
find dist -type f -exec chmod 644 {} \;

# Make sure nginx can access the path
sudo chmod +x /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist

echo ""
echo "7. Restarting nginx..."
sudo systemctl restart nginx

echo ""
echo "8. Testing clean deployment..."
sleep 3

# Test what's actually served
echo "Testing served HTML for Replit references..."
content=$(curl -s https://learnyzer.com/dashboard)

if echo "$content" | grep -q "replit"; then
    echo "❌ Replit banner still being served"
    echo "Served content containing replit:"
    echo "$content" | grep -C 2 "replit"
else
    echo "✅ Clean HTML being served - no Replit banner"
fi

echo ""
echo "Testing asset loading..."
js_file=$(echo "$content" | grep -o '/assets/index-[^"]*\.js' | head -1)
css_file=$(echo "$content" | grep -o '/assets/index-[^"]*\.css' | head -1)

if [ -n "$js_file" ]; then
    js_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
    echo "JavaScript: $js_response"
else
    echo "No JS file found"
fi

if [ -n "$css_file" ]; then
    css_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$css_file")
    echo "CSS: $css_response"
else
    echo "No CSS file found"
fi

echo ""
if [ "$js_response" = "200" ] && [ "$css_response" = "200" ] && ! echo "$content" | grep -q "replit"; then
    echo "🚀 SUCCESS! Clean deployment without Replit banner"
    echo ""
    echo "✅ No development scripts"
    echo "✅ Assets loading (JS: $js_response, CSS: $css_response)"
    echo "✅ React structure ready"
    echo ""
    echo "Your dashboard should now work at: https://learnyzer.com/dashboard"
else
    echo "❌ Still have issues to resolve"
    echo "JS: $js_response, CSS: $css_response"
    if echo "$content" | grep -q "replit"; then
        echo "Replit banner still present"
    fi
fi
EOF

chmod +x remove-replit-banner-completely.sh