import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'course' | 'exam';
  structuredData?: object;
}

export function SEOHead({
  title = "LearnityX - AI-Powered Indian Entrance Exam Preparation",
  description = "Master JEE, NEET, UPSC, CLAT, and CUET with AI tutoring, gamified learning, and personalized study plans. Join thousands of successful students.",
  keywords = "JEE preparation, NEET coaching, UPSC preparation, CLAT exam, CUET preparation, entrance exam AI, Indian competitive exams, AI tutor",
  ogImage = "/images/learnity-og-default.jpg",
  canonical,
  type = 'website',
  structuredData
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    
    // Update Twitter Card tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Update canonical URL
    if (canonical) {
      updateCanonicalLink(canonical);
    }

    // Add structured data
    if (structuredData) {
      updateStructuredData(structuredData);
    }

    // Add breadcrumb JSON-LD if not homepage
    if (window.location.pathname !== '/') {
      addBreadcrumbStructuredData();
    }

  }, [title, description, keywords, ogImage, canonical, type, structuredData]);

  return null;
}

function updateMetaTag(name: string, content: string, attribute: string = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonicalLink(href: string) {
  let canonical = document.querySelector('link[rel="canonical"]');
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  
  canonical.setAttribute('href', href);
}

function updateStructuredData(data: object) {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]#dynamic-seo');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'dynamic-seo';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function addBreadcrumbStructuredData() {
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) return;

  const breadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": window.location.origin
    }
  ];

  segments.forEach((segment, index) => {
    const name = formatBreadcrumbName(segment);
    const url = window.location.origin + '/' + segments.slice(0, index + 1).join('/');
    
    breadcrumbs.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": name,
      "item": url
    });
  });

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs
  };

  updateStructuredData(breadcrumbData);
}

function formatBreadcrumbName(segment: string): string {
  const nameMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'ai-tools': 'AI Tools',
    'ai-tutor': 'AI Tutor',
    'ai-visual-lab': 'Visual Learning Lab',
    'battle-zone': 'Study Battles',
    'profile': 'Profile',
    'leaderboard': 'Leaderboard',
    'study-notes': 'Study Notes Generator',
    'answer-checker': 'Answer Checker',
    'performance': 'Performance Analytics'
  };

  return nameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
}