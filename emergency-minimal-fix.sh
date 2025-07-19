#!/bin/bash

echo "EMERGENCY MINIMAL DASHBOARD FIX"
echo "==============================="

cd /home/ubuntu/Learnyzer

echo "1. Creating truly minimal dashboard without any dependencies..."
cat > client/src/pages/dashboard-minimal.tsx << 'EOF'
function MinimalDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-green-400">
          ✅ REACT IS WORKING!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Study Progress</h2>
            <p className="text-gray-300">Track your learning journey</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">AI Tutor</h2>
            <p className="text-gray-300">Get personalized help</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Battle Zone</h2>
            <p className="text-gray-300">Compete with peers</p>
          </div>
        </div>
        
        <div className="text-center mt-8 p-6 bg-green-900/30 rounded-lg border border-green-500/50">
          <p className="text-green-400 text-xl font-bold mb-2">SUCCESS!</p>
          <p className="text-green-300">React dashboard is loading without crashes</p>
          <p className="text-gray-400 text-sm mt-2">
            If you see this page completely, React routing is working correctly
          </p>
        </div>
      </div>
    </div>
  );
}

export default MinimalDashboard;
EOF

echo "2. Switching to minimal dashboard..."
cp client/src/App.tsx client/src/App.tsx.original
sed -i 's|import Dashboard from "@/pages/dashboard";|import Dashboard from "@/pages/dashboard-minimal";|' client/src/App.tsx

echo "3. Building minimal dashboard..."
npm run build 2>&1 | tee build_minimal.log

if grep -q "error\|Error\|ERROR" build_minimal.log; then
    echo "❌ Build failed even with minimal dashboard:"
    grep -i error build_minimal.log
    mv client/src/App.tsx.original client/src/App.tsx
    exit 1
fi

echo "✅ Clean build successful"

echo "4. Deploying minimal version..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;

# Clean up any Replit artifacts
sed -i '/replit/d' dist/index.html

sudo systemctl restart nginx
sleep 3

echo "5. Testing minimal deployment..."
dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
echo "Dashboard HTTP response: $dashboard_response"

# Test if the HTML contains our success message
success_test=$(curl -s https://learnyzer.com/dashboard | grep -o "REACT IS WORKING" | head -1)
if [ "$success_test" = "REACT IS WORKING" ]; then
    echo "✅ SUCCESS MESSAGE FOUND IN HTML"
else
    echo "❌ Success message not found"
fi

# Test JS and CSS loading
js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
if [ -n "$js_file" ]; then
    js_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
    echo "JavaScript: $js_response"
else
    echo "No JS file reference found"
fi

echo ""
echo "RESULTS:"
echo "========"
if [ "$dashboard_response" = "200" ] && [ "$success_test" = "REACT IS WORKING" ]; then
    echo "🚀 MINIMAL DASHBOARD WORKING!"
    echo ""
    echo "Visit: https://learnyzer.com/dashboard"
    echo ""
    echo "If you see 'REACT IS WORKING' without flashing/crashing:"
    echo "✅ Basic React functionality is good"
    echo "✅ The issue is in the complex dashboard components"
    echo "✅ We can now fix the window references in the original dashboard"
    echo ""
    echo "Next step: Fix window.location and window.scrollY references"
else
    echo "❌ Minimal dashboard still failing"
    echo "HTTP: $dashboard_response"
    echo "Content found: $success_test"
    mv client/src/App.tsx.original client/src/App.tsx
fi

echo ""
echo "Build log: build_minimal.log"
EOF

chmod +x emergency-minimal-fix.sh