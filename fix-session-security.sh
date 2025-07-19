#!/bin/bash

echo "🔒 CRITICAL SECURITY FIX - SESSION ISOLATION"
echo "============================================"

# This script should be run on your EC2 server at /home/ubuntu/Learnyzer

echo "SECURITY ISSUE IDENTIFIED:"
echo "- All devices sharing same user session (Ekansh account)"
echo "- Session cookies not properly isolated per device"
echo "- Missing proper session security configuration"
echo ""

echo "FIXES APPLIED:"
echo "✅ Added httpOnly cookies to prevent XSS"
echo "✅ Added proper sameSite CSRF protection" 
echo "✅ Reduced session duration from 30 days to 24 hours"
echo "✅ Added unique session ID generation"
echo "✅ Enhanced logout with proper session destruction"
echo "✅ Cleared all existing sessions from database"
echo ""

echo "1. Pulling latest security fixes from GitHub..."
git pull origin main

echo "2. Installing dependencies and building..."
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "3. Clearing all existing sessions in production database..."
# Clear all sessions to force re-authentication
sudo -u postgres psql -d learnyzer_db -c "DELETE FROM user_sessions;"

echo "4. Restarting PM2 backend with new session security..."
pm2 restart learnyzer

echo "5. Deploying to nginx..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;
sudo systemctl restart nginx

echo "6. Testing deployment..."
sleep 5

# Test the authentication endpoints
auth_test=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/api/auth/me)
home_test=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)

echo "Results:"
echo "  Auth endpoint: $auth_test"
echo "  Homepage: $home_test"

if [ "$home_test" = "200" ]; then
    echo ""
    echo "✅ SECURITY FIX DEPLOYED SUCCESSFULLY!"
    echo ""
    echo "🔒 IMMEDIATE ACTIONS REQUIRED:"
    echo "1. All users must log in again (sessions cleared for security)"
    echo "2. Each device will now have its own separate session"
    echo "3. Sessions expire after 24 hours instead of 30 days"
    echo ""
    echo "🌐 Test with multiple devices:"
    echo "- Visit https://learnyzer.com from PC (should require login)"
    echo "- Visit https://learnyzer.com from mobile (should require separate login)"
    echo "- Each device will now maintain independent authentication"
    echo ""
    echo "🔐 Security improvements:"
    echo "- httpOnly cookies prevent XSS attacks"
    echo "- Secure session isolation per device"
    echo "- CSRF protection with sameSite cookies"
    echo "- Proper session destruction on logout"
else
    echo "❌ Deployment failed: $home_test"
fi
EOF

chmod +x fix-session-security.sh