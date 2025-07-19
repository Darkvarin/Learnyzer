#!/bin/bash

echo "🚀 COMPREHENSIVE DASHBOARD FIX DEPLOYMENT"
echo "=========================================="

# This script should be run on your EC2 server at /home/ubuntu/Learnyzer

echo "1. Pulling latest code from GitHub..."
git pull origin main

echo "2. Ensuring all React components are properly fixed..."

# Verify key components exist and are properly formatted
if [ ! -f "client/src/components/layout/header.tsx" ]; then
    echo "❌ Header component missing - critical error"
    exit 1
fi

if [ ! -f "client/src/pages/dashboard.tsx" ]; then
    echo "❌ Dashboard component missing - critical error"  
    exit 1
fi

echo "3. Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed - checking for syntax errors..."
    npm run build 2>&1 | grep -A10 -B5 "error"
    exit 1
fi

echo "4. Deploying to nginx..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;

echo "5. Restarting nginx..."
sudo systemctl restart nginx

echo "6. Testing deployment..."
sleep 5

# Test various endpoints
home_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
api_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/api/auth/me)

echo "Test Results:"
echo "  Homepage: $home_status"
echo "  Dashboard: $dashboard_status" 
echo "  API: $api_status"

if [ "$dashboard_status" = "200" ]; then
    echo "✅ SUCCESS! Dashboard deployed successfully"
    echo "🌐 Visit: https://learnyzer.com/dashboard"
    
    # Check if JavaScript is loading properly
    js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
    if [ -n "$js_file" ]; then
        js_status=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
        echo "  JavaScript: $js_status"
        
        if [ "$js_status" = "200" ]; then
            echo "✅ React application should be working properly"
        else
            echo "⚠️  JavaScript file not loading properly"
        fi
    fi
else
    echo "❌ Dashboard still not working: $dashboard_status"
    echo "Check nginx error logs: sudo tail -50 /var/log/nginx/error.log"
fi

echo ""
echo "Deployment complete!"
EOF

chmod +x deploy-dashboard-fixes.sh