# Quick Fix for learnyzer.com OTP Issue

## Root Cause
nginx configuration has wrong upstream server address:
- **Current**: `server app:5000;` (Docker style)
- **Should be**: `server 127.0.0.1:5000;` (Direct server)

## Quick Fix Commands

Run these commands on your EC2 server:

```bash
# 1. Check if backend is running
pm2 status

# 2. Fix nginx upstream configuration
sudo sed -i 's/server app:5000;/server 127.0.0.1:5000;/' /etc/nginx/sites-available/learnyzer.com

# 3. Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

# 4. Test OTP API
curl -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'
```

## Expected Result
```json
{"success":true,"sessionId":"dev-session-1726742835123","message":"Development mode: Use OTP 123456 for testing"}
```

## If Still Not Working

1. **Check backend logs**:
   ```bash
   pm2 logs learnyzer --lines 20
   ```

2. **Restart backend**:
   ```bash
   cd /home/ubuntu/Learnyzer
   pm2 restart learnyzer
   ```

3. **Test backend directly**:
   ```bash
   curl http://127.0.0.1:5000/api/otp/send \
     -H "Content-Type: application/json" \
     -d '{"mobile": "9999999999"}'
   ```

## Alternative: Full nginx config replacement

If the simple fix doesn't work, replace the entire nginx config:

```bash
sudo cp /home/ubuntu/Learnyzer/nginx-seo-config.conf /etc/nginx/sites-available/learnyzer.com
sudo nginx -t && sudo systemctl reload nginx
```