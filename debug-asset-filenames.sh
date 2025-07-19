#!/bin/bash

echo "DEBUGGING ASSET FILENAME MISMATCH"
echo "================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking actual built asset filenames..."
echo "JavaScript files:"
ls -la dist/assets/index-*.js 2>/dev/null || echo "No JS files found"

echo ""
echo "CSS files:"
ls -la dist/assets/index-*.css 2>/dev/null || echo "No CSS files found"

echo ""
echo "2. Checking what HTML references..."
echo "Script tags in index.html:"
grep -o '/assets/index-[^"]*\.js' dist/index.html || echo "No JS references found"

echo ""
echo "CSS links in index.html:"
grep -o '/assets/index-[^"]*\.css' dist/index.html || echo "No CSS references found"

echo ""
echo "3. Testing actual asset access..."
js_file=$(ls dist/assets/index-*.js 2>/dev/null | head -1 | sed 's|dist||')
css_file=$(ls dist/assets/index-*.css 2>/dev/null | head -1 | sed 's|dist||')

if [ -n "$js_file" ]; then
    echo "Testing JS: https://learnyzer.com$js_file"
    curl -s -o /dev/null -w "JS Response: %{http_code}\n" "https://learnyzer.com$js_file"
else
    echo "No JS file to test"
fi

if [ -n "$css_file" ]; then
    echo "Testing CSS: https://learnyzer.com$css_file"
    curl -s -o /dev/null -w "CSS Response: %{http_code}\n" "https://learnyzer.com$css_file"
else
    echo "No CSS file to test"
fi

echo ""
echo "4. Testing what browser actually requests..."
echo "HTML content preview:"
curl -s https://learnyzer.com/dashboard | grep -E "(script|link)" | head -3

echo ""
echo "5. Directory permissions check..."
ls -la /home/ubuntu/Learnyzer/dist/
ls -la /home/ubuntu/Learnyzer/dist/assets/ | head -5

echo ""
echo "6. Nginx error log check..."
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "No nginx errors found"
EOF

chmod +x debug-asset-filenames.sh