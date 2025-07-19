#!/bin/bash

echo "🚀 PRODUCTION NGINX ROUTING FIX"
echo "==============================="

cd ~/Learnyzer

# 1. Stop current server
echo "1. Stopping current server..."
sudo pkill -f tsx
sudo fuser -k 5000/tcp 2>/dev/null

# 2. Update .env to use port 3001 (different from nginx expectations)
echo "2. Updating .env for production port 3001..."
cp .env .env.backup
sed -i 's/PORT=5000/PORT=3001/' .env
sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env

echo "Updated .env:"
grep -E "(PORT|NODE_ENV)" .env

# 3. Create fixed nginx configuration
echo "3. Creating fixed nginx configuration..."
sudo cp /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-available/learnyzer.com.backup

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
    
    # API routes - Higher priority than static files
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

    # Frontend routes - Lower priority
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
    }
}
EOF

# 4. Test nginx configuration
echo "4. Testing nginx configuration..."
sudo nginx -t

# 5. Restart nginx
echo "5. Restarting nginx..."
sudo systemctl restart nginx

# 6. Start server on port 3001 in production mode
echo "6. Starting production server on port 3001..."
tsx server/index.ts > production_server.log 2>&1 &
PROD_PID=$!

echo "Production server PID: $PROD_PID"
sleep 8

# 7. Test API endpoints
echo "7. Testing OTP API..."
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

echo ""
echo "8. Testing health endpoint..."
curl -s https://learnyzer.com/api/health

echo ""
echo "9. Production server logs:"
tail -10 production_server.log

echo ""
echo "10. Nginx access logs:"
sudo tail -5 /var/log/nginx/access.log