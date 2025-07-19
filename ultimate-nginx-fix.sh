#!/bin/bash

echo "🔧 ULTIMATE NGINX FIX"
echo "===================="

cd ~/Learnyzer

# 1. Stop nginx and all servers
echo "1. Stopping nginx and servers..."
sudo systemctl stop nginx
sudo pkill -f tsx 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

# 2. Create completely new nginx config that definitely works
echo "2. Creating new nginx configuration..."
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

    # All requests go to Node.js server - no static file conflicts
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 3. Test and start nginx
echo "3. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
    sudo systemctl start nginx
    sudo systemctl status nginx --no-pager | head -3
else
    echo "❌ Nginx config failed"
    exit 1
fi

# 4. Start server on port 3001
echo "4. Starting server on port 3001..."
export $(grep -v '^#' .env | xargs)
tsx server/index.ts > ultimate_server.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
sleep 10

# 5. Test everything
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ Server is running"
    
    echo "5. Testing local server..."
    curl -s http://localhost:3001/api/health | head -3
    
    echo "6. Testing OTP API locally..."
    curl -X POST http://localhost:3001/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}' | head -3
    
    echo ""
    echo "7. Testing through nginx (FINAL TEST)..."
    curl -X POST https://learnyzer.com/api/otp/send \
      -H "Content-Type: application/json" \
      -d '{"mobile": "9999999999"}'
    
    echo ""
    echo "8. Website test..."
    curl -s https://learnyzer.com | head -10
    
else
    echo "❌ Server failed to start. Log:"
    cat ultimate_server.log
fi