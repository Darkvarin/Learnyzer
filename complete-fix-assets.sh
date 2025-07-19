#!/bin/bash

echo "COMPLETE ASSET SERVING FIX"
echo "=========================="

cd /home/ubuntu/Learnyzer

echo "1. Force clean rebuild..."
sudo rm -rf dist
sudo rm -rf node_modules/.vite
npx vite build --force

echo ""
echo "2. Set proper permissions..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type d -exec chmod 755 {} \;
find dist -type f -exec chmod 644 {} \;

echo ""
echo "3. Check built assets..."
echo "Built files:"
ls -la dist/assets/

echo ""
echo "4. Verify nginx can access files..."
nginx_user=$(ps aux | grep nginx | grep -v root | head -1 | awk '{print $1}')
echo "Nginx runs as: $nginx_user"

# Test nginx access to files
sudo -u www-data test -r /home/ubuntu/Learnyzer/dist/index.html
if [ $? -eq 0 ]; then
    echo "✅ Nginx can read index.html"
else
    echo "❌ Nginx cannot read index.html"
    sudo chmod +r /home/ubuntu/Learnyzer/dist/index.html
fi

# Make sure www-data can access directory path
sudo chmod +x /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist

echo ""
echo "5. Update nginx config for proper asset serving..."
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
    
    # Root directory
    root /home/ubuntu/Learnyzer/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Static assets with long cache
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
        proxy_cache_bypass $http_upgrade;
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
    
    # React Router support - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Optional: serve static files with appropriate headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
EOF

echo ""
echo "6. Test nginx config and restart..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo "✅ Nginx restarted successfully"
else
    echo "❌ Nginx config error"
    exit 1
fi

echo ""
echo "7. Final testing..."
sleep 2

# Test main page
main_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
echo "Main page: $main_response"

# Test dashboard  
dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
echo "Dashboard: $dashboard_response"

# Get actual asset filenames from HTML
js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
css_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.css' | head -1)

if [ -n "$js_file" ]; then
    js_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
    echo "JavaScript ($js_file): $js_response"
else
    echo "No JavaScript file reference found in HTML"
fi

if [ -n "$css_file" ]; then
    css_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$css_file")
    echo "CSS ($css_file): $css_response"
else
    echo "No CSS file reference found in HTML"
fi

echo ""
if [ "$main_response" = "200" ] && [ "$dashboard_response" = "200" ] && [ "$js_response" = "200" ] && [ "$css_response" = "200" ]; then
    echo "🚀 SUCCESS! All assets serving correctly"
    echo ""
    echo "Your Learnyzer platform should now work:"
    echo "• https://learnyzer.com/ - Homepage"
    echo "• https://learnyzer.com/dashboard - Dashboard"  
    echo "• All React routes functional"
    echo "• Assets loading properly"
    echo ""
    echo "Test in browser - the black screen should be resolved!"
else
    echo "❌ Still have issues:"
    echo "Main: $main_response, Dashboard: $dashboard_response, JS: $js_response, CSS: $css_response"
fi
EOF

chmod +x complete-fix-assets.sh