#!/bin/bash

echo "QUICK NGINX UPDATE"
echo "=================="

# Create the nginx config with proper sudo
sudo bash -c 'cat > /etc/nginx/sites-available/learnyzer.com' << 'EOF'
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

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
EOF

echo "Testing nginx config..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Restarting nginx..."
    sudo systemctl restart nginx
    echo "✅ nginx updated successfully"
    
    echo "Testing site..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" https://learnyzer.com/
else
    echo "❌ nginx config has errors"
fi

chmod +x quick-nginx-update.sh