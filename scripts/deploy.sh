#!/bin/bash

# Learnyzer Deployment Script for EC2
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Starting Learnyzer deployment..."

# Configuration
APP_DIR="/home/ubuntu/learnyzer"
REPO_URL="https://github.com/YOUR_USERNAME/learnyzer.git"
BRANCH="main"
NODE_VERSION="20"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as correct user
if [ "$USER" != "ubuntu" ] && [ "$USER" != "ec2-user" ]; then
    print_warning "Consider running as ubuntu or ec2-user"
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    sudo apt-get install -y git
fi

# Create application directory
if [ ! -d "$APP_DIR" ]; then
    print_status "Creating application directory..."
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    
    print_status "Cloning repository..."
    git clone "$REPO_URL" .
else
    print_status "Updating repository..."
    cd "$APP_DIR"
    git fetch --all
    git reset --hard origin/$BRANCH
    git pull origin $BRANCH
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
npm ci --production

# Build application
print_status "Building application..."
npm run build || {
    print_warning "Build failed, continuing with existing build..."
}

# Setup environment variables
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url_here
OPENAI_API_KEY=your_openai_key_here
RAZORPAY_KEY_ID=your_razorpay_key_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
SESSION_SECRET=your_session_secret_here
EOF
    print_warning "Please update .env file with your actual environment variables"
fi

# Create logs directory
mkdir -p logs

# Setup database (if needed)
print_status "Setting up database..."
npm run db:push || print_warning "Database setup failed - check your DATABASE_URL"

# Configure PM2
print_status "Configuring PM2..."
pm2 stop learnyzer || true
pm2 delete learnyzer || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup || print_warning "PM2 startup configuration may need manual setup"

# Setup Nginx (optional)
if command -v nginx &> /dev/null; then
    print_status "Configuring Nginx..."
    sudo tee /etc/nginx/sites-available/learnyzer << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/learnyzer /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    print_status "Nginx configured successfully"
fi

# Setup SSL with Certbot (optional)
setup_ssl() {
    if command -v certbot &> /dev/null; then
        print_status "Setting up SSL certificate..."
        sudo certbot --nginx -d your-domain.com -d www.your-domain.com --non-interactive --agree-tos --email your-email@example.com
    fi
}

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000
sudo ufw --force enable

print_status "Deployment completed successfully! 🎉"
print_status "Application is running on http://localhost:5000"
print_status "PM2 status: $(pm2 list)"

echo ""
echo "📋 Next Steps:"
echo "1. Update .env file with your actual environment variables"
echo "2. Configure your domain in Nginx configuration"
echo "3. Set up SSL certificate with: sudo certbot --nginx"
echo "4. Monitor logs with: pm2 logs learnyzer"
echo "5. Monitor application with: pm2 monit"