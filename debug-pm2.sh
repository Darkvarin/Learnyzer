#!/bin/bash

echo "🔍 DEBUGGING EC2 ACCESS ISSUES"
echo "=============================="

echo "Copy this script to your EC2 server and run it:"
echo ""

cat << 'DEBUG_SCRIPT'
#!/bin/bash

echo "🔍 LEARNYZER ACCESS DEBUG"
echo "========================"

echo "1️⃣ PM2 Status:"
pm2 status

echo -e "\n2️⃣ Server Health Check (local):"
curl -v http://localhost:5000/api/health 2>&1 | head -20

echo -e "\n3️⃣ Port Listening Check:"
netstat -tlnp | grep :5000

echo -e "\n4️⃣ Firewall Status:"
sudo ufw status

echo -e "\n5️⃣ EC2 Security Group Check:"
echo "The server is running locally but not accessible externally."
echo "This usually means the EC2 Security Group is blocking port 5000."

echo -e "\n6️⃣ Quick Fix Options:"
echo "Option A: Change server to use port 80 (standard web port)"
echo "Option B: Add port 5000 to EC2 Security Group"

echo -e "\n7️⃣ Testing Internal Access:"
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null)
echo "Server Public IP: $PUBLIC_IP"
echo "Local test: curl http://localhost:5000/api/health"

if timeout 5 curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "✅ Server is running locally - SECURITY GROUP ISSUE"
    echo ""
    echo "🔧 SOLUTION: Add port 5000 to EC2 Security Group"
    echo "1. Go to EC2 Console"
    echo "2. Select your instance"
    echo "3. Security tab → Security Groups"
    echo "4. Edit inbound rules"
    echo "5. Add: Custom TCP, Port 5000, Source: 0.0.0.0/0"
else
    echo "❌ Server not running locally"
    pm2 logs learnyzer --lines 10 --nostream
fi

DEBUG_SCRIPT

echo ""
echo "🔧 IMMEDIATE SOLUTIONS:"
echo ""
echo "Solution 1: Add port 5000 to EC2 Security Group"
echo "1. AWS Console → EC2 → Your Instance"  
echo "2. Security tab → Edit inbound rules"
echo "3. Add rule: Custom TCP, Port 5000, Source: 0.0.0.0/0"
echo ""
echo "Solution 2: Use port 80 instead (requires changing server config)"
echo ""
echo "Most likely issue: EC2 Security Group is blocking external access to port 5000"