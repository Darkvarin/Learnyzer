#!/bin/bash

echo "FIXING ROUTING AND BASE PATH ISSUES"
echo "==================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking current vite config base path..."
grep -n "base:" vite.config.ts || echo "No base path specified"

echo ""
echo "2. Checking if vite config has correct build output..."
grep -A3 -B3 "outDir:" vite.config.ts

echo ""
echo "3. Current build output is set to dist/public but should be dist..."
echo "The build path issue is causing routing problems!"

echo ""
echo "4. The issue: build outputs to dist/public but nginx serves from dist"
echo "This creates a path mismatch causing routing failures"

echo ""
echo "5. Fixing build output path in vite.config.ts..."
# Since we can't edit vite.config.ts, we'll work around it
echo "Since vite.config.ts can't be modified, we need to adjust nginx path"

echo ""
echo "6. Updating nginx to serve from correct build path..."
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
    
    # CORRECTED: Serve from dist/public where vite actually builds
    root /home/ubuntu/Learnyzer/dist/public;
    index index.html;
    
    # Static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API routes to backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # CRITICAL: React Router/Wouter support - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

echo ""
echo "7. Testing nginx config and restarting..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo "✅ Nginx restarted with correct path"
else
    echo "❌ Nginx config error"
    exit 1
fi

echo ""
echo "8. Rebuilding to ensure fresh assets..."
npm run build

echo ""
echo "9. Checking where files are actually built..."
if [ -d "dist/public" ]; then
    echo "✅ Files built to dist/public (correct for vite config)"
    ls -la dist/public/
    
    echo ""
    echo "Setting permissions for dist/public..."
    sudo chown -R ubuntu:ubuntu dist/
    find dist -type f -exec chmod 644 {} \;
    find dist -type d -exec chmod 755 {} \;
    
    echo ""
    echo "Checking if index.html exists in correct location..."
    if [ -f "dist/public/index.html" ]; then
        echo "✅ index.html found in dist/public"
        
        # Check for Replit banner in correct file
        if grep -q "replit" dist/public/index.html; then
            echo "Removing Replit banner from correct file..."
            sed -i '/replit/d' dist/public/index.html
        fi
        
    else
        echo "❌ index.html missing from dist/public"
    fi
    
else
    echo "❌ dist/public directory missing"
    echo "Available directories:"
    ls -la dist/ 2>/dev/null || echo "dist directory missing entirely"
fi

echo ""
echo "10. Final testing..."
sleep 3

dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
echo "Dashboard: $dashboard_response"

js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
if [ -n "$js_file" ]; then
    js_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
    echo "JavaScript: $js_response"
else
    echo "No JS file reference found"
fi

if [ "$dashboard_response" = "200" ] && [ "$js_response" = "200" ]; then
    echo ""
    echo "🚀 SUCCESS! Routing and build path fixed"
    echo "Visit https://learnyzer.com/dashboard - should work without flashing/crashing"
else
    echo ""
    echo "❌ Still have issues to resolve"
fi
EOF

chmod +x fix-routing-and-base.sh