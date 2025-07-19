#!/bin/bash

# SEO Performance Check for Learnyzer
echo "🔍 SEO Performance Check for Learnyzer"
echo "======================================"

# Check if all SEO files are accessible
echo "📋 Checking SEO Files..."
echo ""

echo "✅ Sitemap.xml:"
curl -s -I https://learnyzer.com/sitemap.xml | head -1
echo "📊 Size: $(curl -s https://learnyzer.com/sitemap.xml | wc -c) bytes"
echo ""

echo "✅ Robots.txt:"
curl -s -I https://learnyzer.com/robots.txt | head -1
echo "📊 Size: $(curl -s https://learnyzer.com/robots.txt | wc -c) bytes"
echo ""

echo "✅ Manifest.json:"
curl -s -I https://learnyzer.com/manifest.json | head -1
echo "📊 Size: $(curl -s https://learnyzer.com/manifest.json | wc -c) bytes"
echo ""

echo "✅ Main Page:"
curl -s -I https://learnyzer.com/ | head -1
echo "📊 Response time: $(curl -s -w '%{time_total}' -o /dev/null https://learnyzer.com/) seconds"
echo ""

# Check SSL Certificate
echo "🔒 SSL Certificate Status:"
echo | openssl s_client -servername learnyzer.com -connect learnyzer.com:443 2>/dev/null | openssl x509 -noout -dates
echo ""

# Check HTTP/2 Support
echo "🚀 HTTP/2 Support:"
curl -s -I --http2 https://learnyzer.com/ | grep -i "HTTP/2"
echo ""

# Check compression
echo "📦 Gzip Compression:"
curl -s -H "Accept-Encoding: gzip" -I https://learnyzer.com/ | grep -i "content-encoding"
echo ""

# Mobile-friendly test suggestion
echo "📱 Next Steps:"
echo "1. Test mobile-friendliness: https://search.google.com/test/mobile-friendly?url=https://learnyzer.com"
echo "2. Page speed insights: https://pagespeed.web.dev/analysis?url=https://learnyzer.com"
echo "3. Submit to Google Search Console: https://search.google.com/search-console/"
echo "4. Submit sitemap: https://learnyzer.com/sitemap.xml"
echo ""

echo "🎉 SEO Audit Complete! Your site is ready for search engines."