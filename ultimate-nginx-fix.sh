#!/bin/bash

echo "🚀 ULTIMATE NGINX FIX FOR LEARNYZER.COM"
echo "====================================="

# Step 1: Ensure backend is running properly
echo "1. Ensuring backend is running..."
cd /home/ubuntu/Learnyzer

# Kill any existing processes on port 5000
sudo fuser -k 5000/tcp 2>/dev/null

# Start fresh backend
pm2 delete learnyzer 2>/dev/null
pm2 start ecosystem.config.js --env production
sleep 5

echo "Backend status:"
pm2 status

# Step 2: Remove any conflicting nginx configs
echo ""
echo "2. Cleaning nginx configuration..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/learnyzer.com

# Step 3: Create completely new nginx config
echo "3. Creating new nginx configuration..."
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

    # Logging
    access_log /var/log/nginx/learnyzer_access.log;
    error_log /var/log/nginx/learnyzer_error.log;

    # API routes - HIGHEST PRIORITY
    location /api/ {
        # Force proxy to backend
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        # Disable any caching for API
        proxy_cache off;
        proxy_buffering off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files root
    root /home/ubuntu/Learnyzer/dist/public;
    index index.html;

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SEO files
    location ~* \.(xml|txt|json)$ {
        try_files $uri =404;
    }

    # All other routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Step 4: Enable site
echo "4. Enabling site..."
sudo ln -s /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-enabled/

# Step 5: Test and restart nginx
echo "5. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ nginx config is valid"
    
    # Restart nginx completely
    echo "6. Restarting nginx..."
    sudo systemctl stop nginx
    sleep 2
    sudo systemctl start nginx
    
    # Wait for services to be ready
    echo "7. Waiting for services..."
    sleep 5
    
    # Test backend directly
    echo "8. Testing backend directly..."
    BACKEND_RESPONSE=$(curl -s -X POST http://127.0.0.1:5000/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}')
    
    echo "Backend response: $BACKEND_RESPONSE"
    
    # Test through nginx
    echo "9. Testing through nginx..."
    NGINX_RESPONSE=$(curl -s -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}')
    
    echo "nginx response:"
    echo "$NGINX_RESPONSE" | head -5
    
    if echo "$NGINX_RESPONSE" | grep -q "success\|error"; then
        echo ""
        echo "🎉 SUCCESS! OTP API is now working correctly!"
        echo "✅ Mobile registration should work on learnyzer.com"
    else
        echo ""
        echo "❌ Still getting HTML - checking logs..."
        sudo tail -10 /var/log/nginx/learnyzer_error.log
    fi
    
else
    echo "❌ nginx configuration has errors"
    sudo nginx -t
fi

echo ""
echo "📋 Service Status:"
echo "- nginx: $(sudo systemctl is-active nginx)"
echo "- Backend: $(pm2 list | grep learnyzer | awk '{print $12}')"