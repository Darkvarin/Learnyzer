# Learnyzer - AI-Powered Indian Entrance Exam Preparation Platform

## Overview

Learnyzer is a comprehensive educational platform designed specifically for Indian students preparing for competitive entrance exams including JEE, NEET, UPSC, CLAT, CUET, and CSE. The platform combines AI-powered tutoring with gamification elements to create an engaging learning experience.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom dark theme and cyberpunk aesthetics
- **UI Components**: Shadcn/UI component library with Radix UI primitives
- **State Management**: TanStack Query for server state and React Context for local state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Real-time**: WebSocket connection for live updates and notifications

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-based session store for production reliability
- **API Design**: RESTful endpoints with consistent error handling
- **Real-time**: WebSocket server for live features like battles and notifications

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- Local username/password authentication with bcrypt hashing
- OTP verification for mobile numbers (SMS integration ready)
- Session-based authentication with PostgreSQL session store
- Protected routes with authentication middleware
- Automatic session refresh and user state management

### AI Integration (Enhanced)
- **GPT-4o Brain**: Advanced AI tutoring with personalized learning experiences
- **DALL-E 3 Visual Engine**: Educational image generation for immersive learning
- **Visual Learning Lab**: Complete interface for generating educational content
- AI tools including study notes generator, answer checker, and performance analytics
- Personalized AI tutors with different specialties (Physics/Math, Chemistry/Biology, Humanities)
- Real-time conversation system with message history
- **New AI Capabilities**:
  - Educational image generation with DALL-E 3
  - Visual learning packages (Image + Guide + Quiz)
  - Interactive study sessions with visual support
  - Smart visual suggestions based on content analysis

### Gamification System
- **Leveling System**: Exponential XP requirements with 35% growth factor per level
- **Ranking System**: 20-tier ranking from Bronze I to Grandmaster with challenging point requirements
- **Streak System**: Daily learning streaks with reward mechanisms
- **Battle System**: Competitive academic battles (1v1, 2v2, 3v3, 4v4) with real-time functionality
- **Achievement System**: Progress tracking and milestone rewards

### Course Management
- Grade-specific content filtering (3rd to 12th grade plus competitive exams)
- Subject categorization with visual icons and progress tracking
- Chapter-wise content organization with AI tutor integration
- Exam-specific preparation tracks (JEE, NEET, UPSC, CLAT, CUET, CSE)

### Real-time Features
- WebSocket implementation for live notifications
- Battle system with real-time chat and progress updates
- Leaderboard updates and rank change notifications
- Streak notifications and achievement unlocks

### Wellness Features
- Study break recommendations with configurable preferences
- Eye strain, posture, hydration, movement, and breathing reminders
- Break tracking and wellness analytics
- User-customizable wellness settings

### Enterprise Security System
- **Multi-Layer Protection**: Rate limiting, CORS protection, input sanitization, and XSS prevention
- **Advanced Encryption**: AES-256-GCM encryption for sensitive data with PBKDF2 key derivation
- **Real-Time Monitoring**: Comprehensive audit logging with automated threat detection and analysis
- **Password Security**: Enhanced validation with strength requirements and secure hashing (bcrypt)
- **File Upload Protection**: Malicious content detection and file type validation
- **Session Security**: Secure session management with automatic regeneration and CSRF protection
- **Security Dashboard**: Real-time threat monitoring with risk scoring and incident tracking
- **Content Security Policy**: Strict CSP headers to prevent code injection attacks
- **Automated Response**: Intelligent rate limiting and suspicious activity detection

### Lead Generation System
- **Comprehensive Data Collection**: Automatic capture of emails and mobile numbers during user registration
- **Advanced Filtering**: Filter leads by date range, contact availability, grade, track, and other criteria
- **Excel Export**: One-click export to professional Excel spreadsheets with statistics and analytics
- **Contact Lists**: Separate email and mobile number lists with easy copy-to-clipboard functionality
- **Real-Time Statistics**: Live dashboard showing total leads, contact coverage, and conversion metrics
- **Search Functionality**: Advanced search across all user data fields for quick lead lookup
- **Grade Analytics**: Breakdown of leads by educational grade with visual progress indicators
- **Marketing Ready**: Pre-formatted lists perfect for email campaigns and SMS marketing

### Customer Feedback System
- **Multi-Type Feedback Collection**: Support for general feedback, feature requests, bug reports, and suggestions
- **Categorized Organization**: Seven feedback categories including AI Tutor, Course Content, UX, and Performance
- **Anonymous & Authenticated Feedback**: Users can provide feedback with or without authentication
- **Voting & Commenting System**: Community-driven prioritization with upvotes, downvotes, and threaded comments
- **Admin Response Interface**: Built-in admin tools for responding to feedback and updating status
- **Priority Management**: Four-tier priority system (low, medium, high, urgent) with visual indicators
- **Status Tracking**: Complete lifecycle tracking from open to resolved with automated notifications
- **Advanced Filtering**: Filter feedback by type, status, priority, category, and public visibility
- **Rating System**: Optional 5-star rating system for overall experience feedback
- **Real-Time Statistics**: Dashboard showing feedback trends, resolution rates, and average ratings

## Data Flow

1. **User Registration/Login**: Client → Auth Service → Database → Session Store
2. **Course Access**: Client → Course Service → Database (with grade filtering)
3. **AI Interactions**: Client → AI Service → OpenAI API → Database (conversation storage)
4. **Real-time Updates**: WebSocket Server → Connected Clients (battles, notifications)
5. **Progress Tracking**: User Actions → Storage Service → Database (XP, levels, ranks)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **passport**: Authentication middleware
- **bcrypt**: Password hashing
- **express-session**: Session management
- **ws**: WebSocket server implementation

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation
- **zod**: Schema validation
- **framer-motion**: Animations and transitions
- **date-fns**: Date manipulation utilities

