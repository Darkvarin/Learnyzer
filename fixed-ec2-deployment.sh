#!/bin/bash

echo "🚀 FIXED EC2 DEPLOYMENT COMMANDS"
echo "================================"

# Set domain
DOMAIN="learnyzer.com"

echo "1. Creating directory structure..."
sudo mkdir -p /var/www/${DOMAIN}/html
sudo chown -R $USER:$USER /var/www/${DOMAIN}/html

echo ""
echo "2. Finding and copying SEO files..."

# Check current directory
echo "Current directory: $(pwd)"

# Try multiple possible locations for the files
echo "Searching for Learnyzer project files..."

# Method 1: Check if we're in a Learnyzer directory with public folder
if [ -d "public" ]; then
    echo "✅ Found public directory in current location"
    sudo cp public/sitemap.xml /var/www/${DOMAIN}/html/ 2>/dev/null && echo "✅ sitemap.xml copied" || echo "❌ sitemap.xml not found"
    sudo cp public/robots.txt /var/www/${DOMAIN}/html/ 2>/dev/null && echo "✅ robots.txt copied" || echo "❌ robots.txt not found"
    sudo cp public/manifest.json /var/www/${DOMAIN}/html/ 2>/dev/null && echo "✅ manifest.json copied" || echo "❌ manifest.json not found"
    sudo cp -r public/images /var/www/${DOMAIN}/html/ 2>/dev/null && echo "✅ images copied" || echo "⚠️ no images directory"
    sudo cp public/*.png /var/www/${DOMAIN}/html/ 2>/dev/null && echo "✅ PNG files copied" || echo "⚠️ no PNG files"
    sudo cp public/*.svg /var/www/${DOMAIN}/html/ 2>/dev/null && echo "✅ SVG files copied" || echo "⚠️ no SVG files"
else
    echo "⚠️ No public directory found in current location"
    
    # Method 2: Search for the files in common locations
    echo "Searching for files in /home/ubuntu..."
    
    SITEMAP_FILE=$(find /home/ubuntu -name "sitemap.xml" 2>/dev/null | head -1)
    ROBOTS_FILE=$(find /home/ubuntu -name "robots.txt" 2>/dev/null | head -1)
    MANIFEST_FILE=$(find /home/ubuntu -name "manifest.json" 2>/dev/null | head -1)
    
    if [ -n "$SITEMAP_FILE" ]; then
        sudo cp "$SITEMAP_FILE" /var/www/${DOMAIN}/html/ && echo "✅ sitemap.xml found and copied from $SITEMAP_FILE"
    else
        echo "❌ sitemap.xml not found anywhere"
    fi
    
    if [ -n "$ROBOTS_FILE" ]; then
        sudo cp "$ROBOTS_FILE" /var/www/${DOMAIN}/html/ && echo "✅ robots.txt found and copied from $ROBOTS_FILE"
    else
        echo "❌ robots.txt not found anywhere"
    fi
    
    if [ -n "$MANIFEST_FILE" ]; then
        sudo cp "$MANIFEST_FILE" /var/www/${DOMAIN}/html/ && echo "✅ manifest.json found and copied from $MANIFEST_FILE"
    else
        echo "❌ manifest.json not found anywhere"
    fi
fi

echo ""
echo "3. Creating fallback SEO files if missing..."

# Create sitemap.xml if missing
if [ ! -f /var/www/${DOMAIN}/html/sitemap.xml ]; then
    echo "Creating basic sitemap.xml..."
    sudo tee /var/www/${DOMAIN}/html/sitemap.xml > /dev/null <<'SITEMAP'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://learnyzer.com/</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://learnyzer.com/ai-tutor</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://learnyzer.com/ai-visual-lab</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
SITEMAP
    echo "✅ Basic sitemap.xml created"
fi

# Create robots.txt if missing
if [ ! -f /var/www/${DOMAIN}/html/robots.txt ]; then
    echo "Creating basic robots.txt..."
    sudo tee /var/www/${DOMAIN}/html/robots.txt > /dev/null <<'ROBOTS'
User-agent: *
Allow: /

# SEO-optimized directives for Learnyzer
Allow: /ai-tutor
Allow: /ai-visual-lab
Allow: /ai-tools/*
Allow: /battle-zone
Allow: /leaderboard
Allow: /subscription
Allow: /landing

# Block admin and development pages
Disallow: /admin/
Disallow: /api/

# Sitemap location
Sitemap: https://learnyzer.com/sitemap.xml
ROBOTS
    echo "✅ Basic robots.txt created"
fi

# Create manifest.json if missing
if [ ! -f /var/www/${DOMAIN}/html/manifest.json ]; then
    echo "Creating basic manifest.json..."
    sudo tee /var/www/${DOMAIN}/html/manifest.json > /dev/null <<'MANIFEST'
{
  "name": "Learnyzer - AI-Powered Entrance Exam Preparation",
  "short_name": "Learnyzer",
  "description": "Master JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE with India's most advanced AI tutoring platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#7c3aed",
  "icons": [
    {
      "src": "/generated-icon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
MANIFEST
    echo "✅ Basic manifest.json created"
fi

echo ""
echo "4. Setting proper permissions..."
sudo chown -R www-data:www-data /var/www/${DOMAIN}/html
sudo chmod -R 755 /var/www/${DOMAIN}/html

echo ""
echo "5. Verifying copied files..."
echo "Files in /var/www/${DOMAIN}/html/:"
ls -la /var/www/${DOMAIN}/html/

echo ""
echo "✅ File setup complete!"
echo "📄 sitemap.xml: $([ -f /var/www/${DOMAIN}/html/sitemap.xml ] && echo 'EXISTS' || echo 'MISSING')"
echo "🤖 robots.txt: $([ -f /var/www/${DOMAIN}/html/robots.txt ] && echo 'EXISTS' || echo 'MISSING')"
echo "📱 manifest.json: $([ -f /var/www/${DOMAIN}/html/manifest.json ] && echo 'EXISTS' || echo 'MISSING')"