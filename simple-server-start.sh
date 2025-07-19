#!/bin/bash

echo "🚀 SIMPLE SERVER START"
echo "====================="

cd ~/Learnyzer

# 1. Clean environment
sudo pkill -f tsx 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

# 2. Load environment variables
export $(grep -v '^#' .env | xargs)
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"

# 3. Start server in foreground first
echo "Starting server in foreground..."
tsx server/index.ts