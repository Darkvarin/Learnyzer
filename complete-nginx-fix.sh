#!/bin/bash

echo "🔧 COMPLETE NGINX FIX - SPLIT ROUTING"
echo "===================================="

cd ~/Learnyzer

# 1. Stop everything first
echo "1. Stopping services..."
sudo systemctl stop nginx
sudo pkill -f tsx 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

# 2. Build the frontend first
echo "2. Building frontend..."
npm run build

# 3. Check if dist directory exists
if [ -d "dist" ]; then
    echo "✅ Frontend built successfully"
    ls -la dist/ | head -5
else
    echo "❌ Frontend build failed - creating fallback"
    mkdir -p dist
    echo '<html><body><h1>Learnyzer</h1><p>Frontend loading...</p></body></html>' > dist/index.html
fi

# 4. Create new nginx configuration with split routing
echo "3. Creating new nginx configuration..."
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
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Backend API routes - HIGHEST PRIORITY
    location ~ ^/api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files and frontend - LOWER PRIORITY
    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 5. Test nginx configuration
echo "4. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration failed"
    exit 1
fi

# 6. Start nginx
echo "5. Starting nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# 7. Start backend server on port 3001
echo "6. Starting backend server on port 3001..."
export $(grep -v '^#' .env | xargs)
tsx server/index.ts > backend_server.log 2>&1 &
BACKEND_PID=$!

echo "Backend server PID: $BACKEND_PID"
sleep 8

# 8. Test everything
echo "7. Testing setup..."

# Test backend directly
echo "Backend API test:"
curl -s http://localhost:3001/api/health || echo "Backend health check failed"

# Test OTP API directly
echo "Backend OTP test:"
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' | head -3

echo ""
echo "8. Testing through nginx..."

# Test frontend
echo "Frontend test:"
curl -s https://learnyzer.com | head -5

# Test API through nginx
echo "API through nginx:"
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "9. Service status:"
sudo systemctl status nginx --no-pager | head -3
ps aux | grep $BACKEND_PID | grep -v grep || echo "Backend not running"

echo ""
echo "10. Backend logs:"
tail -10 backend_server.log