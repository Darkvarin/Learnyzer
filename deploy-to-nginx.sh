#!/bin/bash

echo "🚀 LEARNYZER NGINX DEPLOYMENT SCRIPT"
echo "===================================="

# Configuration
DOMAIN="learnyzer.com"  # Replace with your actual domain
WEB_ROOT="/var/www/${DOMAIN}/html"
NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"
NODE_APP_PATH="/home/ubuntu/Learnyzer"  # Adjust to your actual path

echo "Setting up nginx deployment for domain: ${DOMAIN}"
echo ""

# Step 1: Create web directory
echo "📁 1. Creating web directory..."
sudo mkdir -p ${WEB_ROOT}
sudo chown -R $USER:$USER ${WEB_ROOT}
sudo chmod -R 755 ${WEB_ROOT}
echo "   ✅ Created: ${WEB_ROOT}"

# Step 2: Build frontend for production
echo ""
echo "🔨 2. Building frontend..."
cd ${NODE_APP_PATH}
npm run build
echo "   ✅ Frontend built successfully"

# Step 3: Copy built files to nginx directory
echo ""
echo "📋 3. Copying files to nginx directory..."
sudo cp -r ${NODE_APP_PATH}/dist/public/* ${WEB_ROOT}/
sudo cp ${NODE_APP_PATH}/public/sitemap.xml ${WEB_ROOT}/
sudo cp ${NODE_APP_PATH}/public/robots.txt ${WEB_ROOT}/
sudo cp ${NODE_APP_PATH}/public/manifest.json ${WEB_ROOT}/
sudo cp ${NODE_APP_PATH}/public/favicon.ico ${WEB_ROOT}/ 2>/dev/null || echo "   ⚠️  favicon.ico not found, skipping"
echo "   ✅ Files copied to ${WEB_ROOT}"

# Step 4: Create nginx configuration
echo ""
echo "⚙️  4. Creating nginx configuration..."
sudo tee ${NGINX_CONFIG} > /dev/null <<EOF
# Learnyzer nginx configuration for ${DOMAIN}
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    root ${WEB_ROOT};
    index index.html;

    # Security headers for SEO
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression for better performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # API routes - proxy to Node.js app
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # SEO files served directly
    location = /sitemap.xml {
        try_files \$uri =404;
        add_header Content-Type application/xml;
    }

    location = /robots.txt {
        try_files \$uri =404;
        add_header Content-Type text/plain;
    }

    location = /manifest.json {
        try_files \$uri =404;
        add_header Content-Type application/json;
    }

    # Main application - serve React app
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF

echo "   ✅ Nginx configuration created: ${NGINX_CONFIG}"

# Step 5: Enable the site
echo ""
echo "🔗 5. Enabling nginx site..."
sudo ln -sf ${NGINX_CONFIG} /etc/nginx/sites-enabled/
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "   ✅ Nginx configuration is valid"
    sudo systemctl reload nginx
    echo "   ✅ Nginx reloaded successfully"
else
    echo "   ❌ Nginx configuration error - please check"
    exit 1
fi

# Step 6: Start Node.js backend
echo ""
echo "🖥️  6. Starting Node.js backend..."
cd ${NODE_APP_PATH}
pm2 stop learnyzer 2>/dev/null || echo "   ℹ️  No existing PM2 process"
pm2 start npm --name "learnyzer" -- run dev
pm2 save
echo "   ✅ Node.js backend started with PM2"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================================"
echo "Your Learnyzer platform is now available at:"
echo "   🌐 http://${DOMAIN}"
echo "   🌐 http://www.${DOMAIN}"
echo ""
echo "📊 SEO URLs are ready:"
echo "   📄 Sitemap: http://${DOMAIN}/sitemap.xml"
echo "   🤖 Robots: http://${DOMAIN}/robots.txt"
echo "   📱 PWA Manifest: http://${DOMAIN}/manifest.json"
echo ""
echo "🔧 Next steps:"
echo "1. Set up SSL certificate with Let's Encrypt (certbot)"
echo "2. Update DNS A records to point to your server IP"
echo "3. Submit sitemap to Google Search Console"
echo ""
echo "✅ Your AI-powered entrance exam platform is live!"