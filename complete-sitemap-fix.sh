#!/bin/bash

# Create complete sitemap with all 26 pages for learnyzer.com
echo "🔄 Creating complete sitemap with all 26 pages..."

# Create complete sitemap directly on server
sudo tee /var/www/learnyzer.com/html/sitemap.xml > /dev/null <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <!-- Main pages -->
  <url>
    <loc>https://learnyzer.com/</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/landing</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Core AI Features -->
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
  
  <!-- AI Tools -->
  <url>
    <loc>https://learnyzer.com/ai-tools</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/ai-tools/study-notes</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/ai-tools/answer-checker</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/ai-tools/mock-test-generator</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/ai-tools/performance</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Student Features -->
  <url>
    <loc>https://learnyzer.com/battle-zone</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/leaderboard</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/dashboard</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Business pages -->
  <url>
    <loc>https://learnyzer.com/subscription</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Exam-specific preparation pages -->
  <url>
    <loc>https://learnyzer.com/jee-preparation</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/neet-preparation</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/upsc-preparation</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/clat-preparation</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/cuet-preparation</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/cse-preparation</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/cgle-ssc-cgl-preparation</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/feedback</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/contact</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Legal pages -->
  <url>
    <loc>https://learnyzer.com/terms</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <url>
    <loc>https://learnyzer.com/privacy</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>

  <!-- Additional AI Tools -->
  <url>
    <loc>https://learnyzer.com/ai-tools/flashcard-generator</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://learnyzer.com/ai-tools/visual-learning</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://learnyzer.com/ai-tools/study-sessions</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://learnyzer.com/register</loc>
    <lastmod>2025-07-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
</urlset>
EOF

echo "✅ Complete sitemap created with 26 pages!"

# Count URLs to verify
echo "📊 Total URLs in sitemap:"
curl -s https://learnyzer.com/sitemap.xml | grep -c '<url>'

echo ""
echo "🔍 First 10 URLs:"
curl -s https://learnyzer.com/sitemap.xml | grep -o 'https://learnyzer.com[^<]*' | head -10