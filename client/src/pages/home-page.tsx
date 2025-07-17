import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Book, Sword, Trophy, Calendar, Brain, Star, ShieldCheck, Compass, Menu, X, Github, MessageCircle, Facebook, Twitter, Youtube, Instagram, Check, BellRing, Shield, Zap, Loader2 } from "lucide-react";

import { useRealTime } from "@/contexts/real-time-context";
import { useToast } from "@/hooks/use-toast";
import RazorpayCheckout from "@/components/razorpay-checkout";
import { SEOHead } from "@/components/seo/seo-head";
import { createEducationalOrganizationSchema, createSoftwareApplicationSchema, createFAQSchema } from "@/components/seo/structured-data";
import { SupportChatbot } from "@/components/support-chatbot";


export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sendNotification } = useRealTime();
  const { toast } = useToast();
  
  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: '', amount: 0 });

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

  // Don't redirect authenticated users - they should be able to see homepage
  // We'll just show different UI elements based on authentication status
  
  // Function to handle subscription checkout
  const handleSubscription = (planName: string, amount: number) => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(response => {
        if (!response.ok) {
          // User not logged in, redirect to auth
          toast({
            title: "Authentication Required",
            description: "Please sign in to subscribe to this plan",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        
        // User logged in, show payment modal
        setSelectedPlan({
          name: planName,
          amount: amount
        });
        setPaymentModalOpen(true);
      })
      .catch(error => {
        console.error('Authentication check failed:', error);
        toast({
          title: "Error",
          description: "Could not process your request. Please try again.",
          variant: "destructive"
        });
      });
  };
  
  // SEO data for homepage
  const faqData = [
    {
      question: "What is Learnyzer and how does it help with entrance exam preparation?",
      answer: "Learnyzer is an AI-powered learning platform specifically designed for Indian competitive entrance exams including JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE. It combines personalized AI tutoring with gamified learning experiences to help students achieve better results."
    },
    {
      question: "Which entrance exams does Learnyzer support?",
      answer: "Learnyzer supports all major Indian entrance exams: JEE Main & Advanced for engineering, NEET for medical, UPSC CSE for civil services, CLAT for law, CUET for university admissions, CSE for computer science engineering, and CGLE for government job preparation."
    },
    {
      question: "How does the AI tutoring work on Learnyzer?",
      answer: "Our AI tutors use GPT-4o technology to provide personalized explanations, solve doubts instantly, and adapt to your learning pace. The AI analyzes your performance and creates customized study plans for optimal results."
    },
    {
      question: "Is Learnyzer free to use?",
      answer: "Learnyzer offers a 24-hour free trial with limited daily usage: 2 AI tutor lessons and 10 AI tool uses per day - no credit card required. After the trial, choose from our flexible subscription plans starting at ₹799/month for unlimited access."
    },
    {
      question: "How effective is Learnyzer for competitive exam preparation?",
      answer: "Learnyzer has helped thousands of students improve their exam scores with personalized AI guidance, adaptive learning paths, and comprehensive practice materials designed specifically for JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE success."
    }
  ];

  // For non-authenticated users, show landing page
  return (
    <div className="min-h-screen futuristic-bg relative solo-page cyber-scrollbar">
      <SEOHead
        title="Learnyzer - AI-Powered Indian Entrance Exam Preparation | JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE"
        description="Master JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE with AI tutoring, gamified learning, and personalized study plans. Join thousands of successful students achieving their dreams."
        keywords="JEE preparation, NEET coaching, UPSC preparation, CLAT exam, CUET preparation, CSE exam, CGLE preparation, entrance exam AI, Indian competitive exams, AI tutor, online coaching, exam preparation platform"
        canonical={window.location.origin}
        structuredData={{
          ...createEducationalOrganizationSchema(),
          ...createSoftwareApplicationSchema(),
          ...createFAQSchema(faqData)
        }}
      />
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
      
      {/* Header with Solo Leveling aesthetic */}
      <header className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Professional Logo */}
            <Link href="/" className="flex items-center group">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <div className="text-white text-xl font-bold">🧠</div>
                  </div>
                </div>
                <span 
                  className="text-2xl font-black tracking-tight"
                  style={{
                    background: "linear-gradient(90deg, #4f46e5, #7c3aed, #db2777, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  Learnyzer
                </span>
              </div>
            </Link>

            {/* Desktop Nav with enhanced futuristic design */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-2 text-white hover:text-primary transition-all relative group font-gaming bg-transparent border-none overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md"></span>
                <span className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-blue-500 group-hover:w-full transition-all duration-300"></span>
                <span className="absolute bottom-0 right-0 w-0 h-1 bg-gradient-to-l from-primary to-blue-500 group-hover:w-full transition-all duration-300"></span>
                <span className="relative z-10">Features</span>
              </button>

              <button 
                onClick={() => {
                  const howItWorksSection = document.getElementById('how-it-works');
                  howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-2 text-white hover:text-primary transition-all relative group font-gaming bg-transparent border-none overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md"></span>
                <span className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-blue-500 group-hover:w-full transition-all duration-300"></span>
                <span className="absolute bottom-0 right-0 w-0 h-1 bg-gradient-to-l from-primary to-blue-500 group-hover:w-full transition-all duration-300"></span>
                <span className="relative z-10">How it Works</span>
              </button>
              <button 
                onClick={() => {
                  const faqSection = document.getElementById('faq');
                  faqSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-2 text-white hover:text-primary transition-all relative group font-gaming bg-transparent border-none overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md"></span>
                <span className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-blue-500 group-hover:w-full transition-all duration-300"></span>
                <span className="absolute bottom-0 right-0 w-0 h-1 bg-gradient-to-l from-primary to-blue-500 group-hover:w-full transition-all duration-300"></span>
                <span className="relative z-10">FAQs</span>
              </button>
              <button 
                onClick={() => navigate("/subscription")}
                className="px-3 py-2 text-white hover:text-primary transition-all relative group font-gaming bg-transparent border-none overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md"></span>
                <span className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-blue-500 group-hover:w-full transition-all duration-300"></span>
                <span className="absolute bottom-0 right-0 w-0 h-1 bg-gradient-to-l from-primary to-blue-500 group-hover:w-full transition-all duration-300"></span>
                <span className="relative z-10">Subscription</span>
              </button>
              <Button 
                onClick={() => user ? navigate("/dashboard") : navigate("/auth")}
                className="relative overflow-hidden group bg-gradient-to-r from-primary/80 to-blue-600/80 hover:from-primary hover:to-blue-600 border-none transition-all duration-300 shadow-glow-sm"
              >
                <span className="relative z-10 flex items-center font-gaming tracking-wide text-white">
                  {user ? "Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Button>
            </nav>

            {/* Mobile menu button with Solo Leveling style */}
            <button 
              className="md:hidden relative flex items-center justify-center w-10 h-10 hex-clip-container group"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="absolute inset-0 bg-cyan-950/80 z-0"></span>
              <span className="absolute inset-0 border border-cyan-500/30 z-0"></span>
              <span className="absolute inset-[-3px] border-2 border-cyan-500/20 z-0 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-cyan-300 relative z-10 shadow-glow-xs" />
              ) : (
                <Menu className="h-5 w-5 text-cyan-300 relative z-10 shadow-glow-xs" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu with enhanced futuristic design */}
        <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"} glassmorphism border-b border-primary/20 py-6`}>
          <nav className="container mx-auto px-4 flex flex-col space-y-4">
            <button 
              className="text-left px-4 py-3 text-white hover:text-primary transition-all relative font-gaming bg-transparent border-none overflow-hidden"
              onClick={() => {
                setMobileMenuOpen(false);
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md"></span>
              <span className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-primary to-blue-500 group-hover:h-full transition-all duration-300"></span>
              <span className="absolute right-0 bottom-0 w-1 h-0 bg-gradient-to-t from-primary to-blue-500 group-hover:h-full transition-all duration-300"></span>
              <div className="flex items-center">
                <span className="relative z-10 ml-2">Features</span>
              </div>
              <span className="absolute bottom-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></span>
            </button>

            <button 
              className="text-left px-4 py-3 text-white hover:text-primary transition-all relative font-gaming bg-transparent border-none overflow-hidden"
              onClick={() => {
                setMobileMenuOpen(false);
                const howItWorksSection = document.getElementById('how-it-works');
                howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md"></span>
              <span className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-primary to-blue-500 group-hover:h-full transition-all duration-300"></span>
              <span className="absolute right-0 bottom-0 w-1 h-0 bg-gradient-to-t from-primary to-blue-500 group-hover:h-full transition-all duration-300"></span>
              <div className="flex items-center">
                <span className="relative z-10 ml-2">How it Works</span>
              </div>
              <span className="absolute bottom-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></span>
            </button>
            <button 
              className="text-left px-4 py-3 text-white hover:text-primary transition-all relative font-gaming bg-transparent border-none overflow-hidden"
              onClick={() => {
                setMobileMenuOpen(false);
                const faqSection = document.getElementById('faq');
                faqSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md"></span>
              <span className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-primary to-blue-500 group-hover:h-full transition-all duration-300"></span>
              <span className="absolute right-0 bottom-0 w-1 h-0 bg-gradient-to-t from-primary to-blue-500 group-hover:h-full transition-all duration-300"></span>
              <div className="flex items-center">
                <span className="relative z-10 ml-2">FAQs</span>
              </div>
              <span className="absolute bottom-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></span>
            </button>
            <button 
              className="text-left px-4 py-3 text-white hover:text-primary transition-all relative font-gaming bg-transparent border-none overflow-hidden"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/subscription");
              }}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md"></span>
              <span className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-primary to-blue-500 group-hover:h-full transition-all duration-300"></span>
              <span className="absolute right-0 bottom-0 w-1 h-0 bg-gradient-to-t from-primary to-blue-500 group-hover:h-full transition-all duration-300"></span>
              <div className="flex items-center">
                <span className="relative z-10 ml-2">Subscription</span>
              </div>
              <span className="absolute bottom-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></span>
            </button>
            <Button 
              onClick={() => {
                setMobileMenuOpen(false);
                user ? navigate("/dashboard") : navigate("/auth");
              }}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-primary/80 to-blue-600/80 hover:from-primary hover:to-blue-600 border-none transition-all duration-300 shadow-glow-sm mt-2"
            >
              <span className="relative z-10 py-2 flex items-center justify-center font-gaming tracking-wide text-white">
                {user ? "Dashboard" : "GET STARTED"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section - with Indian entrance exam theme */}
      <section className="relative pt-32 md:pt-36 pb-20">
        {/* Background with Indian entrance exam theme */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Dark overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-dark-900 to-black opacity-90"></div>
          
          {/* Indian entrance exam background image */}
          <div 
            className="absolute inset-0 bg-center bg-cover opacity-50" 
            style={{ 
              backgroundImage: "url('/images/indian-entrance-exam-bg.svg')",
              backgroundSize: "cover", 
              backgroundPosition: "center",
              backgroundBlendMode: "luminosity"
            }}
          ></div>
          
          {/* Energy lines suggesting advancement and technology */}
          <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
          <div className="absolute top-0 left-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
          
          {/* Corner decorations */}
          <div className="absolute top-20 right-20 w-40 h-40 border-t-2 border-r-2 border-cyan-500/20"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 border-b-2 border-l-2 border-primary/20"></div>
        </div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              {/* Hero text with futuristic styling - Solo Leveling inspired */}
              <div className="relative block w-full lg:max-w-xl lg:mx-0 mx-auto">
                <div className="absolute -left-6 top-6 w-4 h-20 border-l-2 border-t-2 border-primary/60"></div>
                <div className="mb-2 font-mono tracking-wider text-primary/80">FUTURE OF EDUCATION</div>
                <h1 className="text-4xl md:text-7xl font-gaming mb-2 relative">
                  <span className="block text-white relative z-10">Level Up <span className="relative">
                    Your
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                  </span></span>
                  <span className="block gradient-text relative z-10 hex-clip-badge" style={{
                    background: "linear-gradient(90deg, #7d27ff, #3b82f6, #7d27ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundSize: "200% auto",
                    animation: "gradient-animation 3s linear infinite"
                  }}>Learning Journey</span>
                </h1>
                
                {/* Solo Leveling inspired decorative element */}
                <div className="absolute -right-2 -bottom-6 w-20 h-20 border-r-2 border-b-2 border-blue-500/40 hidden lg:block"></div>
              </div>
              
              <div className="mt-8 relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-primary/30"></div>
                <p className="text-xl pl-4 mb-8 text-gray-300 max-w-xl leading-relaxed">
                  India's first AI-powered competitive exam preparation platform with advanced gamification. Dominate JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE with voice-interactive AI tutors, real-time battles, and a complete ranking system.
                </p>
              </div>
              
              {/* Free Trial Badge */}
              <div className="mb-6 flex justify-center lg:justify-start">
                <div className="bg-[#4af3c0]/10 border border-[#4af3c0]/30 rounded-full px-4 py-2 flex items-center space-x-2 glow-trial-badge">
                  <Zap className="h-4 w-4 text-[#4af3c0]" />
                  <span className="text-[#4af3c0] font-medium text-sm">Free 1-Day Trial Available!</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mt-10">
                <Button 
                  onClick={() => user ? navigate("/dashboard") : navigate("/auth")}
                  className="animated-gradient-border py-6 px-10 text-lg relative overflow-hidden group"
                >
                  <span className="absolute inset-0.5 bg-background/95 rounded-md overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </span>
                  <span className="relative z-10 flex items-center font-medium">
                    {user ? "Dashboard" : "Start Free Trial"}
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
              
              {/* Tech decorations in place of stats */}
              <div className="mt-12 flex space-x-4 justify-center lg:justify-start">
                <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-5 py-2 inline-flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></div>
                  <span className="text-sm text-primary">AI-Powered</span>
                </div>
                <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-5 py-2 inline-flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span className="text-sm text-primary">Voice Interaction</span>
                </div>
                <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-5 py-2 inline-flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" style={{animationDelay: '2s'}}></div>
                  <span className="text-sm text-primary">Gamified Learning</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/2"
            >
              {/* Solo Leveling + Cybernetic showcase */}
              <div className="solo-leveling-card p-1 relative">
                {/* Solo Leveling inspired hexagonal frame with glowing edges */}
                <div className="absolute -top-3 -right-3 w-36 h-36 solo-leveling-corner-tr"></div>
                <div className="absolute -bottom-3 -left-3 w-36 h-36 solo-leveling-corner-bl"></div>
                
                {/* Scanning line effect */}
                <div className="absolute top-0 left-0 w-full h-1 cyber-scan-line"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 cyber-scan-line"></div>
                
                <div className="glassmorphism p-8 relative overflow-hidden border-2 border-primary/30 shadow-glow">
                  {/* Animated scanning effect */}
                  <div className="absolute inset-0 cyber-dots opacity-10"></div>
                  
                  {/* AI Tutor preview - Solo Leveling styled */}
                  <div className="mb-8 text-center">
                    <div className="inline-block mb-3 hex-badge p-3 px-5 bg-primary/10 text-sm font-mono tracking-wider text-primary">
                      REVOLUTIONARY AI-POWERED LEARNING
                    </div>
                    <h2 className="text-3xl font-gaming mb-4 hex-title relative inline-block">
                      AI Tutor with Voice Interaction
                    </h2>
                    <p className="text-gray-400 mb-6">Master entrance exam concepts with specialized AI tutors for JEE, NEET, UPSC, CLAT, and CUET</p>
                  </div>
                  
                  {/* Interactive Tech Features with Solo Leveling style */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="solo-feature-card p-[1px] rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/10"></div>
                      <div className="bg-background/95 rounded-lg p-4 h-full relative z-10">
                        <Brain className="h-8 w-8 mb-3 text-primary solo-icon" />
                        <h3 className="text-lg font-semibold mb-1">Voice Interaction</h3>
                        <p className="text-sm text-gray-400">Discuss entrance exam concepts naturally with your AI tutor for an immersive preparation experience</p>
                      </div>
                    </div>
                    
                    <div className="solo-feature-card p-[1px] rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/10"></div>
                      <div className="bg-background/95 rounded-lg p-4 h-full relative z-10">
                        <Compass className="h-8 w-8 mb-3 text-cyan-400 solo-icon" />
                        <h3 className="text-lg font-semibold mb-1">Adaptive Learning</h3>
                        <p className="text-sm text-gray-400">AI identifies your weak points and adapts content in real-time</p>
                      </div>
                    </div>
                    
                    <div className="solo-feature-card p-[1px] rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/10"></div>
                      <div className="bg-background/95 rounded-lg p-4 h-full relative z-10">
                        <ShieldCheck className="h-8 w-8 mb-3 text-fuchsia-400 solo-icon" />
                        <h3 className="text-lg font-semibold mb-1">Verified Content</h3>
                        <p className="text-sm text-gray-400">All material is aligned with official entrance exam patterns and requirements</p>
                      </div>
                    </div>
                    
                    <div className="solo-feature-card p-[1px] rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/10"></div>
                      <div className="bg-background/95 rounded-lg p-4 h-full relative z-10">
                        <Star className="h-8 w-8 mb-3 text-amber-400 solo-icon" />
                        <h3 className="text-lg font-semibold mb-1">Real-time Feedback</h3>
                        <p className="text-sm text-gray-400">Get instant analyses of your performance and improvement areas</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Solo Leveling-styled AI Text Interaction Visual */}
                  <div className="mt-8 flex items-center justify-center">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-background/80 border border-primary/30 shadow-glow-sm relative">
                      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-cyan-500/60"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-cyan-500/60"></div>
                      
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="text-sm font-mono text-cyan-500">AI Tutor is thinking...</span>
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
                  Exam-Mastery Features
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
              Learnyzer combines advanced AI technology with immersive gamification to create the future of entrance exam preparation
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
                  <h3 className="text-2xl font-gaming mb-4 text-white">GPT-4o Powered AI Tutors</h3>
                  <p className="text-gray-300">
                    Experience personalized coaching with advanced GPT-4o AI tutors specialized for JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE. 
                    Get instant doubt resolution, step-by-step solutions, and adaptive learning that matches your exam pattern.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>7 major competitive exams covered</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Interactive visual diagrams & charts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Exam-specific problem solving techniques</span>
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
                  <h3 className="text-2xl font-gaming mb-4 text-white">Competitive Battle Arena</h3>
                  <p className="text-gray-300">
                    Join India's most advanced competitive learning platform with real-time battles, power-ups, and tournaments. 
                    Battle other JEE/NEET/UPSC/CLAT/CUET/CSE/CGLE aspirants across the country and prove your knowledge supremacy.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Strategic power-ups & special abilities</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Spectator mode & live tournaments</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Coin economy & prize pools</span>
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
                  <h3 className="text-2xl font-gaming mb-4 text-white">Advanced Ranking & Analytics</h3>
                  <p className="text-gray-300">
                    Track your performance across all competitive exams with detailed analytics, progress charts, and AI-powered insights. 
                    Climb 9 prestigious rank tiers from Bronze to Grandmaster with exam-specific leaderboards for each subject area.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>9 prestigious rank tiers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Exam-specific performance tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>AI-generated study recommendations</span>
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
                  <h3 className="text-2xl font-gaming mb-4 text-white">Daily Exam Prep Rewards</h3>
                  <p className="text-gray-300">
                    Maintain your daily entrance exam preparation streak to earn increasing rewards and unlock 
                    exclusive test series and practice materials for consistent preparation.
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
                  <h3 className="text-2xl font-gaming mb-4 text-white">Complete Exam Ecosystem</h3>
                  <p className="text-gray-300">
                    Master all 7 major competitive exams: JEE (Engineering), NEET (Medical), UPSC (Civil Services), 
                    CLAT (Law), CUET (University), CSE (Computer Science), and CGLE (Government Jobs) with specialized content and strategies.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>All major Indian competitive exams</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Exam-locked focused preparation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Subject-wise mastery tracking</span>
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
                  <h3 className="text-2xl font-gaming mb-4 text-white">AI Tools & Mock Tests</h3>
                  <p className="text-gray-300">
                    Access comprehensive AI-powered study tools including study notes generator, answer checker, mock test generator, 
                    visual learning lab, and performance analytics. Get instant PDF downloads and detailed explanations for every topic.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>AI-generated study materials & PDFs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Real-time mock tests & scoring</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>OCR handwriting recognition</span>
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
              How Learnyzer Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 400 ? 1 : 0, y: scrollY > 400 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl opacity-80 max-w-2xl mx-auto"
            >
              Your complete journey from registration to exam success with India's most advanced AI-powered preparation platform
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
                  <h3 className="text-xl font-bold mb-3">Choose Your Competitive Exam</h3>
                  <p className="text-gray-400">Register with mobile OTP verification and select from 7 major competitive exams: JEE (Engineering), NEET (Medical), UPSC (Civil Services), CLAT (Law), CUET (University), CSE (Computer Science), or CGLE (Government Jobs). Lock your exam for focused preparation.</p>
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
                  <h3 className="text-xl font-bold mb-3">Access Premium AI Tools</h3>
                  <p className="text-gray-400">Start with free trial or choose subscription plans. Use GPT-4o AI tutors, study notes generator, mock test creator, visual learning lab, answer checker with OCR, and performance analytics tailored to your selected exam.</p>
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
                  <h3 className="text-xl font-bold mb-3">Study & Compete</h3>
                  <p className="text-gray-400">Get personalized coaching from exam-specific AI tutors, generate study materials as downloadable PDFs, participate in real-time battle zones with power-ups, and practice with interactive mock tests.</p>
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
                  <h3 className="text-xl font-bold mb-3">Achieve Excellence</h3>
                  <p className="text-gray-400">Monitor performance with detailed analytics, climb 9 prestigious rank tiers from Bronze to Grandmaster, maintain daily streaks for rewards, and track progress on exam-specific leaderboards to maximize your competitive exam score.</p>
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
              Get answers to common questions about Learnyzer
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
                  <h3 className="text-xl font-semibold mb-3">How does Learnyzer adapt to my exam preparation needs?</h3>
                  <p className="text-gray-400">
                    Learnyzer uses advanced AI to analyze your performance patterns, strengths, and areas for improvement on each entrance exam. The AI tutor adjusts its teaching approach based on your responses to practice questions, progress on exam topics, and preferences to provide a truly personalized preparation experience for JEE, NEET, UPSC, CLAT, CUET, CSE, or CGLE.
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
                  <h3 className="text-xl font-semibold mb-3">What entrance exams does Learnyzer cover?</h3>
                  <p className="text-gray-400">
                    Learnyzer specializes in preparation for India's most competitive entrance exams including JEE (engineering), NEET (medical), UPSC (civil services), CLAT (law), CUET (university admissions), CSE (computer science engineering), and CGLE (government job preparation). Our platform is exclusively designed for these high-stakes exams.
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
                    Battle Zones are real-time academic competitions where you can challenge other entrance exam aspirants in 1v1, 2v2, 3v3, or 4v4 formats. Each battle focuses on specific exam topics and sections, and your performance earns you rank points that help you climb from Bronze to Grandmaster ranks.
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
                    Yes, parents can access a dedicated dashboard to monitor their child's entrance exam preparation progress, mock test scores, time spent on different exam sections, and areas needing improvement. The dashboard provides actionable insights and preparation recommendations to support your child's journey to cracking competitive entrance exams.
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
            <h2 className="text-3xl md:text-4xl font-gaming gaming-text mb-6">Ready to Conquer Your Entrance Exams?</h2>
            <p className="text-xl opacity-80 mb-8">Join thousands of aspirants who are already preparing for JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE with Learnyzer.</p>
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


      
      {/* Razorpay Payment Modal */}
      <RazorpayCheckout
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        planName={selectedPlan.name}
        amount={selectedPlan.amount}
        currency="INR"
      />
      
      {/* Support Chatbot */}
      <SupportChatbot />
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