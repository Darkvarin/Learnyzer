import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Book, Sword, Trophy, Calendar, Brain, Star, ShieldCheck, Compass, Menu, X, Github, MessageCircle, Facebook, Twitter, Youtube, Instagram, Check } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll animation effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // If the user is authenticated, show a different home page or redirect to dashboard
  if (user && !isLoading) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-background/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-4xl md:text-5xl font-gaming gaming-text mb-4">Welcome back, {user.name}!</h1>
              <p className="text-xl opacity-80 max-w-2xl mx-auto">Continue your learning journey with LearnityX and level up your skills.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full max-w-3xl"
            >
              <Button 
                className="game-button h-14 text-lg" 
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard <ArrowRight className="ml-2" />
              </Button>
              <Button 
                className="game-button-secondary h-14 text-lg" 
                onClick={() => navigate("/ai-tools")}
              >
                Try AI Tutor <Brain className="ml-2" />
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <FeaturedCard 
              title="Continue Learning"
              description="Resume your courses and pick up where you left off."
              icon={<Book className="h-8 w-8" />}
              path="/courses"
              delay={0.2}
            />
            <FeaturedCard 
              title="Battle Zone"
              description="Test your skills against other students in real-time competitions."
              icon={<Sword className="h-8 w-8" />}
              path="/battle-zone"
              delay={0.3}
            />
            <FeaturedCard 
              title="Track Achievements"
              description="See your progress and unlock new rewards as you learn."
              icon={<Trophy className="h-8 w-8" />}
              path="/rewards"
              delay={0.4}
            />
            <FeaturedCard 
              title="Daily Challenges"
              description="Complete today's challenges to maintain your learning streak."
              icon={<Calendar className="h-8 w-8" />}
              path="/dashboard"
              delay={0.5}
            />
          </div>
        </div>
      </div>
    );
  }

  // For non-authenticated users, show landing page
  return (
    <div className="min-h-screen futuristic-bg relative">
      {/* Cyberpunk-style background elements */}
      <div className="absolute inset-0 cyber-grid z-0"></div>
      
      {/* Animated glowing orbs */}
      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-purple-500/20 filter blur-[80px] animate-pulse-glow z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-blue-500/20 filter blur-[100px] animate-pulse-glow z-0" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-2/3 left-1/3 w-64 h-64 rounded-full bg-purple-800/20 filter blur-[70px] animate-pulse-glow z-0" style={{animationDelay: '2s'}}></div>
      
      {/* Scanning line effect */}
      <div className="fixed inset-0 h-screen pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] cyber-scan-line"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] cyber-scan-line"></div>
      </div>
      
      {/* Header with glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo with futuristic effect */}
            <Link href="/" className="flex items-center">
              <div className="relative w-12 h-12 mr-3">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-xl animate-pulse opacity-70 blur-sm"></div>
                <div className="absolute inset-0.5 bg-gradient-to-br from-primary to-purple-800 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white futuristic-glow" />
                </div>
              </div>
              <div className="relative">
                <span className="text-3xl font-gaming tracking-wide text-white">LearnityX</span>
                <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              </div>
            </Link>

            {/* Desktop Nav with hover effects */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-all relative group">
                Features
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-all relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-all relative group">
                How it Works
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </a>
              <a href="#faq" className="text-gray-300 hover:text-white transition-all relative group">
                FAQs
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </a>
              <Button 
                onClick={() => navigate("/auth")}
                className="relative overflow-hidden group bg-transparent border border-primary hover:bg-primary/20 transition-all duration-300"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/40 to-purple-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Button>
            </nav>

            {/* Mobile menu button */}
            <button 
              className="md:hidden relative flex items-center justify-center w-10 h-10 animated-gradient-border group"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="absolute inset-0.5 rounded-md bg-background"></span>
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-white relative z-10" />
              ) : (
                <Menu className="h-5 w-5 text-white relative z-10" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"} glassmorphism border-b border-primary/20 py-6`}>
          <nav className="container mx-auto px-4 flex flex-col space-y-5">
            <a 
              href="#features" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors relative"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary/50 rounded-r-md"></span>
              Features
            </a>
            <a 
              href="#pricing" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors relative"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary/50 rounded-r-md"></span>
              Pricing
            </a>
            <a 
              href="#how-it-works" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors relative"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary/50 rounded-r-md"></span>
              How it Works
            </a>
            <a 
              href="#faq" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors relative"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary/50 rounded-r-md"></span>
              FAQs
            </a>
            <Button 
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/auth");
              }}
              className="w-full animated-gradient-border relative overflow-hidden"
            >
              <span className="absolute inset-0.5 bg-background/95 rounded-md backdrop-blur-md"></span>
              <span className="relative z-10">Get Started</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section - with futuristic styling */}
      <section className="relative pt-32 md:pt-36 pb-20">
        {/* Hero background with cyberpunk elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Abstract geometric shapes */}
          <div className="absolute -right-20 top-1/4 w-64 h-64 border border-primary/30 rounded-full"></div>
          <div className="absolute -right-40 top-1/4 w-96 h-96 border border-purple-500/20 rounded-full"></div>
          <div className="absolute -left-20 bottom-1/4 w-80 h-80 border border-blue-500/20 rounded-full"></div>
          
          {/* Tech circuit lines */}
          <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L30,10 L70,10 L100,0" stroke="rgba(125, 39, 255, 0.5)" strokeWidth="0.2" fill="none" />
            <path d="M0,20 L40,30 L60,30 L100,20" stroke="rgba(125, 39, 255, 0.3)" strokeWidth="0.2" fill="none" />
            <path d="M0,40 L35,50 L65,50 L100,40" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.2" fill="none" />
            <path d="M0,60 L30,70 L70,70 L100,60" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="0.2" fill="none" />
            <path d="M0,80 L25,90 L75,90 L100,80" stroke="rgba(125, 39, 255, 0.3)" strokeWidth="0.2" fill="none" />
            <path d="M20,0 L20,100" stroke="rgba(125, 39, 255, 0.2)" strokeWidth="0.1" fill="none" />
            <path d="M40,0 L40,100" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.1" fill="none" />
            <path d="M60,0 L60,100" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.1" fill="none" />
            <path d="M80,0 L80,100" stroke="rgba(125, 39, 255, 0.2)" strokeWidth="0.1" fill="none" />
          </svg>
          
          {/* Dots pattern overlay */}
          <div className="absolute inset-0 cyber-dots opacity-10"></div>
        </div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              {/* Hero text with futuristic styling */}
              <div className="relative inline-block">
                <div className="absolute -left-6 top-6 w-4 h-20 border-l-2 border-t-2 border-primary/60"></div>
                <div className="mb-2 font-mono tracking-wider text-primary/80">FUTURE OF EDUCATION</div>
                <h1 className="text-4xl md:text-7xl font-gaming mb-2 relative">
                  <span className="block text-white relative z-10">Level Up <span className="relative">
                    Your
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                  </span></span>
                  <span className="block gradient-text relative z-10" style={{
                    background: "linear-gradient(90deg, #7d27ff, #3b82f6, #7d27ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundSize: "200% auto",
                    animation: "gradient-animation 3s linear infinite"
                  }}>Learning Journey</span>
                </h1>
              </div>
              
              <div className="mt-8 relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-primary/30"></div>
                <p className="text-xl pl-4 mb-8 text-gray-300 max-w-xl leading-relaxed">
                  India's first AI-powered educational platform with advanced gamification. Experience the future of learning with voice-interactive AI tutors, real-time battles, and a complete ranking system.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mt-10">
                <Button 
                  onClick={() => navigate("/auth")}
                  className="animated-gradient-border py-6 px-10 text-lg relative overflow-hidden group"
                >
                  <span className="absolute inset-0.5 bg-background/95 rounded-md overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </span>
                  <span className="relative z-10 flex items-center font-medium">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="relative border border-primary/40 hover:border-primary/60 py-6 px-8 text-lg bg-transparent overflow-hidden group transition-all duration-300"
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    featuresSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10">Explore Features</span>
                </Button>
              </div>
              
              {/* Stats with futuristic styling */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                <div className="relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-primary/60"></div>
                  <div className="text-3xl font-gaming text-white">10K+</div>
                  <div className="text-sm text-gray-400">Active Students</div>
                </div>
                <div className="relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-primary/60"></div>
                  <div className="text-3xl font-gaming text-white">500+</div>
                  <div className="text-sm text-gray-400">Courses</div>
                </div>
                <div className="relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-primary/60"></div>
                  <div className="text-3xl font-gaming text-white">98%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/2"
            >
              {/* 3D-looking futuristic showcase */}
              <div className="neumorph-card p-1 relative">
                <div className="absolute top-0 left-0 w-full h-1 cyber-scan-line"></div>
                <div className="absolute -top-5 -right-5 w-10 h-10">
                  <div className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-primary/40 rounded-tr-lg"></div>
                </div>
                <div className="absolute -bottom-5 -left-5 w-10 h-10">
                  <div className="absolute bottom-0 left-0 w-full h-full border-b-2 border-l-2 border-primary/40 rounded-bl-lg"></div>
                </div>
                
                <div className="glassmorphism p-8 relative overflow-hidden">
                  {/* Animated scanning effect */}
                  <div className="absolute inset-0 cyber-dots opacity-10"></div>
                  
                  {/* AI Tutor preview */}
                  <div className="mb-8 text-center">
                    <div className="inline-block mb-3 neumorph-card p-3 px-5 bg-primary/10 rounded-full text-sm font-medium text-primary">REVOLUTIONARY AI-POWERED LEARNING</div>
                    <h2 className="text-3xl font-gaming mb-4">AI Tutor with Voice Interaction</h2>
                    <p className="text-gray-400 mb-6">Experience personalized learning with our advanced AI tutors</p>
                  </div>
                  
                  {/* Interactive Tech Features */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="animated-gradient-border p-[1px] rounded-lg">
                      <div className="bg-background/95 rounded-lg p-4 h-full">
                        <Brain className="h-8 w-8 mb-3 text-primary" />
                        <h3 className="text-lg font-semibold mb-1">Voice Interaction</h3>
                        <p className="text-sm text-gray-400">Speak naturally with your AI tutor for an immersive learning experience</p>
                      </div>
                    </div>
                    
                    <div className="animated-gradient-border p-[1px] rounded-lg">
                      <div className="bg-background/95 rounded-lg p-4 h-full">
                        <Compass className="h-8 w-8 mb-3 text-primary" />
                        <h3 className="text-lg font-semibold mb-1">Adaptive Learning</h3>
                        <p className="text-sm text-gray-400">AI identifies your weak points and adapts content in real-time</p>
                      </div>
                    </div>
                    
                    <div className="animated-gradient-border p-[1px] rounded-lg">
                      <div className="bg-background/95 rounded-lg p-4 h-full">
                        <ShieldCheck className="h-8 w-8 mb-3 text-primary" />
                        <h3 className="text-lg font-semibold mb-1">Verified Content</h3>
                        <p className="text-sm text-gray-400">All material is aligned with standard curriculum requirements</p>
                      </div>
                    </div>
                    
                    <div className="animated-gradient-border p-[1px] rounded-lg">
                      <div className="bg-background/95 rounded-lg p-4 h-full">
                        <Star className="h-8 w-8 mb-3 text-primary" />
                        <h3 className="text-lg font-semibold mb-1">Real-time Feedback</h3>
                        <p className="text-sm text-gray-400">Get instant analyses of your performance and improvement areas</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Voice Interaction Visual */}
                  <div className="mt-8 flex items-center justify-center">
                    <div className="flex items-end gap-1 px-4 py-3 rounded-full bg-background/50 border border-primary/20">
                      <div className="w-1 bg-primary rounded-full animate-sound-wave1 h-3"></div>
                      <div className="w-1 bg-primary rounded-full animate-sound-wave2 h-5"></div>
                      <div className="w-1 bg-primary rounded-full animate-sound-wave3 h-4"></div>
                      <div className="w-1 bg-primary rounded-full animate-sound-wave1 h-6"></div>
                      <div className="w-1 bg-primary rounded-full animate-sound-wave2 h-3"></div>
                      <span className="ml-3 text-sm text-primary">AI Tutor is speaking...</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with hexagonal cyberpunk styling */}
      <section id="features" className="py-28 relative overflow-hidden">
        {/* Cyberpunk background elements */}
        <div className="absolute inset-0 cyber-grid z-0 opacity-30"></div>
        <div className="absolute top-0 left-0 right-0 h-px cyber-scan-line"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px cyber-scan-line"></div>
        
        {/* Diagonal glowing lines */}
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="15" x2="100" y2="85" stroke="rgba(125, 39, 255, 0.1)" strokeWidth="0.2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(125, 39, 255, 0.08)" strokeWidth="0.1" />
          <line x1="0" y1="85" x2="100" y2="15" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.2" />
        </svg>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center mb-20 relative">
            {/* Futuristic heading decoration */}
            <div className="inline-block relative">
              <div className="absolute -top-4 -left-6 w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-primary/30"></div>
              </div>
              <div className="absolute -bottom-4 -right-6 w-12 h-12">
                <div className="absolute bottom-0 right-0 w-full h-full border-b-2 border-r-2 border-primary/30"></div>
              </div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scrollY > 400 ? 1 : 0, y: scrollY > 400 ? 0 : 20 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-5xl font-gaming mb-2 relative px-6"
              >
                <span className="relative z-10">
                  Revolutionary Features
                  <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                </span>
              </motion.h2>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 400 ? 1 : 0, y: scrollY > 400 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto mt-6"
            >
              LearnityX combines advanced AI technology with immersive gamification to create the next generation of education
            </motion.p>
          </div>

          {/* Hexagonal feature grid with futuristic styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Tutor */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: scrollY > 450 ? 1 : 0, y: scrollY > 450 ? 0 : 30 }}
              transition={{ duration: 0.5, delay: 0 }}
              className="group"
            >
              <div className="neumorph-card h-full relative overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8">
                  <div className="mb-6 relative">
                    {/* Hexagon icon background */}
                    <div className="absolute inset-0 bg-primary/10 transform rotate-45 scale-[1.4] rounded-xl"></div>
                    <div className="relative z-10 flex items-center justify-center p-4">
                      <Brain className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-gaming mb-4 text-white">AI-Powered Tutor</h3>
                  <p className="text-gray-300">
                    Experience personalized learning with our voice-interactive AI tutors that adapt to your learning style 
                    and provide real-time feedback on your progress.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Natural voice conversation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Whiteboard visualizations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Adaptive difficulty</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Battle Zone */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: scrollY > 450 ? 1 : 0, y: scrollY > 450 ? 0 : 30 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group"
            >
              <div className="neumorph-card h-full relative overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-primary/10 transform rotate-45 scale-[1.4] rounded-xl"></div>
                    <div className="relative z-10 flex items-center justify-center p-4">
                      <Sword className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-gaming mb-4 text-white">Battle Zone Challenges</h3>
                  <p className="text-gray-300">
                    Compete in 1v1, 2v2, 3v3, or 4v4 real-time academic battles, solve problems under 
                    pressure and earn rank points to climb the leaderboard.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Real-time competitions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Team vs team modes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>AI-judged responses</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Ranking System */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: scrollY > 450 ? 1 : 0, y: scrollY > 450 ? 0 : 30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group"
            >
              <div className="neumorph-card h-full relative overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-primary/10 transform rotate-45 scale-[1.4] rounded-xl"></div>
                    <div className="relative z-10 flex items-center justify-center p-4">
                      <Trophy className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-gaming mb-4 text-white">Complete Rank System</h3>
                  <p className="text-gray-300">
                    Climb from Bronze to Grandmaster with a comprehensive ranking system that reflects your 
                    academic progress and competitive performance.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>8 rank tiers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Visible progression</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Exclusive rank rewards</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Streak System */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: scrollY > 550 ? 1 : 0, y: scrollY > 550 ? 0 : 30 }}
              transition={{ duration: 0.5, delay: 0 }}
              className="group"
            >
              <div className="neumorph-card h-full relative overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-primary/10 transform rotate-45 scale-[1.4] rounded-xl"></div>
                    <div className="relative z-10 flex items-center justify-center p-4">
                      <Calendar className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-gaming mb-4 text-white">Daily Streak Rewards</h3>
                  <p className="text-gray-300">
                    Maintain your learning streak to earn increasing rewards and unlock 
                    special content for consistent practice and engagement.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Daily check-in rewards</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Streak freeze protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Milestone bonuses</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Curriculum */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: scrollY > 550 ? 1 : 0, y: scrollY > 550 ? 0 : 30 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group"
            >
              <div className="neumorph-card h-full relative overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-primary/10 transform rotate-45 scale-[1.4] rounded-xl"></div>
                    <div className="relative z-10 flex items-center justify-center p-4">
                      <Book className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-gaming mb-4 text-white">Comprehensive Curriculum</h3>
                  <p className="text-gray-300">
                    Access content from 3rd grade through 12th grade, plus competitive exam preparation for 
                    JEE, NEET, UPSC, CLAT and more.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>All major Indian boards</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Grade-specific content</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Exam-focused modules</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: scrollY > 550 ? 1 : 0, y: scrollY > 550 ? 0 : 30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group"
            >
              <div className="neumorph-card h-full relative overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-8">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-primary/10 transform rotate-45 scale-[1.4] rounded-xl"></div>
                    <div className="relative z-10 flex items-center justify-center p-4">
                      <Star className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-gaming mb-4 text-white">Performance Analytics</h3>
                  <p className="text-gray-300">
                    Track your progress with detailed analytics and AI-generated insights to identify 
                    strengths, weaknesses and optimize your study strategy.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Interactive visualizations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>AI-powered recommendations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Progress trend analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-background/90 to-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 400 ? 1 : 0, y: scrollY > 400 ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-gaming gaming-text mb-4"
            >
              How LearnityX Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 400 ? 1 : 0, y: scrollY > 400 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl opacity-80 max-w-2xl mx-auto"
            >
              Four simple steps to revolutionize your learning experience
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 450 ? 1 : 0, y: scrollY > 450 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0 }}
              className="relative"
            >
              <div className="absolute -left-4 top-0 w-12 h-12 rounded-full bg-primary/20 backdrop-blur flex items-center justify-center font-gaming text-2xl text-primary z-10">1</div>
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm h-full pt-8 relative">
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent opacity-50 hidden lg:block"></div>
                <CardContent>
                  <h3 className="text-xl font-bold mb-3">Create Your Profile</h3>
                  <p className="text-gray-400">Sign up and set your grade, subjects, and learning goals to get a personalized experience.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 450 ? 1 : 0, y: scrollY > 450 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -left-4 top-0 w-12 h-12 rounded-full bg-primary/20 backdrop-blur flex items-center justify-center font-gaming text-2xl text-primary z-10">2</div>
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm h-full pt-8 relative">
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent opacity-50 hidden lg:block"></div>
                <CardContent>
                  <h3 className="text-xl font-bold mb-3">Explore Curriculum</h3>
                  <p className="text-gray-400">Access grade-specific courses and materials tailored to your educational needs.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 450 ? 1 : 0, y: scrollY > 450 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -left-4 top-0 w-12 h-12 rounded-full bg-primary/20 backdrop-blur flex items-center justify-center font-gaming text-2xl text-primary z-10">3</div>
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm h-full pt-8 relative">
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent opacity-50 hidden lg:block"></div>
                <CardContent>
                  <h3 className="text-xl font-bold mb-3">Learn with AI</h3>
                  <p className="text-gray-400">Engage with our AI tutor for personalized assistance and practice with interactive tools.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 450 ? 1 : 0, y: scrollY > 450 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -left-4 top-0 w-12 h-12 rounded-full bg-primary/20 backdrop-blur flex items-center justify-center font-gaming text-2xl text-primary z-10">4</div>
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm h-full pt-8">
                <CardContent>
                  <h3 className="text-xl font-bold mb-3">Track Progress</h3>
                  <p className="text-gray-400">Monitor your achievements, compete in battles, and climb the ranks as you improve.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-secondary/5">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 700 ? 1 : 0, y: scrollY > 700 ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-gaming gaming-text mb-4"
            >
              Flexible Pricing Plans
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 700 ? 1 : 0, y: scrollY > 700 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl opacity-80 max-w-2xl mx-auto"
            >
              Choose the plan that best suits your educational needs
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 750 ? 1 : 0, y: scrollY > 750 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <Card className="border-primary/10 bg-card h-full overflow-hidden relative">
                <div className="absolute -top-1 -left-1 -right-1 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold opacity-70">Basic</h3>
                    <div className="flex items-end mt-2">
                      <span className="text-4xl font-gaming">Free</span>
                      <span className="text-gray-400 ml-2 mb-1">forever</span>
                    </div>
                  </div>
                  <div className="py-4 border-y border-border">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Limited access to course content</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Basic AI assistance</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">5 battle participations per month</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Standard rank progression</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Button 
                      onClick={() => navigate("/auth")}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 750 ? 1 : 0, y: scrollY > 750 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border border-primary/30 bg-card h-full overflow-hidden relative transform scale-105 shadow-lg shadow-primary/10">
                <div className="absolute inset-0 bg-primary/5"></div>
                <div className="absolute -top-1 -left-1 -right-1 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">MOST POPULAR</div>
                <CardContent className="p-6 relative">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold opacity-70">Premium</h3>
                    <div className="flex items-end mt-2">
                      <span className="text-4xl font-gaming">₹499</span>
                      <span className="text-gray-400 ml-2 mb-1">per month</span>
                    </div>
                  </div>
                  <div className="py-4 border-y border-border/50">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Full access to all course content</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Advanced AI tutoring & tools</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Unlimited battle participations</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Accelerated rank progression</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Performance analytics</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Button 
                      onClick={() => navigate("/auth")}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Get Premium
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 750 ? 1 : 0, y: scrollY > 750 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-primary/10 bg-card h-full overflow-hidden relative">
                <div className="absolute -top-1 -left-1 -right-1 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold opacity-70">School</h3>
                    <div className="flex items-end mt-2">
                      <span className="text-4xl font-gaming">Custom</span>
                      <span className="text-gray-400 ml-2 mb-1">per school</span>
                    </div>
                  </div>
                  <div className="py-4 border-y border-border">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Bulk student accounts</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">School administrator dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">Custom curriculum integration</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-0.5 bg-primary/20 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="opacity-90">School-wide analytics & reporting</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/auth")}
                    >
                      Contact Sales
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 1000 ? 1 : 0, y: scrollY > 1000 ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-gaming gaming-text mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 1000 ? 1 : 0, y: scrollY > 1000 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl opacity-80 max-w-2xl mx-auto"
            >
              Get answers to common questions about LearnityX
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 1050 ? 1 : 0, y: scrollY > 1050 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">How does LearnityX adapt to my learning style?</h3>
                  <p className="text-gray-400">
                    LearnityX uses advanced AI to analyze your learning patterns, strengths, and areas for improvement. The AI tutor adjusts its teaching approach based on your responses, progress, and preferences to provide a truly personalized learning experience.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 1100 ? 1 : 0, y: scrollY > 1100 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">What educational boards and syllabi are covered?</h3>
                  <p className="text-gray-400">
                    LearnityX covers the major Indian educational boards including CBSE, ICSE, and state boards. Our content spans from 3rd to 12th grade and includes preparation for competitive exams like JEE, NEET, UPSC, and CLAT.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 1150 ? 1 : 0, y: scrollY > 1150 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">How do the Battle Zones work?</h3>
                  <p className="text-gray-400">
                    Battle Zones are real-time academic competitions where you can challenge other students in 1v1, 2v2, 3v3, or 4v4 formats. Each battle focuses on specific subjects or topics, and your performance earns you rank points that help you climb from Bronze to Grandmaster ranks.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 1200 ? 1 : 0, y: scrollY > 1200 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Can parents track their child's progress?</h3>
                  <p className="text-gray-400">
                    Yes, parents can access a dedicated dashboard to monitor their child's learning progress, achievements, time spent, and areas of improvement. The dashboard provides actionable insights and recommendations to support your child's educational journey.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container px-4 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: scrollY > 1300 ? 1 : 0, y: scrollY > 1300 ? 0 : 20 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-gaming gaming-text mb-6">Ready to Transform Your Learning?</h2>
            <p className="text-xl opacity-80 mb-8">Join thousands of students who are already experiencing the future of education with LearnityX.</p>
            <Button 
              onClick={() => navigate("/auth")}
              className="game-button py-6 px-10 text-lg"
            >
              Create Free Account
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-background border-t border-border">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-gaming gaming-text mb-2">LearnityX</h3>
              <p className="opacity-70">Level up your learning journey</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link href="/auth" className="opacity-70 hover:opacity-100 transition-opacity">
                Sign In
              </Link>
              <Link href="/auth" className="opacity-70 hover:opacity-100 transition-opacity">
                Sign Up
              </Link>
              <a href="#features" className="opacity-70 hover:opacity-100 transition-opacity">
                Features
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center opacity-70 text-sm">
            <p>© {new Date().getFullYear()} LearnityX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Card for features on the authenticated home page
function FeaturedCard({ title, description, icon, path, delay }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  path: string;
  delay: number;
}) {
  const [, navigate] = useLocation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group cursor-pointer"
      onClick={() => navigate(path)}
    >
      <Card className="h-full game-card transition-all hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] border-primary/20">
        <CardContent className="p-6">
          <div className="bg-primary/10 rounded-full p-3 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="opacity-70">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Card for features on the landing page
function FeatureCard({ title, description, icon, scrollY, threshold, delay }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  scrollY: number;
  threshold: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: scrollY > threshold ? 1 : 0, y: scrollY > threshold ? 0 : 20 }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <Card className="h-full hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] border border-primary/10 bg-card/50 backdrop-blur-sm transition-all">
        <CardContent className="p-6">
          <div className="bg-primary/10 rounded-full p-3 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="opacity-70">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}