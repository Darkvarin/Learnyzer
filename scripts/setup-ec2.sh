#!/bin/bash

# EC2 Initial Setup Script for Learnyzer
# Run this script on a fresh EC2 instance

set -e

echo "🔧 Setting up EC2 instance for Learnyzer..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 20
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
print_status "Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install PostgreSQL client (if using external DB)
print_status "Installing PostgreSQL client..."
sudo apt install -y postgresql-client

# Create application user (optional)
if ! id "learnyzer" &>/dev/null; then
    print_status "Creating application user..."
    sudo useradd -m -s /bin/bash learnyzer
    sudo usermod -aG www-data learnyzer
fi

# Setup directories
print_status "Setting up directories..."
sudo mkdir -p /var/log/learnyzer
sudo mkdir -p /var/www/learnyzer
sudo chown -R ubuntu:ubuntu /var/www/learnyzer

# Configure Git (if needed)
print_status "Configuring Git..."
git config --global user.name "EC2 Deployment"
git config --global user.email "deploy@learnyzer.com"

# Setup SSH key for GitHub (optional)
print_status "Setting up SSH key for GitHub..."
if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -C "ec2-deploy@learnyzer.com" -f ~/.ssh/id_rsa -N ""
    print_warning "Add this public key to your GitHub repository:"
    cat ~/.ssh/id_rsa.pub
fi

# Install Docker (optional for containerized deployment)
install_docker() {
    print_status "Installing Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker ubuntu
    sudo systemctl enable docker
    sudo systemctl start docker
}

# Setup monitoring (optional)
setup_monitoring() {
    print_status "Setting up basic monitoring..."
    sudo apt install -y htop iotop nethogs
    
    # Install Node.js monitoring tools
    sudo npm install -g clinic
}

# Configure system limits
print_status "Configuring system limits..."
sudo tee -a /etc/security/limits.conf << EOF
ubuntu soft nofile 65536
ubuntu hard nofile 65536
ubuntu soft nproc 65536
ubuntu hard nproc 65536
EOF

# Configure sysctl
sudo tee -a /etc/sysctl.conf << EOF
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 65536
net.core.netdev_max_backlog = 65536
EOF

# Enable and start services
print_status "Enabling services..."
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl enable pm2-ubuntu || true

# Setup basic security
print_status "Configuring basic security..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create deployment directory
print_status "Creating deployment directory..."
mkdir -p /home/ubuntu/learnyzer
cd /home/ubuntu/learnyzer

print_status "EC2 setup completed! 🎉"

echo ""
echo "📋 Next Steps:"
echo "1. Clone your repository: git clone https://github.com/YOUR_USERNAME/learnyzer.git ."
echo "2. Run the deployment script: ./scripts/deploy.sh"
echo "3. Configure your GitHub secrets for CI/CD:"
echo "   - EC2_HOST: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "   - EC2_USERNAME: ubuntu"
echo "   - EC2_SSH_KEY: (your private SSH key)"
echo "   - EC2_PORT: 22"
echo "   - APP_URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "4. Your SSH public key for GitHub:"
cat ~/.ssh/id_rsa.pub