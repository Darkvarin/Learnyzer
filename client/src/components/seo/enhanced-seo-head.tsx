import { useEffect } from 'react';

interface EnhancedSEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  examType?: string;
  subject?: string;
  pageType?: 'homepage' | 'exam-prep' | 'subject' | 'tool' | 'general';
}

export function EnhancedSEOHead({
  title = "Learnyzer - AI-Powered Indian Entrance Exam Preparation Platform | JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE",
  description = "Master all Indian competitive exams with AI tutoring, mock tests, study materials & personalized learning. Expert preparation for JEE, NEET, UPSC, CLAT, CUET, CSE & CGLE. Join thousands of successful students.",
  keywords = "JEE preparation, NEET coaching, UPSC study material, CLAT mock tests, CUET exam prep, CSE preparation, CGLE SSC-CGL, AI tutor, mock test generator, study notes, answer checker, physics preparation, chemistry preparation, mathematics preparation, biology preparation, entrance exam coaching, competitive exam preparation, online test series, previous year questions, exam pattern, syllabus, preparation strategy, doubt solving, concept clarity, exam tips, AI-powered learning, personalized study plan, performance analytics, rank improvement, score enhancement, Indian education, coaching institute alternative, best exam preparation app, adaptive learning, smart tutoring, educational technology",
  canonical,
  ogImage = "https://learnyzer.replit.app/images/learnyzer-og-image.svg",
  examType,
  subject,
  pageType = 'general'
}: EnhancedSEOHeadProps) {

  useEffect(() => {
    // Enhanced title based on exam type and subject
    let enhancedTitle = title;
    if (examType && subject) {
      enhancedTitle = `${subject} Preparation for ${examType} - AI Tutoring & Mock Tests | Learnyzer`;
    } else if (examType) {
      enhancedTitle = `${examType} Preparation - AI Tutoring, Mock Tests & Study Material | Learnyzer`;
    } else if (subject) {
      enhancedTitle = `${subject} Preparation - AI Tutoring & Practice Questions | Learnyzer`;
    }

    // Enhanced description based on context
    let enhancedDescription = description;
    if (examType) {
      const examDescriptions = {
        'JEE': 'Ace JEE Main & Advanced with AI tutoring for Physics, Chemistry & Mathematics. Mock tests, previous papers, doubt solving & rank improvement strategies.',
        'NEET': 'Master NEET UG with AI tutoring for Physics, Chemistry & Biology. Medical entrance preparation with mock tests, study material & performance analysis.',
        'UPSC': 'Excel in UPSC Civil Services with AI tutoring for General Studies, Current Affairs & Optional subjects. Comprehensive preparation for Prelims & Mains.',
        'CLAT': 'Succeed in CLAT with AI tutoring for Legal Reasoning, Logical Reasoning & English. Law entrance preparation with mock tests & practice questions.',
        'CUET': 'Clear CUET with AI tutoring for Domain subjects & General Test. Central university admission preparation with mock tests & study material.',
        'CSE': 'Master Computer Science with AI tutoring for Programming, Data Structures & Algorithms. Technical interview preparation & coding practice.',
        'CGLE': 'Crack SSC-CGL with AI tutoring for Quantitative Aptitude, General Awareness & English. Government job preparation with mock tests.'
      };
      enhancedDescription = examDescriptions[examType as keyof typeof examDescriptions] || description;
    }

    // Enhanced keywords based on exam and subject
    let enhancedKeywords = keywords;
    if (examType) {
      const examKeywords = {
        'JEE': ', IIT preparation, engineering entrance, JEE Main, JEE Advanced, IIT coaching, engineering college admission, JEE rank improvement, JEE study plan, JEE mock test online, JEE previous papers with solutions, JEE important topics, JEE exam pattern 2025, JEE preparation tips, JEE online coaching, best JEE preparation app, JEE physics problems, JEE chemistry reactions, JEE mathematics formulas, JEE cutoff marks, JEE counseling process, JEE preparation strategy, JEE study material PDF, JEE question bank, JEE practice tests',
        'NEET': ', medical entrance, NEET UG, AIIMS preparation, medical college admission, NEET rank improvement, NEET study plan, NEET mock test online, NEET previous papers with solutions, NEET important topics, NEET exam pattern 2025, NEET preparation tips, NEET online coaching, best NEET preparation app, NEET biology concepts, NEET physics numericals, NEET chemistry reactions, NEET cutoff marks, NEET counseling process, MBBS admission, medical coaching, zoology preparation, botany preparation, human physiology',
        'UPSC': ', civil services, IAS preparation, IPS preparation, IFS preparation, UPSC prelims, UPSC mains, UPSC interview, general studies, current affairs, Indian polity, geography preparation, history preparation, economics preparation, essay writing, answer writing practice, UPSC syllabus, UPSC mock test online, UPSC previous papers, UPSC study plan, UPSC preparation tips, UPSC online coaching, administrative services, government job preparation, public administration, optional subjects',
        'CLAT': ', law entrance, legal reasoning, logical reasoning, English comprehension, general knowledge, CLAT syllabus, CLAT mock test online, CLAT previous papers, law college admission, CLAT preparation tips, CLAT online coaching, best CLAT preparation app, legal studies, contract law, constitutional law, criminal law, tort law, law preparation strategy, CLAT cutoff marks, law university admission, legal aptitude test',
        'CUET': ', central university entrance, domain subjects, CUET syllabus, CUET mock test online, CUET previous papers, university admission, undergraduate admission, CUET preparation tips, CUET online coaching, domain specific subjects, general test preparation, language test preparation, CUET exam pattern, CUET cutoff marks, central university admission process',
        'CSE': ', computer science engineering, programming preparation, data structures and algorithms, coding practice, technical interview preparation, software engineering, computer networks, operating systems, database management, programming languages, competitive programming, system design, CS fundamentals, coding problems, technical concepts, placement preparation, software development',
        'CGLE': ', SSC CGL preparation, staff selection commission, government job preparation, quantitative aptitude, general awareness, English language, reasoning ability, SSC tier 1, SSC tier 2, SSC syllabus, SSC mock test online, SSC previous papers, central government job, SSC preparation tips, SSC online coaching, government exam preparation, SSC study material, SSC cutoff marks'
      };
      enhancedKeywords += examKeywords[examType as keyof typeof examKeywords] || '';
    }

    if (subject) {
      const subjectKeywords = {
        'Physics': ', physics concepts, physics formulas, mechanics, thermodynamics, electromagnetism, optics, modern physics, waves and oscillations, kinematics, dynamics, electricity and magnetism, atomic physics, nuclear physics, quantum mechanics, relativity, physics problems with solutions, physics numericals, applied physics, physics theory, physics practical',
        'Chemistry': ', chemistry concepts, chemistry formulas, organic chemistry, inorganic chemistry, physical chemistry, chemical bonding, periodic table, chemical reactions, stoichiometry, thermochemistry, electrochemistry, coordination compounds, biomolecules, polymers, chemical equations, analytical chemistry, chemistry problems with solutions, chemistry theory, chemistry practical',
        'Mathematics': ', mathematics concepts, mathematical formulas, algebra, calculus, geometry, trigonometry, coordinate geometry, statistics, probability, differential equations, integration, differentiation, vectors, matrices, complex numbers, sequences and series, mathematical reasoning, linear programming, mathematics problems with solutions, applied mathematics, mathematical theory',
        'Biology': ', biology concepts, cell biology, genetics, evolution, ecology, human physiology, plant physiology, molecular biology, biotechnology, anatomy, taxonomy, reproduction, photosynthesis, respiration, circulation, nervous system, endocrine system, immune system, biological processes, life sciences, biology theory, biology practical, NCERT biology'
      };
      enhancedKeywords += subjectKeywords[subject as keyof typeof subjectKeywords] || '';
    }

    // Update document title
    document.title = enhancedTitle;

    // Update meta description
    updateMetaTag('description', enhancedDescription);
    
    // Update meta keywords
    updateMetaTag('keywords', enhancedKeywords);

    // Update additional SEO meta tags
    updateMetaTag('subject', 'Indian Entrance Exam Preparation');
    updateMetaTag('topic', 'Educational Technology, AI Tutoring, Competitive Exams');
    updateMetaTag('audience', 'Students, Exam Aspirants, Educational Professionals');
    updateMetaTag('coverage', 'India');
    updateMetaTag('distribution', 'Global');
    updateMetaTag('rating', 'General');
    updateMetaTag('revisit-after', '1 days');
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('author', 'Learnyzer Edtech Private Limited');
    updateMetaTag('language', 'en-IN');
    updateMetaTag('geo.region', 'IN');
    updateMetaTag('geo.country', 'India');
    updateMetaTag('geo.placename', 'India');
    updateMetaTag('ICBM', '20.5937, 78.9629');
    updateMetaTag('category', 'Education');
    updateMetaTag('classification', 'Educational Technology');

    // Open Graph tags
    updateMetaTag('og:title', enhancedTitle, 'property');
    updateMetaTag('og:description', enhancedDescription, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:url', canonical || window.location.href, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:site_name', 'Learnyzer - AI-Powered Exam Preparation', 'property');
    updateMetaTag('og:locale', 'en_IN', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', enhancedTitle);
    updateMetaTag('twitter:description', enhancedDescription);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:site', '@Learnyzer');
    updateMetaTag('twitter:creator', '@Learnyzer');

    // Update canonical URL
    if (canonical) {
      updateCanonicalLink(canonical);
    }

    // Add comprehensive structured data
    addStructuredData(examType, subject, pageType);

    // Add FAQ structured data for exam-specific pages
    if (examType) {
      addExamFAQStructuredData(examType);
    }

  }, [title, description, keywords, canonical, ogImage, examType, subject, pageType]);

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

function addStructuredData(examType?: string, subject?: string, pageType?: string) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://learnyzer.replit.app/#organization",
        "name": "Learnyzer Edtech Private Limited",
        "url": "https://learnyzer.replit.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://learnyzer.replit.app/images/learnyzer-logo.png",
          "width": 512,
          "height": 512
        },
        "description": "AI-powered educational platform for Indian competitive exam preparation",
        "areaServed": "India",
        "serviceType": "Educational Technology",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-XXX-XXX-XXXX",
          "contactType": "Customer Service",
          "email": "learnyzer.ai@gmail.com",
          "areaServed": "India",
          "availableLanguage": ["English", "Hindi"]
        },
        "sameAs": [
          "https://twitter.com/Learnyzer",
          "https://linkedin.com/company/learnyzer",
          "https://instagram.com/learnyzer"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://learnyzer.replit.app/#website",
        "url": "https://learnyzer.replit.app",
        "name": "Learnyzer - AI-Powered Indian Entrance Exam Preparation",
        "description": "Master JEE, NEET, UPSC, CLAT, CUET, CSE & CGLE with AI tutoring, mock tests, and personalized study plans",
        "publisher": {
          "@id": "https://learnyzer.replit.app/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://learnyzer.replit.app/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "EducationalOrganization",
        "name": "Learnyzer",
        "description": "AI-powered platform for Indian competitive exam preparation",
        "url": "https://learnyzer.replit.app",
        "courseMode": ["Online", "Self-paced", "AI-guided"],
        "educationalCredentialAwarded": "Exam Preparation Certification",
        "hasCredential": {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "Certificate",
          "name": "Competitive Exam Preparation"
        }
      }
    ]
  };

  // Add exam-specific course data
  if (examType) {
    const examCourses = {
      'JEE': {
        "@type": "Course",
        "name": "JEE Main & Advanced Preparation",
        "description": "Comprehensive AI-powered preparation for Joint Entrance Examination",
        "provider": { "@id": "https://learnyzer.replit.app/#organization" },
        "courseCode": "JEE-PREP",
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "Online",
          "instructor": {
            "@type": "Person",
            "name": "AI Tutor Akira"
          }
        },
        "audience": {
          "@type": "EducationalAudience",
          "educationalRole": "Student",
          "audienceType": "Engineering Aspirants"
        },
        "teaches": ["Physics", "Chemistry", "Mathematics"],
        "competencyRequired": "Class 12 Science"
      },
      'NEET': {
        "@type": "Course", 
        "name": "NEET UG Medical Entrance Preparation",
        "description": "AI-powered preparation for National Eligibility cum Entrance Test",
        "provider": { "@id": "https://learnyzer.replit.app/#organization" },
        "courseCode": "NEET-PREP",
        "teaches": ["Physics", "Chemistry", "Biology"],
        "competencyRequired": "Class 12 Science with Biology"
      }
    };

    if (examCourses[examType as keyof typeof examCourses]) {
      structuredData["@graph"].push(examCourses[examType as keyof typeof examCourses]);
    }
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

