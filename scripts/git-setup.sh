#!/bin/bash

# GitHub Integration Setup for Replit
# This script configures automatic GitHub synchronization

set -e

echo "🔧 Setting up GitHub integration for Replit..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    git branch -M main
fi

# Configure Git user (use Replit environment or prompt for input)
if [ -z "$(git config user.name)" ]; then
    print_status "Configuring Git user..."
    git config user.name "${REPL_OWNER:-Learnyzer Developer}"
    git config user.email "${REPL_OWNER:-learnyzer}@replit.users.noreply.github.com"
fi

# Check if GitHub remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    print_warning "GitHub remote not configured. Please add your repository:"
    print_info "Run: git remote add origin https://github.com/YOUR_USERNAME/learnyzer.git"
    print_info "Or with SSH: git remote add origin git@github.com:YOUR_USERNAME/learnyzer.git"
    exit 1
fi

print_status "GitHub remote configured: $(git remote get-url origin)"

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    print_status "Creating .gitignore file..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
.nuxt/

# Logs
logs/
*.log
.npm
.eslintcache

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Database
*.sqlite
*.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Replit specific
.replit
.upm
.breakpoints
.replit.nix

# Temporary files
tmp/
temp/
.cache/

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# PM2
.pm2/
EOF
fi

# Create initial commit if no commits exist
if [ -z "$(git log --oneline 2>/dev/null)" ]; then
    print_status "Creating initial commit..."
    git add .
    git commit -m "Initial commit: Learnyzer AI-powered educational platform"
fi

print_status "Git setup completed successfully!"
echo ""
print_info "Next steps:"
print_info "1. Configure GitHub Personal Access Token in Replit Secrets"
print_info "2. Run: ./scripts/auto-push.sh to enable automatic pushing"
print_info "3. Or use: ./scripts/push-to-github.sh for manual pushes"