#!/bin/bash

echo "🔒 SSL CERTIFICATE SETUP FOR LEARNYZER"
echo "======================================"

DOMAIN="learnyzer.com"  # Replace with your actual domain
EMAIL="admin@learnyzer.com"  # Replace with your email

echo "Setting up SSL certificate for: ${DOMAIN}"
echo ""

# Install Certbot if not already installed
echo "📦 1. Installing Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily
echo ""
echo "⏸️  2. Stopping nginx temporarily..."
sudo systemctl stop nginx

# Obtain SSL certificate
echo ""
echo "🔐 3. Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    -d ${DOMAIN} \
    -d www.${DOMAIN}

# Update nginx configuration for SSL
echo ""
echo "⚙️  4. Updating nginx configuration for SSL..."
sudo tee /etc/nginx/sites-available/${DOMAIN} > /dev/null <<EOF
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    root /var/www/${DOMAIN}/html;
    index index.html;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers for better SEO ranking
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

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

# WWW to non-WWW redirect (SEO best practice)
server {
    listen 443 ssl http2;
    server_name www.${DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    return 301 https://${DOMAIN}\$request_uri;
}
EOF

# Test nginx configuration
echo ""
echo "🧪 5. Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Nginx configuration is valid"
    
    # Start nginx
    echo ""
    echo "🚀 6. Starting nginx with SSL..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    echo "   ✅ Nginx started successfully"
    
    # Set up auto-renewal
    echo ""
    echo "🔄 7. Setting up auto-renewal..."
    sudo crontab -l > mycron 2>/dev/null || touch mycron
    echo "0 12 * * * /usr/bin/certbot renew --quiet" >> mycron
    sudo crontab mycron
    rm mycron
    
    echo "   ✅ Auto-renewal configured"
    
    echo ""
    echo "🎉 SSL SETUP COMPLETE!"
    echo "======================"
    echo "Your Learnyzer platform is now available with SSL at:"
    echo "   🔒 https://${DOMAIN}"
    echo "   🔒 https://www.${DOMAIN}"
    echo ""
    echo "📊 SEO URLs with SSL:"
    echo "   📄 Sitemap: https://${DOMAIN}/sitemap.xml"
    echo "   🤖 Robots: https://${DOMAIN}/robots.txt"
    echo "   📱 PWA Manifest: https://${DOMAIN}/manifest.json"
    echo ""
    echo "✅ Your platform now has:"
    echo "   • SSL/TLS encryption for better SEO ranking"
    echo "   • HTTP to HTTPS redirects"
    echo "   • Security headers for protection"
    echo "   • Auto-renewal of certificates"
    
else
    echo "   ❌ Nginx configuration error - please check"
    exit 1
fi