function addExamFAQStructuredData(examType: string) {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": []
  };

  const examFAQs = {
    'JEE': [
      {
        question: "What is the best way to prepare for JEE Main and Advanced?",
        answer: "The best JEE preparation involves understanding concepts thoroughly, practicing previous year questions, taking regular mock tests, and getting personalized guidance. Learnyzer's AI tutor provides concept clarity, doubt solving, and adaptive learning for Physics, Chemistry, and Mathematics."
      },
      {
        question: "How many hours should I study for JEE preparation?",
        answer: "Effective JEE preparation requires 6-8 hours of focused study daily, including concept learning, problem solving, and revision. Quality matters more than quantity - use AI-powered tools for efficient learning and performance tracking."
      },
      {
        question: "What are the most important topics for JEE Main?",
        answer: "Key JEE Main topics include Mechanics and Thermodynamics in Physics, Organic Chemistry and Chemical Bonding in Chemistry, and Calculus and Coordinate Geometry in Mathematics. Our AI tutor helps prioritize topics based on your weak areas."
      }
    ],
    'NEET': [
      {
        question: "How to prepare for NEET Biology effectively?",
        answer: "NEET Biology preparation requires thorough understanding of NCERT concepts, regular revision, and practice questions. Focus on Human Physiology, Genetics, and Ecology. Learnyzer's AI tutor provides concept clarity and personalized practice for all Biology topics."
      },
      {
        question: "What is the weightage of Physics, Chemistry, and Biology in NEET?",
        answer: "NEET has 180 questions with equal weightage: 45 questions each from Physics and Chemistry, and 90 questions from Biology (45 Botany + 45 Zoology). Biology carries maximum marks, making it crucial for good scores."
      }
    ],
    'UPSC': [
      {
        question: "How to prepare for UPSC Prelims and Mains?",
        answer: "UPSC preparation requires systematic study of General Studies, current affairs, and optional subjects. Focus on NCERT books, newspaper reading, and answer writing practice. Our AI tutor helps with concept clarity and current affairs updates."
      }
    ]
  };

  const examQuestions = examFAQs[examType as keyof typeof examFAQs] || [];
  
  faqData.mainEntity = examQuestions.map(qa => ({
    "@type": "Question",
    "name": qa.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": qa.answer
    }
  }));

  if (faqData.mainEntity.length > 0) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqData);
    document.head.appendChild(script);
  }
}