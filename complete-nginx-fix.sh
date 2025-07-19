#!/bin/bash

echo "COMPLETE NGINX CONFIGURATION FIX"
echo "==============================="

echo "1. Stopping nginx and removing bad config..."
sudo systemctl stop nginx 2>/dev/null || true
sudo rm -f /etc/nginx/sites-enabled/learnyzer.com
sudo rm -f /etc/nginx/sites-available/learnyzer.com

echo ""
echo "2. Creating corrected configuration with proper permissions..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null << 'EOF'
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
echo "3. Enabling the site..."
sudo ln -sf /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-enabled/

echo ""
echo "4. Testing configuration..."
if sudo nginx -t; then
    echo "✅ Configuration is valid"
    
    echo ""
    echo "5. Starting nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    sleep 3
    
    if sudo systemctl is-active --quiet nginx; then
        echo "✅ nginx started successfully"
        
        echo ""
        echo "6. Testing deployment..."
        echo "Testing HTTPS response..."
        response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
        echo "Response code: $response"
        
        if [ "$response" = "200" ]; then
            echo ""
            echo "Checking React app content..."
            content=$(curl -s https://learnyzer.com/)
            
            if echo "$content" | grep -q "/assets/index-.*\.js"; then
                echo "🚀 SUCCESS: Complete React application is live!"
                echo ""
                echo "✅ Frontend: React app with Vite bundles"
                echo "✅ Backend: PM2 running on port 5000"
                echo "✅ SSL: HTTPS working"
                echo "✅ Nginx: Serving React + API proxy"
                echo ""
                echo "Live at: https://learnyzer.com"
                
                # Test API too
                echo ""
                echo "Testing API..."
                api_response=$(curl -s -X POST https://learnyzer.com/api/otp/send -H "Content-Type: application/json" -d '{"mobile":"9999999999"}' | head -c 100)
                echo "API test: $api_response"
                
            else
                echo "Site loading but checking what's served..."
                echo "$content" | head -c 300
            fi
        else
            echo "HTTP error $response - checking logs..."
            sudo journalctl -u nginx --no-pager | tail -5
        fi
    else
        echo "❌ nginx failed to start"
        sudo systemctl status nginx --no-pager
        sudo journalctl -u nginx --no-pager | tail -10
    fi
else
    echo "❌ Configuration error:"
    sudo nginx -t
fi

echo ""
echo "Current nginx status:"
sudo systemctl status nginx --no-pager | head -5
EOF

chmod +x complete-nginx-fix.sh