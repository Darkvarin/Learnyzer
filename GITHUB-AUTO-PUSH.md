# Automatic GitHub Push from Replit

## 🚀 Complete Setup Guide

### Step 1: Quick Setup
```bash
# Run the complete setup
chmod +x scripts/setup-github-integration.sh
./scripts/setup-github-integration.sh
```

### Step 2: Configure GitHub Token
1. **Generate Personal Access Token**:
   - Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full repository access)
   - Copy the generated token

2. **Add to Replit Secrets**:
   - In Replit: Tools → Secrets
   - Add: `GITHUB_TOKEN` = `your_token_here`

### Step 3: Configure Repository
```bash
# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/learnyzer.git

# Or update existing remote
git remote set-url origin https://github.com/YOUR_USERNAME/learnyzer.git
```

## 🔄 Usage Options

### Option 1: Manual Push (Quick)
```bash
./scripts/push-to-github.sh "Your commit message"
```

### Option 2: Automatic Monitoring (Recommended)
```bash
# Start automatic file watching and pushing
./scripts/auto-push.sh
```
This will:
- ✅ Monitor all code changes in real-time
- ✅ Auto-commit after 30 seconds of inactivity  
- ✅ Push to GitHub automatically
- ✅ Handle merge conflicts
- ✅ Show commit status and repository links

### Option 3: Two-Way Sync
```bash
# Pull from GitHub + Push local changes
./scripts/sync-with-github.sh
```

### Option 4: Run in Background (Advanced)
```bash
# Start auto-push in background
nohup ./scripts/auto-push.sh > auto-push.log 2>&1 &

# Check if running
ps aux | grep auto-push

# Stop background process
pkill -f auto-push.sh
```

## 📁 Monitored Files & Directories

The auto-push system watches:
- `client/` - React frontend code
- `server/` - Express backend code
- `shared/` - Shared types and utilities
- `db/` - Database schemas and migrations
- `scripts/` - Deployment and utility scripts
- Root config files: `package.json`, `tsconfig.json`, etc.

## ⚙️ Features

### Smart Change Detection
- Ignores temporary files (`.tmp`, `.swp`, `.log`)
- Skips build outputs (`node_modules`, `dist`)
- Only commits meaningful changes

### Automatic Conflict Resolution
- Pulls latest changes before pushing
- Attempts automatic merge for conflicts
- Falls back to manual intervention if needed

### Detailed Logging
- Shows which files changed
- Displays commit messages with timestamps
- Provides GitHub repository links

## 🔧 Advanced Configuration

### Customize Watch Behavior
Edit `scripts/auto-push.sh`:
```bash
WATCH_DELAY=30    # Seconds to wait after changes
MAX_WAIT=300      # Force push after 5 minutes
```

### Add Custom Watch Patterns
```bash
# Add to WATCH_DIRS array
WATCH_DIRS=("client" "server" "shared" "db" "scripts" "your-custom-dir")

# Add to WATCH_FILES array  
WATCH_FILES=("package.json" "tsconfig.json" "your-config.json")
```

## 🚨 Troubleshooting

### Authentication Issues
```bash
# Check if token is properly set
echo $GITHUB_TOKEN

# Re-authenticate manually
git config credential.helper store
echo "https://${GITHUB_TOKEN}@github.com" > ~/.git-credentials
```

### Push Failures
```bash
# Check repository status
git status
git remote -v

# Manual conflict resolution
git pull origin main --no-edit
git push origin main
```

### File Watching Not Working
```bash
# Install inotify-tools (Linux)
sudo apt-get update && sudo apt-get install -y inotify-tools

# Check if inotify is available
which inotifywait

# Test manual push
./scripts/push-to-github.sh "test commit"
```

### Common Issues & Solutions

1. **"Permission denied" errors**
   ```bash
   chmod +x scripts/*.sh
   ```

2. **"No remote repository" error**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/learnyzer.git
   ```

3. **"Authentication failed" error**
   - Check GITHUB_TOKEN in Replit Secrets
   - Ensure token has `repo` permissions
   - Regenerate token if expired

4. **"Nothing to commit" warnings**
   - Normal behavior when no changes detected
   - System only pushes when files actually change

## 📊 Workflow Integration

### With CI/CD Pipeline
The auto-push integrates seamlessly with your existing CI/CD:
1. **Replit** → Auto-push changes to GitHub
2. **GitHub Actions** → Deploy to EC2 automatically
3. **EC2** → Production application updated

### Development Workflow
```
Edit code in Replit → Auto-commit (30s delay) → Push to GitHub → Trigger CI/CD → Deploy to EC2
```

## 🎯 Best Practices

1. **Use descriptive commit messages** when manually pushing
2. **Review changes** before starting auto-push monitoring
3. **Test deployment** after major changes
4. **Monitor logs** for any push failures
5. **Keep tokens secure** in Replit Secrets only

## 📝 Quick Commands Reference

```bash
# Setup (one-time)
./scripts/setup-github-integration.sh

# Manual operations
./scripts/push-to-github.sh "message"    # Single push
./scripts/sync-with-github.sh           # Two-way sync
./scripts/git-setup.sh                  # Initial git config

# Automatic monitoring
./scripts/auto-push.sh                  # Start monitoring
nohup ./scripts/auto-push.sh &         # Background mode
pkill -f auto-push.sh                  # Stop monitoring
```

Your Learnyzer platform now has complete automatic GitHub synchronization! 🎉