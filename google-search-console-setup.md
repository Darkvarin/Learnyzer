# Google Search Console Setup Guide for Learnyzer

## Step 1: Submit Your Site to Google Search Console

### 1. Access Google Search Console
- Go to: https://search.google.com/search-console/
- Sign in with your Google account (use learnyzer.ai@gmail.com if possible)

### 2. Add Your Property
- Click "Add Property"
- Select "URL prefix" method
- Enter: `https://learnyzer.com`
- Click "Continue"

### 3. Verify Domain Ownership
Google will provide several verification methods. The easiest for your setup:

**Option A: HTML File Upload (Recommended)**
- Download the verification HTML file from Google
- Upload it to your nginx web root: `/var/www/learnyzer.com/html/`
- Access it at: `https://learnyzer.com/google[verification-code].html`
- Click "Verify" in Search Console

**Option B: HTML Meta Tag**
- Copy the meta tag provided by Google
- Add it to your main React app's index.html head section
- Deploy the changes
- Click "Verify"

## Step 2: Submit Your Sitemap

Once verified:
1. In Google Search Console, go to "Sitemaps" section
2. Click "Add a new sitemap"
3. Enter: `sitemap.xml`
4. Click "Submit"

Your sitemap URL will be: `https://learnyzer.com/sitemap.xml`

## Step 3: Request Indexing for Key Pages

In Google Search Console:
1. Go to "URL Inspection" tool
2. Enter each important URL and click "Request Indexing":
   - `https://learnyzer.com/`
   - `https://learnyzer.com/landing`
   - `https://learnyzer.com/ai-tutor`
   - `https://learnyzer.com/ai-visual-lab`
   - `https://learnyzer.com/subscription`

## Step 4: Submit to Other Search Engines

### Bing Webmaster Tools
- Go to: https://www.bing.com/webmasters
- Add site: `https://learnyzer.com`
- Submit sitemap: `https://learnyzer.com/sitemap.xml`

### Yandex (for Russian users)
- Go to: https://webmaster.yandex.com/
- Add site and submit sitemap

## Current SEO Status ✅

Your site is already optimized with:
- ✅ **Sitemap.xml**: 25+ pages with proper priorities
- ✅ **Robots.txt**: Search engine directives configured
- ✅ **Manifest.json**: PWA configuration for mobile
- ✅ **Meta Tags**: Comprehensive title and description tags
- ✅ **Structured Data**: Schema.org markup for educational content
- ✅ **Mobile Responsive**: Perfect mobile experience
- ✅ **HTTPS Security**: SSL certificates with HTTP/2
- ✅ **Fast Loading**: nginx optimization with compression

## Expected Timeline

- **Initial Discovery**: 1-3 days
- **Basic Indexing**: 1-2 weeks
- **Full SEO Results**: 4-12 weeks
- **Competitive Rankings**: 3-6 months

Your comprehensive AI entrance exam platform is ready for search engine success!