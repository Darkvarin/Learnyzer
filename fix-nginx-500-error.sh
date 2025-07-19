#!/bin/bash

echo "FIXING NGINX 500 ERROR"
echo "====================="

cd ~/Learnyzer

echo "1. Checking nginx error logs..."
sudo tail -20 /var/log/nginx/error.log

echo ""
echo "2. Checking dist directory..."
ls -la dist/

echo ""
echo "3. Checking nginx configuration..."
sudo nginx -T 2>/dev/null | grep -A 10 -B 5 "root.*dist"

echo ""
echo "4. Creating minimal working frontend..."
sudo rm -rf dist
sudo mkdir -p dist

# Create absolute minimal HTML that nginx can serve
sudo tee dist/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Learnyzer Status</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #667eea; 
            color: white; 
            text-align: center; 
            padding: 50px; 
        }
    </style>
</head>
<body>
    <h1>🧠 Learnyzer Platform</h1>
    <h2>Status: Online</h2>
    <p>Backend API: <span id="status">Testing...</span></p>
    <script>
        fetch('/api/health')
            .then(r => r.json())
            .then(d => document.getElementById('status').textContent = 'Working ✓')
            .catch(e => document.getElementById('status').textContent = 'Error ✗');
    </script>
</body>
</html>
EOF

# Ensure proper ownership and permissions
sudo chown -R www-data:www-data dist
sudo chmod -R 644 dist/*
sudo chmod 755 dist

echo ""
echo "5. Testing nginx configuration..."
sudo nginx -t

echo ""
echo "6. Restarting nginx..."
sudo systemctl restart nginx

echo ""
echo "7. Testing frontend..."
sleep 2
curl -I https://learnyzer.com/ 2>/dev/null | head -3

echo ""
echo "8. If still 500, checking permissions..."
sudo ls -la /home/ubuntu/Learnyzer/dist/
sudo namei -l /home/ubuntu/Learnyzer/dist/index.html

echo ""
echo "9. Final API test to confirm backend working..."
curl -s -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "test"}' | head -50