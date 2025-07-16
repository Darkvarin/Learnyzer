# Learnyzer Deployment Guide

This guide provides comprehensive instructions for deploying Learnyzer to your EC2 instance using CI/CD.

## Quick Start

1. **Setup EC2 Instance**
   ```bash
   # On your EC2 instance
   curl -O https://raw.githubusercontent.com/YOUR_USERNAME/learnyzer/main/scripts/setup-ec2.sh
   chmod +x setup-ec2.sh
   sudo ./setup-ec2.sh
   ```

2. **Configure GitHub Secrets**
   Go to your GitHub repository → Settings → Secrets and Variables → Actions, and add:
   - `EC2_HOST`: Your EC2 public IP address
   - `EC2_USERNAME`: `ubuntu` (or `ec2-user` for Amazon Linux)
   - `EC2_SSH_KEY`: Your private SSH key content
   - `EC2_PORT`: `22` (default SSH port)
   - `APP_URL`: `http://YOUR_EC2_IP:5000`

3. **Deploy**
   ```bash
   git push origin main
   ```
   The GitHub Actions workflow will automatically deploy your app!

## Deployment Options

### Option 1: GitHub Actions CI/CD (Recommended)

The CI/CD pipeline automatically:
- ✅ Builds and tests your application
- ✅ Deploys to EC2 via SSH
- ✅ Manages PM2 process
- ✅ Runs health checks

**Files:**
- `.github/workflows/deploy.yml` - Main CI/CD workflow
- `ecosystem.config.js` - PM2 configuration

### Option 2: Manual Deployment

```bash
# Clone repository on EC2
git clone https://github.com/YOUR_USERNAME/learnyzer.git
cd learnyzer

# Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Option 3: Docker Deployment

```bash
# Build and run with Docker
docker-compose up -d

# Or build manually
docker build -t learnyzer .
docker run -d -p 5000:5000 --env-file .env learnyzer
```

## Environment Variables

Create `.env` file on your EC2 instance:

```bash
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# Razorpay
RAZORPAY_KEY_ID=rzp_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key

# Session
SESSION_SECRET=your-super-secret-session-key

# Optional: 2Factor SMS
TWOFACTOR_API_KEY=your-2factor-key
```

## Server Configuration

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Certificate

```bash
# Install Certbot and get SSL certificate
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Monitoring & Maintenance

### PM2 Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs learnyzer

# Restart application
pm2 restart learnyzer

# Monitor in real-time
pm2 monit

# Save current PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Health Check

```bash
# Check if application is running
curl http://localhost:5000/api/health
```

### Database Operations

```bash
# Run database migrations
npm run db:push

# Seed database
npm run db:seed
```

## Security Checklist

- [ ] Update system packages regularly
- [ ] Configure firewall (UFW)
- [ ] Use HTTPS with SSL certificates
- [ ] Set up regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Use strong passwords for all services
- [ ] Keep Node.js and dependencies updated

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check PM2 logs
   pm2 logs learnyzer
   
   # Check system resources
   htop
   df -h
   ```

2. **Database connection errors**
   ```bash
   # Test database connection
   npm run db:push
   ```

3. **Port already in use**
   ```bash
   # Find process using port 5000
   sudo lsof -i :5000
   
   # Kill process
   sudo kill -9 PID
   ```

4. **GitHub Actions deployment fails**
   - Check GitHub Secrets are correct
   - Verify EC2 instance is accessible
   - Check SSH key permissions

### Logs Location

- **PM2 logs**: `~/.pm2/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **Application logs**: `./logs/`

## Performance Optimization

1. **Enable Gzip compression** (handled by Nginx)
2. **Use Redis for session storage** (optional)
3. **Set up CloudFlare** for CDN and DDoS protection
4. **Monitor with PM2 Plus** for advanced analytics

## Backup Strategy

```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf learnyzer_backup_$(date +%Y%m%d).tar.gz /home/ubuntu/learnyzer

# Automated daily backups (add to crontab)
0 2 * * * /home/ubuntu/learnyzer/scripts/backup.sh
```

## Support

- **Application Health**: http://your-domain.com/api/health
- **PM2 Status**: `pm2 status`
- **System Status**: `systemctl status nginx`
- **Logs**: `pm2 logs learnyzer`

For more help, check the application logs or contact support.