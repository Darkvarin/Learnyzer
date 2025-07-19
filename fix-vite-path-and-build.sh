#!/bin/bash

echo "FIXING VITE BUILD PATH AND NGINX CONFIGURATION"
echo "=============================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking actual build output locations..."
echo "Contents of dist/:"
ls -la dist/ 2>/dev/null || echo "dist/ doesn't exist"

echo ""
echo "Contents of dist/public/:"
ls -la dist/public/ 2>/dev/null || echo "dist/public/ doesn't exist"

echo ""
echo "2. Building fresh to see where files actually go..."
npm run build

echo ""
echo "3. After build - checking locations again..."
echo "dist/ contents:"
ls -la dist/ | head -10

echo ""
echo "dist/public/ contents:"
ls -la dist/public/ 2>/dev/null | head -10 || echo "dist/public/ empty or missing"

echo ""
echo "4. Finding where index.html actually is..."
find dist -name "index.html" -type f

echo ""
echo "5. Since index.html is in dist/, updating nginx to serve from dist/..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null <<'EOF'
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
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # CORRECTED: Serve from dist/ where index.html actually is
    root /home/ubuntu/Learnyzer/dist;
    index index.html;
    
    # Static assets with caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API routes to backend on port 5000
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
    
    # CRITICAL: React/Wouter SPA routing support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
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
    gzip_proxied expired no-cache no-store private must-revalidate max-age=0;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

echo ""
echo "6. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config valid"
    
    echo ""
    echo "7. Restarting nginx..."
    sudo systemctl restart nginx
    
    echo ""
    echo "8. Setting correct permissions..."
    sudo chown -R ubuntu:ubuntu dist/
    find dist -type f -exec chmod 644 {} \;
    find dist -type d -exec chmod 755 {} \;
    
    echo ""
    echo "9. Removing any Replit development artifacts..."
    if [ -f "dist/index.html" ]; then
        sed -i '/replit/d' dist/index.html
        echo "Removed Replit references from index.html"
    fi
    
    echo ""
    echo "10. Testing deployment..."
    sleep 3
    
    # Test main routes
    home_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    
    echo "Home: $home_response"
    echo "Dashboard: $dashboard_response"
    
    # Test if JS and CSS are loading
    js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
    css_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.css' | head -1)
    
    if [ -n "$js_file" ]; then
        js_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
        echo "JavaScript: $js_response"
    else
        echo "No JS file found in HTML"
    fi
    
    if [ -n "$css_file" ]; then
        css_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$css_file")
        echo "CSS: $css_response"
    else
        echo "No CSS file found in HTML"
    fi
    
    # Test API
    api_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/api/auth/me)
    echo "API: $api_response"
    
    echo ""
    if [ "$dashboard_response" = "200" ] && [ "$js_response" = "200" ] && [ "$api_response" = "200" ]; then
        echo "🚀 SUCCESS! All components working"
        echo "Visit https://learnyzer.com/dashboard"
        echo "The dashboard should now load without flashing or crashing"
    else
        echo "❌ Some components still failing"
        echo "Check individual responses above"
    fi
    
else
    echo "❌ Nginx configuration error"
    sudo nginx -t
fi

echo ""
echo "11. Quick HTML preview to verify structure..."
if [ -f "dist/index.html" ]; then
    echo "index.html preview:"
    head -20 dist/index.html | grep -E "(title|script|div|body)"
else
    echo "❌ index.html not found in dist/"
fi
EOF

chmod +x fix-vite-path-and-build.sh