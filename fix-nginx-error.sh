#!/bin/bash

echo "FIXING NGINX CONFIGURATION ERROR"
echo "==============================="

cd /home/ubuntu/Learnyzer

echo "1. Checking nginx error details..."
echo "Nginx status:"
sudo systemctl status nginx.service --no-pager -l

echo ""
echo "Error logs:"
sudo journalctl -xeu nginx.service --no-pager -l | tail -20

echo ""
echo "2. Testing current nginx configuration..."
sudo nginx -t

echo ""
echo "3. Creating clean nginx configuration..."
sudo cat > /etc/nginx/sites-available/learnyzer.com << 'EOF'
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
    ssl_protocols TLSv1.2 TLSv1.3;

    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    # API routes
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React Router fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    # SEO files
    location = /robots.txt {
        try_files $uri =404;
    }

    location = /sitemap.xml {
        try_files $uri =404;
    }
}
EOF

echo ""
echo "4. Testing new configuration..."
if sudo nginx -t; then
    echo "✅ Configuration is valid"
    
    echo ""
    echo "5. Restarting nginx..."
    sudo systemctl restart nginx
    
    if sudo systemctl is-active --quiet nginx; then
        echo "✅ nginx started successfully"
    else
        echo "❌ nginx failed to start"
        sudo systemctl status nginx --no-pager -l
    fi
else
    echo "❌ Configuration still has errors"
    sudo nginx -t
fi

echo ""
echo "6. Final test..."
if sudo systemctl is-active --quiet nginx; then
    echo "Testing site access..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" https://learnyzer.com/
else
    echo "nginx is not running"
fi
EOF

chmod +x fix-nginx-error.sh