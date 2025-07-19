#!/bin/bash

echo "FIXING WINDOW REFERENCE ISSUES IN DASHBOARD"
echo "==========================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking for window object references that cause SSR issues..."
grep -n "window\." client/src/pages/dashboard.tsx || echo "No direct window references found"

echo ""
echo "2. Backing up original dashboard..."
cp client/src/pages/dashboard.tsx client/src/pages/dashboard.tsx.backup

echo ""
echo "3. Fixing window.location.origin reference..."
# Fix the canonical URL to not use window.location.origin during render
sed -i 's|canonical={`${window.location.origin}/dashboard`}|canonical="/dashboard"|' client/src/pages/dashboard.tsx

echo ""
echo "4. Checking for other potential issues..."
# Look for other common React crash causes
if grep -q "localStorage\|sessionStorage" client/src/pages/dashboard.tsx; then
    echo "⚠️ Found storage references - these need proper guards"
fi

if grep -q "document\." client/src/pages/dashboard.tsx; then
    echo "⚠️ Found document references - these need proper guards"
fi

echo ""
echo "5. Building with fixes..."
npm run build 2>&1 | tee build_fixed.log

if grep -q "error\|Error\|ERROR" build_fixed.log; then
    echo "❌ Build errors found:"
    grep -i error build_fixed.log
    
    echo "Reverting changes..."
    mv client/src/pages/dashboard.tsx.backup client/src/pages/dashboard.tsx
else
    echo "✅ Clean build with fixes"
    
    echo ""
    echo "6. Deploying fixed version..."
    sudo chown -R ubuntu:ubuntu dist/
    find dist -type f -exec chmod 644 {} \;
    find dist -type d -exec chmod 755 {} \;
    
    sudo systemctl restart nginx
    sleep 3
    
    echo ""
    echo "7. Testing fixed dashboard..."
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Dashboard response: $dashboard_response"
    
    if [ "$dashboard_response" = "200" ]; then
        echo "✅ Dashboard fixed - testing in browser needed"
        echo ""
        echo "Visit https://learnyzer.com/dashboard"
        echo "It should no longer flash and crash"
    else
        echo "❌ Still having issues"
    fi
fi

echo ""
echo "Build log saved to: build_fixed.log"
EOF

chmod +x fix-window-reference-issue.sh