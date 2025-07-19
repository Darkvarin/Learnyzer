#!/bin/bash

echo "FIXING NGINX PERMISSIONS - FINAL SOLUTION"
echo "========================================"

cd ~/Learnyzer

echo "1. The issue: nginx user can't access /home/ubuntu/Learnyzer/dist/"
echo "   Error: Permission denied (13) for nginx accessing files"

echo ""
echo "2. Fixing directory permissions in the path..."
# nginx needs execute permission on all directories in the path
chmod 755 /home/ubuntu
chmod 755 /home/ubuntu/Learnyzer
chmod 755 /home/ubuntu/Learnyzer/dist

echo "3. Setting proper file permissions..."
chmod 644 /home/ubuntu/Learnyzer/dist/index.html

echo "4. Current permissions:"
ls -la /home/ubuntu/Learnyzer/dist/

echo ""
echo "5. Path permissions:"
namei -l /home/ubuntu/Learnyzer/dist/index.html

echo ""
echo "6. Testing nginx config..."
sudo nginx -t

echo ""
echo "7. Restarting nginx..."
sudo systemctl restart nginx

echo ""
echo "8. Testing frontend (should work now)..."
sleep 2
curl -I https://learnyzer.com/

echo ""
echo "9. Testing full HTML response..."
curl -s https://learnyzer.com/ | head -10

echo ""
echo "10. Final verification - both API and frontend should work:"
echo "Frontend test:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://learnyzer.com/

echo ""
echo "API test:"
curl -s -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' | head -50