#!/bin/bash

echo "EMERGENCY SERVER FIXES FOR REACT CRASH"
echo "====================================="

cd /home/ubuntu/Learnyzer

echo "1. Creating minimal dashboard to test basic React functionality..."
cat > client/src/pages/dashboard-minimal.tsx << 'EOF'
import { SEOHead } from "@/components/seo-head";

function MinimalDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SEOHead
        title="Dashboard - Learnyzer"
        description="Your learning dashboard"
        keywords="dashboard, learning"
        canonical="/dashboard"
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Dashboard</h1>
        
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
        
        <div className="text-center mt-8">
          <p className="text-green-400 text-lg">✅ React is working correctly!</p>
          <p className="text-gray-400">If you see this, the basic React app is functional</p>
        </div>
      </div>
    </div>
  );
}

export default MinimalDashboard;
EOF

echo "2. Temporarily switching to minimal dashboard..."
cp client/src/App.tsx client/src/App.tsx.original
sed -i 's|import Dashboard from "@/pages/dashboard";|import Dashboard from "@/pages/dashboard-minimal";|' client/src/App.tsx

echo "3. Building with minimal dashboard..."
npm run build 2>&1 | tee build_minimal.log

if grep -q "error\|Error\|ERROR" build_minimal.log; then
    echo "❌ Build failed with minimal dashboard:"
    grep -i error build_minimal.log
    echo "Reverting..."
    mv client/src/App.tsx.original client/src/App.tsx
    exit 1
fi

echo "✅ Clean build with minimal dashboard"

echo "4. Setting permissions and deploying..."
sudo chown -R ubuntu:ubuntu dist/
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;

# Remove any Replit artifacts
sed -i '/replit/d' dist/index.html

sudo systemctl restart nginx
sleep 3

echo "5. Testing minimal dashboard..."
dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
echo "Dashboard response: $dashboard_response"

if [ "$dashboard_response" = "200" ]; then
    echo "✅ SUCCESS! Minimal dashboard loads"
    echo ""
    echo "Visit https://learnyzer.com/dashboard"
    echo "You should see a simple working dashboard without crashes"
    echo ""
    echo "If this works, the issue is in the complex dashboard components"
    echo "We can then fix the window references step by step"
else
    echo "❌ Even minimal dashboard fails - deeper infrastructure issue"
    mv client/src/App.tsx.original client/src/App.tsx
fi

echo ""
echo "Build log saved to: build_minimal.log"
EOF

chmod +x emergency-server-fix.sh