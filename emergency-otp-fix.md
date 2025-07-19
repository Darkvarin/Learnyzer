# Emergency OTP Fix Guide

## Problem
Nginx is returning HTML instead of JSON for `/api/otp/send` requests, indicating API routes are not being properly proxied to the backend server.

## Root Cause Analysis
1. Backend server is running correctly on port 5000 ✅
2. Direct API calls to `http://localhost:5000/api/otp/send` work ✅
3. Through nginx `https://learnyzer.com/api/otp/send` returns HTML ❌

## Solution Steps

### Step 1: Verify Backend Server
```bash
# Test backend directly
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'
```
Expected: JSON response with OTP session

### Step 2: Fix Nginx Configuration
```bash
cd ~/Learnyzer

# Stop nginx
sudo systemctl stop nginx

# Remove conflicting configurations
sudo rm -f /etc/nginx/sites-enabled/default

# Create clean configuration
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

    # API routes - HIGHEST PRIORITY
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # Frontend
    root /home/ubuntu/Learnyzer/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-enabled/

# Test and start
sudo nginx -t && sudo systemctl start nginx
```

### Step 3: Test Fix
```bash
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'
```

### Step 4: If Still Not Working
```bash
# Check nginx logs
sudo tail -20 /var/log/nginx/error.log
sudo tail -20 /var/log/nginx/access.log

# Verify no other nginx sites are interfering
ls -la /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -T | grep -A10 -B10 "location /api"
```

## Expected Final Result
```json
{
  "success": true,
  "sessionId": "dev-session-xxx",
  "message": "Development mode: Use OTP 123456 for testing"
}
```

## Troubleshooting
- If still getting HTML: Check for duplicate nginx configurations
- If 502 Bad Gateway: Backend server might be down
- If 404: API route doesn't exist in backend
- If connection refused: Port 5000 not accessible