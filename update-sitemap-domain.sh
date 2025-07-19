#!/bin/bash

# Update sitemap.xml with custom domain
DOMAIN="learnyzer.com"  # Replace with your actual domain

echo "🔄 Updating sitemap.xml for domain: ${DOMAIN}"

# Backup original sitemap
cp public/sitemap.xml public/sitemap.xml.backup

# Update all URLs in sitemap to use custom domain with HTTPS
sed -i "s|http://3.109.251.7:5000|https://${DOMAIN}|g" public/sitemap.xml

echo "✅ Sitemap updated successfully!"
echo "📄 Check updated sitemap: public/sitemap.xml"
echo "🔗 Your sitemap will be available at: https://${DOMAIN}/sitemap.xml"