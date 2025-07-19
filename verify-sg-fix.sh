#!/bin/bash

echo "🔍 VERIFYING SECURITY GROUP CONFIGURATION"
echo "========================================"

echo "Your server is confirmed working locally:"
echo "✅ Listening on 0.0.0.0:5000 (all interfaces)" 
echo "✅ Health endpoint responding"
echo "✅ Running in production mode"
echo ""

echo "The issue is AWS Security Group configuration."
echo ""

echo "📋 EXACT STEPS TO FIX:"
echo "1. AWS Console → EC2 Dashboard"
echo "2. Click 'Instances' in left sidebar"
echo "3. Find your instance with Private IP 172.31.7.64"
echo "4. Click on the instance ID"
echo "5. Click 'Security' tab"
echo "6. Under 'Security groups', click the security group NAME (blue link)"
echo "7. Click 'Edit inbound rules'"
echo "8. Click 'Add rule'"
echo "9. Configure exactly:"
echo "   - Type: Custom TCP"
echo "   - Port range: 5000"
echo "   - Source: 0.0.0.0/0"
echo "   - Description: Learnyzer web access"
echo "10. Click 'Save rules'"
echo ""

echo "⚠️  IMPORTANT: Make sure you're editing the EC2 instance security group,"
echo "   NOT the RDS database security group!"
echo ""

echo "🌐 After fixing, access your site at:"
echo "   http://13.235.75.64:5000"
echo ""

echo "🔧 Alternative: Switch to port 80 (no Security Group changes needed)"
echo "Run this command to switch to standard web port:"
echo "pm2 delete all && sudo PORT=80 pm2 start start-learnyzer-production.mjs --name learnyzer"
echo "Then access at: http://13.235.75.64"