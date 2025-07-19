#!/bin/bash

echo "🔧 PRODUCTION NGINX FIX - COMPREHENSIVE SOLUTION"
echo "==============================================="

cd ~/Learnyzer

# 1. First verify backend is working
echo "1. Testing backend server directly..."
BACKEND_TEST=$(curl -s -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}')

echo "Backend response: $BACKEND_TEST"

if [[ "$BACKEND_TEST" == *"success"* ]]; then
    echo "✅ Backend is working correctly"
else
    echo "❌ Backend issue detected"
    echo "Checking if server is running..."
    sudo lsof -i :5000
    exit 1
fi

# 2. Stop nginx and clear all configurations
echo "2. Stopping nginx and clearing configurations..."
sudo systemctl stop nginx
sudo rm -rf /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/learnyzer.com

# 3. Create a minimal, working nginx configuration
echo "3. Creating minimal nginx configuration..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2 default_server;
    server_name learnyzer.com www.learnyzer.com;

    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;

    # API routes - EXACT MATCH, HIGHEST PRIORITY
    location ~ ^/api/(.*)$ {
        proxy_pass http://127.0.0.1:5000/api/$1;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Content-Type $content_type;
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Ensure proper headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }

    # Serve frontend for all other requests
    location / {
        root /home/ubuntu/Learnyzer/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 4. Enable the site
echo "4. Enabling site..."
sudo ln -s /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-enabled/

# 5. Test configuration
echo "5. Testing nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration failed"
    sudo nginx -t
    exit 1
fi

# 6. Start nginx
echo "6. Starting nginx..."
sudo systemctl start nginx
sleep 3

# 7. Test the fix
echo "7. Testing API through nginx..."
API_RESPONSE=$(curl -s -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}')

echo "API Response: $API_RESPONSE"

if [[ "$API_RESPONSE" == *"success"* ]]; then
    echo "✅ SUCCESS! API is now working through nginx"
else
    echo "❌ Still not working. Debugging..."
    
    echo "Nginx error logs:"
    sudo tail -10 /var/log/nginx/error.log
    
    echo "Nginx access logs:"
    sudo tail -10 /var/log/nginx/access.log
    
    echo "Active nginx sites:"
    ls -la /etc/nginx/sites-enabled/
    
    echo "Nginx configuration test:"
    sudo nginx -T | grep -A20 "location.*api"
fi

echo ""
echo "8. Final status check:"
sudo systemctl status nginx --no-pager | head -3