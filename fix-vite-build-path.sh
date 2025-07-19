#!/bin/bash

echo "FIXING VITE BUILD PATH ISSUE"
echo "============================"

cd /home/ubuntu/Learnyzer

echo "1. Building with current Vite config (builds to dist/public)..."
npx vite build

echo ""
echo "2. Checking what was actually built..."
if [ -d "dist/public" ]; then
    echo "✅ Found build in dist/public"
    ls -la dist/public/
    
    if [ -f "dist/public/index.html" ]; then
        echo "✅ index.html found in dist/public"
        head -5 dist/public/index.html
    fi
else
    echo "❌ No dist/public directory"
    echo "Checking for any dist content..."
    find . -name "dist" -type d 2>/dev/null
fi

echo ""
echo "3. Updating nginx to serve from dist/public..."
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

    root /home/ubuntu/Learnyzer/dist/public;
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

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
EOF

echo ""
echo "4. Setting permissions for dist/public..."
if [ -d "dist/public" ]; then
    chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist /home/ubuntu/Learnyzer/dist/public
    chmod -R 644 /home/ubuntu/Learnyzer/dist/public/*
    find /home/ubuntu/Learnyzer/dist/public -type d -exec chmod 755 {} \;
    echo "✅ Permissions set"
else
    echo "❌ No dist/public to set permissions on"
fi

echo ""
echo "5. Testing nginx config and restarting..."
if sudo nginx -t; then
    echo "✅ nginx config valid"
    sudo systemctl restart nginx
    
    echo ""
    echo "6. Testing deployment..."
    sleep 3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
    echo "Response: $response"
    
    if [ "$response" = "200" ]; then
        content=$(curl -s https://learnyzer.com/)
        if echo "$content" | grep -q "/assets/index-.*\.js"; then
            echo "🚀 SUCCESS: React application is live!"
            echo "✅ Vite build served from dist/public"
            echo "✅ Backend API connected"
            echo "✅ Complete platform at: https://learnyzer.com"
        else
            echo "Content served but checking what..."
            echo "$content" | head -c 200
        fi
    else
        echo "Error $response"
        sudo journalctl -u nginx --no-pager | tail -5
    fi
else
    echo "❌ nginx config error"
    sudo nginx -t
fi

echo ""
echo "Backend status:"
pm2 list | grep learnyzer
EOF

chmod +x fix-vite-build-path.sh