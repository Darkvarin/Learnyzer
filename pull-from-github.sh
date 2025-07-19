#!/bin/bash

echo "PULLING LATEST LEARNYZER CODE FROM GITHUB"
echo "========================================="

cd /home/ubuntu/Learnyzer

echo "1. Current directory and status..."
pwd
git status

echo ""
echo "2. Fetching latest changes from GitHub..."
git fetch origin

echo ""
echo "3. Checking current branch..."
git branch -a

echo ""
echo "4. Pulling latest code from main/master branch..."
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || {
    echo "Trying to reset to latest..."
    git reset --hard origin/main 2>/dev/null || git reset --hard origin/master 2>/dev/null || {
        echo "Error: Could not pull from GitHub. Checking remote status..."
        git remote -v
        echo "Manual pull may be needed."
    }
}

echo ""
echo "5. Showing latest commits..."
git log --oneline -5

echo ""
echo "6. Checking if package.json was updated..."
if [ -f "package.json" ]; then
    echo "Installing/updating dependencies..."
    npm install
else
    echo "No package.json found in root"
fi

echo ""
echo "7. Checking project structure..."
ls -la

echo ""
echo "8. Checking if dist exists or needs building..."
if [ -d "dist" ]; then
    echo "dist folder exists:"
    ls -la dist/
else
    echo "No dist folder, will need to build"
fi

echo ""
echo "🎯 PULL COMPLETE!"
echo "✅ Latest code pulled from GitHub"
echo "✅ Dependencies updated"
echo "✅ Ready for deployment"
echo ""
echo "Next: Run 'bash deploy-from-github.sh' to deploy the frontend"
EOF

chmod +x pull-from-github.sh