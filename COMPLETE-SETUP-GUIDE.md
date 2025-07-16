# Complete GitHub + AWS Setup Guide

## 🚀 Overview
This guide sets up automatic deployment: **Replit → GitHub → AWS EC2** with complete CI/CD pipeline.

---

## Part 1: GitHub Repository Setup

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create new repository
2. Name: `learnyzer` (or your preferred name)
3. Set as **Public** or **Private**
4. Don't initialize with README (we'll push existing code)

### Step 2: Generate Personal Access Token
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: `Replit-Auto-Deploy`
4. Expiration: `90 days` (or longer)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again)

### Step 3: Configure Replit Secrets
1. In Replit: **Tools → Secrets**
2. Add these secrets:
   ```
   GITHUB_TOKEN = ghp_your_token_here
   ```

### Step 4: Connect Repository to Replit
```bash
# Run this in Replit shell
git remote add origin https://github.com/YOUR_USERNAME/learnyzer.git
git branch -M main
```

---

## Part 2: AWS EC2 Setup

### Step 1: Launch EC2 Instance
1. **AWS Console → EC2 → Launch Instance**
2. **Name**: `learnyzer-production`
3. **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance type**: `t2.micro` (free tier) or `t3.small` (recommended)
5. **Key pair**: Create new key pair
   - Name: `learnyzer-key`
   - Type: RSA
   - Format: .pem
   - **Download and save securely**
6. **Security Group**: Create new
   - SSH (22): Your IP
   - HTTP (80): Anywhere (0.0.0.0/0)
   - HTTPS (443): Anywhere (0.0.0.0/0)
   - Custom TCP (5000): Anywhere (0.0.0.0/0)
7. **Storage**: 20 GB gp3 (free tier: 30GB gp2)
8. **Launch instance**

### Step 2: Connect to EC2 Instance
```bash
# From your local machine (not Replit)
chmod 400 learnyzer-key.pem
ssh -i learnyzer-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3: Setup EC2 Instance
```bash
# On EC2 instance, run our setup script
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/learnyzer.git
cd learnyzer
chmod +x scripts/setup-ec2.sh
sudo ./scripts/setup-ec2.sh
```

### Step 4: Configure Environment Variables
```bash
# On EC2 instance
cd /home/ubuntu/learnyzer
nano .env
```

Add your production environment variables:
```env
NODE_ENV=production
PORT=5000

# Database (use your production database)
DATABASE_URL=postgresql://username:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-your-production-key

# Razorpay (production keys)
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_live_secret

# Session
SESSION_SECRET=your-super-secure-production-secret

# Optional services
TWOFACTOR_API_KEY=your-2factor-key
```

---

## Part 3: GitHub Actions CI/CD Setup

### Step 1: Add GitHub Secrets
1. **GitHub Repository → Settings → Secrets and variables → Actions**
2. **Add these Repository Secrets**:
   ```
   EC2_HOST = YOUR_EC2_PUBLIC_IP
   EC2_USERNAME = ubuntu
   EC2_SSH_KEY = [paste entire content of learnyzer-key.pem file]
   EC2_PORT = 22
   APP_URL = http://YOUR_EC2_PUBLIC_IP:5000
   ```

### Step 2: Test GitHub Actions
The workflow file is already created in `.github/workflows/deploy.yml`. It will automatically trigger on push to main branch.

---

## Part 4: Domain & SSL Setup (Optional but Recommended)

### Step 1: Configure Domain
1. **Buy domain** (Namecheap, GoDaddy, etc.)
2. **Point A record** to your EC2 public IP:
   ```
   @ → YOUR_EC2_PUBLIC_IP
   www → YOUR_EC2_PUBLIC_IP
   ```

### Step 2: Setup SSL Certificate
```bash
# On EC2 instance
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 3: Update Nginx Configuration
```bash
# Edit domain in nginx config
sudo nano /etc/nginx/sites-available/learnyzer
# Replace 'your-domain.com' with your actual domain
sudo nginx -t
sudo systemctl reload nginx
```

