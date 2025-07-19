#!/bin/bash

echo "🔍 DEBUGGING NGINX API ROUTING"
echo "=============================="

cd /home/ubuntu/Learnyzer

# 1. Check current nginx configuration
echo "1. Current nginx configuration for learnyzer.com:"
sudo cat /etc/nginx/sites-available/learnyzer.com | grep -A 10 -B 5 "proxy_pass"

# 2. Test direct server connection
echo ""
echo "2. Testing direct server connection on port 5000:"
curl -X POST http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

# 3. Check server process status
echo ""
echo "3. Server process status:"
ps aux | grep tsx | grep -v grep
sudo netstat -tlnp | grep :5000

# 4. Check nginx error logs for specific errors
echo ""
echo "4. Recent nginx error logs:"
sudo tail -20 /var/log/nginx/error.log

# 5. Test nginx upstream connectivity
echo ""
echo "5. Testing nginx upstream connectivity:"
curl -I http://127.0.0.1:5000/

# 6. Check if nginx site is enabled
echo ""
echo "6. Checking if site is enabled:"
ls -la /etc/nginx/sites-enabled/ | grep learnyzer

# 7. Manual nginx configuration fix
echo ""
echo "7. Applying comprehensive nginx fix..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name learnyzer.com www.learnyzer.com;

    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;
    
    # API routes - proxy to Node.js server
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files and frontend
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "8. Testing and reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "9. Final API test:"
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'