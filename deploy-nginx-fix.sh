#!/bin/bash

# Simple deployment script for nginx SPA routing fix

echo "Deploying nginx SPA routing fix..."

# Backup existing config
sudo cp /etc/nginx/sites-available/learnyzer.com /etc/nginx/sites-available/learnyzer.com.backup

# Copy new config
sudo cp learnyzer-nginx.conf /etc/nginx/sites-available/learnyzer.com

# Test nginx config
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Config valid, reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx SPA routing fix deployed!"
    echo "Now test: https://learnyzer.com/dashboard"
else
    echo "❌ Config invalid, restoring backup..."
    sudo cp /etc/nginx/sites-available/learnyzer.com.backup /etc/nginx/sites-available/learnyzer.com
fi