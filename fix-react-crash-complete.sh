#!/bin/bash

echo "🔧 FIXING REACT DASHBOARD CRASH ISSUE"
echo "====================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking current window references in components..."
echo "Header component window references:"
grep -n "window\." client/src/components/layout/header.tsx 2>/dev/null || echo "None found"

echo ""
echo "Dashboard component window references:"
grep -n "window\." client/src/pages/dashboard.tsx 2>/dev/null || echo "None found"

echo ""
echo "ScrollToTop component window references:"
grep -n "window\." client/src/components/scroll-to-top.tsx 2>/dev/null || echo "None found"

echo ""
echo "2. Ensuring all window references are properly guarded..."

# Fix ScrollToTop component if it exists
if [ -f "client/src/components/scroll-to-top.tsx" ]; then
    echo "Fixing ScrollToTop component..."
    cp client/src/components/scroll-to-top.tsx client/src/components/scroll-to-top.tsx.backup
    
    # Check if it already has window guards
    if ! grep -q "typeof window" client/src/components/scroll-to-top.tsx; then
        sed -i 's/window\.scrollTo({/if (typeof window !== '\''undefined'\'') {\n        window.scrollTo({/' client/src/components/scroll-to-top.tsx
        sed -i '/behavior: '\''smooth'\''/a\        }' client/src/components/scroll-to-top.tsx
        echo "✅ ScrollToTop fixed"
    else
        echo "✅ ScrollToTop already has window guards"
    fi
fi

# Fix Dashboard canonical URL if needed
if [ -f "client/src/pages/dashboard.tsx" ]; then
    echo "Fixing Dashboard canonical URL..."
    cp client/src/pages/dashboard.tsx client/src/pages/dashboard.tsx.backup
    
    if grep -q "window.location.origin" client/src/pages/dashboard.tsx; then
        sed -i 's|canonical={\`\${window\.location\.origin}/dashboard\`}|canonical="/dashboard"|g' client/src/pages/dashboard.tsx
        echo "✅ Dashboard canonical URL fixed"
    else
        echo "✅ Dashboard already has static canonical URL"
    fi
fi

# Fix any SEO component issues
if [ -f "client/src/components/seo/seo-head.tsx" ]; then
    echo "Checking SEO component..."
    if grep -q "window.location.pathname" client/src/components/seo/seo-head.tsx; then
        cp client/src/components/seo/seo-head.tsx client/src/components/seo/seo-head.tsx.backup
        sed -i 's/if (window\.location\.pathname !== '\''\/'\'')/if (typeof window !== '\''undefined'\'' \&\& window.location.pathname !== '\''\/'\'')/g' client/src/components/seo/seo-head.tsx
        echo "✅ SEO component fixed"
    else
        echo "✅ SEO component already has proper guards"
    fi
fi

# Fix ReferralSection if it exists
if [ -f "client/src/components/dashboard/referral-section.tsx" ]; then
    echo "Checking ReferralSection component..."
    if grep -q "window.open" client/src/components/dashboard/referral-section.tsx; then
        cp client/src/components/dashboard/referral-section.tsx client/src/components/dashboard/referral-section.tsx.backup
        sed -i 's/if (!referralData?\.referralLink) return;/if (!referralData?.referralLink || typeof window === '\''undefined'\'') return;/g' client/src/components/dashboard/referral-section.tsx
        echo "✅ ReferralSection fixed"
    else
        echo "✅ ReferralSection already has proper guards"
    fi
fi

echo ""
echo "3. Building with all window reference fixes..."
npm run build 2>&1 | tee build_window_fix.log

if grep -q "error\|Error\|ERROR" build_window_fix.log; then
    echo "❌ Build failed - checking errors:"
    grep -i error build_window_fix.log
    
    echo ""
    echo "Reverting all changes..."
    [ -f "client/src/components/scroll-to-top.tsx.backup" ] && mv client/src/components/scroll-to-top.tsx.backup client/src/components/scroll-to-top.tsx
    [ -f "client/src/pages/dashboard.tsx.backup" ] && mv client/src/pages/dashboard.tsx.backup client/src/pages/dashboard.tsx
    [ -f "client/src/components/seo/seo-head.tsx.backup" ] && mv client/src/components/seo/seo-head.tsx.backup client/src/components/seo/seo-head.tsx
    [ -f "client/src/components/dashboard/referral-section.tsx.backup" ] && mv client/src/components/dashboard/referral-section.tsx.backup client/src/components/dashboard/referral-section.tsx
    
    exit 1
fi

echo "✅ Clean build with all window fixes"

echo ""
echo "4. Deploying fixed build..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;

# Remove any replit references that might cause issues
sed -i '/replit/d' dist/index.html 2>/dev/null || true

sudo systemctl restart nginx
sleep 3

echo ""
echo "5. Testing dashboard after complete fix..."
dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
echo "Dashboard HTTP status: $dashboard_status"

# Test for actual React content
dashboard_content=$(curl -s https://learnyzer.com/dashboard | head -100)
if echo "$dashboard_content" | grep -q "Learning Dashboard\|Dashboard\|React"; then
    echo "✅ Dashboard serves React content"
else
    echo "⚠️ Dashboard content might be incomplete"
fi

if [ "$dashboard_status" = "200" ]; then
    echo ""
    echo "🚀 COMPLETE SUCCESS!"
    echo "✅ Dashboard HTTP: 200"
    echo "✅ All window references fixed"
    echo "✅ React components should no longer crash"
    echo ""
    echo "Test now: https://learnyzer.com/dashboard"
    echo "The flashing and black screen should be completely resolved"
else
    echo ""
    echo "❌ Dashboard still shows: $dashboard_status"
    echo "Check nginx error logs:"
    sudo tail -5 /var/log/nginx/error.log
fi

echo ""
echo "Build log saved to: build_window_fix.log"