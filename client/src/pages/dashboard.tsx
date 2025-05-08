import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";
import { CoursesSection } from "@/components/dashboard/courses-section";
import { BattleZoneSection } from "@/components/dashboard/battle-zone-section";
import { StreakSection } from "@/components/dashboard/streak-section";
import { RankSection } from "@/components/dashboard/rank-section";
import { ReferralSection } from "@/components/dashboard/referral-section";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col futuristic-bg relative overflow-hidden solo-page">
      {/* Cyberpunk-style background elements from home page */}
      <div className="absolute inset-0 cyber-grid z-0"></div>
      
      {/* Animated glowing orbs from home page - increased size and opacity to improve visibility */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full bg-purple-500/30 filter blur-[80px] animate-pulse-glow z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-[32rem] h-[32rem] rounded-full bg-blue-500/30 filter blur-[100px] animate-pulse-glow z-0" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-2/3 left-1/3 w-80 h-80 rounded-full bg-purple-800/30 filter blur-[70px] animate-pulse-glow z-0" style={{animationDelay: '2s'}}></div>
      
      {/* Scanning line effect from home page */}
      <div className="fixed inset-0 h-screen pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] cyber-scan-line"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] cyber-scan-line"></div>
      </div>
      
      {/* Solo Leveling background elements from home page */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Solo Leveling runic circles */}
        <div className="absolute -right-20 top-1/4 w-64 h-64 rounded-full" style={{
          border: "1px solid rgba(6, 182, 212, 0.3)",
          boxShadow: "0 0 15px rgba(6, 182, 212, 0.1)"
        }}></div>
        <div className="absolute -right-40 top-1/4 w-96 h-96 rounded-full" style={{
          border: "1px solid rgba(125, 39, 255, 0.2)",
          boxShadow: "0 0 20px rgba(125, 39, 255, 0.05)"
        }}></div>
        <div className="absolute -left-20 bottom-1/4 w-80 h-80 rounded-full" style={{
          border: "1px solid rgba(6, 182, 212, 0.2)",
          boxShadow: "0 0 15px rgba(6, 182, 212, 0.05)"
        }}></div>
        
        {/* Solo Leveling monarch energy lines */}
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
        <div className="absolute top-0 left-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
        
        {/* Tech circuit lines - with Solo Leveling blue energy appearance */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 L30,10 L70,10 L100,0" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="0.2" fill="none" />
          <path d="M0,20 L40,30 L60,30 L100,20" stroke="rgba(125, 39, 255, 0.3)" strokeWidth="0.2" fill="none" />
          <path d="M0,40 L35,50 L65,50 L100,40" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.2" fill="none" />
          <path d="M0,60 L30,70 L70,70 L100,60" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.2" fill="none" />
          <path d="M0,80 L25,90 L75,90 L100,80" stroke="rgba(125, 39, 255, 0.3)" strokeWidth="0.2" fill="none" />
          <path d="M20,0 L20,100" stroke="rgba(125, 39, 255, 0.2)" strokeWidth="0.1" fill="none" />
          <path d="M40,0 L40,100" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.1" fill="none" />
          <path d="M60,0 L60,100" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.1" fill="none" />
          <path d="M80,0 L80,100" stroke="rgba(125, 39, 255, 0.2)" strokeWidth="0.1" fill="none" />
        </svg>
        
        {/* Solo Leveling rune patterns - match home page opacity exactly */}
        <div className="absolute inset-0 solo-grid opacity-[0.1]"></div>
        
        {/* Solo Leveling corner decorations */}
        <div className="absolute top-20 right-20 w-40 h-40 border-t-2 border-r-2 border-cyan-500/20"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 border-b-2 border-l-2 border-primary/20"></div>
      </div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-16 md:pb-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile Card with home page styling */}
            <div className="relative group">
              {/* Home page inspired corner decorations */}
              <div className="absolute -left-4 top-4 w-10 h-10 border-l border-t border-cyan-500/40"></div>
              <div className="absolute -right-4 bottom-4 w-10 h-10 border-r border-b border-primary/40"></div>
              
              {/* Glassmorphism card from home page */}
              <div className="relative z-10 glassmorphism overflow-hidden border border-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
                {/* Subtle energy glow effect */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-cyan-500/10 filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <UserProfileCard />
              </div>
            </div>
            
            {/* Courses Section with home page styling */}
            <div className="relative group">
              {/* Home page inspired corner decorations */}
              <div className="absolute -left-4 top-4 w-10 h-10 border-l border-t border-blue-500/40"></div>
              <div className="absolute -right-4 bottom-4 w-10 h-10 border-r border-b border-primary/40"></div>
              
              {/* Home page style accent line */}
              <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
              
              {/* Glassmorphism card from home page */}
              <div className="relative z-10 glassmorphism overflow-hidden border border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                {/* Energy glow effect */}
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-500/5 filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <CoursesSection />
              </div>
            </div>
            
            {/* Battle Zone Section with home page styling */}
            <div className="relative group">
              {/* Home page inspired corner decorations */}
              <div className="absolute -left-4 top-4 w-10 h-10 border-l border-t border-purple-500/40"></div>
              <div className="absolute -right-4 bottom-4 w-10 h-10 border-r border-b border-primary/40"></div>
              
              {/* Home page style accent lines */}
              <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
              <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
              
              {/* Home page style decorative elements */}
              <div className="absolute -right-2 -top-2 w-20 h-20 border-r border-t border-purple-500/10 rounded-tr-3xl"></div>
              
              {/* Glassmorphism card from home page */}
              <div className="relative z-10 glassmorphism overflow-hidden border border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
                {/* Battle energy pulse - kept but styled like home page */}
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-500/10 filter blur-3xl opacity-0 group-hover:opacity-80 transition-opacity"></div>
                
                <BattleZoneSection />
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* Streak Section with home page styling */}
            <div className="relative group">
              {/* Home page inspired corner decorations */}
              <div className="absolute -left-3 top-3 w-8 h-8 border-l border-t border-amber-500/40"></div>
              <div className="absolute -right-3 bottom-3 w-8 h-8 border-r border-b border-primary/40"></div>
              
              {/* Home page style accent line */}
              <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
              
              {/* Glassmorphism card from home page */}
              <div className="relative z-10 glassmorphism overflow-hidden border border-amber-500/30 transition-all duration-300 hover:-translate-y-1">
                {/* Energy glow effect */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-amber-500/10 filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <StreakSection />
              </div>
            </div>
            
            {/* Rank Section with home page styling */}
            <div className="relative group">
              {/* Home page inspired corner decorations */}
              <div className="absolute -left-3 top-3 w-8 h-8 border-l border-t border-emerald-500/40"></div>
              <div className="absolute -right-3 bottom-3 w-8 h-8 border-r border-b border-primary/40"></div>
              
              {/* Home page style accent lines */}
              <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
              <div className="absolute -left-1 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent"></div>
              
              {/* Glassmorphism card from home page */}
              <div className="relative z-10 glassmorphism overflow-hidden border border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
                {/* Energy glow effect */}
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-emerald-500/5 filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute right-1/4 bottom-0 w-24 h-24 rounded-full bg-emerald-500/5 filter blur-xl opacity-0 group-hover:opacity-70 transition-opacity"></div>
                
                <RankSection />
              </div>
            </div>
            
            {/* Referral Section with home page styling */}
            <div className="relative group">
              {/* Home page inspired corner decorations */}
              <div className="absolute -left-3 top-3 w-8 h-8 border-l border-t border-rose-500/40"></div>
              <div className="absolute -right-3 bottom-3 w-8 h-8 border-r border-b border-primary/40"></div>
              
              {/* Home page style accent lines */}
              <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent"></div>
              <div className="absolute -right-1 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-rose-500/20 to-transparent"></div>
              
              {/* Glassmorphism card from home page */}
              <div className="relative z-10 glassmorphism overflow-hidden border border-rose-500/30 transition-all duration-300 hover:-translate-y-1">
                {/* Energy glow effect */}
                <div className="absolute left-1/3 top-0 w-32 h-32 rounded-full bg-rose-500/5 filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute right-1/3 bottom-0 w-24 h-24 rounded-full bg-rose-500/5 filter blur-xl opacity-0 group-hover:opacity-70 transition-opacity"></div>
                
                <ReferralSection />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
