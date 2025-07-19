#!/bin/bash

# Update sitemap.xml to use correct domain
echo "🔄 Updating sitemap.xml with correct domain..."

# Backup original
cp public/sitemap.xml public/sitemap.xml.backup

# Replace all replit.app URLs with learnyzer.com
sed -i 's|https://learnyzer.replit.app|https://learnyzer.com|g' public/sitemap.xml

echo "✅ Updated sitemap.xml URLs from replit.app to learnyzer.com"
echo "📋 Checking updated URLs:"
grep -n "https://learnyzer.com" public/sitemap.xml | head -5

echo ""
echo "🚀 Next steps:"
echo "1. Deploy this fix to your server"
echo "2. Re-submit sitemap in Google Search Console"
echo "3. All 26 pages will now use correct domain"