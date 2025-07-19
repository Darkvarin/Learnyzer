# PRODUCTION FIX COMMANDS FOR EC2 SERVER

Run these commands on your EC2 server to fix the React routing and build path issues:

## 1. Check where index.html actually is

```bash
cd /home/ubuntu/Learnyzer
find dist -name "index.html" -type f
ls -la dist/
ls -la dist/public/ 2>/dev/null || echo "dist/public doesn't exist"
```

## 2. Update nginx to serve from correct path (dist/ not dist/public/)

```bash
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
    
    # CORRECTED: Serve from dist/ where index.html actually is
    root /home/ubuntu/Learnyzer/dist;
    index index.html;
    
    # Static assets with caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API routes to backend on port 5000
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # CRITICAL: React/Wouter SPA routing support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
```

## 3. Test and restart nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 4. Rebuild and set permissions

```bash
cd /home/ubuntu/Learnyzer
npm run build
sudo chown -R ubuntu:ubuntu dist/
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;
```

## 5. Remove Replit development artifacts

```bash
sed -i '/replit/d' dist/index.html
```

## 6. Test the fix

```bash
sleep 3
curl -s -o /dev/null -w "Dashboard: %{http_code}\n" https://learnyzer.com/dashboard

# Test JS and CSS loading
js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
if [ -n "$js_file" ]; then
    curl -s -o /dev/null -w "JavaScript: %{http_code}\n" "https://learnyzer.com$js_file"
fi

css_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.css' | head -1)
if [ -n "$css_file" ]; then
    curl -s -o /dev/null -w "CSS: %{http_code}\n" "https://learnyzer.com$css_file"
fi

curl -s -o /dev/null -w "API: %{http_code}\n" https://learnyzer.com/api/auth/me
```

## Expected Results

- All responses should return 200
- Visit https://learnyzer.com/dashboard
- Dashboard should load without flashing or going black
- React routing should work properly

## If Still Having Issues

Check browser console (F12 → Console) for specific JavaScript errors and share them.