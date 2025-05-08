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
      {/* Cyberpunk-style background elements */}
      <div className="absolute inset-0 cyber-grid z-0 opacity-60"></div>
      
      {/* Animated glowing orbs */}
      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-purple-500/10 filter blur-[80px] animate-pulse-glow z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-blue-500/10 filter blur-[100px] animate-pulse-glow z-0" style={{animationDelay: '1s'}}></div>
      
      {/* Scanning line effect */}
      <div className="fixed inset-0 h-screen pointer-events-none z-[5]">
        <div className="absolute top-0 left-0 right-0 h-px cyber-scan-line"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px cyber-scan-line"></div>
      </div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-28 pb-20 md:pb-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <div className="absolute -left-4 top-10 w-1 h-20 bg-primary/30"></div>
              <UserProfileCard />
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-10 w-1 h-20 bg-primary/30"></div>
              <CoursesSection />
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-10 w-1 h-20 bg-primary/30"></div>
              <BattleZoneSection />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute -left-4 top-10 w-1 h-20 bg-primary/30"></div>
              <StreakSection />
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-10 w-1 h-20 bg-primary/30"></div>
              <RankSection />
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-10 w-1 h-20 bg-primary/30"></div>
              <ReferralSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
