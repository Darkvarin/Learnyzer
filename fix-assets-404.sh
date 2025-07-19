#!/bin/bash

echo "FIXING ASSETS 404 ERROR"
echo "======================="

cd /home/ubuntu/Learnyzer

echo "1. The issue: JavaScript files exist but nginx returns 404"
echo "File exists: $(ls -la dist/assets/index-*.js)"
echo "But web returns 404 - this is an nginx configuration issue"

echo ""
echo "2. Fixing nginx asset serving..."
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

    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    # API routes first
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Assets directory - serve directly with proper headers
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        try_files $uri =404;
    }

    # Other static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    # React Router catch-all
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

echo ""
echo "3. Testing and restarting nginx..."
if sudo nginx -t; then
    echo "✅ Configuration valid"
    sudo systemctl restart nginx
    
    echo ""
    echo "4. Testing asset access after fix..."
    sleep 2
    
    js_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/assets/index-DJYFKmCi.js)
    echo "JavaScript file: $js_response"
    
    css_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/assets/index-DfcCqErM.css)
    echo "CSS file: $css_response"
    
    if [ "$js_response" = "200" ] && [ "$css_response" = "200" ]; then
        echo ""
        echo "✅ SUCCESS: Assets are now accessible!"
        echo ""
        echo "5. Testing dashboard page..."
        dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
        echo "Dashboard: $dashboard_response"
        
        if [ "$dashboard_response" = "200" ]; then
            echo ""
            echo "🚀 COMPLETE SUCCESS!"
            echo "✅ React app HTML served correctly"
            echo "✅ JavaScript bundles accessible" 
            echo "✅ CSS bundles accessible"
            echo "✅ React Router working"
            echo ""
            echo "Your Learnyzer platform should now work completely:"
            echo "• Home page: https://learnyzer.com"
            echo "• Dashboard: https://learnyzer.com/dashboard"
            echo "• AI Tutor: https://learnyzer.com/ai-tutor"
            echo "• Battle Zone: https://learnyzer.com/battle-zone"
            echo "• All other React routes"
        fi
    else
        echo "❌ Assets still not accessible"
        echo "Checking file permissions..."
        ls -la dist/assets/ | head -3
    fi
else
    echo "❌ nginx configuration error"
    sudo nginx -t
fi

echo ""
echo "Backend status:"
pm2 list | grep learnyzer || echo "Backend status unknown"
EOF

chmod +x fix-assets-404.sh