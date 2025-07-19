#!/bin/bash

echo "STARTING NGINX WITH CLEAN CONFIG"
echo "==============================="

echo "1. Stopping any existing nginx processes..."
sudo pkill nginx 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

echo ""
echo "2. Creating minimal working nginx config..."
sudo cat > /etc/nginx/sites-available/learnyzer.com << 'EOF'
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name learnyzer.com www.learnyzer.com;

    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_private_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;

    root /home/ubuntu/Learnyzer/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

echo ""
echo "3. Testing configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration valid"
    
    echo ""
    echo "4. Starting nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    sleep 2
    
    if sudo systemctl is-active --quiet nginx; then
        echo "✅ nginx is running"
        
        echo ""
        echo "5. Testing site..."
        curl -s -o /dev/null -w "Status: %{http_code}\n" https://learnyzer.com/
        
        echo ""
        echo "Quick content check:"
        curl -s https://learnyzer.com/ | head -c 100
        
    else
        echo "❌ nginx failed to start"
        sudo systemctl status nginx --no-pager
    fi
else
    echo "❌ Configuration error:"
    sudo nginx -t
fi

echo ""
echo "Final status:"
sudo systemctl status nginx --no-pager -l | head -10
EOF

chmod +x start-nginx-clean.sh