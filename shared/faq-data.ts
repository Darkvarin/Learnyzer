export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  priority: number; // 1-5, higher means more common question
}

export const faqData: FAQ[] = [
  // General Platform Questions
  {
    id: "what-is-learnyzer",
    category: "General",
    question: "What is Learnyzer?",
    answer: "Learnyzer is an AI-powered educational platform designed specifically for Indian students preparing for competitive entrance exams including JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE. We offer personalized learning experiences with advanced AI tutoring, gamified learning, and comprehensive study materials.",
    keywords: ["learnyzer", "platform", "what is", "about", "introduction"],
    priority: 5
  },
  {
    id: "supported-exams",
    category: "General",
    question: "Which entrance exams does Learnyzer support?",
    answer: "Learnyzer supports preparation for 7 major competitive exams: JEE (Joint Entrance Examination), NEET (National Eligibility cum Entrance Test), UPSC (Union Public Service Commission), CLAT (Common Law Admission Test), CUET (Common University Entrance Test), CSE (Computer Science Engineering), and CGLE (Combined Graduate Level Examination).",
    keywords: ["exams", "jee", "neet", "upsc", "clat", "cuet", "cse", "cgle", "supported", "entrance"],
    priority: 5
  },
  {
    id: "how-to-get-started",
    category: "General",
    question: "How do I get started with Learnyzer?",
    answer: "Getting started is easy! Simply sign up for a free account, complete your profile by selecting your target entrance exam and grade level, and start your 1-day free trial. You'll immediately get access to our AI tutor, study tools, and learning materials.",
    keywords: ["get started", "sign up", "registration", "begin", "start"],
    priority: 4
  },

  // AI Tutor Questions
  {
    id: "ai-tutor-features",
    category: "AI Tutor",
    question: "What can the AI Tutor help me with?",
    answer: "Our AI Tutor powered by GPT-4o provides personalized learning sessions, answers your questions in real-time, generates study notes, creates practice problems, explains complex concepts, and adapts to your learning style. It's available 24/7 and specializes in your chosen entrance exam subjects.",
    keywords: ["ai tutor", "features", "help", "gpt-4o", "personalized", "questions"],
    priority: 5
  },
  {
    id: "ai-tutor-voice",
    category: "AI Tutor",
    question: "Does the AI Tutor support voice interaction?",
    answer: "Yes! Our AI Tutor includes voice-enabled features. You can speak your questions using speech-to-text, and the AI can read responses aloud with text-to-speech. This creates a hands-free learning experience perfect for studying while multitasking.",
    keywords: ["voice", "speech", "talk", "audio", "hands-free", "speak"],
    priority: 3
  },
  {
    id: "ai-visual-lab",
    category: "AI Tutor",
    question: "What is the AI Visual Lab?",
    answer: "The AI Visual Lab uses DALL-E 3 to generate educational images, diagrams, and visual learning packages. It creates custom visuals to help explain complex concepts, making learning more engaging and easier to understand through visual representation.",
    keywords: ["visual lab", "dall-e", "images", "diagrams", "visual learning", "pictures"],
    priority: 4
  },

  // Subscription Questions
  {
    id: "subscription-plans",
    category: "Subscription",
    question: "What subscription plans are available?",
    answer: "We offer multiple plans: Free Trial (1 day, 2 AI sessions + 10 tools), Basic (₹799/month, all AI tools 50 uses daily, no AI tutor), Pro (₹1500/month, 2 AI tutor sessions + 20 tools daily), Quarterly (₹4199, 3 AI tutor sessions + 40 tools daily), Half-Yearly (₹7599), and Yearly (₹12999, 3 AI tutor sessions + 40 tools daily, best value). All paid plans include analytics and advanced features.",
    keywords: ["subscription", "plans", "pricing", "cost", "monthly", "yearly", "basic", "pro"],
    priority: 5
  },
  {
    id: "free-trial",
    category: "Subscription",
    question: "What's included in the free trial?",
    answer: "The 1-day free trial includes 2 AI tutor lessons, 10 AI tool uses, access to basic learning materials, and all core platform features. It's a great way to experience our platform before upgrading to a paid plan.",
    keywords: ["free trial", "trial", "free", "included", "what's included", "demo"],
    priority: 4
  },
  {
    id: "payment-methods",
    category: "Subscription",
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods through Razorpay including credit cards, debit cards, UPI, net banking, and popular digital wallets. All payments are processed securely with Indian payment standards.",
    keywords: ["payment", "razorpay", "credit card", "upi", "net banking", "wallet", "pay"],
    priority: 4
  },
  {
    id: "subscription-limits",
    category: "Subscription",
    question: "What are the daily usage limits for each plan?",
    answer: "Free Trial: 2 AI sessions/day. Basic: 2 AI tutor sessions + 20 AI tool uses daily. Pro: 3 AI tutor sessions + 30 AI tool uses daily. Quarterly/Half-Yearly/Yearly: 3 AI tutor sessions + 40 AI tool uses daily.",
    keywords: ["limits", "daily limits", "usage", "sessions", "restrictions", "how many"],
    priority: 3
  },

  // Technical Questions
  {
    id: "mobile-support",
    category: "Technical",
    question: "Is Learnyzer available on mobile devices?",
    answer: "Yes! Learnyzer is fully responsive and works perfectly on mobile phones, tablets, and desktop computers. Our mobile-first design ensures you can study anywhere, anytime. We recommend using modern browsers like Chrome, Firefox, or Safari for the best experience.",
    keywords: ["mobile", "phone", "tablet", "responsive", "app", "android", "ios"],
    priority: 4
  },
  {
    id: "browser-requirements",
    category: "Technical",
    question: "What are the system requirements?",
    answer: "Learnyzer works on any device with a modern web browser and internet connection. We recommend Chrome, Firefox, Safari, or Edge. For voice features, your browser needs microphone access permissions. No downloads or installations required!",
    keywords: ["requirements", "browser", "system", "chrome", "firefox", "safari", "edge"],
    priority: 2
  },
  {
    id: "internet-connection",
    category: "Technical",
    question: "Do I need a fast internet connection?",
    answer: "A stable internet connection is required for real-time AI interactions. We recommend at least 1 Mbps for smooth experience. The platform is optimized for Indian internet speeds and works well on 3G/4G networks.",
    keywords: ["internet", "connection", "speed", "3g", "4g", "wifi", "data"],
    priority: 2
  },

  // Account & Profile
  {
    id: "exam-selection",
    category: "Account",
    question: "Can I change my target entrance exam after selection?",
    answer: "You can initially explore different exams, but once you confirm your entrance exam choice in profile settings, it becomes locked to ensure focused, exam-specific content. This prevents confusion and ensures you get the most relevant study materials.",
    keywords: ["exam selection", "change exam", "locked", "target exam", "switch"],
    priority: 3
  },
  {
    id: "profile-setup",
    category: "Account",
    question: "How do I complete my profile setup?",
    answer: "After signing up, go to Profile Settings and fill in your target entrance exam, grade level, and study preferences. This helps our AI provide personalized content. You must select your entrance exam to access AI features.",
    keywords: ["profile", "setup", "complete profile", "settings", "grade", "preferences"],
    priority: 3
  },
  {
    id: "account-security",
    category: "Account",
    question: "How secure is my account data?",
    answer: "We use enterprise-grade security with AES-256-GCM encryption, secure password hashing, real-time threat monitoring, and comprehensive audit logging. Your data is protected with multiple layers of security and regular security updates.",
    keywords: ["security", "safe", "data protection", "encryption", "privacy", "secure"],
    priority: 3
  },

  // Features & Learning
  {
    id: "gamification",
    category: "Features",
    question: "What gamification features does Learnyzer offer?",
    answer: "Learnyzer includes a comprehensive gamification system with XP points, level progression, ranking system (Bronze to Grandmaster), achievement badges, daily streaks, competitive battles with other students, and leaderboards to make learning engaging and motivating.",
    keywords: ["gamification", "points", "levels", "ranks", "achievements", "streaks", "battles", "leaderboard"],
    priority: 4
  },
  {
    id: "study-materials",
    category: "Features",
    question: "What study materials are available?",
    answer: "Our platform includes AI-generated study notes, comprehensive courses organized by chapters, practice problems, performance analytics, answer checking tools, and visual learning packages. All content is tailored to your specific entrance exam.",
    keywords: ["study materials", "notes", "courses", "practice", "content", "chapters"],
    priority: 4
  },
  {
    id: "progress-tracking",
    category: "Features",
    question: "How can I track my learning progress?",
    answer: "You can monitor your progress through detailed analytics including XP gained, levels achieved, course completion percentages, streak days, battle wins, accuracy rates, and performance trends. All data is visualized in easy-to-understand charts.",
    keywords: ["progress", "tracking", "analytics", "performance", "stats", "charts"],
    priority: 3
  },

  // Support & Contact
  {
    id: "customer-support",
    category: "Support",
    question: "How can I contact customer support?",
    answer: "You can reach our support team through multiple channels: Email us at learnyzer.ai@gmail.com, call us at +91 9910601733, or visit our Contact page. We also have a comprehensive feedback system where you can report issues and request features.",
    keywords: ["support", "contact", "help", "email", "phone", "assistance"],
    priority: 4
  },
  {
    id: "response-time",
    category: "Support",
    question: "What's your customer support response time?",
    answer: "We strive to respond to all inquiries within 24-48 hours. Premium subscribers receive priority support with faster response times. For urgent technical issues, you can call our support number for immediate assistance.",
    keywords: ["response time", "how fast", "priority", "urgent", "immediate"],
    priority: 2
  },
  {
    id: "feedback-system",
    category: "Support",
    question: "How can I provide feedback or request features?",
    answer: "We have a comprehensive feedback system accessible from our main menu. You can submit general feedback, feature requests, bug reports, or suggestions. Other users can vote on feedback, and our team responds with updates and implementation timelines.",
    keywords: ["feedback", "feature request", "suggestions", "bug report", "vote"],
    priority: 3
  },

  // Billing & Refunds
  {
    id: "refund-policy",
    category: "Billing",
    question: "What is your refund policy?",
    answer: "We offer a 7-day money-back guarantee for all subscription plans. If you're not satisfied, contact our support team within 7 days of purchase for a full refund. Free trial users can cancel anytime without charges.",
    keywords: ["refund", "money back", "guarantee", "cancel", "return"],
    priority: 3
  },
  {
    id: "billing-issues",
    category: "Billing",
    question: "I'm having trouble with payment or billing. What should I do?",
    answer: "For payment or billing issues, please contact our support team at learnyzer.ai@gmail.com with your transaction details. We can help resolve payment failures, update billing information, or assist with subscription changes.",
    keywords: ["billing", "payment issues", "transaction", "failed payment", "billing problem"],
    priority: 3
  },

  // Competitive Advantage
  {
    id: "vs-competitors",
    category: "Comparison",
    question: "How is Learnyzer different from other learning platforms?",
    answer: "Learnyzer combines cutting-edge AI (GPT-4o, DALL-E 3) with Indian exam-specific content, voice interaction, visual learning, gamification, and affordable pricing. We focus specifically on Indian competitive exams with personalized learning paths and real-time AI tutoring.",
    keywords: ["different", "unique", "competitors", "advantages", "better", "why choose"],
    priority: 3
  },
  {
    id: "success-rate",
    category: "Results",
    question: "What's the success rate of Learnyzer students?",
    answer: "Our AI-powered personalized learning approach has helped students improve their performance significantly. With features like adaptive learning, regular practice, and comprehensive analytics, students can track their progress and focus on weak areas effectively.",
    keywords: ["success rate", "results", "performance", "improvement", "effectiveness"],
    priority: 2
  }
];

