import type { Express, Request, Response } from "express";

// Define site routes with priorities and update frequencies
const siteRoutes = [
  {
    url: "/",
    priority: 1.0,
    changefreq: "daily",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/dashboard",
    priority: 0.9,
    changefreq: "daily",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/ai-tutor",
    priority: 0.9,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/ai-visual-lab",
    priority: 0.8,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/ai-tools",
    priority: 0.8,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/ai-tools/study-notes",
    priority: 0.7,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/ai-tools/answer-checker",
    priority: 0.7,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/ai-tools/performance",
    priority: 0.7,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/battle-zone",
    priority: 0.8,
    changefreq: "daily",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/leaderboard",
    priority: 0.6,
    changefreq: "daily",
    lastmod: new Date().toISOString().split('T')[0]
  }
];

// Exam-specific pages for better SEO
const examPages = [
  {
    url: "/jee-preparation",
    priority: 0.9,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/neet-preparation",
    priority: 0.9,
    changefreq: "weekly", 
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/upsc-preparation",
    priority: 0.9,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/clat-preparation",
    priority: 0.8,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: "/cuet-preparation",
    priority: 0.8,
    changefreq: "weekly",
    lastmod: new Date().toISOString().split('T')[0]
  }
];

export function generateSitemap(baseUrl: string): string {
  const allRoutes = [...siteRoutes, ...examPages];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  allRoutes.forEach(route => {
    sitemap += `
  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

export function generateRobotsTxt(baseUrl: string): string {
  return `User-agent: *
Allow: /

# Important pages for crawlers
Allow: /
Allow: /dashboard
Allow: /ai-tutor
Allow: /ai-visual-lab
Allow: /ai-tools
Allow: /battle-zone
Allow: /jee-preparation
Allow: /neet-preparation
Allow: /upsc-preparation
Allow: /clat-preparation
Allow: /cuet-preparation

# Block admin and sensitive areas
Disallow: /admin
Disallow: /api/
Disallow: /security-dashboard
Disallow: /lead-generation

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1`;
}

export function setupSEORoutes(app: Express): void {
  // Sitemap.xml route
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    try {
      const protocol = req.secure ? 'https' : 'http';
      const baseUrl = `${protocol}://${req.get('host')}`;
      const sitemap = generateSitemap(baseUrl);
      
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      });
      
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Robots.txt route
  app.get('/robots.txt', (req: Request, res: Response) => {
    try {
      const protocol = req.secure ? 'https' : 'http';
      const baseUrl = `${protocol}://${req.get('host')}`;
      const robotsTxt = generateRobotsTxt(baseUrl);
      
      res.set({
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      });
      
      res.send(robotsTxt);
    } catch (error) {
      console.error('Error generating robots.txt:', error);
      res.status(500).send('Error generating robots.txt');
    }
  });

  // Schema.org JSON-LD for organization
  app.get('/.well-known/schema.json', (req: Request, res: Response) => {
    try {
      const protocol = req.secure ? 'https' : 'http';
      const baseUrl = `${protocol}://${req.get('host')}`;
      
      const schema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "Learnyzer",
        "description": "AI-powered preparation platform for Indian entrance exams including JEE, NEET, UPSC, CLAT, and CUET",
        "url": baseUrl,
        "logo": `${baseUrl}/images/logo.png`,
        "sameAs": [
          "https://www.facebook.com/learnyzer",
          "https://twitter.com/learnyzer",
          "https://www.instagram.com/learnyzer"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "India"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service"
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "JEE Preparation Course",
            "description": "Comprehensive JEE Main and Advanced preparation with AI tutoring",
            "category": "education"
          },
          {
            "@type": "Offer",
            "name": "NEET Preparation Course", 
            "description": "Complete NEET preparation with personalized AI guidance",
            "category": "education"
          },
          {
            "@type": "Offer",
            "name": "UPSC Preparation Course",
            "description": "Civil services exam preparation with AI-powered study plans",
            "category": "education"
          }
        ]
      };
      
      res.set({
        'Content-Type': 'application/ld+json',
        'Cache-Control': 'public, max-age=86400'
      });
      
      res.json(schema);
    } catch (error) {
      console.error('Error generating schema:', error);
      res.status(500).json({ error: 'Error generating schema' });
    }
  });
}