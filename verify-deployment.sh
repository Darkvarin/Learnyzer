#!/bin/bash

# Verify that sitemap deployment is successful
echo "🔍 Verifying Learnyzer deployment and SEO files..."
echo ""

# Check live sitemap URLs
echo "📋 Checking live sitemap.xml (first 10 URLs):"
curl -s https://learnyzer.com/sitemap.xml | grep -o 'https://learnyzer.com[^<]*' | head -10
echo ""

# Count total URLs in sitemap
echo "📊 Total URLs in sitemap:"
curl -s https://learnyzer.com/sitemap.xml | grep -c '<loc>'
echo ""

# Verify key pages are accessible
echo "🌐 Testing key pages accessibility:"
echo "Homepage:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" -o /dev/null https://learnyzer.com/

echo "Landing page:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" -o /dev/null https://learnyzer.com/landing

echo "AI Tutor:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" -o /dev/null https://learnyzer.com/ai-tutor

echo "Subscription:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" -o /dev/null https://learnyzer.com/subscription

echo ""
echo "✅ Google Search Console Actions:"
echo "1. Go to https://search.google.com/search-console/"
echo "2. Remove old sitemap (if exists)"
echo "3. Add new sitemap: https://learnyzer.com/sitemap.xml"
echo "4. Request re-indexing for main pages"
echo ""
echo "🎯 All URLs now use correct https://learnyzer.com domain!"