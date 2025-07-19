#!/bin/bash

echo "RESTORING REAL DASHBOARD WITH FIXES"
echo "=================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking current App.tsx status..."
grep "dashboard-minimal" client/src/App.tsx && echo "Still using minimal dashboard" || echo "Using real dashboard"

echo "2. Restoring to use real dashboard..."
if [ -f "client/src/App.tsx.original" ]; then
    mv client/src/App.tsx.original client/src/App.tsx
    echo "✅ Restored original App.tsx"
else
    # Manually fix the import
    sed -i 's|import Dashboard from "@/pages/dashboard-minimal";|import Dashboard from "@/pages/dashboard";|' client/src/App.tsx
    echo "✅ Fixed dashboard import manually"
fi

echo "3. Verifying the import is correct..."
grep "import Dashboard" client/src/App.tsx

echo "4. Building with real dashboard..."
npm run build 2>&1 | tee build_real_dashboard.log

if grep -q "error\|Error\|ERROR" build_real_dashboard.log; then
    echo "❌ Build failed:"
    grep -i error build_real_dashboard.log
    exit 1
fi

echo "✅ Clean build with real dashboard"

echo "5. Deploying real dashboard..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;
sed -i '/replit/d' dist/index.html

sudo systemctl restart nginx
sleep 3

echo "6. Testing real dashboard deployment..."
dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
echo "Dashboard HTTP: $dashboard_response"

# Check if we get real dashboard content (not minimal)
real_dashboard_test=$(curl -s https://learnyzer.com/dashboard | grep -o "Learning Analytics\|Level.*XP\|Solo Leveling" | head -1)
minimal_dashboard_test=$(curl -s https://learnyzer.com/dashboard | grep -o "REACT IS WORKING" | head -1)

echo "Real dashboard content: $real_dashboard_test"
echo "Minimal dashboard content: $minimal_dashboard_test"

echo ""
echo "RESULTS:"
echo "========"
if [ "$dashboard_response" = "200" ] && [ -n "$real_dashboard_test" ] && [ -z "$minimal_dashboard_test" ]; then
    echo "🚀 SUCCESS! Real dashboard deployed with fixes"
    echo ""
    echo "Visit: https://learnyzer.com/dashboard"
    echo ""
    echo "You should now see:"
    echo "✅ Full Learnyzer dashboard with all features"
    echo "✅ User stats, level, XP, and rank displays"
    echo "✅ AI tutor, battle zone, and course sections"
    echo "✅ No flashing or black screen issues"
else
    echo "❌ Issue with deployment:"
    echo "HTTP Status: $dashboard_response"
    echo "Real content found: $real_dashboard_test"
    echo "Still showing minimal: $minimal_dashboard_test"
fi

echo ""
echo "Build log: build_real_dashboard.log"
EOF

chmod +x restore-real-dashboard.sh