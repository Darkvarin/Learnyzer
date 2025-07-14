import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Target,
  Award,
  TrendingUp,
  Sparkles,
  Clock,
  Shield,
  Heart,
  PlayCircle,
  ChevronDown,
  GraduationCap
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [activeExam, setActiveExam] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const examTypes = [
    { name: "JEE", description: "Joint Entrance Examination", subjects: ["Physics", "Chemistry", "Mathematics"] },
    { name: "NEET", description: "National Eligibility cum Entrance Test", subjects: ["Physics", "Chemistry", "Biology"] },
    { name: "UPSC", description: "Union Public Service Commission", subjects: ["History", "Geography", "Political Science"] },
    { name: "CLAT", description: "Common Law Admission Test", subjects: ["English", "Legal Reasoning", "Logical Reasoning"] },
    { name: "CUET", description: "Common University Entrance Test", subjects: ["Physics", "Chemistry", "Mathematics"] },
    { name: "CSE", description: "Computer Science Engineering", subjects: ["Programming", "Data Structures", "Algorithms"] },
    { name: "CGLE", description: "Combined Graduate Level Examination", subjects: ["General Awareness", "Quantitative Aptitude"] }
  ];

  // Auto-rotate exam types for interactive demo
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExam((prev) => (prev + 1) % examTypes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [examTypes.length]);

  // Show stats after a delay for engagement
  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlanSelection = (planName: string) => {
    // For free trial, go to authentication page
    if (planName === "Free Trial") {
      setLocation("/auth");
      return;
    }
    
    // For paid plans, go to subscription page with plan selected
    const planId = planName === "Monthly Basic" ? "basic" :
                   planName === "Monthly Pro" ? "pro" :
                   planName === "Quarterly" ? "quarterly" :
                   planName === "Half-Yearly" ? "half_yearly" :
                   planName === "Yearly" ? "yearly" : "basic";
    
    setLocation(`/subscription?plan=${planId}`);
  };

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Tutoring",
      description: "Get personalized explanations from GPT-4o powered AI tutors specialized in your exam"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Interactive Visual Learning",
      description: "Learn with AI-generated diagrams, interactive elements, and visual explanations"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Gamified Learning",
      description: "Level up, earn XP, compete in battles, and track your progress with achievements"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Exam-Specific Content",
      description: "Focused content tailored specifically for your target competitive examination"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Battle Arena",
      description: "Compete with other students in real-time academic battles and challenges"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Track your progress with detailed analytics and personalized insights"
    }
  ];

  const testimonials = [
    {
      name: "NEET Student",
      exam: "Medical Entrance Preparation",
      content: "The AI tutor helped me understand complex Biology concepts with interactive diagrams. The visual learning approach is excellent.",
      rating: 5
    },
    {
      name: "JEE Aspirant",
      exam: "Engineering Entrance Preparation", 
      content: "Battle Arena made learning fun! Competing with other students improved my Physics and Math problem-solving skills.",
      rating: 5
    },
    {
      name: "UPSC Candidate",
      exam: "Civil Services Preparation",
      content: "The voice-enabled AI tutor is amazing. I can learn while commuting or during breaks. Very convenient and effective!",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free Trial",
      price: "₹0",
      duration: "1 Day",
      features: [
        "5 AI chat sessions",
        "3 visual lab generations", 
        "2 AI tutor sessions",
        "1 visual learning package",
        "Basic exam preparation content"
      ],
      popular: false,
      ctaText: "Start Free Trial"
    },
    {
      name: "Monthly Basic",
      price: "₹799",
      duration: "Per Month",
      features: [
        "Access to all AI tools",
        "No AI tutor access",
        "Basic analytics",
        "Battle Arena participation",
        "Monthly billing"
      ],
      popular: false,
      ctaText: "Choose Basic"
    },
    {
      name: "Monthly Pro",
      price: "₹1,500",
      duration: "Per Month",
      features: [
        "2 AI tutor lessons daily",
        "All AI tools (20 uses/day)",
        "Performance analytics",
        "Battle Arena participation",
        "Full course library access"
      ],
      popular: true,
      ctaText: "Choose Monthly Pro"
    },
    {
      name: "Quarterly",
      price: "₹4,199",
      duration: "3 Months",
      features: [
        "3 AI tutor lessons daily",
        "All AI tools (40 uses/day)",
        "Advanced analytics",
        "Save ₹1,301 compared to monthly",
        "Quarterly billing"
      ],
      popular: false,
      ctaText: "Choose Quarterly"
    },
    {
      name: "Half-Yearly",
      price: "₹7,599",
      duration: "6 Months",
      features: [
        "3 AI tutor lessons daily",
        "All AI tools (40 uses/day)",
        "Advanced analytics",
        "Save ₹3,401 compared to monthly",
        "6-month billing"
      ],
      popular: false,
      ctaText: "Choose Half-Yearly"
    },
    {
      name: "Yearly", 
      price: "₹12,999",
      duration: "Per Year",
      features: [
        "3 AI tutor lessons daily",
        "All AI tools (40 uses/day)",
        "Priority support",
        "Advanced analytics",
        "Save ₹5,001 compared to monthly"
      ],
      popular: false,
      ctaText: "Choose Yearly"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <img 
                  src="/images/learnyzer-logo.png" 
                  alt="Learnyzer Logo" 
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <span 
                className="text-xl font-black tracking-tight"
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
            <div className="flex space-x-4">
              <Link href="/auth">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1.3, 1, 1.3],
              opacity: [0.7, 0.3, 0.7]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
              </motion.div>
              Free 1-Day Trial Available!
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Master Competitive Exams with AI
          </motion.h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            India's most advanced AI-powered learning platform for JEE, NEET, UPSC, CLAT, CUET, CSE & CGLE preparation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => handlePlanSelection("Free Trial")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4">
              Watch Demo
              <Clock className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>100% Safe & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              <span>Loved by 50,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              <span>98% Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Exams */}
      <section className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            Comprehensive Exam Preparation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {examTypes.map((exam, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">{exam.name}</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    {exam.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {exam.subjects.map((subject, subIndex) => (
                      <Badge key={subIndex} variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Why Choose Learnyzer?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of learning with our AI-powered educational platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card className={`bg-white/5 border-white/10 transition-all duration-300 h-full ${
                  hoveredFeature === index ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/20' : ''
                }`}>
                  <CardHeader>
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4"
                      animate={hoveredFeature === index ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            What Students Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-white text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="text-blue-300">{testimonial.exam}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Choose Your Learning Journey
            </h2>
            <p className="text-xl text-gray-300">
              Affordable plans designed for Indian students
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className={`relative h-full ${plan.popular ? 'border-blue-500 bg-blue-500/10' : 'bg-white/5 border-white/10'} transition-all duration-300`}>
                  {plan.popular && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Most Popular
                        </motion.div>
                      </Badge>
                    </motion.div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                    <motion.div 
                      className="text-3xl font-bold text-white"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {plan.price}
                      <span className="text-lg font-normal text-gray-300">/{plan.duration}</span>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          className="flex items-center gap-3 text-gray-300"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 180 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                          </motion.div>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={() => handlePlanSelection(plan.name)}
                        className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-white/10 hover:bg-white/20'} transition-all duration-300 group`}
                      >
                        {plan.ctaText}
                        <motion.div
                          className="ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful students who achieved their dreams with Learnyzer
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => handlePlanSelection("Free Trial")}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
            >
              Start Your Free Trial Today
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">Learnyzer</div>
              </div>
              <p className="text-gray-400">
                Empowering students to achieve their competitive exam goals through AI-powered learning.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Exams</h3>
              <ul className="space-y-2 text-gray-400">
                <li>JEE Preparation</li>
                <li>NEET Preparation</li>
                <li>UPSC Preparation</li>
                <li>CLAT Preparation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI Tutoring</li>
                <li>Visual Learning</li>
                <li>Battle Arena</li>
                <li>Analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Learnyzer Edtech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}