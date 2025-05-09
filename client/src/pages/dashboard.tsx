import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";
import { CoursesSection } from "@/components/dashboard/courses-section";
import { BattleZoneSection } from "@/components/dashboard/battle-zone-section";
import { StreakSection } from "@/components/dashboard/streak-section";
import { RankSection } from "@/components/dashboard/rank-section";
import { ReferralSection } from "@/components/dashboard/referral-section";
import { BreaksRecommender } from "@/components/wellness/breaks-recommender";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Simple elegant background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black z-0"></div>
      
      {/* Subtle gradient accents */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] rounded-full bg-blue-600/10 filter blur-[120px] z-0 opacity-40"></div>
      <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] rounded-full bg-purple-700/10 filter blur-[100px] z-0 opacity-30"></div>
      
      {/* Clean horizontal dividers */}
      <div className="absolute top-[10%] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-0"></div>
      <div className="absolute bottom-[10%] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-0"></div>
      
      {/* Minimal corner decorations */}
      <div className="absolute top-10 right-10 w-40 h-40 border-t border-r border-blue-500/20 rounded-tr-3xl z-0"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 border-b border-l border-blue-500/20 rounded-bl-3xl z-0"></div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-16 md:pb-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile Card with elegant styling */}
            <div className="relative group">
              {/* Simple corner accents */}
              <div className="absolute -left-2 top-2 w-10 h-10 border-l border-t border-cyan-500/30 rounded-tl-lg"></div>
              <div className="absolute -right-2 bottom-2 w-10 h-10 border-r border-b border-cyan-500/30 rounded-br-lg"></div>
              
              {/* Card with clean, elegant styling */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {/* Subtle gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <UserProfileCard />
              </div>
            </div>
            
            {/* Courses Section with elegant styling */}
            <div className="relative group">
              {/* Simple corner accents */}
              <div className="absolute -left-2 top-2 w-10 h-10 border-l border-t border-blue-500/30 rounded-tl-lg"></div>
              <div className="absolute -right-2 bottom-2 w-10 h-10 border-r border-b border-blue-500/30 rounded-br-lg"></div>
              
              {/* Card with clean, elegant styling */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-sm border border-blue-500/20 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {/* Subtle gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Simple top accent line */}
                <div className="absolute top-0 h-0.5 left-0 right-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                
                <CoursesSection />
              </div>
            </div>
            
            {/* Battle Zone Section with elegant styling */}
            <div className="relative group">
              {/* Simple corner accents */}
              <div className="absolute -left-2 top-2 w-10 h-10 border-l border-t border-purple-500/30 rounded-tl-lg"></div>
              <div className="absolute -right-2 bottom-2 w-10 h-10 border-r border-b border-purple-500/30 rounded-br-lg"></div>
              
              {/* Card with clean, elegant styling */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-sm border border-purple-500/20 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {/* Subtle gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Simple top accent line */}
                <div className="absolute top-0 h-0.5 left-0 right-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                
                <BattleZoneSection />
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* Wellness Breaks Section with elegant styling */}
            <div className="relative group">
              {/* Simple corner accents */}
              <div className="absolute -left-2 top-2 w-10 h-10 border-l border-t border-cyan-500/30 rounded-tl-lg"></div>
              <div className="absolute -right-2 bottom-2 w-10 h-10 border-r border-b border-cyan-500/30 rounded-br-lg"></div>
              
              {/* Card with clean, elegant styling */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {/* Subtle gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Simple top accent line */}
                <div className="absolute top-0 h-0.5 left-0 right-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                
                <BreaksRecommender />
              </div>
            </div>
            
            {/* Streak Section with elegant styling */}
            <div className="relative group">
              {/* Simple corner accents */}
              <div className="absolute -left-2 top-2 w-10 h-10 border-l border-t border-amber-500/30 rounded-tl-lg"></div>
              <div className="absolute -right-2 bottom-2 w-10 h-10 border-r border-b border-amber-500/30 rounded-br-lg"></div>
              
              {/* Card with clean, elegant styling */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-sm border border-amber-500/20 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {/* Subtle gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Simple top accent line */}
                <div className="absolute top-0 h-0.5 left-0 right-0 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
                
                <StreakSection />
              </div>
            </div>
            
            {/* Rank Section with elegant styling */}
            <div className="relative group">
              {/* Simple corner accents */}
              <div className="absolute -left-2 top-2 w-10 h-10 border-l border-t border-emerald-500/30 rounded-tl-lg"></div>
              <div className="absolute -right-2 bottom-2 w-10 h-10 border-r border-b border-emerald-500/30 rounded-br-lg"></div>
              
              {/* Card with clean, elegant styling */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-sm border border-emerald-500/20 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {/* Subtle gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Simple top accent line */}
                <div className="absolute top-0 h-0.5 left-0 right-0 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
                
                <RankSection />
              </div>
            </div>
            
            {/* Referral Section with elegant styling */}
            <div className="relative group">
              {/* Simple corner accents */}
              <div className="absolute -left-2 top-2 w-10 h-10 border-l border-t border-rose-500/30 rounded-tl-lg"></div>
              <div className="absolute -right-2 bottom-2 w-10 h-10 border-r border-b border-rose-500/30 rounded-br-lg"></div>
              
              {/* Card with clean, elegant styling */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-sm border border-rose-500/20 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {/* Subtle gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Simple top accent line */}
                <div className="absolute top-0 h-0.5 left-0 right-0 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent"></div>
                
                <ReferralSection />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
