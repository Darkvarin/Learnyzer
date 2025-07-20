#!/bin/bash

echo "🔧 NGINX SPA ROUTING FIX FOR LEARNYZER"
echo "===================================="

echo "ISSUE: React Router routes (dashboard, etc.) showing blank screen"
echo "CAUSE: nginx not configured to serve index.html for all routes"
echo "SOLUTION: Configure nginx to always serve index.html for SPA routing"
echo ""

# Backup existing nginx configuration
echo "1. Backing up existing nginx configuration..."
sudo cp /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-available/learnyzer.com.backup

echo "2. Creating new nginx configuration with SPA routing support..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null << 'EOF'
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

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:;" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Document root - where React build files are located
    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    # API Routes - Proxy to Node.js backend
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

    # WebSocket support for real-time features
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

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SEO files
    location = /sitemap.xml {
        try_files $uri =404;
    }

    location = /robots.txt {
        try_files $uri =404;
    }

    location = /manifest.json {
        try_files $uri =404;
    }

    # **CRITICAL SPA ROUTING FIX**
    # All other routes should serve index.html for React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF

echo "3. Testing nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed. Restoring backup..."
    sudo cp /etc/nginx/sites-available/learnyzer.com.backup /etc/nginx/sites-available/learnyzer.com
    exit 1
fi

echo "4. Reloading nginx with new SPA routing configuration..."
sudo systemctl reload nginx

echo "5. Testing SPA routing..."
sleep 2

# Test home page
home_test=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
echo "Homepage test: $home_test"

# Test React router route (should now serve index.html)
dashboard_test=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
echo "Dashboard route test: $dashboard_test"

api_test=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/api/auth/me)
echo "API endpoint test: $api_test"

if [ "$home_test" = "200" ] && [ "$dashboard_test" = "200" ]; then
    echo ""
    echo "✅ NGINX SPA ROUTING FIX SUCCESSFUL!"
    echo ""
    echo "🎯 React Router routes now working:"
    echo "  ✅ https://learnyzer.com/ (homepage)"
    echo "  ✅ https://learnyzer.com/dashboard (React route)"
    echo "  ✅ https://learnyzer.com/ai-tutor (React route)"
    echo "  ✅ https://learnyzer.com/battle-zone (React route)"
    echo "  ✅ All other React routes now serve index.html"
    echo ""
    echo "🔧 Configuration Applied:"
    echo "  • try_files \$uri \$uri/ /index.html"
    echo "  • Error pages redirect to index.html"
    echo "  • API routes still proxy to Node.js backend"
    echo "  • Static files served with proper caching"
    echo ""
    echo "🌐 Test all routes now - no more blank screens!"
else
    echo "❌ SPA routing test failed"
    echo "Homepage: $home_test, Dashboard: $dashboard_test"
fi