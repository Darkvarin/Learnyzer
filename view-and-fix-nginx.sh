#!/bin/bash

echo "🔍 VIEWING CURRENT NGINX CONFIGURATION"
echo "====================================="

echo "1. Current nginx config for learnyzer.com:"
echo "----------------------------------------"
sudo cat /etc/nginx/sites-available/learnyzer.com

echo ""
echo "2. Looking for location blocks specifically:"
echo "-------------------------------------------"
sudo grep -n -A 5 -B 2 "location" /etc/nginx/sites-available/learnyzer.com

echo ""
echo "3. AUTOMATIC FIX - Adding correct SPA routing..."
echo "------------------------------------------------"

# Create the corrected nginx config
sudo cp /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-available/learnyzer.com.backup

# Create a new config with proper SPA routing
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name learnyzer.com www.learnyzer.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Root directory
    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API routes - proxy to backend
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
        proxy_read_timeout 86400;
    }

    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # React SPA routing - serve index.html for all other routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        expires off;
    }
}
EOF

echo ""
echo "4. Testing new nginx configuration..."
if sudo nginx -t; then
    echo "✅ Configuration is valid"
    
    echo ""
    echo "5. Reloading nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "6. Testing routes..."
    sleep 2
    
    homepage=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
    dashboard=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    
    echo "Homepage: $homepage"
    echo "Dashboard: $dashboard"
    
    if [ "$dashboard" = "200" ]; then
        echo ""
        echo "🚀 SUCCESS! Dashboard 404 fixed"
        echo "✅ React SPA routing now works properly"
        echo ""
        echo "Visit: https://learnyzer.com/dashboard"
    else
        echo ""
        echo "❌ Still having issues with dashboard: $dashboard"
    fi
    
else
    echo "❌ Configuration has errors - restoring backup"
    sudo cp /etc/nginx/sites-available/learnyzer.com.backup /etc/nginx/sites-available/learnyzer.com
fi