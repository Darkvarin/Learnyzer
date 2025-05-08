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
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative w-10 h-10 mr-2 bg-gradient-to-br from-primary to-purple-700 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
                <div className="absolute -inset-0.5 rounded-lg bg-primary/20 blur-sm opacity-70"></div>
              </div>
              <span className="text-2xl font-gaming tracking-wide text-white">LearnityX</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
              <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQs</a>
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
            </nav>

            {/* Mobile menu button */}
            <button 
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"} bg-background/95 backdrop-blur-md border-b border-primary/10 py-4`}>
          <nav className="container mx-auto px-4 flex flex-col space-y-4">
            <a 
              href="#features" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#how-it-works" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </a>
            <a 
              href="#faq" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQs
            </a>
            <Button 
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/auth");
              }}
              className="w-full"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section - with padding to account for fixed header */}
      <section className="relative pt-32 md:pt-40 pb-20 overflow-hidden bg-gradient-to-br from-background/80 to-background">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "radial-gradient(circle at center, var(--primary) 0, transparent 70%)",
            opacity: 0.1
          }}
        />

        {/* Hero background with abstract elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full filter blur-3xl"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-6xl font-gaming gaming-text mb-6">
                <span className="block">Level Up Your</span>
                <span className="block text-primary">Learning Journey</span>
              </h1>
              <p className="text-xl mb-8 opacity-80 max-w-xl">
                India's first AI-powered educational platform with gamification elements to make learning engaging, interactive, and rewarding.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => navigate("/auth")}
                  className="game-button py-6 px-8 text-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  className="game-button-secondary border-primary/50 py-6 px-8 text-lg"
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    featuresSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Features
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/2 rounded-xl overflow-hidden bg-primary/5 border border-primary/20 backdrop-blur-sm"
            >
              <div className="p-6 pb-0">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  <div className="text-center p-6">
                    <h3 className="text-2xl font-gaming gaming-text mb-3">Interactive AI Tutor</h3>
                    <p className="opacity-80">Engage with our advanced AI tutor for personalized learning</p>
                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                        <Brain className="h-6 w-6 mb-2 text-primary" />
                        <div className="text-sm">Voice interaction</div>
                      </div>
                      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                        <Compass className="h-6 w-6 mb-2 text-primary" />
                        <div className="text-sm">Smart navigation</div>
                      </div>
                      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                        <ShieldCheck className="h-6 w-6 mb-2 text-primary" />
                        <div className="text-sm">Verified content</div>
                      </div>
                      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                        <Star className="h-6 w-6 mb-2 text-primary" />
                        <div className="text-sm">Progress tracking</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/5">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 100 ? 1 : 0, y: scrollY > 100 ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-gaming gaming-text mb-4"
            >
              Game-Changing Features
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: scrollY > 100 ? 1 : 0, y: scrollY > 100 ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl opacity-80 max-w-2xl mx-auto"
            >
              LearnityX combines cutting-edge AI technology with gamification to revolutionize education
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              title="AI-Powered Tutor"
              description="Get personalized assistance 24/7 with our intelligent AI tutor that adapts to your learning style."
              icon={<Brain className="h-8 w-8 text-primary" />}
              scrollY={scrollY}
              threshold={150}
              delay={0}
            />
            <FeatureCard 
              title="Battle Zone Challenges"
              description="Compete in 1v1, 2v2, 3v3, or 4v4 real-time academic battles and earn rank points."
              icon={<Sword className="h-8 w-8 text-primary" />}
              scrollY={scrollY}
              threshold={150}
              delay={0.1}
            />
            <FeatureCard 
              title="Complete Rank System"
              description="Climb from Bronze to Grandmaster with a comprehensive ranking system that reflects your progress."
              icon={<Trophy className="h-8 w-8 text-primary" />}
              scrollY={scrollY}
              threshold={150}
              delay={0.2}
            />
            <FeatureCard 
              title="Daily Streak Rewards"
              description="Maintain your learning streak and earn increasing rewards for consistent practice."
              icon={<Calendar className="h-8 w-8 text-primary" />}
              scrollY={scrollY}
              threshold={250}
              delay={0}
            />
            <FeatureCard 
              title="Comprehensive Curriculum"
              description="Access content from 3rd grade to 12th grade, as well as competitive exams like JEE, NEET, UPSC, and CLAT."
              icon={<Book className="h-8 w-8 text-primary" />}
              scrollY={scrollY}
              threshold={250}
              delay={0.1}
            />
            <FeatureCard 
              title="Performance Analytics"
              description="Track your progress with detailed analytics and AI-generated insights to improve your study strategies."
              icon={<Star className="h-8 w-8 text-primary" />}
              scrollY={scrollY}
              threshold={250}
              delay={0.2}
            />
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