### AI Integration
- **OpenAI API**: GPT-4o model for AI tutoring and content generation
- **@stripe/stripe-js**: Payment processing (Stripe integration)
- **razorpay**: Indian payment gateway integration

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production build optimization
- **@replit/vite-plugin-cartographer**: Replit-specific development tools

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- tsx for TypeScript execution in development
- Automatic database migrations with Drizzle Kit
- Environment-based configuration (development vs production)

### Production Build
- Vite build for optimized frontend bundle
- esbuild for server-side bundle with external packages
- Static file serving through Express
- Session persistence through PostgreSQL

### Database Management
- Drizzle migrations for schema versioning
- Seed scripts for initial data population
- Force push capability for rapid development iterations
- Connection pooling for scalability

### Comprehensive SEO Optimization System
- **Advanced Meta Tag Management**: Dynamic title and description generation based on user progress and page content
- **Structured Data Implementation**: Schema.org markup for educational organization, courses, software application, and FAQ sections
- **Automated Sitemap Generation**: Dynamic XML sitemap with proper priorities and update frequencies for all routes
- **Search Engine Compliance**: Robots.txt generation with crawler directives and sitemap location
- **SEO Component Library**: Reusable SEO head component with Open Graph tags, Twitter cards, and canonical URLs
- **Page-Specific Optimization**: Custom SEO for homepage, dashboard, and AI tool pages with exam-specific keywords
- **Schema.org Integration**: JSON-LD structured data for better search engine understanding and rich snippets

## Changelog
- June 30, 2025: Initial setup
- June 30, 2025: Enhanced AI integration with GPT-4o and DALL-E 3
  - Added comprehensive AI Visual Learning Lab
  - Implemented educational image generation with DALL-E 3
  - Created visual learning packages (Image + Guide + Quiz)
  - Added interactive study sessions with visual support
  - Enhanced AI tutor with personalized learning experiences
  - Integrated smart visual suggestions for educational content
- June 30, 2025: Implemented enterprise-grade security system
  - Multi-layer security architecture with comprehensive threat detection
  - Advanced password validation and encryption (AES-256-GCM)
  - Real-time security monitoring and audit logging
  - Rate limiting and DDoS protection
  - Content Security Policy and CORS protection
  - Input sanitization and XSS prevention
  - Malicious file upload detection
  - Security dashboard for threat monitoring
  - Automated security event analysis and risk scoring
- June 30, 2025: Comprehensive SEO optimization implementation
  - Dynamic meta tag generation with user progress integration
  - Complete structured data system with Schema.org markup
  - Automated sitemap and robots.txt generation
  - SEO component library for consistent optimization across pages
  - Exam-specific keyword targeting for JEE, NEET, UPSC, CLAT, CUET
  - Open Graph and Twitter card integration for social media sharing
  - Company branding updated to "Learnyzer Edtech" across all components
- July 01, 2025: Comprehensive customer feedback system implementation
  - Multi-type feedback collection (feedback, feature requests, bug reports, suggestions)
  - Seven organized feedback categories with icon-based navigation
  - Anonymous and authenticated feedback submission support
  - Community voting system with upvotes, downvotes, and threaded comments
  - Admin response interface with status tracking and priority management
  - Advanced filtering and search capabilities across all feedback
  - Real-time statistics dashboard with feedback analytics
  - Complete database schema with proper relations and validation
- July 02, 2025: CSE exam integration across the platform
  - Added CSE (Computer Science Engineering) as new exam type
  - Integrated CSE subjects in AI tutor (Programming, Data Structures, Algorithms, Networks, OS, Database)
  - Added comprehensive CSE courses with detailed chapter content
  - Updated all platform components to support CSE exam preparation
  - Enhanced subject filters and search functionality to include Computer Science
- July 02, 2025: Advanced AI prompt engineering implementation
  - Completely redesigned AI tutor prompts for topic-specific content generation
  - Enhanced study notes generation with mandatory structured format and topic focus
  - Improved DALL-E 3 image generation prompts for precise educational diagrams
  - Added critical instructions for topic relevance and exam-focused content
  - Implemented lower temperature settings (0.3) for more factual, focused responses
  - Enhanced visual learning package generation with topic-specific requirements
- July 02, 2025: Voice-enabled AI tutoring system implementation
  - Created comprehensive useVoice custom hook with Web Speech API integration
  - Implemented speech-to-text input with real-time transcript display
  - Added text-to-speech output for AI tutor responses with voice controls
  - Integrated voice controls into AI tutor chat interface with visual feedback
  - Added voice settings panel with enable/disable toggle and status indicators
  - Enhanced UI with voice input buttons, listening states, and speaking indicators
  - Auto-speaking AI responses when voice mode is enabled for hands-free learning
  - Complete voice interaction system for accessible educational experience
- July 02, 2025: Comprehensive exam-specific content filtering implementation
  - Added exam-locked content filtering across all platform components
  - Courses page now filters content based on user's confirmed entrance exam
  - AI tutor selection is exam-specific when user has locked their exam choice
  - AI Visual Lab filters exam types and shows locked status indicators
  - Visual lock status indicators throughout platform with green "Locked" badges
  - Disabled exam type selectors when user's exam is confirmed and locked
  - Complete content personalization based on entrance exam field lock system
  - Seamless integration with existing entrance exam confirmation workflow

## User Preferences

Preferred communication style: Simple, everyday language.