#!/bin/bash

echo "DEBUGGING REACT APP LOADING ISSUE"
echo "================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking if dashboard serves the React HTML..."
echo "Dashboard content preview:"
curl -s https://learnyzer.com/dashboard | head -c 500

echo ""
echo ""
echo "2. Checking if JavaScript bundles are accessible..."
js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
if [ -n "$js_file" ]; then
    echo "Found JS file: $js_file"
    echo "Testing JS file access:"
    js_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
    echo "JS file response: $js_response"
    
    if [ "$js_response" = "200" ]; then
        echo "✅ JavaScript bundle is accessible"
    else
        echo "❌ JavaScript bundle not accessible"
    fi
else
    echo "❌ No JavaScript file found in HTML"
fi

echo ""
echo "3. Checking CSS bundles..."
css_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.css' | head -1)
if [ -n "$css_file" ]; then
    echo "Found CSS file: $css_file"
    css_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$css_file")
    echo "CSS file response: $css_response"
else
    echo "❌ No CSS file found in HTML"
fi

echo ""
echo "4. Checking actual file structure in dist..."
echo "dist directory contents:"
ls -la dist/

if [ -d "dist/assets" ]; then
    echo ""
    echo "assets directory contents:"
    ls -la dist/assets/ | head -10
else
    echo "❌ No assets directory in dist"
fi

echo ""
echo "5. Checking if the HTML file has the correct structure..."
echo "Looking for React root div and script tags:"
curl -s https://learnyzer.com/dashboard | grep -E "(id=\"root\"|src=\"/assets/|href=\"/assets/)" || echo "No React structure found"

echo ""
echo "6. Testing base path access..."
echo "Root index.html:"
curl -s -o /dev/null -w "Root: %{http_code}\n" https://learnyzer.com/

echo ""
echo "7. Quick file existence check..."
if [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html exists"
    echo "File size: $(stat -c%s dist/index.html) bytes"
    
    echo ""
    echo "Checking for React root and scripts in local file:"
    grep -E "(id=\"root\"|/assets/index-)" dist/index.html || echo "Local file missing React structure"
else
    echo "❌ dist/index.html does not exist"
fi

echo ""
echo "8. Backend API test (should work)..."
api_test=$(curl -s https://learnyzer.com/api/auth/me | head -c 100)
echo "API response: $api_test"
EOF

chmod +x debug-react-loading.sh