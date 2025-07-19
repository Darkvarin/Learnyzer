#!/bin/bash

echo "FIXING DASHBOARD REACT CRASH"
echo "============================"

cd /home/ubuntu/Learnyzer

echo "1. Creating simplified dashboard component to test..."
cat > client/src/pages/dashboard-simple.tsx << 'EOF'
import { Header } from "@/components/layout/header";

function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Study Progress</h2>
            <p>Your learning journey</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AI Tutor</h2>
            <p>Get personalized help</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Battle Zone</h2>
            <p>Compete with peers</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleDashboard;
EOF

echo "2. Temporarily updating App.tsx to use simple dashboard..."
cp client/src/App.tsx client/src/App.tsx.backup

# Replace the dashboard import
sed -i 's|import Dashboard from "@/pages/dashboard";|import Dashboard from "@/pages/dashboard-simple";|' client/src/App.tsx

echo "3. Building with simplified dashboard..."
npm run build 2>&1 | tee build_simple.log

if grep -q "error\|Error\|ERROR" build_simple.log; then
    echo "❌ Build errors with simple dashboard:"
    grep -i error build_simple.log
    
    echo "Reverting to original..."
    mv client/src/App.tsx.backup client/src/App.tsx
else
    echo "✅ Clean build with simple dashboard"
    
    echo "4. Setting permissions and testing..."
    sudo chown -R ubuntu:ubuntu dist/
    find dist -type f -exec chmod 644 {} \;
    find dist -type d -exec chmod 755 {} \;
    
    sudo systemctl restart nginx
    sleep 3
    
    echo "5. Testing simplified dashboard..."
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" https://learnyzer.com/dashboard)
    echo "Dashboard response: $dashboard_response"
    
    if [ "$dashboard_response" = "200" ]; then
        echo "✅ Simple dashboard works - the issue is in the complex dashboard component"
        echo ""
        echo "Visit https://learnyzer.com/dashboard to test"
        echo "If it works, we'll fix the original dashboard step by step"
    else
        echo "❌ Still failing - deeper issue"
    fi
fi

echo ""
echo "Dashboard build log saved to: build_simple.log"
EOF

chmod +x fix-dashboard-crash.sh