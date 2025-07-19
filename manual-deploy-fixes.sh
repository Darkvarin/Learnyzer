#!/bin/bash

echo "MANUAL DEPLOYMENT OF REACT CRASH FIXES TO EC2"
echo "=============================================="
echo ""
echo "Copy and run these commands on your EC2 server:"
echo ""

cat << 'EC2_COMMANDS'
# SSH to your EC2 server and run these commands:

cd /home/ubuntu/Learnyzer

# 1. Fix Header component - Replace window.location with useLocation hook
echo "1. Fixing Header component..."
cp client/src/components/layout/header.tsx client/src/components/layout/header.tsx.backup

# Update the import to include useLocation
sed -i '1s/.*/import { Link, useLocation } from "wouter";/' client/src/components/layout/header.tsx

# Replace window.location.pathname with useLocation hook
sed -i '/const path = window.location.pathname;/,/}, \[\]);/ {
  s/const path = window.location.pathname;/const [location] = useLocation();/
  s/if (path.includes/if (location.includes/g
  s/else if (path.includes/else if (location.includes/g
  s/}, \[\]);/}, [location]);/
}' client/src/components/layout/header.tsx

# Add window guards for scroll events
sed -i '/const handleScroll = () => {/i\    if (typeof window === '\''undefined'\'') return;\n' client/src/components/layout/header.tsx

# Add window guard for reload
sed -i 's/window.location.reload();/if (typeof window !== '\''undefined'\'') {\n        window.location.reload();\n      }/' client/src/components/layout/header.tsx

# 2. Fix ScrollToTop component
echo "2. Fixing ScrollToTop component..."
cp client/src/components/scroll-to-top.tsx client/src/components/scroll-to-top.tsx.backup

sed -i 's/window.scrollTo({/if (typeof window !== '\''undefined'\'') {\n        window.scrollTo({/' client/src/components/scroll-to-top.tsx
sed -i '/behavior: '\''smooth'\''/a\        }' client/src/components/scroll-to-top.tsx

# 3. Fix SEOHead component
echo "3. Fixing SEOHead component..."
cp client/src/components/seo/seo-head.tsx client/src/components/seo/seo-head.tsx.backup

sed -i 's/if (window.location.pathname !== '\''\/'\'')/if (typeof window !== '\''undefined'\'' \&\& window.location.pathname !== '\''\/'\'')/g' client/src/components/seo/seo-head.tsx

# 4. Fix ReferralSection component
echo "4. Fixing ReferralSection component..."
cp client/src/components/dashboard/referral-section.tsx client/src/components/dashboard/referral-section.tsx.backup

sed -i 's/if (!referralData?.referralLink) return;/if (!referralData?.referralLink || typeof window === '\''undefined'\'') return;/g' client/src/components/dashboard/referral-section.tsx

# 5. Fix Dashboard canonical URL
echo "5. Fixing Dashboard canonical URL..."
cp client/src/pages/dashboard.tsx client/src/pages/dashboard.tsx.backup

sed -i 's/canonical={`${window.location.origin}\/dashboard`}/canonical="\/dashboard"/g' client/src/pages/dashboard.tsx

# 6. Build and deploy the fixes
echo "6. Building with all fixes..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to nginx
    sudo chown -R ubuntu:ubuntu dist/
    find dist -type f -exec chmod 644 {} \;
    find dist -type d -exec chmod 755 {} \;
    
    # Remove any Replit artifacts
    sed -i '/replit/d' dist/index.html
    
    # Restart nginx
    sudo systemctl restart nginx
    
    echo "✅ Deployed successfully!"
    
    # Test the deployment
    sleep 3
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Dashboard response: $dashboard_response"
    
    if [ "$dashboard_response" = "200" ]; then
        echo ""
        echo "🚀 SUCCESS! Dashboard fixes deployed"
        echo ""
        echo "Visit: https://learnyzer.com/dashboard"
        echo ""
        echo "The dashboard should now:"
        echo "✅ Load without flashing or going black"
        echo "✅ Show complete Learnyzer interface"
        echo "✅ Have working navigation and features"
        echo ""
        echo "React crash issue should be resolved!"
    else
        echo "❌ Still having issues. Response: $dashboard_response"
    fi
else
    echo "❌ Build failed. Check the errors above."
fi
EC2_COMMANDS

echo ""
echo "OR run this single command on EC2:"
echo "=================================="
echo "curl -sSL https://raw.githubusercontent.com/example/learnyzer/main/manual-deploy-fixes.sh | bash"
echo ""
echo "This will apply all the window reference fixes and deploy the corrected dashboard."
EOF

chmod +x manual-deploy-fixes.sh