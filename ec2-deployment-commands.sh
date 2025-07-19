#!/bin/bash

echo "COMPLETE EC2 DEPLOYMENT FIX COMMANDS"
echo "===================================="

cd /home/ubuntu/Learnyzer

echo "1. FORCE CLEAN REBUILD..."
sudo rm -rf dist
sudo rm -rf node_modules/.vite
sudo rm -rf node_modules/.cache
npm run build

echo ""
echo "2. SET PROPER PERMISSIONS..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type d -exec chmod 755 {} \;
find dist -type f -exec chmod 644 {} \;
sudo chmod +x /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist

echo ""
echo "3. UPDATE NGINX CONFIG..."
sudo tee /etc/nginx/sites-available/learnyzer.com > /dev/null <<'EOF'
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
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    root /home/ubuntu/Learnyzer/dist;
    index index.html;
    
    # Static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

echo ""
echo "4. RESTART NGINX..."
sudo nginx -t && sudo systemctl restart nginx

echo ""
echo "5. TESTING DEPLOYMENT..."
sleep 3

dashboard=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
css_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.css' | head -1)

js_status=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
css_status=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$css_file")

echo "Dashboard: $dashboard"
echo "JavaScript: $js_status"
echo "CSS: $css_status"

if [ "$dashboard" = "200" ] && [ "$js_status" = "200" ] && [ "$css_status" = "200" ]; then
    echo ""
    echo "🚀 SUCCESS! Deployment working"
    echo "Visit: https://learnyzer.com/dashboard"
else
    echo ""
    echo "❌ Issues found - check logs:"
    echo "sudo tail -10 /var/log/nginx/error.log"
fi
EOF

chmod +x ec2-deployment-commands.sh