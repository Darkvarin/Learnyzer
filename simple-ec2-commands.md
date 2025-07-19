# Simple EC2 Deployment Commands (Fixed File Paths)

## 🚀 Quick nginx setup for Learnyzer

Run these commands on your EC2 instance:

### 1. Install nginx and setup directory
```bash
# Connect to your EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install nginx
sudo apt update && sudo apt install nginx -y
sudo systemctl enable nginx && sudo systemctl start nginx

# Create domain directory
DOMAIN="learnyzer.com"  # Change to your domain
sudo mkdir -p /var/www/${DOMAIN}/html
sudo chown -R $USER:$USER /var/www/${DOMAIN}/html
```

### 2. Copy SEO files (they exist in public/)
```bash
cd /home/ubuntu/Learnyzer  # Adjust path if needed

# Copy the SEO files that exist
sudo cp public/sitemap.xml /var/www/${DOMAIN}/html/
sudo cp public/robots.txt /var/www/${DOMAIN}/html/
sudo cp public/manifest.json /var/www/${DOMAIN}/html/

# Copy other public assets
sudo cp -r public/images /var/www/${DOMAIN}/html/ 2>/dev/null || echo "No images folder"
sudo cp public/*.png /var/www/${DOMAIN}/html/ 2>/dev/null || echo "No PNG files"
sudo cp public/*.svg /var/www/${DOMAIN}/html/ 2>/dev/null || echo "No SVG files"
sudo cp public/*.ico /var/www/${DOMAIN}/html/ 2>/dev/null || echo "No ICO files"

# Create a simple index.html for now
sudo tee /var/www/${DOMAIN}/html/index.html > /dev/null <<'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>Learnyzer - Redirecting...</title>
    <meta http-equiv="refresh" content="0;url=http://localhost:5000">
</head>
<body>
    <p>Redirecting to Learnyzer...</p>
    <script>window.location.href='http://localhost:5000';</script>
</body>
</html>
HTML
```

### 3. Create nginx configuration
```bash
# Create nginx config
sudo tee /etc/nginx/sites-available/${DOMAIN} > /dev/null <<'EOF'
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;

    # Serve SEO files directly from nginx
    location = /sitemap.xml {
        root /var/www/learnyzer.com/html;
        try_files $uri =404;
        add_header Content-Type application/xml;
    }

    location = /robots.txt {
        root /var/www/learnyzer.com/html;
        try_files $uri =404;
        add_header Content-Type text/plain;
    }

    location = /manifest.json {
        root /var/www/learnyzer.com/html;
        try_files $uri =404;
        add_header Content-Type application/json;
    }

    # Serve static assets from nginx
    location ~* \.(png|jpg|jpeg|gif|ico|svg|css|js|woff|woff2|ttf|eot)$ {
        root /var/www/learnyzer.com/html;
        try_files $uri @proxy;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Everything else goes to Node.js app
    location @proxy {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Default - proxy everything to Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || echo "Default already removed"
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Start your Node.js backend
```bash
cd /home/ubuntu/Learnyzer

# Install PM2 if needed
sudo npm install -g pm2

# Start the app
pm2 stop learnyzer 2>/dev/null || echo "Starting fresh"
pm2 start npm --name "learnyzer" -- run dev
pm2 save
pm2 startup
```

### 5. Test your deployment
```bash
# Check status
sudo systemctl status nginx
pm2 status

# Test URLs
curl -I http://learnyzer.com/sitemap.xml
curl -I http://learnyzer.com/robots.txt
curl -I http://learnyzer.com/manifest.json
curl -I http://learnyzer.com/
```

### 6. Setup SSL (optional)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d learnyzer.com -d www.learnyzer.com
```

## ✅ What this setup does:

1. **SEO Files Working**: Your sitemap.xml, robots.txt, and manifest.json are served directly from nginx
2. **Static Assets**: Images and other assets served efficiently from nginx  
3. **Main App**: All other traffic proxied to your Node.js app on port 5000
4. **No Build Issues**: Bypasses the build problem by using development mode with nginx proxy

Your Learnyzer platform will be accessible at your domain with proper SEO files served correctly!