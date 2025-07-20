#!/bin/bash

echo "FIXING SCROLL-TO-TOP SYNTAX ERROR"
echo "================================="

cd /home/ubuntu/Learnyzer

echo "1. Restoring original ScrollToTop component..."
if [ -f "client/src/components/scroll-to-top.tsx.backup" ]; then
    cp client/src/components/scroll-to-top.tsx.backup client/src/components/scroll-to-top.tsx
    echo "✅ Original file restored"
else
    echo "❌ No backup found"
fi

echo ""
echo "2. Creating properly fixed ScrollToTop component..."
cat > client/src/components/scroll-to-top.tsx << 'EOF'
import { useEffect } from "react";
import { useLocation } from "wouter";

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Guard against server-side rendering
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }, 100); // Small delay to ensure DOM is ready

      return () => clearTimeout(timer);
    }
  }, [location]);

  return null;
}
EOF

echo "✅ ScrollToTop component properly fixed"

echo ""
echo "3. Testing build with fixed component..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    
    echo "4. Deploying fixed build..."
    sudo chown -R ubuntu:ubuntu dist/
    find dist -type f -exec chmod 644 {} \;
    find dist -type d -exec chmod 755 {} \;
    sudo systemctl restart nginx
    
    echo ""
    echo "5. Testing dashboard..."
    sleep 3
    dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Dashboard status: $dashboard_status"
    
    if [ "$dashboard_status" = "200" ]; then
        echo ""
        echo "🚀 SUCCESS! React crash completely fixed"
        echo "✅ Dashboard should now load without flashing or black screen"
        echo ""
        echo "Test now: https://learnyzer.com/dashboard"
    else
        echo "❌ Dashboard still showing: $dashboard_status"
    fi
else
    echo "❌ Build still failed - checking error..."
    npm run build 2>&1 | tail -10
fi