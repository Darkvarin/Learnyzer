# LearnityX - AI-Powered Indian Entrance Exam Preparation Platform

## Overview

LearnityX is a comprehensive educational platform designed specifically for Indian students preparing for competitive entrance exams including JEE, NEET, UPSC, CLAT, and CUET. The platform combines AI-powered tutoring with gamification elements to create an engaging learning experience.

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

### AI Integration
- OpenAI GPT-4o integration for AI tutoring and content generation
- AI tools including study notes generator, answer checker, and performance analytics
- Personalized AI tutors with different specialties (Physics/Math, Chemistry/Biology, Humanities)
- Real-time conversation system with message history

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
- Exam-specific preparation tracks (JEE, NEET, UPSC, CLAT, CUET)

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

## Changelog
- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.