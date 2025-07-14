import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";
import { CoursesSection } from "@/components/dashboard/courses-section";
import { BattleZoneSection } from "@/components/dashboard/battle-zone-section";
import { StreakSection } from "@/components/dashboard/streak-section";
import { RankSection } from "@/components/dashboard/rank-section";
import { ReferralSection } from "@/components/dashboard/referral-section";
import { BreaksRecommender } from "@/components/wellness/breaks-recommender";

import { LayoutGrid, BarChart3, Zap, Award, Users, Brain, BookOpen, Target, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { SEOHead } from "@/components/seo/seo-head";
import { createWebPageSchema } from "@/components/seo/structured-data";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: userStats } = useQuery<any>({ 
    queryKey: ["/api/user/stats"],
  });

  // Dynamic SEO data based on user progress
  const dashboardSchema = createWebPageSchema({
    title: `${user?.name || user?.username || 'Student'}'s Learning Dashboard - Learnyzer`,
    description: `Track your progress in JEE, NEET, UPSC, CLAT, and CUET preparation. Level ${userStats?.level || 1}, ${userStats?.currentXp || 0} XP, ${userStats?.streakDays || 0} day streak.`
  });

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden futuristic-bg">
      <SEOHead
        title={`${user?.name || user?.username || 'Student'}'s Dashboard - Learnyzer`}
        description={`Track your entrance exam preparation progress with AI-powered learning. Level ${userStats?.level || 1}, ${userStats?.currentXp || 0} XP earned. Advanced analytics for JEE, NEET, UPSC, CLAT, and CUET success.`}
        keywords="student dashboard, exam preparation progress, JEE progress tracker, NEET study analytics, UPSC preparation dashboard, AI learning progress, competitive exam analytics"
        canonical={`${window.location.origin}/dashboard`}
        structuredData={dashboardSchema}
      />
      {/* Modern cyberpunk grid background with subtle Solo Leveling accents */}
      <div className="absolute inset-0 cyber-grid z-0 opacity-20"></div>
      
      {/* Educational-themed background with competitive exams - subtler version */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-dark-900 to-black opacity-90"></div>
        
        {/* Indian educational background image */}
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-30" 
          style={{ 
            backgroundImage: "url('/images/indian-education-bg.svg')",
            backgroundSize: "cover", 
            backgroundPosition: "center",
            backgroundBlendMode: "luminosity"
          }}
        ></div>
      </div>
      
      {/* Animated glowing orbs */}
      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-purple-500/10 filter blur-[80px] animate-pulse-glow z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-blue-500/10 filter blur-[100px] animate-pulse-glow z-0" style={{animationDelay: '1s'}}></div>
      
      {/* Minimal energy flow line - subtle Solo Leveling accent */}
      <div className="absolute h-full w-full overflow-hidden z-0">
        <div className="energy-flow-horizontal top-2/3 opacity-30"></div>
      </div>
      
      {/* Cyberpunk corner elements from home page */}
      <div className="absolute top-24 right-20 w-40 h-40 border-t-2 border-r-2 border-purple-500/20 z-0"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 border-b-2 border-l-2 border-cyan-500/20 z-0"></div>
      
      {/* Circuit lines - tech aesthetic */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.07] z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,30 L40,40 L60,40 L100,30" stroke="rgba(125, 39, 255, 0.3)" strokeWidth="0.2" fill="none" />
        <path d="M0,60 L30,70 L70,70 L100,60" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.2" fill="none" />
        <path d="M25,0 L25,100" stroke="rgba(125, 39, 255, 0.2)" strokeWidth="0.1" fill="none" />
        <path d="M75,0 L75,100" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.1" fill="none" />
      </svg>
      
      {/* Solo Leveling hex pattern - reduced but maintained for theme consistency */}
      <div className="absolute top-40 right-10 z-0 opacity-30">
        <div className="hex-grid">
          <div className="hex-cell"></div>
        </div>
      </div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-16 md:pb-6 relative z-10">
        {/* Welcome message with Solo Leveling inspiration */}
        <div className="mb-8 relative">
          <div className="mb-1 font-mono tracking-wider text-primary/80">STUDENT DASHBOARD</div>
          <div className="relative">
            <h1 className="text-2xl md:text-4xl font-gaming mb-2 text-white">
              Welcome<span className="relative ml-2">
                {user ? user.name : ''}
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
              </span>
            </h1>
            <div className="absolute -left-4 top-2 w-2 h-12 border-l-2 border-t-2 border-primary/60"></div>
          </div>
          
          <p className="text-gray-300 mt-4 pl-4 border-l border-primary/30">
            Your AI-enhanced educational journey awaits. Track your progress, engage in battles, and level up your learning.
          </p>
        </div>
        
        {/* Profile Card with Solo Leveling & Education Theme */}
        <div className="mb-7">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000 rounded-xl"></div>
              
            <div className="relative overflow-hidden glassmorphism border border-primary/30 rounded-xl transition-all duration-300 hover:border-primary/50 solo-leveling-card">
              {/* Solo Leveling inspired hexagonal frame with glowing edges */}
              <div className="absolute -top-2 -right-2 w-24 h-24 solo-leveling-corner-tr opacity-60"></div>
              <div className="absolute -bottom-2 -left-2 w-24 h-24 solo-leveling-corner-bl opacity-60"></div>
              
              {/* Accent lines similar to homepage */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0"></div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              
              <UserProfileCard />
            </div>
          </div>
        </div>
        
        {/* Learning Analytics Stats Section - Solo Leveling Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 group-hover:from-primary/0 group-hover:via-primary/30 group-hover:to-primary/0 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative overflow-hidden glassmorphism border border-primary/30 p-4 rounded-lg transition-all duration-300 hover:border-primary/50">
              {/* Solo Leveling inspired corner accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[1px] border-r-[1px] border-primary/60 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1px] border-l-[1px] border-primary/30 rounded-bl-lg"></div>
              
              <div className="flex items-center mb-2">
                <div className="bg-primary/20 p-1.5 rounded mr-2">
                  <Trophy className="h-4 w-4 text-primary/90" />
                </div>
                <h3 className="font-gaming text-white/90 tracking-wide">Level</h3>
              </div>
              
              <p className="text-2xl font-bold font-gaming text-white">{userStats?.level || 0}</p>
              
              <div className="h-2 w-full bg-gray-800/50 mt-2 rounded-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r from-primary to-purple-500 rounded-l ${
                    userStats && userStats.currentXp > 0 ? 'animate-pulse-width' : ''
                  }`} 
                  style={{
                    width: userStats ? 
                      `${(userStats.currentXp / userStats.nextLevelXp) * 100}%` : '0%'
                  }}>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1 font-mono">
                {userStats ? 
                  `${userStats.currentXp} / ${userStats.nextLevelXp} XP` : 
                  '0 / 1000 XP'}
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 group-hover:from-emerald-500/0 group-hover:via-emerald-500/30 group-hover:to-emerald-500/0 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative overflow-hidden glassmorphism border border-emerald-500/30 p-4 rounded-lg transition-all duration-300 hover:border-emerald-500/50">
              {/* Solo Leveling inspired corner accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[1px] border-r-[1px] border-emerald-500/60 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1px] border-l-[1px] border-emerald-500/30 rounded-bl-lg"></div>
              
              <div className="flex items-center mb-2">
                <div className="bg-emerald-500/20 p-1.5 rounded mr-2">
                  <Award className="h-4 w-4 text-emerald-400/90" />
                </div>
                <h3 className="font-gaming text-white/90 tracking-wide">Rank</h3>
              </div>
              
              <p className="text-2xl font-bold font-gaming text-white">{userStats?.rank || 'Bronze I'}</p>
              
              <div className="h-2 w-full bg-gray-800/50 mt-2 rounded-lg">
                <div className={`h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l ${
                    userStats && userStats.rankPoints > 0 ? 'shimmer-effect' : ''
                  }`} 
                  style={{width: userStats?.rankPoints ? `${Math.min((userStats.rankPoints / 1000) * 100, 100)}%` : '0%'}}>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1 font-mono">
                {userStats?.rankPoints || 0} points
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 group-hover:from-amber-500/0 group-hover:via-amber-500/30 group-hover:to-amber-500/0 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative overflow-hidden glassmorphism border border-amber-500/30 p-4 rounded-lg transition-all duration-300 hover:border-amber-500/50">
              {/* Solo Leveling inspired corner accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[1px] border-r-[1px] border-amber-500/60 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1px] border-l-[1px] border-amber-500/30 rounded-bl-lg"></div>
              
              <div className="flex items-center mb-2">
                <div className="bg-amber-500/20 p-1.5 rounded mr-2">
                  <Zap className="h-4 w-4 text-amber-400/90" />
                </div>
                <h3 className="font-gaming text-white/90 tracking-wide">Streak</h3>
              </div>
              
              <p className="text-2xl font-bold font-gaming text-white">{userStats?.streakDays || 0} Days</p>
              
              <div className="h-2 w-full bg-gray-800/50 mt-2 rounded-lg">
                <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-l" 
                  style={{width: userStats?.streakDays ? `${Math.min(userStats.streakDays * 10, 100)}%` : '0%'}}>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1 font-mono">
                Keep learning daily
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 group-hover:from-purple-500/0 group-hover:via-purple-500/30 group-hover:to-purple-500/0 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative overflow-hidden glassmorphism border border-purple-500/30 p-4 rounded-lg transition-all duration-300 hover:border-purple-500/50">
              {/* Solo Leveling inspired corner accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[1px] border-r-[1px] border-purple-500/60 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1px] border-l-[1px] border-purple-500/30 rounded-bl-lg"></div>
              
              <div className="flex items-center mb-2">
                <div className="bg-purple-500/20 p-1.5 rounded mr-2">
                  <Target className="h-4 w-4 text-purple-400/90" />
                </div>
                <h3 className="font-gaming text-white/90 tracking-wide">Accuracy</h3>
              </div>
              
              <p className="text-2xl font-bold font-gaming text-white">{userStats?.accuracy || '0%'}</p>
              
              <div className="h-2 w-full bg-gray-800/50 mt-2 rounded-lg">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-l" 
                  style={{width: userStats?.accuracy ? 
                    `${parseInt(userStats.accuracy.replace('%', ''))}%` : '0%'}}>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1 font-mono">
                Answer accuracy rate
              </p>
            </div>
          </div>
        </div>
        
        {/* Dashboard Content - Top Section with mobile-optimized layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Mobile: full width, Desktop: 5 columns */}
          <div className="lg:col-span-5 space-y-6">
            {/* Rank Section */}
            <div className="relative group w-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 group-hover:from-emerald-500/0 group-hover:via-emerald-500/20 group-hover:to-emerald-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative w-full overflow-hidden glassmorphism border border-emerald-500/20 rounded-xl transition-all duration-300 hover:border-emerald-500/40">
                <RankSection />
              </div>
            </div>
            
            {/* Referral Section */}
            <div className="relative group w-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 group-hover:from-rose-500/0 group-hover:via-rose-500/20 group-hover:to-rose-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative w-full overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-rose-500/20 rounded-xl transition-all duration-300 hover:border-rose-500/40">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500/0 via-rose-500/40 to-rose-500/0"></div>
                
                <div className="p-5 flex flex-col">
                  <div className="flex items-center mb-4">
                    <Users className="h-5 w-5 text-rose-400 mr-2" />
                    <h3 className="font-bold text-white/90">Referrals</h3>
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400 ml-2 animate-pulse"></div>
                  </div>
                  
                  <div className="relative flex-grow">
                    <ReferralSection />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wellness & Streaks Section - Mobile: full width, Desktop: 7 columns */}
          <div className="lg:col-span-7 space-y-6">
            {/* Wellness Breaks */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 group-hover:from-cyan-500/0 group-hover:via-cyan-500/20 group-hover:to-cyan-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative h-full overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-cyan-500/20 rounded-xl transition-all duration-300 hover:border-cyan-500/40">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/40 to-cyan-500/0"></div>
                
                <div className="p-5 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <Brain className="h-5 w-5 text-cyan-400 mr-2" />
                    <h3 className="font-bold text-white/90">Smart Breaks</h3>
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 ml-2 animate-pulse"></div>
                  </div>
                  
                  <div className="relative flex-grow">
                    <BreaksRecommender />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Streak Section */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 group-hover:from-amber-500/0 group-hover:via-amber-500/20 group-hover:to-amber-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative h-full overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-amber-500/20 rounded-xl transition-all duration-300 hover:border-amber-500/40">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0"></div>
                
                <div className="p-5 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <Zap className="h-5 w-5 text-amber-400 mr-2" />
                    <h3 className="font-bold text-white/90">Streak</h3>
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 ml-2 animate-pulse"></div>
                  </div>
                  
                  <div className="relative flex-grow">
                    <StreakSection />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Battle Zone - Full Width */}
        <div className="mt-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 group-hover:from-purple-500/0 group-hover:via-purple-500/20 group-hover:to-purple-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-purple-500/20 rounded-xl transition-all duration-300 hover:border-purple-500/40">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0"></div>
              
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <Zap className="h-5 w-5 text-purple-400 mr-2" />
                  <h3 className="font-bold text-white/90">Battle Zone</h3>
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400 ml-2 animate-pulse"></div>
                </div>
                
                <div className="relative">
                  <BattleZoneSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
