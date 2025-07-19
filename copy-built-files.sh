#!/bin/bash

echo "COPYING BUILT FILES TO PRODUCTION DIST"
echo "====================================="

# Run this on your production server

cd ~/Learnyzer

echo "1. Removing old dist..."
sudo rm -rf dist
sudo mkdir -p dist

echo "2. Creating production frontend files..."

# Copy the main built files that we know exist
echo "3. Copying main application files..."

# Create the main index.html with the built application
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Learnyzer - AI-Powered Exam Preparation</title>
    <meta name="description" content="AI-powered educational platform for Indian competitive exam preparation including JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE (SSC-CGL)">
    <script type="module" crossorigin src="/assets/index-4e82Zwvg.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-DfcCqErM.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF

echo "4. Creating assets directory..."
mkdir -p dist/assets

echo "5. Creating placeholder assets (will be replaced with actual build)..."
# Create minimal CSS
cat > dist/assets/index-DfcCqErM.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
}

#root {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 20px;
}

.loading {
  font-size: 2em;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
EOF

# Create minimal JS
cat > dist/assets/index-4e82Zwvg.js << 'EOF'
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div>
      <h1 class="loading">🧠 Learnyzer Loading...</h1>
      <p>AI-Powered Educational Platform</p>
      <p style="margin-top: 20px;">
        <button onclick="testAPI()" style="padding: 10px 20px; background: white; color: #667eea; border: none; border-radius: 5px; cursor: pointer;">
          Test API Connection
        </button>
      </p>
      <div id="api-result" style="margin-top: 20px;"></div>
    </div>
  `;
});

function testAPI() {
  const result = document.getElementById('api-result');
  result.innerHTML = 'Testing API...';
  
  fetch('/api/health')
    .then(r => r.json())
    .then(data => {
      result.innerHTML = `<p style="color: #4ade80;">✅ API Working: ${JSON.stringify(data)}</p>`;
    })
    .catch(err => {
      result.innerHTML = `<p style="color: #ef4444;">❌ API Error: ${err.message}</p>`;
    });
}
EOF

echo "6. Setting permissions..."
sudo chown -R ubuntu:ubuntu dist
sudo chmod -R 755 dist

echo "7. Testing..."
curl -s -I https://learnyzer.com/ | head -3

echo ""
echo "✅ Basic frontend deployed"
echo "Visit https://learnyzer.com to test"
echo ""
echo "Next: Copy actual built files from Replit dist/public/ to replace these placeholders"