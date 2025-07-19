# 🚀 Learnyzer CI/CD Deployment Guide

This guide will help you set up automated deployments to your EC2 server using GitHub Actions.

## 📋 Overview

**Current Configuration:**
- **EC2 Host:** `ec2-13-235-75-64.ap-south-1.compute.amazonaws.com`
- **EC2 User:** `ubuntu`
- **Project Directory:** `/home/ubuntu/Learnyzer`
- **Production Port:** `5000`

## 🔧 One-Time Setup

### Step 1: Configure GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value |
|-------------|--------|
| `EC2_HOST` | `ec2-13-235-75-64.ap-south-1.compute.amazonaws.com` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Your EC2 private key content (see below) |
| `DATABASE_URL` | `postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer` |
| `OPENAI_API_KEY` | `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` |
| `TWOFACTOR_API_KEY` | `75c5f204-57d8-11f0-a562-0200cd936042` |
| `RAZORPAY_KEY_ID` | `rzp_test_KofqomcGyXcjRP` |
| `RAZORPAY_KEY_SECRET` | `dqYO8RMzv4QaEiTOiP97fLka` |

### Step 2: Get Your EC2 SSH Key

**On your local machine:**
```bash
# Display your EC2 private key
cat ~/.ssh/your-ec2-key.pem

# Copy the ENTIRE output including:
# -----BEGIN RSA PRIVATE KEY-----
# [key content]
# -----END RSA PRIVATE KEY-----
```

Paste this complete content as the `EC2_SSH_KEY` secret value.

### Step 3: Setup EC2 Server

**Run this on your EC2 server:**
```bash
# Navigate to project directory
cd ~/Learnyzer

# Run the deployment configuration script
chmod +x deploy/deploy-config.sh
./deploy/deploy-config.sh
```

This creates:
- `ecosystem.config.js` - PM2 process configuration
- `deploy-manual.sh` - Manual deployment script
- `logs/` - Log directory

## 🚀 How It Works

### Automatic Deployment
- Every push to `main` branch triggers automatic deployment
- GitHub Actions builds the frontend and deploys to EC2
- PM2 manages the production server process

### Manual Deployment
If you need to deploy manually on EC2:
```bash
cd ~/Learnyzer
./deploy-manual.sh
```

### Workflow Triggers
- **Push to main/master branch** - Automatic deployment
- **Manual trigger** - Go to Actions tab → "Deploy to EC2" → "Run workflow"

## 📊 Monitoring & Management

### Server Status
```bash
# Check PM2 status
pm2 status

# View live logs
pm2 logs learnyzer

# Monitor in real-time
pm2 monit

# Restart server
pm2 restart learnyzer

# Stop server
pm2 stop learnyzer
```

### Server Health Check
```bash
# Test if server is responding
curl http://localhost:5000/api/health

# Check if port is listening
ss -tlnp | grep :5000
```

### View Deployment Logs
- **GitHub Actions:** Repository → Actions tab
- **Server Logs:** `pm2 logs learnyzer`
- **Error Logs:** `pm2 logs learnyzer --err`

## 🔧 Troubleshooting

### Common Issues

**1. GitHub Actions Fails - SSH Connection**
- Verify `EC2_HOST`, `EC2_USER`, and `EC2_SSH_KEY` secrets
- Ensure EC2 security group allows SSH (port 22)

**2. GitHub Actions Fails - Build Issues**
- Check Actions tab for build errors
- Verify all environment secrets are set correctly

**3. Server Not Responding After Deployment**
- SSH to EC2: `ssh -i ~/.ssh/your-key.pem ubuntu@ec2-13-235-75-64.ap-south-1.compute.amazonaws.com`
- Check logs: `pm2 logs learnyzer`
- Check if port 5000 is open in security group

**4. Manual Deployment Needed**
```bash
cd ~/Learnyzer
pm2 delete learnyzer
./deploy-manual.sh
```

### Debug Commands
```bash
# Check EC2 system resources
df -h           # Disk space
free -h         # Memory usage
top             # CPU usage

# Check Node.js processes
ps aux | grep node

# Check port availability
netstat -tlnp | grep :5000
```

## 🌐 Access Your Application

**After successful deployment:**
- **Live URL:** `http://ec2-13-235-75-64.ap-south-1.compute.amazonaws.com:5000`
- **Health Check:** `http://ec2-13-235-75-64.ap-south-1.compute.amazonaws.com:5000/api/health`

## 📝 Development Workflow

1. **Make changes** locally or on Replit
2. **Commit and push** to main branch
3. **GitHub Actions** automatically deploys
4. **Monitor deployment** in Actions tab
5. **Verify** application is running on EC2

## 🔒 Security Notes

- All sensitive data is stored as GitHub Secrets (encrypted)
- SSH key is never exposed in logs or workflow files
- Environment variables are securely passed to EC2
- Production server runs with minimal privileges

## ✅ Success Indicators

**Deployment Successful When You See:**
- ✅ GitHub Actions workflow completes without errors
- ✅ PM2 shows "online" status: `pm2 status`
- ✅ Health check responds: `curl http://localhost:5000/api/health`
- ✅ Application accessible at live URL

Your Learnyzer platform is now ready for continuous deployment! 🎉