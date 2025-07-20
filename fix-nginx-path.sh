#!/bin/bash

echo "🔧 FIXING NGINX ROOT PATH FOR VITE BUILD"
echo "======================================="

echo "ISSUE: nginx pointing to /home/ubuntu/Learnyzer/dist but Vite builds to /home/ubuntu/Learnyzer/dist/public"
echo "SOLUTION: Update nginx root path to correct Vite build directory"
echo ""

# Update nginx root path to point to dist/public
sudo sed -i 's|root /home/ubuntu/Learnyzer/dist;|root /home/ubuntu/Learnyzer/dist/public;|' /etc/nginx/sites-available/learnyzer.com

echo "Updated nginx root path to: /home/ubuntu/Learnyzer/dist/public"

# Test nginx configuration
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration valid"
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded with correct Vite build path"
    
    # Test the routes
    echo ""
    echo "Testing routes..."
    home_test=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
    dashboard_test=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    
    echo "Homepage: $home_test"
    echo "Dashboard: $dashboard_test"
    
    if [ "$home_test" = "200" ] && [ "$dashboard_test" = "200" ]; then
        echo ""
        echo "🎉 SUCCESS! Nginx now serving from correct Vite build directory"
        echo "✅ React routes should now work properly"
    else
        echo "❌ Still having issues with routing"
    fi
else
    echo "❌ Nginx configuration error"
fi