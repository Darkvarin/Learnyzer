#!/bin/bash

echo "COMPREHENSIVE REACT RENDERING FIX"
echo "================================="

cd /home/ubuntu/Learnyzer

echo "1. Checking main React entry point..."
if [ -f "client/src/main.tsx" ]; then
    echo "✅ main.tsx exists"
    echo "Content preview:"
    head -10 client/src/main.tsx
else
    echo "❌ main.tsx missing"
fi

echo ""
echo "2. Checking App component..."
if [ -f "client/src/App.tsx" ]; then
    echo "✅ App.tsx exists"
    echo "Content preview:"
    head -15 client/src/App.tsx
else
    echo "❌ App.tsx missing"
fi

echo ""
echo "3. Force rebuilding with error checking..."
npm run build 2>&1 | tee build_output.log

if grep -q "error\|Error\|ERROR" build_output.log; then
    echo "❌ Build errors found:"
    grep -i error build_output.log
else
    echo "✅ Clean build"
fi

echo ""
echo "4. Checking built bundle for React content..."
js_file=$(ls dist/assets/index-*.js 2>/dev/null | head -1)
if [ -n "$js_file" ]; then
    echo "Checking React in: $js_file"
    if grep -q "React\|createElement" "$js_file"; then
        echo "✅ React found in bundle"
    else
        echo "❌ No React in bundle"
    fi
    
    # Check for common errors
    if grep -q "import.*not.*defined\|export.*not.*defined" "$js_file"; then
        echo "❌ Module definition errors in bundle"
    else
        echo "✅ No obvious module errors"
    fi
else
    echo "❌ No JS bundle found"
fi

echo ""
echo "5. Creating minimal React test..."
cat > dist/minimal-test.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minimal React Test</title>
</head>
<body>
    <div id="root">React not loaded</div>
    <script type="module">
        import React from 'https://esm.sh/react@18';
        import { createRoot } from 'https://esm.sh/react-dom@18/client';
        
        const root = createRoot(document.getElementById('root'));
        root.render(React.createElement('div', {}, 'React is working!'));
        console.log('Minimal React test completed');
    </script>
</body>
</html>
EOF

chmod 644 dist/minimal-test.html

echo ""
echo "6. Setting all permissions again..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;

echo ""
echo "7. Testing deployment..."
dashboard_test=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
minimal_test=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/minimal-test.html)

echo "Dashboard: $dashboard_test"
echo "Minimal test: $minimal_test"

echo ""
echo "NEXT STEPS:"
echo "=========="
echo "1. Visit https://learnyzer.com/minimal-test.html"
echo "   • Should show 'React is working!' if React can load"
echo ""
echo "2. Visit https://learnyzer.com/dashboard"
echo "   • Press F12 → Console tab"
echo "   • Look for specific error messages"
echo ""
echo "3. Common issues to check in browser console:"
echo "   • 'Failed to resolve module specifier'"
echo "   • 'Unexpected token'"
echo "   • 'SyntaxError in module'"
echo "   • CORS policy errors"
echo ""
echo "Share any specific errors from browser console for targeted fixes."
EOF

chmod +x fix-react-rendering.sh