---

## Part 5: Database Setup

### Option A: Neon Database (Recommended)
1. Go to [Neon](https://neon.tech)
2. Create new project: `learnyzer-production`
3. Copy connection string
4. Update `DATABASE_URL` in EC2 `.env` file

### Option B: AWS RDS PostgreSQL
1. **AWS Console → RDS → Create database**
2. **Engine**: PostgreSQL
3. **Template**: Free tier
4. **DB instance identifier**: `learnyzer-db`
5. **Master username**: `learnyzer`
6. **Master password**: Generate secure password
7. **Connectivity**: Same VPC as EC2, allow EC2 security group
8. **Create database**
9. Use connection string in `.env`

---

## Part 6: Testing Complete Setup

### Step 1: Test Replit → GitHub Auto-Push
```bash
# In Replit Shell
./scripts/setup-github-integration.sh
# Follow prompts, then start auto-push
./scripts/auto-push.sh
```

### Step 2: Test GitHub → EC2 Deployment
```bash
# In Replit, make a small change and push
echo "// Test deployment" >> client/src/App.tsx
git add .
git commit -m "Test automatic deployment"
git push origin main
```

### Step 3: Verify Deployment
1. **Check GitHub Actions**: Repository → Actions tab
2. **Check EC2 application**: `http://YOUR_EC2_IP:5000`
3. **Check logs**: SSH to EC2 and run `pm2 logs learnyzer`

---

## Part 7: Monitoring & Maintenance

### Setup Monitoring
```bash
# On EC2 instance
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Setup basic monitoring
sudo apt install htop iotop
```

### Backup Strategy
```bash
# On EC2 instance
# Setup automated backups
crontab -e
# Add this line for daily backups at 2 AM:
0 2 * * * /home/ubuntu/learnyzer/scripts/backup.sh
```

### Health Monitoring
- **Application**: `http://yourdomain.com/api/health`
- **PM2 Status**: `pm2 status`
- **System**: `htop`
- **Logs**: `pm2 logs learnyzer`

---

## 🎯 Complete Workflow

Once everything is setup:

1. **Code in Replit** → Changes detected automatically
2. **Auto-commit & push** → GitHub repository updated (30s delay)
3. **GitHub Actions triggered** → Build, test, deploy to EC2
4. **Production application** → Updated automatically

---

## 🔧 Troubleshooting

### Common Issues

**GitHub Actions failing:**
```bash
# Check secrets in GitHub repository settings
# Verify EC2 instance is running and accessible
# Check SSH key format (entire .pem file content)
```

**EC2 deployment failing:**
```bash
# SSH to EC2 and check logs
pm2 logs learnyzer
# Check disk space
df -h
# Check memory
free -h
```

**Application not starting:**
```bash
# Check environment variables
cat .env
# Check database connection
npm run db:push
# Restart application
pm2 restart learnyzer
```

**Domain/SSL issues:**
```bash
# Check nginx configuration
sudo nginx -t
# Renew SSL certificate
sudo certbot renew
# Check DNS propagation
nslookup yourdomain.com
```

---

## 📞 Support Checklist

Before asking for help, check:
- [ ] GitHub token has correct permissions
- [ ] EC2 instance is running and accessible
- [ ] Environment variables are set correctly
- [ ] Database connection works
- [ ] Domain DNS is configured correctly
- [ ] SSL certificate is valid
- [ ] GitHub Actions secrets are correct

---

## 🎉 Success Indicators

Your setup is working correctly when:
- ✅ Replit auto-pushes to GitHub
- ✅ GitHub Actions deploy successfully
- ✅ Application runs on EC2
- ✅ Health endpoint responds: `/api/health`
- ✅ Domain points to your application
- ✅ SSL certificate is active

**Total setup time: 30-60 minutes**