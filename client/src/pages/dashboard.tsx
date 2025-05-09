import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";
import { CoursesSection } from "@/components/dashboard/courses-section";
import { BattleZoneSection } from "@/components/dashboard/battle-zone-section";
import { StreakSection } from "@/components/dashboard/streak-section";
import { RankSection } from "@/components/dashboard/rank-section";
import { ReferralSection } from "@/components/dashboard/referral-section";
import { BreaksRecommender } from "@/components/wellness/breaks-recommender";
import { LayoutGrid, BarChart3, Zap, Award, Users, Brain } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#080B14]">
      {/* Modern futuristic background */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-950/30 via-[#080B14] to-[#080B14] z-0"></div>
      
      {/* Abstract geometric shapes for futuristic feel */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-indigo-500/5 to-transparent opacity-50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-purple-500/5 to-transparent opacity-40 rounded-full blur-3xl"></div>
      
      {/* Dynamic light patterns */}
      <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }}></div>
      
      {/* High-tech grid lines */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #4F46E5 1px, transparent 1px), 
                            linear-gradient(to bottom, #4F46E5 1px, transparent 1px)`,
          backgroundSize: '60px 60px' 
        }}>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
      <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent"></div>
      <div className="absolute top-10 right-10 w-[260px] h-[260px] border-t-[1px] border-r-[1px] border-indigo-500/10 rounded-tr-3xl"></div>
      <div className="absolute bottom-10 left-10 w-[200px] h-[200px] border-b-[1px] border-l-[1px] border-indigo-500/10 rounded-bl-3xl"></div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-16 md:pb-6 relative z-10">
        {/* Welcome message with futuristic style */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 tracking-tight">
            Welcome to Your Learning Hub
          </h1>
          <p className="text-gray-400 mt-2">
            Your personalized educational dashboard with AI-enhanced learning tools
          </p>
        </div>
        
        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main content */}
          <div className="lg:col-span-2 space-y-7">
            {/* User Profile Card - Futuristic style */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000 rounded-xl"></div>
              
              <div className="relative overflow-hidden bg-[#0C101F]/80 backdrop-blur-sm border border-indigo-500/20 rounded-xl transition-all duration-300 hover:border-indigo-500/40">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-indigo-500/0"></div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                
                <UserProfileCard />
              </div>
            </div>
            
            {/* Courses Section - Futuristic style */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 group-hover:from-blue-500/0 group-hover:via-blue-500/20 group-hover:to-blue-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative flex items-center space-x-4 overflow-hidden bg-[#0C101F]/80 backdrop-blur-sm border border-blue-500/20 p-4 rounded-xl transition-all duration-300 hover:border-blue-500/40">
                <div className="flex-shrink-0 bg-blue-500/10 p-3 rounded-lg">
                  <LayoutGrid className="h-6 w-6 text-blue-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white/90 flex items-center">
                    <span>Courses</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 ml-2 animate-pulse"></div>
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">Continue your learning journey</p>
                  
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0"></div>
                    <CoursesSection />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Analytics/Stats Overview - New section with futuristic style */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 group-hover:from-teal-500/0 group-hover:via-teal-500/20 group-hover:to-teal-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative overflow-hidden bg-[#0C101F]/80 backdrop-blur-sm border border-teal-500/20 rounded-xl transition-all duration-300 hover:border-teal-500/40">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-500/0 via-teal-500/60 to-teal-500/0"></div>
                
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-5 w-5 text-teal-400 mr-2" />
                    <h3 className="font-bold text-white/90">Learning Analytics</h3>
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-400 ml-2 animate-pulse"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0A0E1A] p-4 rounded-lg border border-teal-500/10">
                      <p className="text-xs text-gray-400 mb-1">Total Courses</p>
                      <p className="text-2xl font-bold text-white/90">12</p>
                      <div className="h-1 w-full bg-gray-700/30 mt-2 rounded">
                        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-400 rounded" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    
                    <div className="bg-[#0A0E1A] p-4 rounded-lg border border-indigo-500/10">
                      <p className="text-xs text-gray-400 mb-1">Accuracy</p>
                      <p className="text-2xl font-bold text-white/90">92%</p>
                      <div className="h-1 w-full bg-gray-700/30 mt-2 rounded">
                        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-400 rounded" style={{width: '92%'}}></div>
                      </div>
                    </div>
                    
                    <div className="bg-[#0A0E1A] p-4 rounded-lg border border-blue-500/10">
                      <p className="text-xs text-gray-400 mb-1">AI Sessions</p>
                      <p className="text-2xl font-bold text-white/90">28</p>
                      <div className="h-1 w-full bg-gray-700/30 mt-2 rounded">
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded" style={{width: '40%'}}></div>
                      </div>
                    </div>
                    
                    <div className="bg-[#0A0E1A] p-4 rounded-lg border border-purple-500/10">
                      <p className="text-xs text-gray-400 mb-1">Battles Won</p>
                      <p className="text-2xl font-bold text-white/90">5</p>
                      <div className="h-1 w-full bg-gray-700/30 mt-2 rounded">
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-400 rounded" style={{width: '25%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Battle Zone Section - Futuristic style */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 group-hover:from-purple-500/0 group-hover:via-purple-500/20 group-hover:to-purple-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative flex items-center space-x-4 overflow-hidden bg-[#0C101F]/80 backdrop-blur-sm border border-purple-500/20 p-4 rounded-xl transition-all duration-300 hover:border-purple-500/40">
                <div className="flex-shrink-0 bg-purple-500/10 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white/90 flex items-center">
                    <span>Battle Zone</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400 ml-2 animate-pulse"></div>
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">Test your knowledge against others</p>
                  
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0"></div>
                    <BattleZoneSection />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Side panels */}
          <div className="space-y-7">
            {/* Wellness Breaks Section - Futuristic style */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 group-hover:from-cyan-500/0 group-hover:via-cyan-500/20 group-hover:to-cyan-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative flex items-center space-x-4 overflow-hidden bg-[#0C101F]/80 backdrop-blur-sm border border-cyan-500/20 p-4 rounded-xl transition-all duration-300 hover:border-cyan-500/40">
                <div className="flex-shrink-0 bg-cyan-500/10 p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-cyan-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white/90 flex items-center">
                    <span>Smart Breaks</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 ml-2 animate-pulse"></div>
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">AI-recommended wellness activities</p>
                  
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0"></div>
                    <BreaksRecommender />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Streak Section - Futuristic style */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 group-hover:from-amber-500/0 group-hover:via-amber-500/20 group-hover:to-amber-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative flex items-center space-x-4 overflow-hidden bg-[#0C101F]/80 backdrop-blur-sm border border-amber-500/20 p-4 rounded-xl transition-all duration-300 hover:border-amber-500/40">
                <div className="flex-shrink-0 bg-amber-500/10 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-amber-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white/90 flex items-center">
                    <span>Daily Streak</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 ml-2 animate-pulse"></div>
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">Keep your momentum going</p>
                  
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-500/0 via-amber-500/30 to-amber-500/0"></div>
                    <StreakSection />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rank Section - Futuristic style */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 group-hover:from-emerald-500/0 group-hover:via-emerald-500/20 group-hover:to-emerald-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative flex items-center space-x-4 overflow-hidden bg-[#0C101F]/80 backdrop-blur-sm border border-emerald-500/20 p-4 rounded-xl transition-all duration-300 hover:border-emerald-500/40">
                <div className="flex-shrink-0 bg-emerald-500/10 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-emerald-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white/90 flex items-center">
                    <span>Your Rank</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 ml-2 animate-pulse"></div>
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">Track progress to next level</p>
                  
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0"></div>
                    <RankSection />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Referral Section - Futuristic style */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 group-hover:from-rose-500/0 group-hover:via-rose-500/20 group-hover:to-rose-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative flex items-center space-x-4 overflow-hidden bg-[#0C101F]/80 backdrop-blur-sm border border-rose-500/20 p-4 rounded-xl transition-all duration-300 hover:border-rose-500/40">
                <div className="flex-shrink-0 bg-rose-500/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-rose-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white/90 flex items-center">
                    <span>Referrals</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400 ml-2 animate-pulse"></div>
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">Invite friends and earn rewards</p>
                  
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-rose-500/0 via-rose-500/30 to-rose-500/0"></div>
                    <ReferralSection />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
