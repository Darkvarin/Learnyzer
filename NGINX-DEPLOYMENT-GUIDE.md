# Learnyzer Nginx Deployment Guide

## Complete Custom Domain Setup with SEO Optimization

This guide walks you through deploying Learnyzer on nginx with your custom domain, SSL, and optimized SEO configuration.

### Prerequisites
- Ubuntu/Debian server with root access
- Domain name pointed to your server IP
- Node.js application running on port 5000

### Step 1: Prepare Your Domain
```bash
# Update your DNS A records to point to your server IP
# A record: learnyzer.com → YOUR_SERVER_IP
# A record: www.learnyzer.com → YOUR_SERVER_IP
```

### Step 2: Install Nginx
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
```

### Step 3: Deploy Learnyzer Files
```bash
# Make the deployment script executable and run it
chmod +x deploy-to-nginx.sh
./deploy-to-nginx.sh

# This script will:
# - Create /var/www/learnyzer.com/html directory
# - Build your React frontend for production
# - Copy all files including SEO assets (sitemap.xml, robots.txt, manifest.json)
# - Configure nginx with proper proxy settings
# - Start your Node.js backend with PM2
```

### Step 4: Set Up SSL Certificate
```bash
# Run the SSL setup script
chmod +x ssl-setup.sh
./ssl-setup.sh

# This script will:
# - Install Certbot for Let's Encrypt
# - Obtain SSL certificates for your domain
# - Configure nginx with SSL/TLS
# - Set up automatic certificate renewal
# - Add security headers for SEO benefits
```

### Step 5: Verify Deployment
After running the scripts, verify your deployment:

```bash
# Check nginx status
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates

# Check PM2 status
pm2 status

# Test your website
curl -I https://learnyzer.com
```

### SEO Assets Verification
Your SEO assets should be accessible at:
- **Sitemap**: https://learnyzer.com/sitemap.xml
- **Robots**: https://learnyzer.com/robots.txt
- **PWA Manifest**: https://learnyzer.com/manifest.json

### Nginx Configuration Overview

The nginx setup includes:

#### Frontend Serving
- Static React app served from `/var/www/learnyzer.com/html/`
- Gzip compression for faster loading
- Cache headers for static assets
- Fallback to `index.html` for React routing

#### API Proxying
- All `/api/*` requests proxied to Node.js on port 5000
- WebSocket support for real-time features
- Proper headers for authentication

#### SEO Optimization
- Security headers for better search ranking
- SSL/TLS encryption (required by Google)
- Canonical URL redirects (www → non-www)
- Proper MIME types for all assets

#### Performance Features
- HTTP/2 support for faster loading
- Gzip compression for text assets
- Long-term caching for static resources
- Optimized SSL configuration

### Troubleshooting

#### Nginx Not Starting
```bash
# Check configuration syntax
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

#### SSL Issues
```bash
# Renew certificates manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

#### Node.js Backend Issues
```bash
# Check PM2 logs
pm2 logs learnyzer

# Restart backend
pm2 restart learnyzer
```

### Monitoring and Maintenance

#### Daily Checks
- Monitor SSL certificate expiry
- Check PM2 process status
- Review nginx access logs

#### Weekly Tasks
- Update system packages
- Check disk space usage
- Review application logs

#### Monthly Tasks
- Backup database
- Update dependencies
- Security audit

### SEO Submission Checklist

After deployment, submit your site to search engines:

1. **Google Search Console**
   - Add property: https://learnyzer.com
   - Submit sitemap: https://learnyzer.com/sitemap.xml
   - Request indexing for key pages

2. **Google Analytics**
   - Set up GA4 tracking
   - Configure goals for student registrations
   - Monitor entrance exam search traffic

3. **Bing Webmaster Tools**
   - Add site and verify ownership
   - Submit sitemap for Bing indexing

### Performance Optimization

Your nginx setup includes these performance optimizations:

- **Gzip Compression**: Reduces file sizes by ~70%
- **HTTP/2**: Faster multiplexed connections
- **Static Caching**: 1-year cache for assets
- **SSL Session Reuse**: Faster SSL handshakes
- **Connection Keep-Alive**: Reduces connection overhead

### Security Features

Built-in security features:

- **SSL/TLS Encryption**: End-to-end security
- **Security Headers**: XSS protection, content type validation
- **HSTS**: Forces HTTPS connections
- **Rate Limiting**: Prevents abuse (configure as needed)
- **Firewall Rules**: Block malicious traffic

### Files Created

This deployment creates:
- `deploy-to-nginx.sh` - Main deployment script
- `ssl-setup.sh` - SSL certificate setup
- `update-sitemap-domain.sh` - Domain updating utility
- `nginx-seo-config.conf` - Reference nginx configuration
- Updated sitemap.xml with your domain
- Updated SEO components with canonical URLs

### Support

For deployment issues:
1. Check nginx error logs: `/var/log/nginx/error.log`
2. Check PM2 logs: `pm2 logs learnyzer`
3. Verify DNS propagation: `dig learnyzer.com`
4. Test SSL: `openssl s_client -connect learnyzer.com:443`

Your Learnyzer platform is now production-ready with enterprise-grade nginx deployment, SSL security, and comprehensive SEO optimization!