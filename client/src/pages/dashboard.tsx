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

export default function Dashboard() {
  const { user } = useAuth();
  const { data: userStats } = useQuery<any>({ 
    queryKey: ["/api/user/stats"],
  });

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#080B14]">
      {/* Modern futuristic background */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-950/30 via-[#080B14] to-[#080B14] z-0"></div>
      
      {/* Subtle geometric shapes for futuristic feel */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-indigo-500/5 to-transparent opacity-50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-purple-500/5 to-transparent opacity-40 rounded-full blur-3xl"></div>
      
      {/* Dynamic light patterns */}
      <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
      
      {/* Futuristic grid lines */}
      <div className="absolute inset-0 z-0 opacity-[0.03] tech-pattern"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
      <div className="absolute top-10 right-10 w-[260px] h-[260px] border-t-[1px] border-r-[1px] border-indigo-500/10 rounded-tr-3xl"></div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-16 md:pb-6 relative z-10">
        {/* Welcome message with futuristic style */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 tracking-tight">
            Welcome{user ? `, ${user.name}` : ''}
          </h1>
          <p className="text-gray-400 mt-2">
            Your AI-enhanced educational platform
          </p>
        </div>
        
        {/* Profile Card and Learning Performance - Full Width */}
        <div className="mb-7">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000 rounded-xl"></div>
              
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-indigo-500/20 rounded-xl transition-all duration-300 hover:border-indigo-500/40">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-indigo-500/0"></div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
              
              <UserProfileCard />
            </div>
          </div>
        </div>
        
        {/* Learning Analytics Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 group-hover:from-blue-500/0 group-hover:via-blue-500/20 group-hover:to-blue-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-blue-500/20 p-4 rounded-xl transition-all duration-300 hover:border-blue-500/40">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0"></div>
              
              <div className="flex items-center mb-2">
                <Trophy className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="font-medium text-white/90">Level</h3>
              </div>
              
              <p className="text-2xl font-bold text-white">{userStats?.level || 0}</p>
              
              <div className="h-1 w-full bg-gray-800/50 mt-2 rounded overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-l animate-pulse-width" 
                  style={{
                    width: userStats ? 
                      `${(userStats.currentXp / userStats.nextLevelXp) * 100}%` : '0%'
                  }}>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                {userStats ? 
                  `${userStats.currentXp} / ${userStats.nextLevelXp} XP` : 
                  '0 / 1000 XP'}
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 group-hover:from-emerald-500/0 group-hover:via-emerald-500/20 group-hover:to-emerald-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-emerald-500/20 p-4 rounded-xl transition-all duration-300 hover:border-emerald-500/40">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0"></div>
              
              <div className="flex items-center mb-2">
                <Award className="h-5 w-5 text-emerald-400 mr-2" />
                <h3 className="font-medium text-white/90">Rank</h3>
              </div>
              
              <p className="text-2xl font-bold text-white">{userStats?.rank || 'Bronze I'}</p>
              
              <div className="h-1 w-full bg-gray-800/50 mt-2 rounded">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-l shimmer-effect" 
                  style={{width: '35%'}}>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                {userStats?.rankPoints || 0} points
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 group-hover:from-amber-500/0 group-hover:via-amber-500/20 group-hover:to-amber-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-amber-500/20 p-4 rounded-xl transition-all duration-300 hover:border-amber-500/40">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0"></div>
              
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 text-amber-400 mr-2" />
                <h3 className="font-medium text-white/90">Streak</h3>
              </div>
              
              <p className="text-2xl font-bold text-white">{userStats?.streakDays || 0} Days</p>
              
              <div className="h-1 w-full bg-gray-800/50 mt-2 rounded">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-l" 
                  style={{width: userStats?.streakDays ? `${Math.min(userStats.streakDays * 10, 100)}%` : '0%'}}>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                Keep learning daily
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 group-hover:from-purple-500/0 group-hover:via-purple-500/20 group-hover:to-purple-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-purple-500/20 p-4 rounded-xl transition-all duration-300 hover:border-purple-500/40">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0"></div>
              
              <div className="flex items-center mb-2">
                <Target className="h-5 w-5 text-purple-400 mr-2" />
                <h3 className="font-medium text-white/90">Accuracy</h3>
              </div>
              
              <p className="text-2xl font-bold text-white">{userStats?.accuracy || '0%'}</p>
              
              <div className="h-1 w-full bg-gray-800/50 mt-2 rounded">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-400 rounded-l" 
                  style={{width: userStats?.accuracy ? 
                    `${parseInt(userStats.accuracy.replace('%', ''))}%` : '0%'}}>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                Answer accuracy rate
              </p>
            </div>
          </div>
        </div>
        
        {/* Three Column Layout for Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Courses Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 group-hover:from-blue-500/0 group-hover:via-blue-500/20 group-hover:to-blue-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-blue-500/20 rounded-xl transition-all duration-300 hover:border-blue-500/40 h-full">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0"></div>
              
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="font-bold text-white/90">My Courses</h3>
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 ml-2 animate-pulse"></div>
                </div>
                
                <div className="relative">
                  <CoursesSection />
                </div>
              </div>
            </div>
          </div>
          
          {/* Battle Zone Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 group-hover:from-purple-500/0 group-hover:via-purple-500/20 group-hover:to-purple-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-purple-500/20 rounded-xl transition-all duration-300 hover:border-purple-500/40 h-full">
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
          
          {/* Combined Rank & Streak Section */}
          <div className="space-y-6">
            {/* Wellness Breaks */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 group-hover:from-cyan-500/0 group-hover:via-cyan-500/20 group-hover:to-cyan-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-cyan-500/20 rounded-xl transition-all duration-300 hover:border-cyan-500/40">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/40 to-cyan-500/0"></div>
                
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <Brain className="h-5 w-5 text-cyan-400 mr-2" />
                    <h3 className="font-bold text-white/90">Smart Breaks</h3>
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 ml-2 animate-pulse"></div>
                  </div>
                  
                  <div className="relative">
                    <BreaksRecommender />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Streak Section */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 group-hover:from-amber-500/0 group-hover:via-amber-500/20 group-hover:to-amber-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-amber-500/20 rounded-xl transition-all duration-300 hover:border-amber-500/40">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0"></div>
                
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <Zap className="h-5 w-5 text-amber-400 mr-2" />
                    <h3 className="font-bold text-white/90">Streak</h3>
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 ml-2 animate-pulse"></div>
                  </div>
                  
                  <div className="relative">
                    <StreakSection />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Rank Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 group-hover:from-emerald-500/0 group-hover:via-emerald-500/20 group-hover:to-emerald-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-emerald-500/20 rounded-xl transition-all duration-300 hover:border-emerald-500/40">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0"></div>
              
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <Award className="h-5 w-5 text-emerald-400 mr-2" />
                  <h3 className="font-bold text-white/90">Rank Progress</h3>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 ml-2 animate-pulse"></div>
                </div>
                
                <div className="relative">
                  <RankSection />
                </div>
              </div>
            </div>
          </div>
          
          {/* Referral Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 group-hover:from-rose-500/0 group-hover:via-rose-500/20 group-hover:to-rose-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-[#0C101F]/90 backdrop-blur-sm border border-rose-500/20 rounded-xl transition-all duration-300 hover:border-rose-500/40">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500/0 via-rose-500/40 to-rose-500/0"></div>
              
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <Users className="h-5 w-5 text-rose-400 mr-2" />
                  <h3 className="font-bold text-white/90">Referrals</h3>
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-400 ml-2 animate-pulse"></div>
                </div>
                
                <div className="relative">
                  <ReferralSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
