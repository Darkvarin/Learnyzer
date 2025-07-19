#!/bin/bash

echo "🔍 LEARNYZER DEPLOYMENT VERIFICATION"
echo "===================================="

cd ~/Learnyzer || { echo "❌ Project directory not found"; exit 1; }

echo "1️⃣ PM2 Status:"
pm2 status

echo -e "\n2️⃣ Process Information:"
ps aux | grep -E "(learnyzer|tsx.*server)" | grep -v grep || echo "No processes found"

echo -e "\n3️⃣ Port Check:"
netstat -tlnp | grep :5000 || echo "Port 5000 not listening"

echo -e "\n4️⃣ Health Check:"
if timeout 10 curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo -e "\n✅ Health check successful!"
else
    echo -e "\n❌ Health check failed"
fi

echo -e "\n5️⃣ Recent Logs (last 10 lines):"
pm2 logs learnyzer --lines 10 --nostream

echo -e "\n6️⃣ Server Information:"
PUBLIC_IP=$(timeout 5 curl -s ifconfig.me 2>/dev/null || echo "Unable to get IP")
echo "🌐 Your Learnyzer server should be accessible at:"
echo "   http://$PUBLIC_IP:5000"
echo "   http://localhost:5000 (local access)"

echo -e "\n7️⃣ PM2 Process Details:"
pm2 describe learnyzer 2>/dev/null | head -20

echo -e "\n✅ VERIFICATION COMPLETE"
echo "If health check passed, your server is running successfully!"