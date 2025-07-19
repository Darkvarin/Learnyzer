#!/bin/bash

echo "APPLYING REACT DASHBOARD FIXES ON EC2"
echo "===================================="

cd /home/ubuntu/Learnyzer

echo "1. Backing up original files..."
cp client/src/components/layout/header.tsx client/src/components/layout/header.tsx.backup
cp client/src/components/scroll-to-top.tsx client/src/components/scroll-to-top.tsx.backup
cp client/src/components/seo/seo-head.tsx client/src/components/seo/seo-head.tsx.backup
cp client/src/components/dashboard/referral-section.tsx client/src/components/dashboard/referral-section.tsx.backup
cp client/src/pages/dashboard.tsx client/src/pages/dashboard.tsx.backup

echo "2. Fixing Header component..."
# Fix the active link detection - replace window.location with useLocation
cat > temp_header_fix.txt << 'EOF'
  // Determine active link based on current path using wouter
  const [location] = useLocation();
  useEffect(() => {
    if (location.includes("/dashboard")) setActiveLink("dashboard");
    else if (location.includes("/battle-zone")) setActiveLink("battle-zone");
    else if (location.includes("/ai-tutor")) setActiveLink("ai-tutor");
    else if (location.includes("/ai-tools")) setActiveLink("ai-tools");
    else if (location.includes("/leaderboard")) setActiveLink("leaderboard");
    else setActiveLink("");
  }, [location]);
EOF

# Replace the window.location section
sed -i '/\/\/ Determine active link based on current path/,/}, \[\]);/{
  /\/\/ Determine active link based on current path/r temp_header_fix.txt
  d
}' client/src/components/layout/header.tsx

# Add window guard for scroll effect
sed -i '/const handleScroll = () => {/i\    if (typeof window === '\''undefined'\'') return;\n' client/src/components/layout/header.tsx

# Add window guard for reload
sed -i 's/window\.location\.reload();/if (typeof window !== '\''undefined'\'') {\n        window.location.reload();\n      }/' client/src/components/layout/header.tsx

rm temp_header_fix.txt

echo "3. Fixing ScrollToTop component..."
sed -i 's/window\.scrollTo({/if (typeof window !== '\''undefined'\'') {\n        window.scrollTo({/' client/src/components/scroll-to-top.tsx
sed -i '/behavior: '\''smooth'\''/a\        }' client/src/components/scroll-to-top.tsx

echo "4. Fixing SEOHead component..."
sed -i 's/if (window\.location\.pathname !== '\''\/'\'')/if (typeof window !== '\''undefined'\'' \&\& window.location.pathname !== '\''\/'\'')/g' client/src/components/seo/seo-head.tsx

echo "5. Fixing ReferralSection component..."
sed -i 's/if (!referralData?\.referralLink) return;/if (!referralData?.referralLink || typeof window === '\''undefined'\'') return;/g' client/src/components/dashboard/referral-section.tsx

echo "6. Fixing Dashboard canonical URL..."
sed -i 's/canonical={\`\${window\.location\.origin}\/dashboard\`}/canonical="\/dashboard"/g' client/src/pages/dashboard.tsx

echo "7. Building with all fixes..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "8. Deploying to nginx..."
    sudo chown -R ubuntu:ubuntu dist/
    find dist -type f -exec chmod 644 {} \;
    find dist -type d -exec chmod 755 {} \;
    
    # Remove any Replit artifacts
    sed -i '/replit/d' dist/index.html 2>/dev/null || true
    
    # Restart nginx
    sudo systemctl restart nginx
    
    echo "9. Testing deployment..."
    sleep 3
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    
    echo "Dashboard HTTP response: $dashboard_response"
    
    # Test for real dashboard content
    real_content=$(curl -s https://learnyzer.com/dashboard | grep -o "Learning Dashboard\|Level.*XP" | head -1)
    echo "Dashboard content found: $real_content"
    
    if [ "$dashboard_response" = "200" ] && [ -n "$real_content" ]; then
        echo ""
        echo "🚀 SUCCESS! React dashboard fixes applied and deployed"
        echo ""
        echo "Visit: https://learnyzer.com/dashboard"
        echo ""
        echo "The dashboard should now:"
        echo "✅ Load without flashing or going black"
        echo "✅ Show complete Learnyzer interface"
        echo "✅ Have working navigation and features"
        echo ""
        echo "React crash issue resolved!"
    else
        echo ""
        echo "❌ Still having issues:"
        echo "HTTP: $dashboard_response"
        echo "Content: $real_content"
        echo ""
        echo "Restoring backups..."
        mv client/src/components/layout/header.tsx.backup client/src/components/layout/header.tsx
        mv client/src/components/scroll-to-top.tsx.backup client/src/components/scroll-to-top.tsx
        mv client/src/components/seo/seo-head.tsx.backup client/src/components/seo/seo-head.tsx
        mv client/src/components/dashboard/referral-section.tsx.backup client/src/components/dashboard/referral-section.tsx
        mv client/src/pages/dashboard.tsx.backup client/src/pages/dashboard.tsx
    fi
else
    echo "❌ Build failed. Restoring backups..."
    mv client/src/components/layout/header.tsx.backup client/src/components/layout/header.tsx
    mv client/src/components/scroll-to-top.tsx.backup client/src/components/scroll-to-top.tsx
    mv client/src/components/seo/seo-head.tsx.backup client/src/components/seo/seo-head.tsx
    mv client/src/components/dashboard/referral-section.tsx.backup client/src/components/dashboard/referral-section.tsx
    mv client/src/pages/dashboard.tsx.backup client/src/pages/dashboard.tsx
fi

echo ""
echo "Deployment completed."
EOF

chmod +x ec2-window-fixes.sh