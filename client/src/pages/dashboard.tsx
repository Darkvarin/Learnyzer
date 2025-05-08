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
    <div className="min-h-screen flex flex-col futuristic-bg relative">
      {/* Solo Leveling + Cyberpunk style background elements */}
      <div className="absolute inset-0 cyber-grid z-0 opacity-30"></div>
      
      {/* Solo Leveling corner decorations */}
      <div className="absolute top-24 right-4 w-32 h-32 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg z-0"></div>
      <div className="absolute bottom-4 left-4 w-32 h-32 border-b-2 border-l-2 border-primary/30 rounded-bl-lg z-0"></div>
      
      {/* Animated glowing orbs with Solo Leveling colors */}
      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-cyan-500/10 filter blur-[80px] animate-pulse-glow z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-primary/10 filter blur-[100px] animate-pulse-glow z-0" style={{animationDelay: '1s'}}></div>
      
      {/* Scanning line effect */}
      <div className="fixed inset-0 h-screen pointer-events-none z-[5]">
        <div className="absolute top-0 left-0 right-0 h-px cyber-scan-line"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px cyber-scan-line"></div>
      </div>
      
      {/* Solo Leveling hexagonal patterns */}
      <div className="absolute top-36 left-10 opacity-20 z-0">
        <div className="hex-pattern"></div>
      </div>
      <div className="absolute bottom-36 right-10 opacity-20 z-0">
        <div className="hex-pattern"></div>
      </div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-28 pb-20 md:pb-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              {/* Solo Leveling accent bar */}
              <div className="absolute -left-4 top-10 w-1 h-20 bg-gradient-to-b from-cyan-500/70 via-primary/50 to-cyan-500/20"></div>
              {/* Corner decoration */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 z-10"></div>
              <UserProfileCard />
            </div>
            <div className="relative">
              {/* Solo Leveling accent bar */}
              <div className="absolute -left-4 top-10 w-1 h-20 bg-gradient-to-b from-primary/70 via-cyan-500/50 to-primary/20"></div>
              {/* Corner decoration */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary/40 z-10"></div>
              <CoursesSection />
            </div>
            <div className="relative">
              {/* Solo Leveling accent bar */}
              <div className="absolute -left-4 top-10 w-1 h-20 bg-gradient-to-b from-fuchsia-500/70 via-primary/50 to-fuchsia-500/20"></div>
              {/* Corner decoration */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-fuchsia-500/40 z-10"></div>
              <BattleZoneSection />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div className="relative">
              {/* Solo Leveling accent bar */}
              <div className="absolute -left-4 top-10 w-1 h-20 bg-gradient-to-b from-amber-500/70 via-primary/50 to-amber-500/20"></div>
              {/* Corner decoration */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/40 z-10"></div>
              <StreakSection />
            </div>
            <div className="relative">
              {/* Solo Leveling accent bar */}
              <div className="absolute -left-4 top-10 w-1 h-20 bg-gradient-to-b from-emerald-500/70 via-primary/50 to-emerald-500/20"></div>
              {/* Corner decoration */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-emerald-500/40 z-10"></div>
              <RankSection />
            </div>
            <div className="relative">
              {/* Solo Leveling accent bar */}
              <div className="absolute -left-4 top-10 w-1 h-20 bg-gradient-to-b from-rose-500/70 via-primary/50 to-rose-500/20"></div>
              {/* Corner decoration */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-rose-500/40 z-10"></div>
              <ReferralSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
