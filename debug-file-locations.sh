#!/bin/bash

echo "🔍 DEBUGGING FILE LOCATIONS ON EC2"
echo "=================================="

echo "Current directory:"
pwd

echo ""
echo "Checking if we're in the right Learnyzer directory:"
ls -la

echo ""
echo "Looking for public directory:"
find /home/ubuntu -name "public" -type d 2>/dev/null

echo ""
echo "Looking for sitemap.xml files:"
find /home/ubuntu -name "sitemap.xml" 2>/dev/null

echo ""
echo "Looking for robots.txt files:"
find /home/ubuntu -name "robots.txt" 2>/dev/null

echo ""
echo "Looking for manifest.json files:"
find /home/ubuntu -name "manifest.json" 2>/dev/null

echo ""
echo "Checking if files exist in current directory:"
echo "public/sitemap.xml exists: $([ -f public/sitemap.xml ] && echo 'YES' || echo 'NO')"
echo "public/robots.txt exists: $([ -f public/robots.txt ] && echo 'YES' || echo 'NO')" 
echo "public/manifest.json exists: $([ -f public/manifest.json ] && echo 'YES' || echo 'NO')"

echo ""
echo "Directory structure:"
tree public/ 2>/dev/null || ls -la public/ 2>/dev/null || echo "No public directory found"