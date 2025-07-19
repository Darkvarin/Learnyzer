#!/bin/bash

echo "FIXING SCROLL-TO-TOP COMPONENT SYNTAX ERROR"
echo "==========================================="

cd /home/ubuntu/Learnyzer

echo "Creating correct ScrollToTop component..."
cat > client/src/components/scroll-to-top.tsx << 'EOF'
import { useEffect } from "react";
import { useLocation } from "wouter";

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Add a small delay to ensure proper page transition
    const timer = setTimeout(() => {
      // Scroll to top with smooth behavior (with window guard)
      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [location]);

  return null; // This component doesn't render anything
}
EOF

echo "Building..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "Deploying..."
    sudo chown -R ubuntu:ubuntu dist/
    find dist -type f -exec chmod 644 {} \;
    find dist -type d -exec chmod 755 {} \;
    sudo systemctl restart nginx
    
    sleep 3
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Dashboard: $dashboard_response"
    
    if [ "$dashboard_response" = "200" ]; then
        echo "🚀 SUCCESS! Dashboard fixes deployed"
        echo "Visit: https://learnyzer.com/dashboard"
    else
        echo "❌ Still having issues: $dashboard_response"
    fi
else
    echo "❌ Build still failed"
fi
EOF

chmod +x fix-scroll-to-top.sh