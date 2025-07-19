#!/bin/bash

echo "🔧 DEBUGGING NGINX API ROUTING ISSUE"
echo "===================================="

cd ~/Learnyzer

# 1. Check current nginx configuration
echo "1. Current nginx configuration:"
sudo cat /etc/nginx/sites-available/learnyzer.com | grep -A20 "location"

echo ""
echo "2. Check if site is enabled:"
ls -la /etc/nginx/sites-enabled/ | grep learnyzer

echo ""
echo "3. Test backend server directly:"
curl -s -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' || echo "Backend test failed"

echo ""
echo "4. Stop nginx and recreate configuration..."
sudo systemctl stop nginx

# Create a clean, working nginx configuration
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name learnyzer.com www.learnyzer.com;

    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API routes MUST come first - exact match
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }

    # Static files root
    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    # Frontend routes - catch all
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 5. Ensure the site is properly linked
sudo rm -f /etc/nginx/sites-enabled/learnyzer.com
sudo ln -s /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-enabled/

# 6. Remove default nginx site that might interfere
sudo rm -f /etc/nginx/sites-enabled/default

echo "5. Testing new configuration:"
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration valid"
    
    # 7. Start nginx
    sudo systemctl start nginx
    sudo systemctl reload nginx
    
    echo "6. Testing nginx status:"
    sudo systemctl status nginx --no-pager | head -3
    
    # 8. Wait and test
    sleep 3
    
    echo "7. Testing API routing:"
    echo "Direct backend test:"
    curl -s -X POST http://localhost:5000/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
    
    echo ""
    echo "Through nginx test:"
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
    
    echo ""
    echo "8. Additional debugging:"
    echo "Nginx error logs:"
    sudo tail -5 /var/log/nginx/error.log
    
    echo ""
    echo "Access logs:"
    sudo tail -5 /var/log/nginx/access.log
    
else
    echo "❌ Configuration failed:"
    sudo nginx -t
fi