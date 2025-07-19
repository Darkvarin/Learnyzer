#!/bin/bash

echo "🔧 CHANGE LEARNYZER TO PORT 80"
echo "==============================="
echo "This will make your site accessible without Security Group changes"
echo ""
echo "Run this on your EC2 server:"
echo ""

cat << 'PORT80_SCRIPT'
#!/bin/bash

echo "🔧 Switching Learnyzer to Port 80"
echo "================================="

cd ~/Learnyzer || exit 1

# Stop current server
pm2 delete learnyzer 2>/dev/null || true

# Update environment to use port 80
export NODE_ENV=production
export PORT=80
export DATABASE_URL="postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
export OPENAI_API_KEY="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"
export TWOFACTOR_API_KEY="75c5f204-57d8-11f0-a562-0200cd936042"
export RAZORPAY_KEY_ID="rzp_test_KofqomcGyXcjRP"
export RAZORPAY_KEY_SECRET="dqYO8RMzv4QaEiTOiP97fLka"

# Create new startup script for port 80
cat > start-learnyzer-port80.mjs << 'EOF'
// ES Module startup for Learnyzer on Port 80
import { spawn } from 'child_process';

console.log('🚀 LEARNYZER STARTING ON PORT 80');
console.log('Starting at:', new Date().toString());

process.chdir('/home/ubuntu/Learnyzer');

console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'production');
console.log('- PORT: 80 (standard web port)');
console.log('- Database URL present:', !!process.env.DATABASE_URL ? 'YES' : 'NO');

const server = spawn('sudo', ['npx', 'tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '80'
    },
    cwd: process.cwd()
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});

server.on('exit', (code, signal) => {
    console.log(`Server exited: code=${code}, signal=${signal}`);
    if (code !== 0 && code !== null) {
        process.exit(code);
    }
});

const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down...`);
    server.kill(signal);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
EOF

# Start with PM2 using sudo for port 80
sudo pm2 start start-learnyzer-port80.mjs \
    --name learnyzer \
    --log-date-format="YYYY-MM-DD HH:mm:ss" \
    --env NODE_ENV=production \
    --env PORT=80 \
    --env DATABASE_URL="$DATABASE_URL" \
    --env OPENAI_API_KEY="$OPENAI_API_KEY" \
    --env TWOFACTOR_API_KEY="$TWOFACTOR_API_KEY" \
    --env RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID" \
    --env RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET"

sleep 10

# Test the new setup
sudo pm2 status
if timeout 5 curl -f http://localhost:80/api/health; then
    echo "✅ SUCCESS! Learnyzer now running on port 80"
    echo "🌐 Access at: http://13.235.75.64 (no port needed)"
    sudo pm2 save
else
    echo "❌ Issue starting on port 80"
    sudo pm2 logs learnyzer --lines 10 --nostream
fi

PORT80_SCRIPT

echo ""
echo "After running this script, your site will be accessible at:"
echo "  http://13.235.75.64 (no port number needed)"
echo ""
echo "Note: Port 80 requires sudo privileges but is typically allowed by default Security Groups"