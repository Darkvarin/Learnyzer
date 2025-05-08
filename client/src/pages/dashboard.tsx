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
    <div className="min-h-screen flex flex-col futuristic-bg relative overflow-hidden">
      {/* Modern cyberpunk grid background with Solo Leveling accents */}
      <div className="absolute inset-0 cyber-grid z-0 opacity-20"></div>
      
      {/* Minimal energy flow lines - more subtle Solo Leveling accents */}
      <div className="absolute h-full w-full overflow-hidden z-0">
        <div className="energy-flow-horizontal top-1/3 opacity-30"></div>
        <div className="energy-flow-vertical right-1/3 opacity-30"></div>
      </div>
      
      {/* Cyberpunk corner elements - maintained from home page */}
      <div className="absolute top-20 right-20 w-40 h-40 border-t-2 border-r-2 border-cyan-500/20 z-0"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 border-b-2 border-l-2 border-primary/20 z-0"></div>
      
      {/* Subtle power aura elements - reduced intensity */}
      <div className="absolute top-1/4 left-1/5 w-80 h-80 rounded-full bg-cyan-500/10 filter blur-[60px] z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-primary/10 filter blur-[80px] z-0"></div>
      
      {/* Circuit lines from home page - tech aesthetic */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.07] z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,0 L30,10 L70,10 L100,0" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="0.2" fill="none" />
        <path d="M0,30 L40,40 L60,40 L100,30" stroke="rgba(125, 39, 255, 0.3)" strokeWidth="0.2" fill="none" />
        <path d="M0,60 L30,70 L70,70 L100,60" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.2" fill="none" />
        <path d="M0,90 L25,100 L75,100 L100,90" stroke="rgba(125, 39, 255, 0.3)" strokeWidth="0.2" fill="none" />
        <path d="M25,0 L25,100" stroke="rgba(125, 39, 255, 0.2)" strokeWidth="0.1" fill="none" />
        <path d="M50,0 L50,100" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.1" fill="none" />
        <path d="M75,0 L75,100" stroke="rgba(125, 39, 255, 0.2)" strokeWidth="0.1" fill="none" />
      </svg>
      
      {/* Solo Leveling subtle hex patterns - reduced but maintained for theme */}
      <div className="absolute top-40 left-10 z-0 opacity-40">
        <div className="hex-grid">
          <div className="hex-cell"></div>
          <div className="hex-cell"></div>
        </div>
      </div>
      <div className="absolute bottom-40 right-10 z-0 opacity-40">
        <div className="hex-grid">
          <div className="hex-cell"></div>
          <div className="hex-cell"></div>
        </div>
      </div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-28 pb-20 md:pb-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile Card with Cyberpunk + Solo Leveling accent */}
            <div className="relative group transition-transform duration-300 hover:-translate-y-1">
              {/* Subtle Solo Leveling energy accent */}
              <div className="absolute -left-1 top-10 w-1 h-32 bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent"></div>
              
              {/* Corner decorations from home page style */}
              <div className="absolute top-0 right-0 w-16 h-16 solo-corner-tr opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 solo-corner-bl opacity-60"></div>
              
              {/* Glassmorphism card with improved black background */}
              <div className="relative z-10 glassmorphism border border-cyan-500/20 overflow-hidden">
                {/* Subtle scan line animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                  <div className="absolute top-0 left-0 right-0 h-[1px] solo-scan-line"></div>
                </div>
                <UserProfileCard />
              </div>
            </div>
            
            {/* Courses Section with Cyberpunk + Solo Leveling accent */}
            <div className="relative group transition-transform duration-300 hover:-translate-y-1">
              {/* Subtle Solo Leveling energy accent */}
              <div className="absolute -left-1 top-10 w-1 h-32 bg-gradient-to-b from-transparent via-blue-500/40 to-transparent"></div>
              
              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-blue-500/20 rounded-tr-md"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-blue-500/20 rounded-bl-md"></div>
              
              {/* Glassmorphism card with improved black background */}
              <div className="relative z-10 glassmorphism border border-blue-500/20 overflow-hidden">
                {/* Subtle blue energy glow */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-blue-500/10 filter blur-xl"></div>
                
                <CoursesSection />
              </div>
            </div>
            
            {/* Battle Zone Section - More intense purple with subtle Solo Leveling accent */}
            <div className="relative group transition-transform duration-300 hover:-translate-y-1">
              {/* Subtle Solo Leveling energy accent */}
              <div className="absolute -left-1 top-10 w-1 h-32 bg-gradient-to-b from-transparent via-purple-500/40 to-transparent"></div>
              
              {/* Cyberpunk corner decoration - slightly more intense for battle theme */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-purple-500/30 rounded-tr-md"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-purple-500/30 rounded-bl-md"></div>
              
              {/* Special solo leveling hex element for battle - subtle but present */}
              <div className="absolute -right-3 top-1/4 opacity-30">
                <div className="hex-cell border-purple-500/40"></div>
              </div>
              
              {/* Glassmorphism card with improved black background */}
              <div className="relative z-10 glassmorphism border border-purple-500/30 overflow-hidden">
                {/* Battle energy pulse */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-purple-500/10 filter blur-2xl animate-pulse-slow"></div>
                
                <BattleZoneSection />
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* Streak Section with Cyberpunk + Solo Leveling accent */}
            <div className="relative group transition-transform duration-300 hover:-translate-y-1">
              {/* Subtle Solo Leveling energy accent */}
              <div className="absolute -left-1 top-10 w-1 h-24 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent"></div>
              
              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-500/20 rounded-tr-md"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-500/20 rounded-bl-md"></div>
              
              {/* Special Solo Leveling element for streak - subtle but recognizable */}
              <div className="absolute top-3 right-3 w-6 h-6 opacity-50">
                <div className="relative w-full h-full border border-amber-500/30 rotate-45"></div>
              </div>
              
              {/* Glassmorphism card with improved black background */}
              <div className="relative z-10 glassmorphism border border-amber-500/20 overflow-hidden">
                {/* Streak flame effect - subtle amber pulse */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-amber-500/10 filter blur-xl animate-pulse-slow"></div>
                
                <StreakSection />
              </div>
            </div>
            
            {/* Rank Section with Cyberpunk + Solo Leveling accent */}
            <div className="relative group transition-transform duration-300 hover:-translate-y-1">
              {/* Subtle Solo Leveling energy accent */}
              <div className="absolute -left-1 top-10 w-1 h-24 bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent"></div>
              
              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-emerald-500/20 rounded-tr-md"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-emerald-500/20 rounded-bl-md"></div>
              
              {/* Solo Leveling specific element - kept for rank to show importance */}
              <div className="absolute top-2 right-2 w-8 h-8 rank-insignia opacity-60"></div>
              
              {/* Glassmorphism card with improved black background */}
              <div className="relative z-10 glassmorphism border border-emerald-500/20 overflow-hidden">
                {/* Rank level glow effect */}
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-emerald-500/10 filter blur-xl"></div>
                <div className="absolute right-1/4 bottom-0 w-24 h-24 rounded-full bg-emerald-500/5 filter blur-xl"></div>
                
                <RankSection />
              </div>
            </div>
            
            {/* Referral Section with Cyberpunk + Solo Leveling accent */}
            <div className="relative group transition-transform duration-300 hover:-translate-y-1">
              {/* Subtle Solo Leveling energy accent */}
              <div className="absolute -left-1 top-10 w-1 h-24 bg-gradient-to-b from-transparent via-rose-500/40 to-transparent"></div>
              
              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-rose-500/20 rounded-tr-md"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-rose-500/20 rounded-bl-md"></div>
              
              {/* Subtle Solo Leveling referral symbol */}
              <div className="absolute bottom-2 right-2 w-6 h-6 opacity-50">
                <div className="w-full h-full border border-rose-500/30 rounded-full flex items-center justify-center">
                  <div className="w-2/3 h-2/3 border-t border-rose-500/40 rotate-45"></div>
                </div>
              </div>
              
              {/* Glassmorphism card with improved black background */}
              <div className="relative z-10 glassmorphism border border-rose-500/20 overflow-hidden">
                {/* Referral connections effect */}
                <div className="absolute left-1/4 bottom-0 w-16 h-16 rounded-full bg-rose-500/10 filter blur-xl"></div>
                <div className="absolute right-1/3 top-0 w-12 h-12 rounded-full bg-rose-500/5 filter blur-lg"></div>
                
                <ReferralSection />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
