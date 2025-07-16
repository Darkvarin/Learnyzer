#!/bin/bash

# Quick Start Script for Complete Setup
# This script guides you through the entire setup process

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN} $1 ${NC}"
    echo -e "${CYAN}================================${NC}"
}

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

prompt_user() {
    echo -e "${YELLOW}❓ $1${NC}"
    read -p "   → " response
    echo "$response"
}

confirm_action() {
    echo -e "${YELLOW}❓ $1 (y/n)${NC}"
    read -p "   → " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

print_header "Learnyzer Complete Setup Guide"
echo "This script will guide you through setting up:"
echo "• GitHub repository integration"
echo "• Automatic push from Replit to GitHub"
echo "• CI/CD pipeline for AWS EC2 deployment"
echo ""

# Step 1: Check prerequisites
print_header "Step 1: Prerequisites Check"

if ! command -v git &> /dev/null; then
    print_error "Git not found. Please install Git first."
    exit 1
fi

if ! command -v curl &> /dev/null; then
    print_error "curl not found. Please install curl first."
    exit 1
fi

print_status "Prerequisites satisfied"
echo ""

# Step 2: GitHub Repository Setup
print_header "Step 2: GitHub Repository Setup"

echo "Before continuing, please:"
echo "1. Create a GitHub repository (public or private)"
echo "2. Generate a Personal Access Token with 'repo' permissions"
echo "3. Add GITHUB_TOKEN to Replit Secrets"
echo ""

if confirm_action "Have you completed these steps?"; then
    GITHUB_REPO=$(prompt_user "Enter your GitHub repository URL (https://github.com/username/repo.git):")
    
    if [[ $GITHUB_REPO =~ ^https://github\.com/.+/.+\.git$ ]]; then
        print_status "Valid GitHub repository URL"
    else
        print_error "Invalid GitHub repository URL format"
        exit 1
    fi
else
    print_info "Please complete GitHub setup first, then run this script again"
    exit 0
fi

# Step 3: Configure Git Remote
print_header "Step 3: Git Configuration"

if git remote get-url origin >/dev/null 2>&1; then
    current_remote=$(git remote get-url origin)
    print_info "Current remote: $current_remote"
    
    if confirm_action "Update remote to $GITHUB_REPO?"; then
        git remote set-url origin "$GITHUB_REPO"
        print_status "Remote updated"
    fi
else
    git remote add origin "$GITHUB_REPO"
    print_status "Remote added"
fi

# Set up git user if not configured
if [ -z "$(git config user.name)" ]; then
    GIT_NAME=$(prompt_user "Enter your name for Git commits:")
    git config user.name "$GIT_NAME"
fi

if [ -z "$(git config user.email)" ]; then
    GIT_EMAIL=$(prompt_user "Enter your email for Git commits:")
    git config user.email "$GIT_EMAIL"
fi

print_status "Git configuration complete"
echo ""

# Step 4: Test GitHub Authentication
print_header "Step 4: GitHub Authentication Test"

if [ -z "$GITHUB_TOKEN" ]; then
    print_error "GITHUB_TOKEN not found in environment"
    print_info "Please add GITHUB_TOKEN to Replit Secrets:"
    print_info "1. Go to Tools → Secrets in Replit"
    print_info "2. Add: GITHUB_TOKEN = your_github_token_here"
    print_info "3. Restart this script"
    exit 1
fi

if curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user >/dev/null; then
    print_status "GitHub authentication successful"
else
    print_error "GitHub authentication failed"
    print_info "Please check your GITHUB_TOKEN in Replit Secrets"
    exit 1
fi

echo ""

# Step 5: Setup Scripts
print_header "Step 5: Script Configuration"

chmod +x scripts/*.sh
print_status "Made all scripts executable"

# Test initial push
if confirm_action "Test initial push to GitHub?"; then
    if [ -z "$(git log --oneline 2>/dev/null)" ]; then
        git add .
        git commit -m "Initial commit: Learnyzer setup"
        git branch -M main
    fi
    
    if git push origin main; then
        print_status "Initial push successful!"
    else
        print_error "Initial push failed"
        print_info "You may need to resolve conflicts manually"
    fi
fi

echo ""

# Step 6: AWS EC2 Information
print_header "Step 6: AWS EC2 Setup Information"

echo "For AWS EC2 deployment, you'll need:"
echo ""
echo "Required Information:"
echo "• EC2 Public IP Address"
echo "• SSH Key (.pem file)"
echo "• Database URL (Neon, AWS RDS, etc.)"
echo "• Production API keys (OpenAI, Razorpay, etc.)"
echo ""

print_info "GitHub Secrets to add in your repository:"
print_info "• EC2_HOST = your_ec2_public_ip"
print_info "• EC2_USERNAME = ubuntu"
print_info "• EC2_SSH_KEY = content_of_your_pem_file"
print_info "• EC2_PORT = 22"
print_info "• APP_URL = http://your_ec2_ip:5000"
echo ""

# Step 7: Auto-Push Setup
print_header "Step 7: Automatic Push Setup"

if confirm_action "Start automatic push monitoring now?"; then
    print_status "Starting auto-push in background..."
    print_info "This will monitor file changes and push to GitHub automatically"
    print_info "Press Ctrl+C to stop monitoring"
    echo ""
    
    ./scripts/auto-push.sh
else
    print_info "You can start auto-push later with: ./scripts/auto-push.sh"
fi

echo ""

# Final Summary
print_header "Setup Complete!"

print_status "✅ Git repository configured"
print_status "✅ GitHub authentication working"
print_status "✅ Scripts ready for deployment"
print_status "✅ Auto-push system available"

echo ""
print_info "📋 Next Steps:"
print_info "1. Setup EC2 instance using: ./scripts/setup-ec2.sh"
print_info "2. Add GitHub Secrets in repository settings"
print_info "3. Configure production environment variables"
print_info "4. Test deployment pipeline"

echo ""
print_info "📚 Documentation:"
print_info "• Complete guide: COMPLETE-SETUP-GUIDE.md"
print_info "• GitHub integration: GITHUB-AUTO-PUSH.md"
print_info "• Deployment guide: README-DEPLOYMENT.md"

echo ""
print_info "🔧 Available Commands:"
print_info "• Manual push: ./scripts/push-to-github.sh 'message'"
print_info "• Auto push: ./scripts/auto-push.sh"
print_info "• Verify setup: ./scripts/verify-setup.sh"
print_info "• Two-way sync: ./scripts/sync-with-github.sh"

print_status "🎉 Your Learnyzer platform is ready for automatic deployment!"