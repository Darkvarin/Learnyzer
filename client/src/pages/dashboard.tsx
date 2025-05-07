import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";
import { CoursesSection } from "@/components/dashboard/courses-section";
import { BattleZoneSection } from "@/components/dashboard/battle-zone-section";
import { StreakSection } from "@/components/dashboard/streak-section";
import { RankSection } from "@/components/dashboard/rank-section";
import { ReferralSection } from "@/components/dashboard/referral-section";
import { AiToolsSection } from "@/components/dashboard/ai-tools-section";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <UserProfileCard />
            <CoursesSection />
            <BattleZoneSection />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <StreakSection />
            <RankSection />
            <ReferralSection />
            <AiToolsSection />
          </div>
        </div>
      </main>
    </div>
  );
}
