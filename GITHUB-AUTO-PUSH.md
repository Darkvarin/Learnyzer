# 🚀 GitHub CI/CD Auto-Push Setup Guide

## Step 1: Convert SSH Key Format

Your SSH key is in PuTTY format (.ppk). For GitHub Actions, we need OpenSSH format.

### Option A: Using PuTTYgen (Recommended)
1. Open PuTTYgen
2. Load your `Learnyzer key_1752898338282.ppk` file
3. Go to **Conversions** → **Export OpenSSH key**
4. Save as `learnyzer-key.pem`
5. Copy the entire content of the `.pem` file

### Option B: Using your EC2 instance
If you have the original `.pem` file on your EC2 server:
```bash
cat ~/.ssh/learnyzer-key.pem
```

## Step 2: Configure GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions**

Click **"New repository secret"** for each:

| Secret Name | Value |
|-------------|--------|
| `EC2_HOST` | `ec2-13-235-75-64.ap-south-1.compute.amazonaws.com` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | **[Paste your converted OpenSSH private key here]** |
| `DATABASE_URL` | `postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer` |
| `OPENAI_API_KEY` | `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` |
| `TWOFACTOR_API_KEY` | `75c5f204-57d8-11f0-a562-0200cd936042` |
| `RAZORPAY_KEY_ID` | `rzp_test_KofqomcGyXcjRP` |
| `RAZORPAY_KEY_SECRET` | `dqYO8RMzv4QaEiTOiP97fLka` |

## Step 3: Setup EC2 Server (One-time)

SSH to your EC2 server and run:
```bash
cd ~/Learnyzer
git pull origin main  # Get the latest deployment scripts
chmod +x deploy/deploy-config.sh
./deploy/deploy-config.sh
```

## Step 4: Test Automated Deployment

1. **Make any small change** to your code (e.g., add a comment)
2. **Commit and push** to main branch:
   ```bash
   git add .
   git commit -m "Test automated deployment"
   git push origin main
   ```
3. **Watch GitHub Actions**:
   - Go to your repository → **Actions** tab
   - You should see "Deploy to EC2" workflow running
   - It will automatically build and deploy to your server

## Step 5: Verify Deployment

After GitHub Actions completes:
- Check your server: `http://ec2-13-235-75-64.ap-south-1.compute.amazonaws.com:5000`
- SSH to server and run: `pm2 status` to see running processes

## 🔧 Troubleshooting

### If SSH Key Conversion Fails:
You can also extract the private key manually from your PuTTY key file.

**For the EC2_SSH_KEY secret, use this format:**
```
-----BEGIN RSA PRIVATE KEY-----
[Your private key content from the .ppk file]
-----END RSA PRIVATE KEY-----
```

### If GitHub Actions Fails:
1. Check the **Actions** tab for error logs
2. Verify all secrets are correctly set
3. Ensure EC2 security group allows SSH (port 22)

### If Server Doesn't Start:
SSH to your server and check:
```bash
pm2 logs learnyzer
pm2 status
```

## 🎉 Success!

Once configured, every push to main branch will:
1. ✅ Build your frontend automatically
2. ✅ Deploy to EC2 server
3. ✅ Start production server with PM2
4. ✅ Run health checks
5. ✅ Show deployment status

**No more manual server management needed!**