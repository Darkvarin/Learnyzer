# EMERGENCY OTP FIX FOR LEARNYZER.COM

## Quick Commands for Server 3.109.251.7

```bash
# Connect to your server
ssh ubuntu@3.109.251.7

# 1. Fix nginx upstream
sudo sed -i 's/server app:5000;/server 127.0.0.1:5000;/' /etc/nginx/sites-available/learnyzer.com

# 2. Reload nginx
sudo nginx -t && sudo systemctl reload nginx

# 3. Test OTP API
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'
```

## Expected Success Response
```json
{"success":true,"sessionId":"dev-session-xxx","message":"Development mode: Use OTP 123456 for testing"}
```

## If Still HTML Response

```bash
# Check backend status
pm2 status

# Restart backend if needed
cd /home/ubuntu/Learnyzer
pm2 restart learnyzer

# Check logs
pm2 logs learnyzer --lines 20

# Test backend directly
curl http://127.0.0.1:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'
```

## Root Issue
nginx was trying to proxy to `app:5000` (Docker) instead of `127.0.0.1:5000` (your actual server), causing API calls to return HTML instead of JSON.

This single configuration change should fix mobile registration on your live website.