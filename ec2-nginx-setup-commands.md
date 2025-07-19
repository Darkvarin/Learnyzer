# EC2 Nginx Setup Commands for Learnyzer

## Step 1: Connect to your EC2 instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 2: Update system and install nginx
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Step 3: Create directory structure
```bash
# Replace 'learnyzer.com' with your actual domain
DOMAIN="learnyzer.com"
sudo mkdir -p /var/www/${DOMAIN}/html
sudo chown -R $USER:$USER /var/www/${DOMAIN}/html
sudo chmod -R 755 /var/www/${DOMAIN}
```

## Step 4: Build and copy your Learnyzer files
```bash
# Navigate to your Learnyzer directory (adjust path as needed)
cd /home/ubuntu/Learnyzer

# First, let's check what's available
ls -la public/

# Copy SEO files directly from public directory first
sudo cp public/sitemap.xml /var/www/${DOMAIN}/html/
sudo cp public/robots.txt /var/www/${DOMAIN}/html/
sudo cp public/manifest.json /var/www/${DOMAIN}/html/

# Build the frontend (we'll check if build works, if not we'll use dev mode)
npm run build

# If build succeeds, copy from dist/public, otherwise we'll serve via proxy
if [ -d "dist/public" ]; then
    sudo cp -r dist/public/* /var/www/${DOMAIN}/html/
    echo "✅ Using built files from dist/public"
else
    echo "⚠️  Build failed, will use development mode with nginx proxy"
    # Copy essential static files from public
    sudo cp -r public/* /var/www/${DOMAIN}/html/ 2>/dev/null || echo "Some files already copied"
fi

# Set proper permissions
sudo chown -R www-data:www-data /var/www/${DOMAIN}/html
sudo chmod -R 755 /var/www/${DOMAIN}/html
```

## Step 5: Create nginx configuration
```bash
# Create nginx site configuration
sudo tee /etc/nginx/sites-available/${DOMAIN} > /dev/null <<'EOF'
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    root /var/www/learnyzer.com/html;
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
        try_files $uri =404;
    }

    # API routes - proxy to Node.js app
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # SEO files served directly
    location = /sitemap.xml {
        try_files $uri =404;
        add_header Content-Type application/xml;
    }

    location = /robots.txt {
        try_files $uri =404;
        add_header Content-Type text/plain;
    }

    location = /manifest.json {
        try_files $uri =404;
        add_header Content-Type application/json;
    }

    # Main application - serve React app or proxy to dev server
    location / {
        try_files $uri $uri/ @fallback;
    }

    # Fallback to development server if files not found
    location @fallback {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF
```

## Step 6: Enable the site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

## Step 7: Start your Node.js backend with PM2
```bash
# Install PM2 if not already installed
sudo npm install -g pm2

# Navigate to your app directory
cd /home/ubuntu/Learnyzer

# Start your Node.js app with PM2
pm2 stop learnyzer 2>/dev/null || echo "No existing PM2 process"
pm2 start npm --name "learnyzer" -- run dev
pm2 save
pm2 startup

# Follow the instructions from pm2 startup command (usually a sudo command)
```

## Step 8: Set up SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain and email)
sudo certbot --nginx -d learnyzer.com -d www.learnyzer.com --email your-email@example.com --agree-tos --no-eff-email

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 9: Configure firewall
```bash
# Allow nginx through firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable
```

## Step 10: Verify everything is working
```bash
# Check nginx status
sudo systemctl status nginx

# Check PM2 status
pm2 status

# Check if your site is accessible
curl -I http://learnyzer.com
curl -I https://learnyzer.com

# Check SEO files
curl -I https://learnyzer.com/sitemap.xml
curl -I https://learnyzer.com/robots.txt
curl -I https://learnyzer.com/manifest.json
```

## Troubleshooting Commands

### If nginx fails to start:
```bash
# Check nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### If PM2 app is not running:
```bash
# Check PM2 logs
pm2 logs learnyzer

# Restart PM2 app
pm2 restart learnyzer
```

### If SSL certificate fails:
```bash
# Check certificate status
sudo certbot certificates

# Manual certificate renewal
sudo certbot renew
```

## Important Notes:

1. **Replace `learnyzer.com` with your actual domain** in all commands
2. **Update DNS records** - Point your domain A records to your EC2 instance IP
3. **Adjust file paths** if your Learnyzer app is in a different directory
4. **Security Groups** - Ensure your EC2 security group allows HTTP (80) and HTTPS (443) traffic

## Quick Verification:
After running all commands, your site should be accessible at:
- http://learnyzer.com (redirects to HTTPS)
- https://learnyzer.com (main site)
- https://learnyzer.com/sitemap.xml (SEO)
- https://learnyzer.com/robots.txt (SEO)

Your Learnyzer AI-powered entrance exam platform will be live with proper nginx configuration, SSL security, and SEO optimization!