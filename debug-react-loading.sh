#!/bin/bash

echo "DEBUGGING REACT LOADING ISSUES"
echo "=============================="

cd /home/ubuntu/Learnyzer

echo "1. Testing JavaScript execution..."
# Check if the JS file has valid React code
js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
echo "JS file: $js_file"

# Download and check JS content
curl -s "https://learnyzer.com$js_file" > temp_js_check.js
js_size=$(stat -c%s temp_js_check.js)
echo "JS file size: $js_size bytes"

# Check for React content
if grep -q "React\|createElement\|useState" temp_js_check.js; then
    echo "✅ React code found in JS bundle"
else
    echo "❌ No React code in JS bundle"
fi

# Check for errors in JS
if grep -q "Error\|TypeError\|ReferenceError" temp_js_check.js; then
    echo "⚠️ Potential errors in JS bundle"
else
    echo "✅ No obvious errors in JS"
fi

rm temp_js_check.js

echo ""
echo "2. Testing HTML structure..."
content=$(curl -s https://learnyzer.com/dashboard)

# Check for proper HTML structure
if echo "$content" | grep -q '<div id="root"></div>'; then
    echo "✅ Root div found"
else
    echo "❌ Root div missing"
fi

# Check for script tags
if echo "$content" | grep -q 'type="module"'; then
    echo "✅ Module script found"
else
    echo "❌ Module script missing"
fi

echo ""
echo "3. Simulating browser environment test..."
# Create a simple test to see if there are obvious issues
cat > test_react.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>React Test</title>
</head>
<body>
    <div id="root">Loading...</div>
    <script>
        console.log("Testing basic JS execution");
        document.getElementById('root').innerHTML = 'JavaScript is working';
    </script>
</body>
</html>
EOF

# Copy to nginx directory for testing
cp test_react.html dist/test.html
chmod 644 dist/test.html

echo "Test page created at: https://learnyzer.com/test.html"
echo "This should show 'JavaScript is working' if basic JS execution works"

echo ""
echo "4. Checking for common React issues..."

# Check if there are any import/export issues
echo "Looking for potential module issues in served content..."
if echo "$content" | grep -q 'import.*from'; then
    echo "⚠️ ES6 imports found in HTML (should be in JS bundle)"
else
    echo "✅ No problematic imports in HTML"
fi

echo ""
echo "5. Backend API connectivity test..."
api_response=$(curl -s https://learnyzer.com/api/auth/me)
echo "API response: $api_response"

if echo "$api_response" | grep -q '"id"'; then
    echo "✅ Backend API working"
elif echo "$api_response" | grep -q 'Not authenticated'; then
    echo "✅ Backend API working (not authenticated)"
else
    echo "❌ Backend API issue"
fi

echo ""
echo "RECOMMENDATIONS:"
echo "==============="
echo "1. Visit https://learnyzer.com/test.html to verify basic JS works"
echo "2. Open https://learnyzer.com/dashboard in browser"
echo "3. Press F12 and check Console tab for JavaScript errors"
echo "4. Look for specific error messages about:"
echo "   • Module loading failures"
echo "   • React mounting errors"
echo "   • Import/export issues"
echo "   • CORS errors"
echo ""
echo "If you see errors in browser console, share them for specific fixes."
EOF

chmod +x debug-react-loading.sh