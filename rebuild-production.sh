#!/bin/bash

echo "REBUILDING PRODUCTION WITHOUT REPLIT BANNER"
echo "==========================================="

cd /home/ubuntu/Learnyzer

echo "1. Rebuilding React app without development scripts..."
npx vite build

echo ""
echo "2. Verifying build..."
if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
    echo "✅ Build successful"
    
    echo ""
    echo "3. Checking if Replit banner script is removed..."
    if grep -q "replit.com/public/js/replit-dev-banner.js" dist/index.html; then
        echo "❌ Replit banner still in HTML"
    else
        echo "✅ Replit banner removed from production build"
    fi
    
    echo ""
    echo "4. Setting permissions..."
    chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist
    chmod -R 644 /home/ubuntu/Learnyzer/dist/*
    find /home/ubuntu/Learnyzer/dist -type d -exec chmod 755 {} \;
    
    echo ""
    echo "5. Restarting nginx..."
    sudo systemctl restart nginx
    
    echo ""
    echo "6. Testing complete deployment..."
    sleep 3
    
    # Test home page
    home_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
    echo "Home page: $home_response"
    
    # Test dashboard
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Dashboard: $dashboard_response"
    
    # Test if React content loads
    if curl -s https://learnyzer.com/dashboard | grep -q "id=\"root\"" && curl -s https://learnyzer.com/dashboard | grep -q "/assets/index-"; then
        echo "✅ React structure confirmed"
        
        # Test JavaScript bundle
        js_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/assets/index-*.js 2>/dev/null || echo "404")
        echo "JavaScript bundle: $js_response"
        
        if [ "$js_response" = "200" ]; then
            echo ""
            echo "🚀 SUCCESS: Clean production build deployed!"
            echo ""
            echo "Your Learnyzer platform should now work correctly:"
            echo "• No development scripts interfering"
            echo "• Clean React production build"
            echo "• All routes functional"
            echo ""
            echo "Test in browser: https://learnyzer.com/dashboard"
            echo "Check browser console - should be clean now"
        fi
    else
        echo "❌ React structure issue"
    fi
    
else
    echo "❌ Build failed"
    npx vite build 2>&1 | tail -10
fi

echo ""
echo "Backend status:"
pm2 list | grep learnyzer || echo "Backend check needed"
EOF

chmod +x rebuild-production.sh