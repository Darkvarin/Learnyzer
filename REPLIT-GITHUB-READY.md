# 🚀 READY FOR GITHUB CI/CD - Complete Setup Guide

## Your SSH Key (Ready for GitHub Secrets)

I've converted your PuTTY key. Use this **exact content** for the `EC2_SSH_KEY` secret:

```
-----BEGIN RSA PRIVATE KEY-----
AAABAQCsHbz0iRO38NYk14uL4T7gVciUUBS8bIan/5llxKlE5vTfsRJo1PU7lVyQ
7LrS3ddi5Otbe+bRKCZkrwRUeqW1OhJZnla/EQGoNYRRa3cEUOEAAPj0RUz641jq
mdmEhzmZCXRFShnr+1vROlhqEslGSy5qhypMHyJuJKpA7VlsEsj3ETpGNAtDRHfR
HhwjnS8Y6nhCmc/3WPE9d2VeKdDR6TdARawhr+EtjhMo3fhe78cBogjfgn22gJqz
+5PztfTYWCUwJR8mnrGNnCVcQAmYXCHD9MS5Q/YmDOfhDJTWFiKQqQ7AYr1AozWS
w4bx52357eYSwidfNqfJfWWMkf3RAAAAgQD9olPj3I3u9FQ5zKMO6SQEFRzjdDKt
Vwa2Dlw5nCOHI8yohFTvzkP75KrLl8jyn6Yhbh7ekWUICPSk769YNfyWZLb5j2fG
6CiXo6zFQYsP6tCIAs7Hkv6T92W6/6uWk5wQzs3aNU4aYiCkurlDWzxUld5LMu63
yATbzqVXCW87AwAAAIEAwWihLAbEcvtcEDOQtSil09KzMcC72tFcuN9ymQWFy7sL
3hFFsvxWBxUgyC7QRxysfd3OGIBqv69HCnPJY0sVz8SpQED/hsjSFB296/m4ZYCo
3rtDkmuneju4k9SqivhmEWQbtRUnSXfQHDZVzoeHH/EI9A1/qoMJ4/23MifZlhUA
AACAAvyRbFIIGPCGvqrusdWWPNjH9+81Y75PMohOdobhgbgytHKiExoNh+2GZyHy
0I9slcBmJ2ai22l8GRHc+tlQkwbNoP6yTm84yIY8QWDw7FynXQJgsO+jtayMYvYv
kVopnrY4PMody7oBYZmahElVrAkr3Pe1KsRzpIEtWthGf9g=
-----END RSA PRIVATE KEY-----
```

## 🔐 EXACT GitHub Secrets Configuration

**Go to your GitHub repository: Settings → Secrets and variables → Actions**

Add these **8 secrets** with these **exact values**:

### 1. EC2_HOST
```
ec2-13-235-75-64.ap-south-1.compute.amazonaws.com
```

### 2. EC2_USER
```
ubuntu
```

### 3. EC2_SSH_KEY
**Copy the entire SSH key block above** (including -----BEGIN and -----END lines)

### 4. DATABASE_URL
```
postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer
```

### 5. OPENAI_API_KEY
```
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
```

### 6. TWOFACTOR_API_KEY
```
75c5f204-57d8-11f0-a562-0200cd936042
```

### 7. RAZORPAY_KEY_ID
```
rzp_test_KofqomcGyXcjRP
```

### 8. RAZORPAY_KEY_SECRET
```
dqYO8RMzv4QaEiTOiP97fLka
```

## 🚀 Activate Auto-Deployment (3 Steps)

### Step 1: Setup EC2 Server
SSH to your server and run:
```bash
cd ~/Learnyzer
git pull origin main
chmod +x deploy/deploy-config.sh
./deploy/deploy-config.sh
```

### Step 2: Push to GitHub
From Replit or your local machine:
```bash
git add .
git commit -m "Activate CI/CD pipeline"
git push origin main
```

### Step 3: Watch Magic Happen
1. Go to your GitHub repository → **Actions** tab
2. You'll see "Deploy to EC2" workflow running
3. It automatically builds and deploys to your server
4. Your website will be live at: `http://ec2-13-235-75-64.ap-south-1.compute.amazonaws.com:5000`

## ✅ Verification

**After deployment completes:**
- Website: `http://ec2-13-235-75-64.ap-south-1.compute.amazonaws.com:5000`
- Health: `http://ec2-13-235-75-64.ap-south-1.compute.amazonaws.com:5000/api/health`
- SSH and check: `pm2 status`

## 🎉 Future Deployments

**Every time you push to main branch:**
1. GitHub Actions automatically builds frontend
2. Deploys to your EC2 server
3. Starts production server with PM2
4. Runs health checks
5. Your site is updated automatically

**No more manual deployment work needed!** Just push your code and it goes live.

## 🔧 Manual Deployment (Backup Option)

If you ever need to deploy manually:
```bash
ssh -i ~/.ssh/learnyzer-key.pem ubuntu@ec2-13-235-75-64.ap-south-1.compute.amazonaws.com
cd ~/Learnyzer
./deploy-manual.sh
```

**Your Learnyzer platform now has enterprise-grade CI/CD automation!** 🚀