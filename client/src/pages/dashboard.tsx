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
    <div className="min-h-screen flex flex-col solo-bg relative overflow-hidden">
      {/* Solo Leveling intense background elements */}
      <div className="absolute inset-0 solo-grid z-0 opacity-40"></div>
      
      {/* Spirit/Energy Flow Lines - Animated paths representing the flow of power */}
      <div className="absolute h-full w-full overflow-hidden z-0">
        <div className="energy-flow-horizontal top-1/4"></div>
        <div className="energy-flow-horizontal bottom-1/4"></div>
        <div className="energy-flow-vertical left-1/4"></div>
        <div className="energy-flow-vertical right-1/4"></div>
      </div>
      
      {/* Solo Leveling shadow monarch corner elements */}
      <div className="absolute top-20 right-4 w-40 h-40 solo-corner-tr z-0"></div>
      <div className="absolute bottom-4 left-4 w-40 h-40 solo-corner-bl z-0"></div>
      
      {/* Power aura elements */}
      <div className="absolute top-1/4 left-1/5 w-80 h-80 rounded-full bg-cyan-500/15 filter blur-[60px] animate-power-pulse z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-primary/15 filter blur-[80px] animate-power-pulse z-0" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] rounded-full radial-pulse opacity-10 z-0"></div>
      
      {/* Solo Leveling scanning effect */}
      <div className="fixed inset-0 h-screen pointer-events-none z-[5]">
        <div className="absolute top-0 left-0 right-0 h-[2px] solo-scan-line"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] solo-scan-line-reverse"></div>
      </div>
      
      {/* Solo Leveling monarch symbol patterns */}
      <div className="absolute top-36 left-10 z-0">
        <div className="hex-grid">
          <div className="hex-cell"></div>
          <div className="hex-cell"></div>
          <div className="hex-cell"></div>
        </div>
      </div>
      <div className="absolute bottom-36 right-10 z-0">
        <div className="hex-grid">
          <div className="hex-cell"></div>
          <div className="hex-cell"></div>
          <div className="hex-cell"></div>
        </div>
      </div>
      
      {/* Shadow monarch particles */}
      <div className="absolute inset-0 shadow-particles z-0"></div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-28 pb-20 md:pb-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile Card with Shadow Monarch Style */}
            <div className="relative group">
              {/* Shadow monarch energy bar */}
              <div className="absolute -left-4 top-10 w-2 h-32 monarch-energy-bar"></div>
              
              {/* Solo Leveling runic corner decorations */}
              <div className="absolute -top-3 -left-3 w-12 h-12 solo-rune-corner-tl"></div>
              <div className="absolute -top-3 -right-3 w-12 h-12 solo-rune-corner-tr"></div>
              <div className="absolute -bottom-3 -left-3 w-12 h-12 solo-rune-corner-bl"></div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 solo-rune-corner-br"></div>
              
              {/* Power glow effect on hover */}
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors duration-500 rounded-xl"></div>
              
              {/* Section content with glow outline */}
              <div className="relative z-10 monarch-card-glow">
                <UserProfileCard />
              </div>
            </div>
            
            {/* Courses Section with Runic Style */}
            <div className="relative group monarch-section">
              {/* Shadow monarch energy bar */}
              <div className="absolute -left-4 top-10 w-2 h-32 monarch-energy-bar-blue"></div>
              
              {/* Monarch insignia */}
              <div className="absolute -top-2 right-4 w-8 h-8 monarch-insignia opacity-60"></div>
              
              {/* Power pulses on hover */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 rounded-full bg-primary/0 group-hover:bg-primary/20 transition-all duration-700 blur-xl group-hover:w-full group-hover:h-full"></div>
              
              <div className="relative z-10 monarch-card-glow-blue">
                <CoursesSection />
              </div>
            </div>
            
            {/* Battle Zone Section with Intense Style */}
            <div className="relative group monarch-section">
              {/* Shadow monarch energy bar - battle color */}
              <div className="absolute -left-4 top-10 w-2 h-32 monarch-energy-bar-purple"></div>
              
              {/* Battle runes */}
              <div className="absolute -top-2 -right-2 w-24 h-24 battle-runes opacity-40"></div>
              
              {/* Animated battle energy */}
              <div className="absolute inset-0 battle-aura opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
              
              <div className="relative z-10 monarch-card-glow-purple">
                <BattleZoneSection />
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* Streak Section with Monarch Style */}
            <div className="relative group monarch-section">
              {/* Shadow monarch energy bar */}
              <div className="absolute -left-4 top-10 w-2 h-24 monarch-energy-bar-amber"></div>
              
              {/* Solo Leveling streak rune */}
              <div className="absolute -top-3 -right-3 w-10 h-10 streak-rune"></div>
              
              {/* Streak aura */}
              <div className="absolute inset-0 streak-aura opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="relative z-10 monarch-card-glow-amber">
                <StreakSection />
              </div>
            </div>
            
            {/* Rank Section with Power Level Style */}
            <div className="relative group monarch-section">
              {/* Shadow monarch energy bar - rank color */}
              <div className="absolute -left-4 top-10 w-2 h-24 monarch-energy-bar-emerald"></div>
              
              {/* Rank level indicator */}
              <div className="absolute top-0 right-0 w-12 h-12 rank-insignia"></div>
              
              {/* Power level aura */}
              <div className="absolute inset-0 rank-aura opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="relative z-10 monarch-card-glow-emerald"> 
                <RankSection />
              </div>
            </div>
            
            {/* Referral Section with Summoning Style */}
            <div className="relative group monarch-section">
              {/* Shadow monarch energy bar - referral color */}
              <div className="absolute -left-4 top-10 w-2 h-24 monarch-energy-bar-rose"></div>
              
              {/* Summoning runes */}
              <div className="absolute -bottom-3 -right-3 w-10 h-10 summon-rune"></div>
              
              {/* Summon aura */}
              <div className="absolute inset-0 summon-aura opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="relative z-10 monarch-card-glow-rose">
                <ReferralSection />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
