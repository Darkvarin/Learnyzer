#!/bin/bash

echo "TRANSFERRING FRONTEND FILES TO PRODUCTION"
echo "========================================"

# This needs to be run on your production server at ~/Learnyzer

cd ~/Learnyzer

echo "1. Checking current status..."
echo "PM2 status:"
pm2 status

echo ""
echo "Backend test:"
curl -s http://localhost:5000/api/health

echo ""
echo "2. Backing up existing dist..."
if [ -d "dist" ]; then
    sudo mv dist dist.backup.$(date +%Y%m%d_%H%M%S)
    echo "Backed up existing dist directory"
fi

echo "3. Creating new dist directory structure..."
sudo mkdir -p dist
sudo mkdir -p dist/assets

echo "4. You need to copy these files from Replit to production:"
echo "FROM REPLIT: /home/runner/workspace/dist/public/*"
echo "TO PRODUCTION: /home/ubuntu/Learnyzer/dist/"

echo ""
echo "5. Quick manual transfer commands (run these on production):"
echo ""
echo "# Create a simple index.html for now"
cat > temp-index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learnyzer - Loading...</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .logo { font-size: 3em; margin-bottom: 20px; }
        .message { font-size: 1.2em; margin-bottom: 30px; }
        .status { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; }
    </style>
</head>
<body>
    <div class="logo">🧠 Learnyzer</div>
    <div class="message">AI-Powered Educational Platform</div>
    <div class="status">
        <h3>Platform Status: Online</h3>
        <p>Backend API: <span id="api-status">Testing...</span></p>
        <p>Frontend: Updating...</p>
        <script>
            fetch('/api/health')
                .then(r => r.json())
                .then(d => {
                    document.getElementById('api-status').textContent = 'Working ✓';
                    document.getElementById('api-status').style.color = '#4ade80';
                })
                .catch(e => {
                    document.getElementById('api-status').textContent = 'Error ✗';
                    document.getElementById('api-status').style.color = '#ef4444';
                });
        </script>
    </div>
</body>
</html>
EOF

sudo mv temp-index.html dist/index.html
sudo chown -R ubuntu:ubuntu dist
sudo chmod -R 755 dist

echo "6. Testing temporary frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
echo "Frontend status: $FRONTEND_STATUS"

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Temporary frontend is working"
    echo "Visit https://learnyzer.com to see the status page"
else
    echo "❌ Still getting 500 error"
    echo "Checking nginx error logs:"
    sudo tail -10 /var/log/nginx/error.log
fi

echo ""
echo "7. API test through domain:"
curl -s -X POST https://learnyzer.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'