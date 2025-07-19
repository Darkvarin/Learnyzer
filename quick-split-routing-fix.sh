#!/bin/bash

echo "🚀 QUICK SPLIT ROUTING FIX"
echo "=========================="

cd ~/Learnyzer

# 1. Build frontend
echo "1. Building frontend..."
npm run build || echo "Build may have failed, continuing..."

# 2. Stop services
sudo systemctl stop nginx
sudo pkill -f tsx

# 3. Quick nginx config update
echo "2. Updating nginx config..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null << 'EOF'
server {
    listen 443 ssl http2 default_server;
    server_name learnyzer.com www.learnyzer.com;

    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;

    # API routes to backend
    location ~ ^/api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend static files
    root /home/ubuntu/Learnyzer/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$server_name$request_uri;
}
EOF

# 4. Start services
sudo nginx -t && sudo systemctl start nginx
tsx server/index.ts &

sleep 5

# 5. Test
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'