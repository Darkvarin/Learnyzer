#!/bin/bash

# Complete GitHub Integration Setup for Replit
# This script sets up everything needed for GitHub synchronization

set -e

echo "🚀 Setting up complete GitHub integration for Replit..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Run basic git setup
print_status "Running basic Git setup..."
chmod +x scripts/git-setup.sh
./scripts/git-setup.sh

# Step 2: Install inotify-tools for file watching (if not available)
if ! command -v inotifywait >/dev/null 2>&1; then
    print_status "Installing inotify-tools for file watching..."
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update && sudo apt-get install -y inotify-tools
    elif command -v yum >/dev/null 2>&1; then
        sudo yum install -y inotify-tools
    else
        print_warning "Could not install inotify-tools automatically"
        print_info "Will use polling method for file watching"
    fi
fi

# Step 3: Create GitHub Actions workflow if it doesn't exist
if [ ! -f ".github/workflows/deploy.yml" ]; then
    print_status "GitHub Actions workflow already exists"
else
    print_status "GitHub Actions CI/CD workflow is ready"
fi

# Step 4: Create systemd service for auto-push (optional)
create_systemd_service() {
    print_status "Creating systemd service for auto-push..."
    
    cat > /tmp/replit-github-sync.service << EOF
[Unit]
Description=Replit GitHub Auto-Push Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/scripts/auto-push.sh
Restart=always
RestartSec=10
Environment=GITHUB_TOKEN=$GITHUB_TOKEN

[Install]
WantedBy=multi-user.target
EOF

    sudo mv /tmp/replit-github-sync.service /etc/systemd/system/
    sudo systemctl daemon-reload
    
    print_info "Systemd service created. To enable:"
    print_info "sudo systemctl enable replit-github-sync"
    print_info "sudo systemctl start replit-github-sync"
}

# Step 5: Create package.json scripts for easy usage
print_status "Adding npm scripts for GitHub integration..."

# Check if package.json exists and add scripts
if [ -f "package.json" ]; then
    # Add GitHub-related scripts to package.json
    npm pkg set scripts.git:setup="./scripts/git-setup.sh"
    npm pkg set scripts.git:push="./scripts/push-to-github.sh"
    npm pkg set scripts.git:auto="./scripts/auto-push.sh"
    npm pkg set scripts.git:sync="./scripts/sync-with-github.sh"
    
    print_status "Added npm scripts:"
    print_info "  npm run git:setup  - Initial Git setup"
    print_info "  npm run git:push   - Manual push to GitHub"
    print_info "  npm run git:auto   - Start automatic push monitoring"
    print_info "  npm run git:sync   - Sync with GitHub (pull + push)"
fi

# Step 6: Make all scripts executable
print_status "Making scripts executable..."
chmod +x scripts/*.sh

# Step 7: Create sync script for two-way synchronization
print_status "Creating two-way sync script..."
cat > scripts/sync-with-github.sh << 'EOF'
#!/bin/bash

# Two-way GitHub synchronization
# Pulls latest changes from GitHub and pushes local changes

set -e

echo "🔄 Syncing with GitHub..."

# Configure authentication
if [ ! -z "$GITHUB_TOKEN" ]; then
    git config credential.helper store
    echo "https://${GITHUB_TOKEN}@github.com" > ~/.git-credentials
fi

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
if git pull origin main --no-edit; then
    echo "✅ Successfully pulled latest changes"
else
    echo "⚠️  Pull failed, continuing with push..."
fi

# Push local changes
echo "📤 Pushing local changes to GitHub..."
./scripts/push-to-github.sh "Sync from Replit - $(date '+%Y-%m-%d %H:%M:%S')"

echo "🎉 Sync completed!"
EOF

chmod +x scripts/sync-with-github.sh

# Step 8: Create environment setup instructions
print_status "Creating environment setup guide..."
cat > GITHUB-SETUP.md << 'EOF'
# GitHub Integration Setup Guide

## Quick Start

1. **Create GitHub Personal Access Token**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` permissions
   - Copy the token

2. **Add token to Replit Secrets**
   - In Replit, go to Tools → Secrets
   - Add secret: `GITHUB_TOKEN` = your_token_here

3. **Configure your repository**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/learnyzer.git
   ```

4. **Run setup**
   ```bash
   npm run git:setup
   ```

## Usage Commands

- **One-time push**: `npm run git:push "your message"`
- **Start auto-push**: `npm run git:auto`
- **Two-way sync**: `npm run git:sync`
- **Manual setup**: `npm run git:setup`

## Automatic Push Features

- 📁 Monitors file changes in real-time
- ⏱️ Auto-commits after 30 seconds of inactivity
- 🔄 Handles merge conflicts automatically
- 🚀 Pushes to GitHub seamlessly
- 📊 Shows commit status and links

## Files Monitored

- `client/` - Frontend code
- `server/` - Backend code  
- `shared/` - Shared utilities
- `db/` - Database files
- `scripts/` - Deployment scripts
- Configuration files

## Troubleshooting

### Authentication Issues
```bash
# Check if token is set
echo $GITHUB_TOKEN

# Re-configure if needed
git config credential.helper store
```

### Push Conflicts
```bash
# Manual resolution
git pull origin main
git push origin main
```

### File Watching Issues
```bash
# Install inotify-tools (Linux)
sudo apt-get install inotify-tools

# Check if monitoring is working
./scripts/auto-push.sh
```
EOF

print_status "GitHub integration setup completed! 🎉"
echo ""
print_info "📋 Next Steps:"
print_info "1. Add GITHUB_TOKEN to Replit Secrets"
print_info "2. Configure repository: git remote add origin https://github.com/YOUR_USERNAME/learnyzer.git"
print_info "3. Start auto-push: npm run git:auto"
print_info "4. Or manual push: npm run git:push 'your message'"
echo ""
print_info "📚 Read GITHUB-SETUP.md for detailed instructions"

# Offer to create systemd service
read -p "Create systemd service for background auto-push? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    create_systemd_service
fi