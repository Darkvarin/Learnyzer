#!/bin/bash

echo "DEBUGGING NGINX PERMISSIONS AND PATHS"
echo "===================================="

cd ~/Learnyzer

echo "1. Current user and groups..."
whoami
groups

echo ""
echo "2. Nginx user configuration..."
ps aux | grep nginx | head -3

echo ""
echo "3. Directory permissions along the path..."
sudo namei -l /home/ubuntu/Learnyzer/dist/

echo ""
echo "4. SELinux status (if applicable)..."
getenforce 2>/dev/null || echo "SELinux not enabled"

echo ""
echo "5. Recent nginx error logs..."
sudo tail -10 /var/log/nginx/error.log

echo ""
echo "6. Nginx configuration test..."
sudo nginx -t

echo ""
echo "7. Creating world-readable test file..."
sudo rm -rf dist
mkdir -p dist
echo "<h1>Test</h1>" > dist/index.html
chmod 644 dist/index.html
chmod 755 dist
ls -la dist/

echo ""
echo "8. Testing with new file..."
curl -I http://localhost/ 2>/dev/null | head -3

echo ""
echo "9. If still failing, checking nginx root directive..."
sudo grep -r "root.*Learnyzer" /etc/nginx/sites-available/