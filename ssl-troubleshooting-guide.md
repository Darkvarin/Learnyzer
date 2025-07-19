# SSL Troubleshooting Guide for Learnyzer

## Current Issue
- HTTPS connections failing (port 443 not accessible)
- No SSL certificates found
- Certbot setup appears incomplete

## Diagnostic Commands to Run on EC2

```bash
# 1. Check if nginx is listening on port 443
sudo netstat -tlnp | grep :443

# 2. Check nginx configuration
sudo nginx -t

# 3. Check certbot logs for errors
sudo tail -20 /var/log/letsencrypt/letsencrypt.log

# 4. Check domain DNS resolution
nslookup learnyzer.com
dig learnyzer.com

# 5. Verify nginx sites
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/learnyzer.com
```

## Solution Steps

### Step 1: Verify Domain DNS
Your domain `learnyzer.com` must point to your EC2 instance IP address. Check with your domain registrar that:
- A record: learnyzer.com → YOUR_EC2_PUBLIC_IP
- A record: www.learnyzer.com → YOUR_EC2_PUBLIC_IP

### Step 2: Manual SSL Setup
```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate using standalone method
sudo certbot certonly --standalone --email learnyzer.ai@gmail.com --agree-tos --no-eff-email -d learnyzer.com -d www.learnyzer.com

# Start nginx
sudo systemctl start nginx

# If successful, update nginx configuration manually
```

### Step 3: Manual Nginx SSL Configuration
If certbot succeeds, update nginx config:

```bash
DOMAIN="learnyzer.com"
sudo tee /etc/nginx/sites-available/${DOMAIN} > /dev/null <<'EOF'
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name learnyzer.com www.learnyzer.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name learnyzer.com www.learnyzer.com;
    root /var/www/learnyzer.com/html;
    index index.html;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/learnyzer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learnyzer.com/privkey.pem;

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

    # Static assets
    location ~* \.(png|jpg|jpeg|gif|ico|svg|css|js)$ {
        try_files $uri @proxy;
        expires 1y;
    }

    # Everything else to Node.js
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

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

## Alternative: Continue with HTTP Only

If SSL proves difficult, your platform is already working perfectly on HTTP:

```bash
# Test HTTP endpoints (these should work)
curl -I http://learnyzer.com/
curl -I http://learnyzer.com/sitemap.xml
curl -I http://learnyzer.com/robots.txt
curl -I http://learnyzer.com/manifest.json
```

Your Learnyzer platform is functional and students can access it via HTTP while you troubleshoot SSL.