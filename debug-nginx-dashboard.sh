#!/bin/bash

echo "🔍 DEBUGGING NGINX DASHBOARD ROUTING"
echo "===================================="

echo "1. Checking current nginx configuration..."
echo "Looking for location / block:"
sudo grep -A 10 "location / " /etc/nginx/sites-available/learnyzer.com

echo ""
echo "2. Testing different routes:"
echo "Homepage:"
curl -s -o /dev/null -w "HTTP: %{http_code} | Size: %{size_download} bytes\n" https://learnyzer.com/

echo "Dashboard:"
curl -s -o /dev/null -w "HTTP: %{http_code} | Size: %{size_download} bytes\n" https://learnyzer.com/dashboard

echo "Non-existent route:"
curl -s -o /dev/null -w "HTTP: %{http_code} | Size: %{size_download} bytes\n" https://learnyzer.com/nonexistent

echo ""
echo "3. Checking if files exist on server:"
echo "index.html in dist:"
ls -la /home/ubuntu/Learnyzer/dist/index.html 2>/dev/null || echo "Not found"

echo "index.html in dist/public:"
ls -la /home/ubuntu/Learnyzer/dist/public/index.html 2>/dev/null || echo "Not found"

echo ""
echo "4. Content check - what nginx is actually serving:"
echo "From /"
curl -s https://learnyzer.com/ | head -5

echo ""
echo "From /dashboard"
curl -s https://learnyzer.com/dashboard | head -5

echo ""
echo "5. Nginx error logs (last 10 lines):"
sudo tail -10 /var/log/nginx/error.log

echo ""
echo "6. Nginx access logs for dashboard (last 5):"
sudo grep "/dashboard" /var/log/nginx/access.log | tail -5