#!/bin/bash

echo "🔧 FIXING NGINX DASHBOARD 404 ERROR"
echo "==================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking current nginx configuration..."
echo "Current location / block:"
sudo grep -A 10 "location / " /etc/nginx/sites-available/learnyzer.com

echo ""
echo "2. Backing up current nginx config..."
sudo cp /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-available/learnyzer.com.backup.$(date +%Y%m%d_%H%M%S)

echo ""
echo "3. Fixing nginx SPA routing configuration..."

# Remove any existing location / blocks and add the correct one
sudo sed -i '/location \/ {/,/^[[:space:]]*}/d' /etc/nginx/sites-available/learnyzer.com

# Add the correct location block before the API location block
sudo sed -i '/location \/api\/ {/i\
    # React SPA routing - serve index.html for all non-API routes\
    location / {\
        try_files $uri $uri/ /index.html;\
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";\
        expires off;\
    }\
' /etc/nginx/sites-available/learnyzer.com

echo ""
echo "4. Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx config syntax is valid"
    
    echo ""
    echo "5. Reloading nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "6. Testing routes after fix..."
    sleep 2
    
    echo "Homepage test:"
    homepage_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
    echo "Status: $homepage_status"
    
    echo "Dashboard test:"
    dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Status: $dashboard_status"
    
    echo "Random route test:"
    random_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/nonexistent)
    echo "Status: $random_status"
    
    echo ""
    echo "7. Content verification..."
    dashboard_content=$(curl -s https://learnyzer.com/dashboard | head -3)
    if echo "$dashboard_content" | grep -q "DOCTYPE\|html"; then
        echo "✅ Dashboard now serves HTML content"
    else
        echo "❌ Dashboard still not serving HTML"
        echo "Content received: $dashboard_content"
    fi
    
    echo ""
    if [ "$dashboard_status" = "200" ]; then
        echo "🚀 SUCCESS! Dashboard 404 fixed"
        echo "Visit: https://learnyzer.com/dashboard"
    else
        echo "❌ Still getting $dashboard_status for dashboard"
        echo ""
        echo "Checking nginx error logs:"
        sudo tail -5 /var/log/nginx/error.log
    fi
    
else
    echo "❌ Nginx config has syntax errors"
    echo "Restoring backup..."
    sudo cp /etc/nginx/sites-available/learnyzer.com.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/sites-available/learnyzer.com
fi

echo ""
echo "Final nginx location / block:"
sudo grep -A 5 "location / " /etc/nginx/sites-available/learnyzer.com