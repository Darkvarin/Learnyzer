#!/bin/bash

echo "FIXING NGINX SSL DIRECTIVE ERROR"
echo "==============================="

echo "1. Creating corrected nginx configuration..."
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
    ssl_certificate_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;

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

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
EOF

echo ""
echo "2. Testing corrected configuration..."
if sudo nginx -t; then
    echo "✅ Configuration is now valid"
    
    echo ""
    echo "3. Starting nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    sleep 2
    
    if sudo systemctl is-active --quiet nginx; then
        echo "✅ nginx started successfully"
        
        echo ""
        echo "4. Testing deployment..."
        response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
        echo "Site response: $response"
        
        if [ "$response" = "200" ]; then
            echo ""
            echo "Checking if React app is loaded..."
            if curl -s https://learnyzer.com/ | grep -q "/assets/index-.*\.js"; then
                echo "🚀 SUCCESS: Complete React application is live!"
                echo ""
                echo "Your Learnyzer platform features:"
                echo "• AI Tutor with GPT-4o"
                echo "• Visual Learning Laboratory"  
                echo "• Battle Zone 2.0"
                echo "• Course Management"
                echo "• User Authentication"
                echo "• All 7 competitive exams"
                echo ""
                echo "Live at: https://learnyzer.com"
            else
                echo "Site loading but checking content..."
                curl -s https://learnyzer.com/ | head -c 200
            fi
        fi
    else
        echo "❌ nginx failed to start"
        sudo systemctl status nginx --no-pager
    fi
else
    echo "❌ Configuration still has errors:"
    sudo nginx -t
fi

echo ""
echo "Backend status:"
pm2 list | grep learnyzer || echo "PM2 backend status unknown"
EOF

chmod +x fix-nginx-ssl-directive.sh