#!/bin/bash

echo "FIXING PERMISSIONS AND REBUILDING CLEAN"
echo "======================================="

cd /home/ubuntu/Learnyzer

echo "1. Removing existing dist with permission issues..."
sudo rm -rf dist

echo ""
echo "2. Rebuilding React app fresh..."
npx vite build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    
    echo ""
    echo "3. Setting proper ownership and permissions..."
    sudo chown -R ubuntu:ubuntu dist/
    chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist
    find /home/ubuntu/Learnyzer/dist -type d -exec chmod 755 {} \;
    find /home/ubuntu/Learnyzer/dist -type f -exec chmod 644 {} \;
    
    echo ""
    echo "4. Verifying permissions..."
    ls -la dist/
    ls -la dist/assets/ | head -3
    
    echo ""
    echo "5. Checking build structure..."
    if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
        echo "✅ Complete build structure"
        
        # Check if Replit banner is gone
        if grep -q "replit.com" dist/index.html; then
            echo "❌ Replit banner still present"
        else
            echo "✅ Clean production HTML"
        fi
        
        # Check JavaScript file
        js_file=$(ls dist/assets/index-*.js 2>/dev/null | head -1)
        if [ -n "$js_file" ]; then
            echo "✅ JavaScript bundle: $(basename "$js_file")"
            echo "Size: $(stat -c%s "$js_file") bytes"
        fi
        
    else
        echo "❌ Incomplete build"
    fi
    
    echo ""
    echo "6. Restarting nginx..."
    sudo systemctl restart nginx
    
    echo ""
    echo "7. Testing deployment..."
    sleep 3
    
    # Test dashboard
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Dashboard HTTP: $dashboard_response"
    
    # Test JavaScript access
    js_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/assets/index-*.js 2>/dev/null)
    echo "JavaScript access: $js_response"
    
    # Test CSS access  
    css_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/assets/index-*.css 2>/dev/null)
    echo "CSS access: $css_response"
    
    if [ "$dashboard_response" = "200" ] && [ "$js_response" = "200" ] && [ "$css_response" = "200" ]; then
        echo ""
        echo "8. Verifying React structure..."
        content=$(curl -s https://learnyzer.com/dashboard)
        
        if echo "$content" | grep -q 'id="root"' && echo "$content" | grep -q '/assets/index-' && ! echo "$content" | grep -q 'replit.com'; then
            echo "✅ Clean React HTML structure confirmed"
            echo "✅ No development scripts"
            echo "✅ Assets loading correctly"
            echo ""
            echo "🚀 DEPLOYMENT SHOULD NOW WORK!"
            echo ""
            echo "Visit https://learnyzer.com/dashboard"
            echo "The page should load with React components"
            echo "Check browser console (F12) for any remaining errors"
        else
            echo "❌ HTML structure issue"
            echo "Preview: $(echo "$content" | head -c 200)"
        fi
    else
        echo "❌ HTTP access issues"
        echo "Dashboard: $dashboard_response, JS: $js_response, CSS: $css_response"
    fi
    
else
    echo "❌ Build failed"
    npx vite build
fi

echo ""
echo "Backend status:"
pm2 list | grep learnyzer || echo "Backend check needed"

echo ""
echo "Final file permissions check:"
ls -la dist/index.html
ls -la dist/assets/index-*.js | head -1
EOF

chmod +x fix-permissions-and-rebuild.sh