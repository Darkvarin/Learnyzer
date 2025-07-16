#!/bin/bash

# Automatic GitHub Push with File Watching
# This script monitors file changes and automatically pushes to GitHub

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

# Configuration
WATCH_DELAY=30  # seconds to wait after last change before pushing
MAX_WAIT=300    # maximum seconds to wait before forcing a push
WATCH_DIRS=("client" "server" "shared" "db" "scripts")
WATCH_FILES=("package.json" "tsconfig.json" "vite.config.ts" "tailwind.config.ts")

print_status "Starting automatic GitHub sync..."
print_info "Watching directories: ${WATCH_DIRS[*]}"
print_info "Watching files: ${WATCH_FILES[*]}"
print_info "Auto-push delay: ${WATCH_DELAY}s"

# Check if inotify-tools is available (for Linux)
if command -v inotifywait >/dev/null 2>&1; then
    USE_INOTIFY=true
    print_status "Using inotify for file watching"
else
    USE_INOTIFY=false
    print_warning "inotify-tools not available, using polling method"
fi

# Function to check for changes and push
check_and_push() {
    if git diff --quiet && git diff --staged --quiet; then
        return 0  # No changes
    fi
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local commit_msg="Auto-update from Replit - $timestamp"
    
    print_status "Changes detected, preparing to push..."
    
    # Show changes
    print_info "Modified files:"
    git status --porcelain | head -10
    
    # Configure GitHub authentication
    if [ ! -z "$GITHUB_TOKEN" ]; then
        git config credential.helper store
        echo "https://${GITHUB_TOKEN}@github.com" > ~/.git-credentials
    fi
    
    # Add, commit, and push
    git add .
    git commit -m "$commit_msg" || {
        print_warning "Nothing to commit"
        return 0
    }
    
    if git push origin main; then
        print_status "Successfully auto-pushed to GitHub! 🚀"
        print_info "Commit: $commit_msg"
    else
        print_error "Failed to push to GitHub"
        # Try to pull and merge, then push again
        print_info "Attempting to resolve conflicts..."
        if git pull origin main --no-edit && git push origin main; then
            print_status "Conflicts resolved, successfully pushed!"
        else
            print_error "Auto-push failed, manual intervention required"
        fi
    fi
}

# Function to watch files using inotify
watch_with_inotify() {
    local watch_paths=""
    for dir in "${WATCH_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            watch_paths="$watch_paths $dir"
        fi
    done
    
    for file in "${WATCH_FILES[@]}"; do
        if [ -f "$file" ]; then
            watch_paths="$watch_paths $file"
        fi
    done
    
    print_info "Monitoring: $watch_paths"
    
    # Start watching
    inotifywait -m -r -e modify,create,delete,move $watch_paths |
    while read path action file; do
        # Skip temporary files and build outputs
        if [[ "$file" =~ \.(tmp|swp|log)$ ]] || [[ "$path" =~ (node_modules|dist|\.git) ]]; then
            continue
        fi
        
        print_info "Change detected: $action $path$file"
        
        # Wait for more changes
        sleep $WATCH_DELAY
        
        # Check and push
        check_and_push
    done
}

# Function to watch files using polling (fallback)
watch_with_polling() {
    local last_check=$(date +%s)
    local last_push=$(date +%s)
    
    while true do
        local current_time=$(date +%s)
        local time_since_push=$((current_time - last_push))
        
        # Check for changes
        if ! git diff --quiet || ! git diff --staged --quiet; then
            local time_since_check=$((current_time - last_check))
            
            if [ $time_since_check -ge $WATCH_DELAY ] || [ $time_since_push -ge $MAX_WAIT ]; then
                check_and_push
                last_push=$(date +%s)
            fi
            
            last_check=$current_time
        fi
        
        sleep 5
    done
}

# Trap to handle script termination
trap 'print_info "Auto-push monitoring stopped"; exit 0' SIGINT SIGTERM

# Initial push of any existing changes
print_status "Checking for initial changes..."
check_and_push

# Start file watching
if [ "$USE_INOTIFY" = true ]; then
    watch_with_inotify
else
    watch_with_polling
fi