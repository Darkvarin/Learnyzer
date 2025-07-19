#!/bin/bash

echo "🔍 COMPREHENSIVE NETWORK DIAGNOSTIC"
echo "==================================="

echo "Your server is running (confirmed by logs), but not accessible externally."
echo "This suggests either:"
echo "1. EC2 Security Group blocking ALL custom ports"
echo "2. Network ACL restrictions"
echo "3. VPC/Subnet configuration issue"
echo ""

echo "Run these commands on your EC2 server:"
echo ""

cat << 'DIAGNOSTIC_SCRIPT'
#!/bin/bash

echo "=== NETWORK DIAGNOSTIC FOR LEARNYZER ==="

# 1. Confirm server is running
echo "1. Current server status:"
pm2 status
netstat -tlnp | grep -E ":(5000|8080|80)"

# 2. Test multiple ports locally
echo -e "\n2. Local connectivity tests:"
for port in 5000 8080 80 3000; do
    echo -n "Port $port: "
    timeout 3 curl -s http://localhost:$port/api/health >/dev/null && echo "✅ Working" || echo "❌ Not accessible"
done

# 3. Check what's actually listening
echo -e "\n3. All listening ports:"
sudo netstat -tlnp | grep LISTEN | head -10

# 4. EC2 metadata and network info
echo -e "\n4. EC2 Network Information:"
echo "Instance metadata:"
curl -s http://169.254.169.254/latest/meta-data/instance-id || echo "Cannot get instance ID"
curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "Cannot get public IP"
curl -s http://169.254.169.254/latest/meta-data/local-ipv4 || echo "Cannot get private IP"

# 5. Security group check (if AWS CLI is available)
echo -e "\n5. Security Group Check:"
if command -v aws &> /dev/null; then
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
    aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].SecurityGroups[*].GroupId' --output text 2>/dev/null || echo "AWS CLI not configured"
else
    echo "AWS CLI not installed"
fi

# 6. Try alternative approach - direct server start
echo -e "\n6. Testing direct server start (bypass PM2):"
echo "Stopping PM2..."
pm2 delete all 2>/dev/null

echo "Starting server directly on port 8080..."
cd ~/Learnyzer
PORT=8080 npx tsx server/index.ts &
SERVER_PID=$!

# Wait for server to start
sleep 8

# Test direct connection
echo "Testing direct connection:"
curl -v http://localhost:8080/api/health 2>&1 | head -15

# Clean up
kill $SERVER_PID 2>/dev/null

echo -e "\n7. Network Interface Information:"
ip addr show | grep -E "(inet|eth0|ens)" | head -10

echo -e "\n8. Route Table:"
ip route | head -5

DIAGNOSTIC_SCRIPT

echo ""
echo "🔧 POSSIBLE SOLUTIONS BASED ON RESULTS:"
echo ""
echo "If localhost tests work but external doesn't:"
echo "→ Definitely AWS Security Group issue"
echo "→ Try adding MULTIPLE ports to Security Group: 5000, 8080, 80, 3000"
echo ""
echo "If localhost tests fail:"
echo "→ Server binding issue or PM2 problem"
echo "→ Try direct server start (shown in diagnostic)"
echo ""
echo "If direct server works but PM2 doesn't:"
echo "→ PM2 configuration issue"
echo "→ Environment variables not being passed correctly"