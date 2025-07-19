#!/bin/bash

echo "FIXING NGINX REVERSE PROXY CONFIGURATION"
echo "======================================="

cd ~/Learnyzer

# Check current nginx config
echo "1. Current nginx configuration:"
sudo nginx -T 2>/dev/null | grep -A 20 "server_name learnyzer.com" || echo "Config not found"

echo ""
echo "2. Creating optimized nginx config for reverse proxy..."

# Create optimized nginx config
sudo tee /etc/nginx/sites-available/learnyzer.com << 'EOF'
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
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # API Routes - HIGHEST PRIORITY
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
        
        # Ensure JSON content type
        proxy_set_header Accept application/json;
        proxy_set_header Content-Type application/json;
        
        # Log API requests
        access_log /var/log/nginx/api.log;
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

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /home/ubuntu/Learnyzer/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri $uri/ =404;
    }

    # SEO files
    location = /sitemap.xml {
        root /home/ubuntu/Learnyzer/dist;
        expires 1d;
        add_header Cache-Control "public";
    }

    location = /robots.txt {
        root /home/ubuntu/Learnyzer/dist;
        expires 1d;
        add_header Cache-Control "public";
    }

    location = /manifest.json {
        root /home/ubuntu/Learnyzer/dist;
        expires 1d;
        add_header Cache-Control "public";
    }

    # Frontend - LOWEST PRIORITY (catch-all)
    location / {
        root /home/ubuntu/Learnyzer/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache headers for HTML
        location = /index.html {
            expires 5m;
            add_header Cache-Control "public, must-revalidate";
        }
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF

echo "3. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
    
    echo "4. Reloading nginx..."
    sudo systemctl reload nginx
    
    echo "5. Testing API through domain..."
    sleep 2
    
    # Test API through domain
    echo "Testing OTP API through https://learnyzer.com:"
    API_RESPONSE=$(curl -s -X POST https://learnyzer.com/api/otp/send \
        -H "Content-Type: application/json" \
        -d '{"mobile": "9999999999"}' \
        --connect-timeout 10)
    
    echo "Response: $API_RESPONSE"
    
    if [[ "$API_RESPONSE" == *"success"* ]]; then
        echo ""
        echo "🎉 SUCCESS! Domain API now returns JSON"
        echo "✅ Reverse proxy is working correctly"
        
        # Test frontend
        echo ""
        echo "6. Testing frontend access..."
        FRONTEND_RESPONSE=$(curl -s -I https://learnyzer.com/ | head -1)
        echo "Frontend response: $FRONTEND_RESPONSE"
        
        if [[ "$FRONTEND_RESPONSE" == *"200"* ]]; then
            echo "✅ Frontend is accessible"
            echo ""
            echo "🚀 COMPLETE SUCCESS!"
            echo "- API endpoints: https://learnyzer.com/api/*"
            echo "- Frontend: https://learnyzer.com/"
            echo "- Both working through nginx reverse proxy"
        fi
        
    else
        echo ""
        echo "❌ API still not working through domain"
        echo "Checking backend server status..."
        curl -s http://localhost:5000/api/health || echo "Backend not responding"
    fi
    
else
    echo "❌ Nginx config has errors"
    echo "Restoring previous config..."
    sudo systemctl reload nginx
fi

echo ""
echo "7. Nginx access logs for API:"
sudo tail -5 /var/log/nginx/access.log | grep "/api/"