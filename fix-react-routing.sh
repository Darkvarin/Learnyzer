#!/bin/bash

echo "FIXING REACT ROUTER ISSUE"
echo "========================="

cd /home/ubuntu/Learnyzer

echo "1. The issue is that nginx isn't handling React Router properly"
echo "When you visit /dashboard, nginx looks for a file called 'dashboard' instead of serving index.html"

echo ""
echo "2. Updating nginx config to properly handle React Router..."
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

    # API routes first - before the catch-all
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    # SEO files
    location = /robots.txt {
        try_files $uri =404;
    }

    location = /sitemap.xml {
        try_files $uri =404;
    }

    # React Router catch-all - MUST be last
    # This handles all routes like /dashboard, /ai-tutor, etc.
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

echo ""
echo "3. Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Configuration valid"
    
    echo ""
    echo "4. Restarting nginx..."
    sudo systemctl restart nginx
    
    echo ""
    echo "5. Testing React Router routes..."
    sleep 2
    
    echo "Testing home page:"
    home_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
    echo "Home: $home_response"
    
    echo ""
    echo "Testing dashboard route:"
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Dashboard: $dashboard_response"
    
    if [ "$dashboard_response" = "200" ]; then
        echo ""
        echo "Checking if dashboard serves React app..."
        dashboard_content=$(curl -s https://learnyzer.com/dashboard)
        if echo "$dashboard_content" | grep -q "/assets/index-.*\.js"; then
            echo "✅ SUCCESS: Dashboard route serves React app!"
            echo "✅ All React routes should now work:"
            echo "  • /dashboard"
            echo "  • /ai-tutor" 
            echo "  • /courses"
            echo "  • /battle-zone"
            echo "  • /profile"
        else
            echo "Dashboard returns content but not React app"
            echo "$dashboard_content" | head -c 200
        fi
    else
        echo "Dashboard still returns $dashboard_response"
    fi
else
    echo "❌ nginx configuration error"
    sudo nginx -t
fi

echo ""
echo "Final status:"
echo "Backend: $(pm2 list | grep learnyzer | awk '{print $10}' || echo 'unknown')"
echo "Frontend: React app with client-side routing"
EOF

chmod +x fix-react-routing.sh