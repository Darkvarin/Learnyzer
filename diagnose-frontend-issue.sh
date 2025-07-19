#!/bin/bash

echo "COMPREHENSIVE FRONTEND DIAGNOSIS"
echo "==============================="

cd /home/ubuntu/Learnyzer

echo "1. Testing what exactly is served on dashboard..."
echo "Dashboard HTML content:"
curl -s https://learnyzer.com/dashboard | head -c 1000
echo ""
echo "============================================"

echo ""
echo "2. Checking if it's serving the right index.html..."
if curl -s https://learnyzer.com/dashboard | grep -q "Learnyzer - AI-Powered"; then
    echo "✅ Correct HTML title found"
else
    echo "❌ Wrong HTML or missing title"
fi

echo ""
echo "3. JavaScript file check..."
js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
if [ -n "$js_file" ]; then
    echo "JS file reference: $js_file"
    js_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
    echo "JS file accessibility: $js_response"
    
    if [ "$js_response" = "200" ]; then
        # Check if JS file has React content
        js_content=$(curl -s "https://learnyzer.com$js_file" | head -c 500)
        if echo "$js_content" | grep -q "React\|useState\|useEffect"; then
            echo "✅ JavaScript contains React code"
        else
            echo "❌ JavaScript doesn't contain React code"
            echo "JS preview: $js_content"
        fi
    fi
else
    echo "❌ No JavaScript file reference found"
fi

echo ""
echo "4. CSS file check..."
css_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.css' | head -1)
if [ -n "$css_file" ]; then
    echo "CSS file reference: $css_file"
    css_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$css_file")
    echo "CSS file accessibility: $css_response"
else
    echo "❌ No CSS file reference found"
fi

echo ""
echo "5. Local file verification..."
echo "Local dist/index.html exists?"
if [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html exists ($(stat -c%s dist/index.html) bytes)"
    echo "Local file content preview:"
    head -c 500 dist/index.html
else
    echo "❌ dist/index.html missing"
fi

echo ""
echo "6. React root div check..."
if curl -s https://learnyzer.com/dashboard | grep -q '<div id="root">'; then
    echo "✅ React root div found"
else
    echo "❌ React root div missing"
fi

echo ""
echo "7. Module script check..."
if curl -s https://learnyzer.com/dashboard | grep -q 'type="module"'; then
    echo "✅ Module script found"
else
    echo "❌ Module script missing"
fi

echo ""
echo "8. Browser developer tools simulation..."
echo "What a browser would see when loading /dashboard:"
echo "HTML response size: $(curl -s https://learnyzer.com/dashboard | wc -c) characters"
echo "HTTP headers:"
curl -s -I https://learnyzer.com/dashboard | head -5

echo ""
echo "9. Backend API verification..."
api_response=$(curl -s https://learnyzer.com/api/auth/me)
echo "API response preview: $api_response" | head -c 200

echo ""
echo "SUMMARY:"
echo "========"
if curl -s https://learnyzer.com/dashboard | grep -q "id=\"root\"" && curl -s https://learnyzer.com/dashboard | grep -q "/assets/index-"; then
    echo "✅ HTML structure is correct"
    if curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)" | grep -q "200"; then
        echo "✅ JavaScript is accessible"
        echo "🔍 Issue might be:"
        echo "   • JavaScript runtime errors"
        echo "   • React component mounting failures"
        echo "   • Browser console errors"
        echo "   • Check browser Developer Tools → Console"
    else
        echo "❌ JavaScript files not accessible"
    fi
else
    echo "❌ HTML structure problem - wrong index.html being served"
fi
EOF

chmod +x diagnose-frontend-issue.sh