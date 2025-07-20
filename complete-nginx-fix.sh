#!/bin/bash

echo "🔧 COMPLETING NGINX CONFIGURATION FOR SPA ROUTING"
echo "================================================="

echo "1. Backing up current config..."
sudo cp /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-available/learnyzer.com.backup.$(date +%H%M%S)

echo "2. Creating complete nginx configuration..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name learnyzer.com www.learnyzer.com;

    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Serve from dist/ where index.html actually is
    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    # API routes - proxy to Node.js backend
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
    }

    # Static assets with long-term caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Other static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # React SPA routing - THIS IS THE CRITICAL MISSING PIECE
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        expires off;
    }
}
EOF

echo "3. Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Configuration syntax is valid"
    
    echo "4. Reloading nginx with new config..."
    sudo systemctl reload nginx
    
    echo "5. Testing routes after fix..."
    sleep 3
    
    echo "Testing homepage..."
    homepage_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
    echo "Homepage: $homepage_status"
    
    echo "Testing dashboard..."
    dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Dashboard: $dashboard_status"
    
    echo "Testing API..."
    api_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/api/auth/me)
    echo "API: $api_status"
    
    if [ "$dashboard_status" = "200" ]; then
        echo ""
        echo "🚀 SUCCESS! Dashboard 404 completely fixed"
        echo "✅ React Router now works for all routes"
        echo ""
        echo "Test it now: https://learnyzer.com/dashboard"
    else
        echo ""
        echo "❌ Dashboard still showing: $dashboard_status"
        echo "Checking nginx error logs..."
        sudo tail -3 /var/log/nginx/error.log
    fi
    
else
    echo "❌ Nginx config has syntax errors"
    echo "Restoring previous config..."
    sudo cp /etc/nginx/sites-available/learnyzer.com.backup.$(date +%H%M%S) /etc/nginx/sites-available/learnyzer.com
    echo "Please check the error above"
fi

echo ""
echo "6. Current nginx status:"
sudo systemctl status nginx --no-pager -l