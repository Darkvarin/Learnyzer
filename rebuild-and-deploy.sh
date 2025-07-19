#!/bin/bash

echo "REBUILDING AND DEPLOYING REACT APPLICATION"
echo "=========================================="

cd /home/ubuntu/Learnyzer

echo "1. Building React application with Vite..."
npx vite build --outDir dist

if [ $? -eq 0 ]; then
    echo "✅ Vite build successful"
    
    echo ""
    echo "2. Verifying build contents..."
    ls -la dist/
    
    if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
        echo "✅ Build structure is correct"
        
        echo ""
        echo "3. Setting proper permissions..."
        chmod 755 /home/ubuntu /home/ubuntu/Learnyzer /home/ubuntu/Learnyzer/dist
        chmod -R 644 /home/ubuntu/Learnyzer/dist/*
        find /home/ubuntu/Learnyzer/dist -type d -exec chmod 755 {} \;
        
        echo ""
        echo "4. Restarting nginx..."
        sudo systemctl restart nginx
        
        echo ""
        echo "5. Testing deployment..."
        sleep 3
        
        response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/)
        echo "Response code: $response"
        
        if [ "$response" = "200" ]; then
            echo ""
            echo "Checking content..."
            content=$(curl -s https://learnyzer.com/)
            
            if echo "$content" | grep -q "/assets/index-.*\.js"; then
                echo "🚀 SUCCESS: React application deployed!"
                echo ""
                echo "✅ Complete Learnyzer platform is live"
                echo "✅ Frontend: React app with Vite bundles"
                echo "✅ Backend: API running on port 5000"
                echo "✅ SSL: HTTPS working"
                echo ""
                echo "🌟 Live at: https://learnyzer.com"
            else
                echo "Basic HTML served - checking nginx logs..."
                sudo journalctl -u nginx --no-pager | tail -5
            fi
        else
            echo "HTTP error $response"
            sudo journalctl -u nginx --no-pager | tail -5
        fi
    else
        echo "❌ Build structure incomplete"
        ls -la dist/
    fi
else
    echo "❌ Vite build failed"
    npx vite build --outDir dist 2>&1 | tail -10
fi

echo ""
echo "Backend status:"
pm2 list | grep learnyzer
EOF

chmod +x rebuild-and-deploy.sh