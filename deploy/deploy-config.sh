#!/bin/bash

# Learnyzer EC2 Deployment Configuration
# Run this script on your EC2 server to set up automated deployments

echo "🔧 SETTING UP LEARNYZER CI/CD PIPELINE"
echo "======================================"

# EC2 Server Information
EC2_HOST="ec2-13-235-75-64.ap-south-1.compute.amazonaws.com"
EC2_USER="ubuntu"
PROJECT_DIR="/home/ubuntu/Learnyzer"

echo "📋 Current Configuration:"
echo "   Host: $EC2_HOST"
echo "   User: $EC2_USER"
echo "   Project Directory: $PROJECT_DIR"
echo ""

# Check if we're running on the EC2 server
if [[ $USER == "ubuntu" && -d "/home/ubuntu" ]]; then
    echo "✅ Running on EC2 server - setting up local deployment environment..."
    
    # Ensure project directory exists
    cd $PROJECT_DIR || { echo "❌ Project directory not found"; exit 1; }
    
    # Create PM2 ecosystem file for better process management
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'learnyzer',
    script: './start-production.mjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log'
  }]
};
EOF

    # Create logs directory
    mkdir -p logs
    
    # Create manual deployment script
    cat > deploy-manual.sh << 'EOF'
#!/bin/bash

echo "🚀 MANUAL DEPLOYMENT SCRIPT"
echo "==========================="

# Stop current process
pm2 delete learnyzer 2>/dev/null || true

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Set environment variables (you may need to update these)
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
export OPENAI_API_KEY="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"
export TWOFACTOR_API_KEY="75c5f204-57d8-11f0-a562-0200cd936042"
export RAZORPAY_KEY_ID="rzp_test_KofqomcGyXcjRP"
export RAZORPAY_KEY_SECRET="dqYO8RMzv4QaEiTOiP97fLka"
export PORT="5000"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build frontend
echo "🏗️ Building frontend..."
npx vite build --config vite.config.ts

# Create production startup script
cat > start-production.mjs << 'SCRIPT_EOF'
// Production server with TypeScript loader
import { register } from 'module';
import { pathToFileURL } from 'url';

// Register TypeScript loader
register('tsx/esm', pathToFileURL('./'));

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Learnyzer Production Server Starting...');
console.log('📁 Serving static files from dist/public/');
console.log(`🌐 Server running on port ${process.env.PORT || 5000}`);

// Import and start the server
import('./server/index.ts');
SCRIPT_EOF

# Start with PM2 using ecosystem file
echo "🚀 Starting production server..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration (skip startup command to avoid hanging)
pm2 save

# Wait for startup
sleep 10

# Test server
echo "🧪 Testing server..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    pm2 status
    echo "🌐 Learnyzer is LIVE at: http://$(curl -s ifconfig.me):5000"
else
    echo "❌ Deployment failed. Checking logs..."
    pm2 logs learnyzer --lines 20
fi
EOF

    chmod +x deploy-manual.sh
    
    echo "✅ EC2 deployment environment configured!"
    echo ""
    echo "📝 Files created:"
    echo "   • ecosystem.config.js - PM2 process configuration"
    echo "   • deploy-manual.sh - Manual deployment script"
    echo "   • logs/ - Log directory"
    echo ""
    echo "🚀 To deploy manually, run: ./deploy-manual.sh"
    echo "🔍 To view logs: pm2 logs learnyzer"
    echo "📊 To monitor: pm2 monit"
    
else
    echo "ℹ️ Not running on EC2 server."
    echo ""
    echo "📋 TO SET UP GITHUB SECRETS, add these to your repository:"
    echo "   Go to: GitHub Repository → Settings → Secrets and variables → Actions"
    echo ""
    echo "   🔐 Required Secrets:"
    echo "   EC2_HOST: $EC2_HOST"
    echo "   EC2_USER: $EC2_USER"
    echo "   EC2_SSH_KEY: [Your EC2 private key content]"
    echo "   DATABASE_URL: postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer"
    echo "   OPENAI_API_KEY: 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"
    echo "   TWOFACTOR_API_KEY: 75c5f204-57d8-11f0-a562-0200cd936042"
    echo "   RAZORPAY_KEY_ID: rzp_test_KofqomcGyXcjRP"
    echo "   RAZORPAY_KEY_SECRET: dqYO8RMzv4QaEiTOiP97fLka"
    echo ""
    echo "🔑 TO GET YOUR EC2_SSH_KEY:"
    echo "   1. On your local machine: cat ~/.ssh/your-ec2-key.pem"
    echo "   2. Copy the entire content (including -----BEGIN and -----END lines)"
    echo "   3. Paste it as the EC2_SSH_KEY secret value"
    echo ""
    echo "🚀 Once secrets are configured, every push to main branch will auto-deploy!"
fi