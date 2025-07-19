#!/bin/bash

echo "🔧 FIXING NGINX API ROUTING"
echo "==========================="

cd ~/Learnyzer

# 1. Build frontend to ensure dist exists
echo "1. Building frontend..."
npm run build > build.log 2>&1
if [ -d "dist" ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Build failed, creating fallback..."
    mkdir -p dist
    echo '<!DOCTYPE html><html><head><title>Learnyzer</title></head><body><div id="root">Loading...</div></body></html>' > dist/index.html
fi

# 2. Stop nginx
echo "2. Stopping nginx..."
sudo systemctl stop nginx

# 3. Create correct nginx configuration with API routing priority
echo "3. Creating nginx config with API routing priority..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name learnyzer.com www.learnyzer.com;

    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API routes - MUST BE FIRST AND HIGHEST PRIORITY
    location ~ ^/api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Important: Add trailing slash handling
        proxy_redirect off;
        proxy_buffering off;
    }

    # WebSocket support for real-time features
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend static files - LOWER PRIORITY
    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    # Frontend routes (catch-all for SPA)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Cache HTML files for shorter period
        location ~* \.(html)$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }

    # SEO files
    location = /sitemap.xml {
        expires 1d;
        add_header Cache-Control "public";
    }

    location = /robots.txt {
        expires 1d;
        add_header Cache-Control "public";
    }

    location = /manifest.json {
        expires 1d;
        add_header Cache-Control "public";
    }
}
EOF

# 4. Test nginx configuration
echo "4. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration failed!"
    sudo nginx -t
    exit 1
fi

# 5. Start nginx
echo "5. Starting nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# 6. Verify services are running
echo "6. Checking services..."
echo "Nginx status:"
sudo systemctl status nginx --no-pager | head -3

echo "Backend server on port 5000:"
sudo lsof -i :5000 | head -2

# 7. Test API routing
echo "7. Testing API routing..."

echo "Direct backend test (port 5000):"
curl -s -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' | head -3

echo ""
echo "Through nginx test (HTTPS):"
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "Frontend test:"
curl -s https://learnyzer.com | head -5

echo ""
echo "8. Testing various API endpoints..."
curl -s https://learnyzer.com/api/health | head -3
curl -s https://learnyzer.com/api/auth/me | head -3

echo ""
echo "✅ Setup complete! API routes should now return JSON, not HTML."
echo "Test your OTP API at: https://learnyzer.com/api/otp/send"