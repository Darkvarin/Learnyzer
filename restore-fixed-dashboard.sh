#!/bin/bash

echo "RESTORING FIXED DASHBOARD WITH WINDOW REFERENCE FIXES"
echo "====================================================="

cd /home/ubuntu/Learnyzer

echo "1. Restoring original App.tsx to use the fixed dashboard..."
mv client/src/App.tsx.original client/src/App.tsx

echo "2. Building with the fixed window references..."
npm run build 2>&1 | tee build_fixed_dashboard.log

if grep -q "error\|Error\|ERROR" build_fixed_dashboard.log; then
    echo "❌ Build failed with fixed dashboard:"
    grep -i error build_fixed_dashboard.log
    exit 1
fi

echo "✅ Clean build with fixed dashboard"

echo "3. Deploying the fixed version..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;

sed -i '/replit/d' dist/index.html

sudo systemctl restart nginx
sleep 3

echo "4. Testing the fixed dashboard..."
dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
echo "Dashboard response: $dashboard_response"

# Test if we get the full dashboard content
content_test=$(curl -s https://learnyzer.com/dashboard | grep -o "Learning Dashboard\|Dashboard" | head -1)
echo "Content test: $content_test"

js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
if [ -n "$js_file" ]; then
    js_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
    echo "JavaScript: $js_response"
fi

api_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/api/auth/me)
echo "API: $api_response"

echo ""
echo "RESULTS:"
echo "========"
if [ "$dashboard_response" = "200" ] && [ "$js_response" = "200" ] && [ "$api_response" = "200" ]; then
    echo "🚀 SUCCESS! Fixed dashboard deployed"
    echo ""
    echo "Visit: https://learnyzer.com/dashboard"
    echo ""
    echo "The dashboard should now:"
    echo "✅ Load completely without flashing"
    echo "✅ Not go black after initial load"
    echo "✅ Show the full Learnyzer dashboard interface"
    echo "✅ Have working navigation and components"
else
    echo "❌ Some components still failing"
    echo "Dashboard: $dashboard_response"
    echo "JavaScript: $js_response"
    echo "API: $api_response"
fi

echo ""
echo "Build log: build_fixed_dashboard.log"
EOF

chmod +x restore-fixed-dashboard.sh