#!/bin/bash

echo "COPYING REAL LEARNYZER FRONTEND TO PRODUCTION"
echo "============================================="

cd /home/ubuntu/Learnyzer

echo "1. Creating backup of current dist..."
if [ -d "dist" ]; then
    sudo mv dist dist.backup.$(date +%Y%m%d_%H%M%S)
fi

echo "2. Creating new dist directory..."
mkdir -p dist/assets
mkdir -p dist/images
mkdir -p dist/animations

echo "3. Copying main index.html..."
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Learnyzer - AI-Powered Indian Entrance Exam Preparation Platform</title>
    <meta name="description" content="Master JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE with India's leading AI-powered educational platform. Get personalized tutoring, smart study plans, and gamified learning experiences designed specifically for competitive exam success.">
    <meta name="keywords" content="JEE preparation, NEET coaching, UPSC study material, CLAT prep, CUET exam, CSE preparation, CGLE SSC-CGL, AI tutor, online education, competitive exams India">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Learnyzer - AI-Powered Indian Entrance Exam Preparation">
    <meta property="og:description" content="Master JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE with personalized AI tutoring and gamified learning">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://learnyzer.com">
    <meta property="og:image" content="https://learnyzer.com/images/learnity-og-image.svg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Learnyzer - AI-Powered Exam Preparation">
    <meta name="twitter:description" content="Master JEE, NEET, UPSC, CLAT with AI tutoring">
    <meta name="twitter:image" content="https://learnyzer.com/images/learnity-og-image.svg">
    
    <!-- Additional Meta Tags -->
    <meta name="theme-color" content="#141625">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://learnyzer.com">
    
    <!-- Preload Critical Resources -->
    <link rel="preload" href="/assets/index-DfcCqErM.css" as="style">
    <link rel="preload" href="/assets/index-4e82Zwvg.js" as="script">
    
    <script type="module" crossorigin src="/assets/index-4e82Zwvg.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-DfcCqErM.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF

echo "4. Creating robots.txt..."
cat > dist/robots.txt << 'EOF'
# Robots.txt for Learnyzer.com - AI-Powered Educational Platform

User-agent: *
Allow: /

# Priority Pages for SEO
Allow: /home
Allow: /auth
Allow: /courses
Allow: /ai-tutor
Allow: /ai-visual-lab
Allow: /landing

# Allow all images and assets
Allow: /images/
Allow: /assets/
Allow: /animations/

# Important files for search engines
Allow: /sitemap.xml
Allow: /robots.txt

# Sitemap location
Sitemap: https://learnyzer.com/sitemap.xml

# Crawl-delay for better server performance
Crawl-delay: 1
EOF

echo "5. Creating sitemap.xml..."
cat > dist/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Homepage -->
  <url>
    <loc>https://learnyzer.com/</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Main Platform Pages -->
  <url>
    <loc>https://learnyzer.com/auth</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://learnyzer.com/dashboard</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- AI Features -->
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
    <priority>0.8</priority>
  </url>

  <!-- Educational Content -->
  <url>
    <loc>https://learnyzer.com/courses</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://learnyzer.com/battle-zone</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Landing and Marketing Pages -->
  <url>
    <loc>https://learnyzer.com/landing</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://learnyzer.com/subscription</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

</urlset>
EOF

echo "6. Creating placeholder assets (you need to copy real ones)..."
echo "/* Learnyzer CSS - Replace with real file */" > dist/assets/index-DfcCqErM.css
echo "/* Learnyzer JS - Replace with real file */" > dist/assets/index-4e82Zwvg.js

echo "7. Setting permissions..."
chmod 755 /home/ubuntu
chmod 755 /home/ubuntu/Learnyzer
chmod 755 /home/ubuntu/Learnyzer/dist
chmod 755 /home/ubuntu/Learnyzer/dist/assets
chmod 755 /home/ubuntu/Learnyzer/dist/images
chmod 755 /home/ubuntu/Learnyzer/dist/animations
chmod 644 /home/ubuntu/Learnyzer/dist/*
chmod 644 /home/ubuntu/Learnyzer/dist/assets/*

echo "8. Restarting nginx..."
sudo systemctl restart nginx

echo "9. Testing basic structure..."
curl -s -I https://learnyzer.com/ | head -3

echo ""
echo "CRITICAL: You now need to copy the real built files from Replit:"
echo ""
echo "FILES TO COPY FROM REPLIT TO PRODUCTION:"
echo "FROM: /home/runner/workspace/dist/public/assets/index-DfcCqErM.css"
echo "TO:   /home/ubuntu/Learnyzer/dist/assets/index-DfcCqErM.css"
echo ""
echo "FROM: /home/runner/workspace/dist/public/assets/index-4e82Zwvg.js" 
echo "TO:   /home/ubuntu/Learnyzer/dist/assets/index-4e82Zwvg.js"
echo ""
echo "Use scp, wget, or copy the file contents manually"
echo ""
echo "The HTML structure is ready - you just need the real CSS and JS files!"
EOF

chmod +x copy-real-frontend.sh