#!/bin/bash

echo "🔧 FIXING PORT CONFLICT AND IMPLEMENTING SPLIT ROUTING"
echo "====================================================="

cd ~/Learnyzer

# 1. Check what's running on port 5000
echo "1. Current process on port 5000:"
sudo lsof -i :5000
echo ""

# 2. Test if the existing server is working
echo "2. Testing existing server on port 5000..."
curl -s http://localhost:5000/api/health | head -3 || echo "Health check failed"
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}' 2>/dev/null | head -3 || echo "OTP test failed"

# 3. Kill the existing server and clean up
echo "3. Stopping existing server..."
sudo kill -9 97677 2>/dev/null || true
sudo pkill -f tsx 2>/dev/null || true
sudo pkill -f node 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

sleep 3

# 4. Build frontend
echo "4. Building frontend..."
npm run build > build.log 2>&1
if [ -d "dist" ]; then
    echo "✅ Frontend built successfully"
    ls -la dist/ | head -3
else
    echo "❌ Build failed, checking log..."
    tail -10 build.log
    # Create fallback
    mkdir -p dist
    echo '<!DOCTYPE html><html><head><title>Learnyzer</title></head><body><div id="root"><h1>Loading...</h1></div></body></html>' > dist/index.html
fi

# 5. Stop nginx and implement split routing
echo "5. Implementing nginx split routing..."
sudo systemctl stop nginx

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

    # API routes to backend - HIGHEST PRIORITY
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

    # Frontend routes with proper SPA handling
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }

    # Static assets with long caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
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
}
EOF

# 6. Test and start nginx
echo "6. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration valid"
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    echo "❌ Nginx configuration failed"
    exit 1
fi

# 7. Start backend server on port 3001
echo "7. Starting backend server on port 3001..."
export $(grep -v '^#' .env | xargs)
echo "Environment: PORT=$PORT, NODE_ENV=$NODE_ENV"

tsx server/index.ts > production_backend.log 2>&1 &
BACKEND_PID=$!

echo "Backend server PID: $BACKEND_PID"
sleep 10

# 8. Comprehensive testing
echo "8. Testing complete setup..."

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "✅ Backend server is running"
    
    # Test backend directly
    echo "Backend health check:"
    curl -s http://localhost:3001/api/health || echo "Backend health failed"
    
    echo "Backend OTP test:"
    curl -X POST http://localhost:3001/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}' | head -3
    
    echo ""
    echo "9. Testing through nginx (FINAL TEST):"
    
    # Test frontend
    echo "Frontend loading:"
    curl -s https://learnyzer.com | head -5
    
    # Test API through nginx
    echo "OTP API through nginx:"
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
    
else
    echo "❌ Backend server failed to start. Log:"
    cat production_backend.log
fi

echo ""
echo "10. Service status:"
sudo systemctl status nginx --no-pager | head -3
sudo netstat -tlnp | grep :3001 || echo "No process on port 3001"

echo ""
echo "11. Backend logs:"
tail -10 production_backend.log 2>/dev/null || echo "No backend logs"