export function searchFAQs(query: string): FAQ[] {
  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  const queryLower = query.toLowerCase();
  
  return faqData
    .map(faq => {
      let score = 0;
      
      // Exact question match (highest priority)
      if (queryLower.includes(faq.question.toLowerCase()) || faq.question.toLowerCase().includes(queryLower)) {
        score += 20;
      }
      
      // Individual term matches in question
      const questionWords = faq.question.toLowerCase().split(/\s+/);
      const questionMatches = searchTerms.filter(term => 
        questionWords.some(word => word.includes(term) || term.includes(word))
      );
      score += questionMatches.length * 3;
      
      // Keyword exact matches
      const exactKeywordMatches = searchTerms.filter(term =>
        faq.keywords.some(keyword => keyword.toLowerCase() === term)
      );
      score += exactKeywordMatches.length * 8;
      
      // Keyword partial matches
      const partialKeywordMatches = searchTerms.filter(term =>
        faq.keywords.some(keyword => keyword.toLowerCase().includes(term) || term.includes(keyword.toLowerCase()))
      );
      score += partialKeywordMatches.length * 4;
      
      // Answer content matches
      const answerMatches = searchTerms.filter(term =>
        faq.answer.toLowerCase().includes(term)
      );
      score += answerMatches.length * 2;
      
      // Category boost for related terms
      if (queryLower.includes('subscription') || queryLower.includes('price') || queryLower.includes('cost')) {
        if (faq.category === 'Subscription' || faq.category === 'Billing') score += 5;
      }
      if (queryLower.includes('ai') || queryLower.includes('tutor') || queryLower.includes('chatbot')) {
        if (faq.category === 'AI Tutor') score += 5;
      }
      if (queryLower.includes('technical') || queryLower.includes('mobile') || queryLower.includes('browser')) {
        if (faq.category === 'Technical') score += 5;
      }
      
      // Priority bonus (weighted)
      score += faq.priority * 1.5;
      
      return { ...faq, score };
    })
    .filter(faq => faq.score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}