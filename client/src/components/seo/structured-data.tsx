// Structured data templates for different page types

export const createEducationalOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "LearnityX",
  "description": "AI-powered preparation platform for Indian entrance exams including JEE, NEET, UPSC, CLAT, and CUET",
  "url": window.location.origin,
  "logo": `${window.location.origin}/images/logo.png`,
  "sameAs": [
    "https://www.facebook.com/learnityX",
    "https://twitter.com/learnityX",
    "https://www.instagram.com/learnityX"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "India"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXX-XXX-XXXX",
    "contactType": "customer service"
  }
});

export const createCourseSchema = (course: {
  name: string;
  description: string;
  category: string;
  difficulty: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": course.name,
  "description": course.description,
  "provider": {
    "@type": "EducationalOrganization",
    "name": "LearnityX"
  },
  "courseMode": "online",
  "educationalLevel": course.difficulty,
  "about": course.category,
  "inLanguage": "en",
  "isAccessibleForFree": false,
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "instructor": {
      "@type": "Person",
      "name": "AI Tutor"
    }
  }
});

export const createExamPreparationSchema = (exam: string) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": `${exam} Preparation Course`,
  "description": `Comprehensive ${exam} preparation with AI tutoring, practice tests, and personalized study plans`,
  "provider": {
    "@type": "EducationalOrganization",
    "name": "LearnityX"
  },
  "courseMode": "online",
  "educationalLevel": "advanced",
  "about": `${exam} entrance examination`,
  "teaches": [
    "Problem solving techniques",
    "Time management",
    "Exam strategies",
    "Subject mastery"
  ],
  "inLanguage": ["en", "hi"],
  "isAccessibleForFree": false,
  "offers": {
    "@type": "Offer",
    "category": "education",
    "priceCurrency": "INR"
  }
});

export const createSoftwareApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LearnityX",
  "description": "AI-powered learning platform for competitive exam preparation",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
    "category": "freemium"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
    "bestRating": "5"
  },
  "featureList": [
    "AI Tutoring",
    "Gamified Learning",
    "Progress Tracking",
    "Study Battles",
    "Performance Analytics"
  ]
});

export const createArticleSchema = (article: {
  title: string;
  description: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "author": {
    "@type": "Organization",
    "name": article.author || "LearnityX Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "LearnityX",
    "logo": {
      "@type": "ImageObject",
      "url": `${window.location.origin}/images/logo.png`
    }
  },
  "datePublished": article.datePublished || new Date().toISOString(),
  "dateModified": article.dateModified || new Date().toISOString(),
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": window.location.href
  }
});

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const createWebPageSchema = (page: {
  title: string;
  description: string;
  type?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": page.title,
  "description": page.description,
  "url": window.location.href,
  "isPartOf": {
    "@type": "WebSite",
    "name": "LearnityX",
    "url": window.location.origin
  },
  "about": page.type || "education",
  "inLanguage": "en"
});

export const createLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "LearnityX",
  "description": "AI-powered learning platform for Indian competitive exams",
  "url": window.location.origin,
  "logo": `${window.location.origin}/images/logo.png`,
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "India"
  },
  "priceRange": "₹₹",
  "serviceArea": {
    "@type": "Country",
    "name": "India"
  }
});