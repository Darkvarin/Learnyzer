#!/bin/bash

echo "🔗 CONNECTING LEARNYZER TO ELASTIC IP"
echo "===================================="

echo "Your Elastic IP: 3.109.251.7"
echo "Current Instance IP: 13.127.206.181"
echo ""

echo "To connect your Elastic IP to your EC2 instance:"
echo ""
echo "1. Go to AWS Console → EC2 → Elastic IPs"
echo "2. Find your Elastic IP: 3.109.251.7"
echo "3. Click 'Associate Elastic IP address'"
echo "4. Select your EC2 instance (the one with private IP 172.31.7.64)"
echo "5. Click 'Associate'"
echo ""

echo "After association:"
echo "✅ Your website will be accessible at: http://3.109.251.7:5000"
echo "✅ The IP will remain stable even after instance restarts"
echo "✅ You can later add a custom domain pointing to 3.109.251.7"
echo ""

echo "Security Group Update Needed:"
echo "Make sure port 5000 is open in your Security Group for IP: 3.109.251.7"
echo "(It should inherit the same security rules from your current setup)"
echo ""

echo "After association, test these URLs:"
echo "- Main site: http://3.109.251.7:5000"
echo "- Health check: http://3.109.251.7:5000/api/health"
echo "- Admin panel: http://3.109.251.7:5000/dashboard"