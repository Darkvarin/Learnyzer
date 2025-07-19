#!/bin/bash

echo "🔧 LEARNYZER PM2 DEBUG & STARTUP"
echo "================================="

# Navigate to project directory
cd ~/Learnyzer || { echo "❌ Project directory not found"; exit 1; }

echo "1️⃣ Current PM2 status:"
pm2 status

echo -e "\n2️⃣ Checking for existing Learnyzer processes:"
pm2 delete learnyzer 2>/dev/null && echo "✅ Deleted existing learnyzer process" || echo "ℹ️ No existing learnyzer process"

echo -e "\n3️⃣ Environment check:"
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
export OPENAI_API_KEY="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"
export TWOFACTOR_API_KEY="75c5f204-57d8-11f0-a562-0200cd936042"
export RAZORPAY_KEY_ID="rzp_test_KofqomcGyXcjRP"
export RAZORPAY_KEY_SECRET="dqYO8RMzv4QaEiTOiP97fLka"
export PORT="5000"

echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "Database URL set: $([ -n "$DATABASE_URL" ] && echo "✅ Yes" || echo "❌ No")"
echo "OpenAI API Key set: $([ -n "$OPENAI_API_KEY" ] && echo "✅ Yes" || echo "❌ No")"

echo -e "\n4️⃣ Checking project files:"
[ -f "server/index.ts" ] && echo "✅ server/index.ts exists" || echo "❌ server/index.ts missing"
[ -f "package.json" ] && echo "✅ package.json exists" || echo "❌ package.json missing"
[ -d "dist/public" ] && echo "✅ dist/public exists" || echo "❌ dist/public missing - need to build"
[ -f "dist/public/index.html" ] && echo "✅ Frontend built" || echo "❌ Frontend not built"

echo -e "\n5️⃣ Testing direct server startup:"
echo "Creating simple production startup script..."

cat > pm2-startup.mjs << 'EOF'
import { register } from 'module';
import { pathToFileURL } from 'url';

console.log('🔧 PM2 Startup Script');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('PWD:', process.cwd());

// Register TypeScript loader
try {
    register('tsx/esm', pathToFileURL('./'));
    console.log('✅ TypeScript loader registered');
} catch (err) {
    console.error('❌ Failed to register TypeScript loader:', err);
    process.exit(1);
}

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Learnyzer server...');

// Import server
import('./server/index.ts')
    .then(() => {
        console.log('✅ Server started successfully');
    })
    .catch((err) => {
        console.error('❌ Server startup failed:', err);
        console.error('Stack trace:', err.stack);
        process.exit(1);
    });
EOF

echo -e "\n6️⃣ Testing script directly with Node.js:"
echo "Running: timeout 15 node pm2-startup.mjs"
timeout 15 node pm2-startup.mjs &
DIRECT_PID=$!
sleep 5

if kill -0 $DIRECT_PID 2>/dev/null; then
    echo "✅ Direct Node.js startup working"
    kill $DIRECT_PID 2>/dev/null
else
    echo "❌ Direct Node.js startup failed"
fi

echo -e "\n7️⃣ Starting with PM2:"
pm2 start pm2-startup.mjs --name learnyzer \
    --log-date-format="YYYY-MM-DD HH:mm:ss" \
    --merge-logs \
    --env NODE_ENV=production \
    --env PORT=5000

sleep 5

echo -e "\n8️⃣ PM2 Status after startup:"
pm2 status

echo -e "\n9️⃣ Recent logs:"
pm2 logs learnyzer --lines 20 --nostream

echo -e "\n🔟 Testing server endpoint:"
if timeout 10 curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo -e "\n✅ SERVER IS WORKING!"
    echo "🌐 Learnyzer is running at: http://$(curl -s ifconfig.me 2>/dev/null):5000"
else
    echo -e "\n❌ Server endpoint not responding"
    echo "Checking if port 5000 is in use:"
    netstat -tlnp | grep :5000 || echo "Port 5000 not listening"
fi

echo -e "\n📊 Final PM2 status:"
pm2 status

echo -e "\n🛠️ Useful commands:"
echo "View logs: pm2 logs learnyzer"
echo "Restart: pm2 restart learnyzer" 
echo "Stop: pm2 stop learnyzer"
echo "Monitor: pm2 monit"