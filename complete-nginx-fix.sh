#!/bin/bash

echo "🚀 COMPLETE NGINX FIX FOR LEARNYZER.COM OTP"
echo "=========================================="

# Step 1: Ensure backend is running
echo "1. Checking and starting backend..."
if ! pm2 list | grep -q "learnyzer.*online"; then
    cd /home/ubuntu/Learnyzer
    pm2 start ecosystem.config.js --env production
    sleep 3
fi

# Step 2: Create proper nginx configuration
echo "2. Creating proper nginx configuration..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$server_name$request_uri;
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
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Root directory for static files
    root /home/ubuntu/Learnyzer/dist/public;
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
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SEO files
    location = /sitemap.xml {
        try_files $uri $uri/ =404;
        add_header Content-Type application/xml;
    }

    location = /robots.txt {
        try_files $uri $uri/ =404;
        add_header Content-Type text/plain;
    }

    location = /manifest.json {
        try_files $uri $uri/ =404;
        add_header Content-Type application/json;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF

# Step 3: Enable site and test
echo "3. Enabling site and testing configuration..."
sudo ln -sf /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-enabled/
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "4. Restarting nginx..."
    sudo systemctl restart nginx
    
    echo "5. Testing OTP API..."
    sleep 3
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
      
    echo ""
    echo "🎉 Complete nginx configuration deployed!"
else
    echo "❌ nginx configuration has errors"
fi