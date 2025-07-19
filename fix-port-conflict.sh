#!/bin/bash

echo "🔧 DEFINITIVE PORT CONFLICT FIX"
echo "==============================="

cd /home/ubuntu/Learnyzer

# 1. Check current nginx configuration
echo "1. Current nginx configuration:"
sudo cat /etc/nginx/sites-available/learnyzer.com | grep -A 2 -B 2 "proxy_pass"

# 2. Force replace any remaining port 3000 references
echo "2. Forcing port updates..."
sudo sed -i 's/127\.0\.0\.1:3000/127.0.0.1:5000/g' /etc/nginx/sites-available/learnyzer.com
sudo sed -i 's/localhost:3000/localhost:5000/g' /etc/nginx/sites-available/learnyzer.com

# 3. Verify changes
echo "3. Verification - all proxy_pass lines should show port 5000:"
sudo grep "proxy_pass" /etc/nginx/sites-available/learnyzer.com

# 4. Force nginx restart
echo "4. Force restarting nginx..."
sudo systemctl stop nginx
sleep 3
sudo systemctl start nginx
sudo systemctl status nginx --no-pager

# 5. Clear any nginx cache
echo "5. Clearing nginx cache..."
sudo rm -rf /var/cache/nginx/*

# 6. Test API immediately
echo "6. Testing API..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "7. Check for any remaining errors:"
sudo tail -5 /var/log/nginx/error.log