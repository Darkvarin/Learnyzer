#!/bin/bash

echo "SIMPLE NGINX FIX FOR LEARNYZER"
echo "============================="

# Backup existing config
sudo cp /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-available/learnyzer.com.backup

# Create new optimized config
sudo cat > /etc/nginx/sites-available/learnyzer.com << 'NGINXEOF'
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name learnyzer.com www.learnyzer.com;

    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_private_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;

    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
NGINXEOF

# Test and restart
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Simple nginx configuration applied"
echo "Testing..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://learnyzer.com/
echo "Done!"