#!/bin/bash

# Learnyzer Backup Script
# Run this daily via cron: 0 2 * * * /home/ubuntu/learnyzer/scripts/backup.sh

set -e

# Configuration
APP_DIR="/home/ubuntu/learnyzer"
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_status "Starting backup process..."

# Backup database
if [ ! -z "$DATABASE_URL" ]; then
    print_status "Backing up database..."
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database_$DATE.sql"
    gzip "$BACKUP_DIR/database_$DATE.sql"
else
    print_warning "No DATABASE_URL found, skipping database backup"
fi

# Backup application files (excluding node_modules and logs)
print_status "Backing up application files..."
cd "$APP_DIR"
tar --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.git' \
    --exclude='dist' \
    -czf "$BACKUP_DIR/app_$DATE.tar.gz" .

# Backup PM2 configuration
print_status "Backing up PM2 configuration..."
pm2 save
cp ~/.pm2/dump.pm2 "$BACKUP_DIR/pm2_$DATE.json" 2>/dev/null || true

# Clean old backups
print_status "Cleaning old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.json" -mtime +$RETENTION_DAYS -delete

# List current backups
print_status "Current backups:"
ls -lh "$BACKUP_DIR"

print_status "Backup completed successfully!"

# Optional: Upload to S3 or other cloud storage
# aws s3 sync "$BACKUP_DIR" s3://your-backup-bucket/learnyzer/