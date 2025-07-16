#!/bin/bash

# Complete Setup Verification Script
# This script verifies your entire GitHub + AWS setup

set -e

echo "🔍 Verifying complete GitHub + AWS setup..."

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

# Verification functions
check_git_setup() {
    echo "📡 Checking Git configuration..."
    
    if git remote get-url origin >/dev/null 2>&1; then
        local remote_url=$(git remote get-url origin)
        print_status "Git remote configured: $remote_url"
    else
        print_error "Git remote not configured"
        print_info "Run: git remote add origin https://github.com/YOUR_USERNAME/learnyzer.git"
        return 1
    fi
    
    if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
        print_warning "Git user not configured"
        print_info "Run: git config user.name 'Your Name' && git config user.email 'your@email.com'"
    else
        print_status "Git user configured: $(git config user.name) <$(git config user.email)>"
    fi
}

check_github_token() {
    echo "🔑 Checking GitHub authentication..."
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "GITHUB_TOKEN not set in Replit Secrets"
        print_info "Add GITHUB_TOKEN to Replit Secrets with your GitHub Personal Access Token"
        return 1
    else
        print_status "GITHUB_TOKEN is configured"
        
        # Test GitHub API access
        if curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user >/dev/null; then
            print_status "GitHub API access working"
        else
            print_error "GitHub API access failed - check token validity"
            return 1
        fi
    fi
}

check_scripts() {
    echo "📜 Checking deployment scripts..."
    
    local scripts=("git-setup.sh" "push-to-github.sh" "auto-push.sh" "setup-github-integration.sh" "deploy.sh" "setup-ec2.sh")
    
    for script in "${scripts[@]}"; do
        if [ -f "scripts/$script" ]; then
            if [ -x "scripts/$script" ]; then
                print_status "scripts/$script exists and is executable"
            else
                print_warning "scripts/$script exists but not executable"
                chmod +x "scripts/$script"
                print_status "Made scripts/$script executable"
            fi
        else
            print_error "scripts/$script not found"
        fi
    done
}

check_github_actions() {
    echo "🚀 Checking GitHub Actions workflow..."
    
    if [ -f ".github/workflows/deploy.yml" ]; then
        print_status "GitHub Actions workflow exists"
        
        # Check if required secrets would be available
        print_info "Required GitHub Secrets for CI/CD:"
        print_info "  - EC2_HOST (your EC2 public IP)"
        print_info "  - EC2_USERNAME (ubuntu)"
        print_info "  - EC2_SSH_KEY (content of .pem file)"
        print_info "  - EC2_PORT (22)"
        print_info "  - APP_URL (http://your-ec2-ip:5000)"
    else
        print_error "GitHub Actions workflow not found"
        return 1
    fi
}

check_docker_setup() {
    echo "🐳 Checking Docker configuration..."
    
    if [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ]; then
        print_status "Docker configuration files exist"
    else
        print_warning "Docker files missing (optional for deployment)"
    fi
    
    if [ -f "nginx.conf" ]; then
        print_status "Nginx configuration exists"
    else
        print_warning "Nginx configuration missing"
    fi
}

check_health_endpoint() {
    echo "🏥 Checking health endpoint..."
    
    if grep -q "/api/health" server/routes.ts; then
        print_status "Health endpoint configured in routes"
    else
        print_error "Health endpoint not found in server/routes.ts"
        return 1
    fi
}

check_environment_template() {
    echo "🔧 Checking environment configuration..."
    
    print_info "Environment variables needed for production:"
    print_info "  - NODE_ENV=production"
    print_info "  - PORT=5000"
    print_info "  - DATABASE_URL=postgresql://..."
    print_info "  - OPENAI_API_KEY=sk-..."
    print_info "  - RAZORPAY_KEY_ID=rzp_..."
    print_info "  - RAZORPAY_KEY_SECRET=..."
    print_info "  - SESSION_SECRET=..."
    
    if [ -f ".env.example" ] || [ -f ".env.template" ]; then
        print_status "Environment template exists"
    else
        print_warning "Consider creating .env.example for documentation"
    fi
}

test_manual_push() {
    echo "📤 Testing manual GitHub push..."
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_warning "Skipping push test - no GITHUB_TOKEN"
        return 0
    fi
    
    # Create a test file
    echo "# Test file created $(date)" > .setup-test-$(date +%s).tmp
    git add .setup-test-*.tmp
    
    if git commit -m "Setup verification test - $(date)"; then
        print_status "Test commit created"
        
        if git push origin main; then
            print_status "Manual push successful!"
            
            # Clean up test file
            git rm .setup-test-*.tmp
            git commit -m "Clean up setup test file"
            git push origin main
        else
            print_error "Manual push failed"
            return 1
        fi
    else
        print_info "No changes to commit for test"
        rm -f .setup-test-*.tmp
    fi
}

# Main verification sequence
main() {
    echo "🎯 Starting complete setup verification..."
    echo "This will check your Replit → GitHub → AWS pipeline"
    echo ""
    
    local failed_checks=0
    
    check_git_setup || ((failed_checks++))
    echo ""
    
    check_github_token || ((failed_checks++))
    echo ""
    
    check_scripts || ((failed_checks++))
    echo ""
    
    check_github_actions || ((failed_checks++))
    echo ""
    
    check_docker_setup || ((failed_checks++))
    echo ""
    
    check_health_endpoint || ((failed_checks++))
    echo ""
    
    check_environment_template || ((failed_checks++))
    echo ""
    
    if [ $failed_checks -eq 0 ]; then
        test_manual_push || ((failed_checks++))
        echo ""
    fi
    
    # Summary
    echo "📊 Verification Summary:"
    echo "========================"
    
    if [ $failed_checks -eq 0 ]; then
        print_status "All checks passed! Your setup is ready! 🎉"
        echo ""
        print_info "Next steps:"
        print_info "1. Setup EC2 instance using: scripts/setup-ec2.sh"
        print_info "2. Configure GitHub Secrets in repository settings"
        print_info "3. Start auto-push: ./scripts/auto-push.sh"
        print_info "4. Test deployment by pushing changes"
    else
        print_error "$failed_checks check(s) failed"
        print_info "Fix the issues above and run this script again"
    fi
    
    echo ""
    print_info "For detailed setup instructions, see: COMPLETE-SETUP-GUIDE.md"
}

# Run verification
main "$@"