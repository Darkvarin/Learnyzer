#!/bin/bash

# Manual GitHub Push Script
# Usage: ./scripts/push-to-github.sh "commit message"

set -e

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

# Get commit message from argument or prompt
COMMIT_MSG="$1"
if [ -z "$COMMIT_MSG" ]; then
    echo -n "Enter commit message: "
    read COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Update from Replit - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
fi

print_status "Starting GitHub push process..."

# Configure GitHub authentication if token is available
if [ ! -z "$GITHUB_TOKEN" ]; then
    print_status "Configuring GitHub authentication..."
    git config credential.helper store
    echo "https://${GITHUB_TOKEN}@github.com" > ~/.git-credentials
fi

# Check if there are changes to commit
if git diff --quiet && git diff --staged --quiet; then
    print_warning "No changes detected. Nothing to commit."
    exit 0
fi

# Show what will be committed
print_info "Changes to be committed:"
git status --porcelain

# Add all changes
print_status "Adding changes..."
git add .

# Create commit
print_status "Creating commit: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push to GitHub
print_status "Pushing to GitHub..."
if git push origin main; then
    print_status "Successfully pushed to GitHub! 🚀"
    
    # Get the repository URL for easy access
    REPO_URL=$(git remote get-url origin | sed 's/\.git$//')
    if [[ $REPO_URL == https://* ]]; then
        print_info "View your changes: $REPO_URL"
    fi
    
    # Show latest commit info
    print_info "Latest commit: $(git log -1 --oneline)"
    
else
    print_error "Failed to push to GitHub"
    print_warning "This might be due to:"
    print_warning "1. Network connectivity issues"
    print_warning "2. Authentication problems (check GITHUB_TOKEN)"
    print_warning "3. Repository permissions"
    print_warning "4. Merge conflicts (pull latest changes first)"
    
    print_info "Try pulling latest changes first:"
    print_info "git pull origin main"
    exit 1
fi