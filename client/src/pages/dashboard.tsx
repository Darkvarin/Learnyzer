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
      {/* Cyberpunk digital grid background - enhanced with stronger lines and higher contrast */}
      <div className="absolute inset-0 bg-[#050508] cyber-grid-enhanced z-0"></div>
      
      {/* Stronger glow effects for better depth and immersion */}
      <div className="absolute top-0 left-1/4 w-[45rem] h-[45rem] rounded-full bg-blue-600/20 filter blur-[120px] animate-slow-pulse z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] rounded-full bg-purple-700/20 filter blur-[100px] animate-slow-pulse z-0" style={{animationDelay: '3s'}}></div>
      <div className="absolute bottom-1/3 left-1/3 w-[30rem] h-[30rem] rounded-full bg-cyan-700/15 filter blur-[80px] animate-slow-pulse z-0" style={{animationDelay: '6s'}}></div>
      
      {/* Enhanced scanning lines and digital effects */}
      <div className="fixed inset-0 h-screen pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-[3px] cyber-scan-line-enhanced"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] cyber-scan-line-enhanced"></div>
        
        {/* Horizontal data lines with pulse animation */}
        <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent animate-pulse-width"></div>
        <div className="absolute top-2/4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent animate-pulse-width" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/70 to-transparent animate-pulse-width" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Advanced cyberpunk circuit patterns and energy flows */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Glowing circuit nodes */}
        <div className="absolute right-[5%] top-[15%] w-3 h-3 rounded-full bg-cyan-500/80 animate-glow-pulse shadow-lg shadow-cyan-500/50"></div>
        <div className="absolute right-[25%] top-[35%] w-2 h-2 rounded-full bg-purple-500/80 animate-glow-pulse shadow-lg shadow-purple-500/50" style={{animationDelay: '2s'}}></div>
        <div className="absolute left-[15%] bottom-[25%] w-4 h-4 rounded-full bg-blue-500/80 animate-glow-pulse shadow-lg shadow-blue-500/50" style={{animationDelay: '4s'}}></div>
        
        {/* Hexagonal grid sections - more digital and tech-focused */}
        <div className="absolute right-0 top-0 w-[30vw] h-[40vh] bg-grid-hex opacity-20"></div>
        <div className="absolute left-0 bottom-0 w-[25vw] h-[35vh] bg-grid-hex opacity-20"></div>
        
        {/* Digital circuit lines with stronger glow effects */}
        <div className="absolute right-[10%] top-[15%] w-[1px] h-[70%] bg-gradient-to-b from-cyan-500/0 via-cyan-500/70 to-cyan-500/0 shadow-glow-cyan"></div>
        <div className="absolute left-[20%] top-[10%] w-[1px] h-[80%] bg-gradient-to-b from-purple-500/0 via-purple-500/70 to-purple-500/0 shadow-glow-purple"></div>
        
        {/* Advanced tech circuit grid - more prominent and futuristic */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 L30,10 L70,10 L100,0" stroke="rgba(14, 165, 233, 0.7)" strokeWidth="0.2" fill="none" className="animate-circuit-line" />
          <path d="M0,20 L40,30 L60,30 L100,20" stroke="rgba(139, 92, 246, 0.7)" strokeWidth="0.2" fill="none" className="animate-circuit-line" style={{animationDelay: '1s'}} />
          <path d="M0,40 L35,50 L65,50 L100,40" stroke="rgba(14, 165, 233, 0.7)" strokeWidth="0.2" fill="none" className="animate-circuit-line" style={{animationDelay: '2s'}} />
          <path d="M0,60 L30,70 L70,70 L100,60" stroke="rgba(14, 165, 233, 0.7)" strokeWidth="0.2" fill="none" className="animate-circuit-line" style={{animationDelay: '3s'}} />
          <path d="M0,80 L25,90 L75,90 L100,80" stroke="rgba(139, 92, 246, 0.7)" strokeWidth="0.2" fill="none" className="animate-circuit-line" style={{animationDelay: '4s'}} />
          <path d="M20,0 L20,100" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="0.1" fill="none" />
          <path d="M40,0 L40,100" stroke="rgba(14, 165, 233, 0.5)" strokeWidth="0.1" fill="none" />
          <path d="M60,0 L60,100" stroke="rgba(14, 165, 233, 0.5)" strokeWidth="0.1" fill="none" />
          <path d="M80,0 L80,100" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="0.1" fill="none" />
        </svg>
        
        {/* Digital data patterns - more tech and less mystical */}
        <div className="absolute inset-0 cyber-data-pattern opacity-[0.15]"></div>
        
        {/* Enhanced corner decorations with better visibility */}
        <div className="absolute top-10 right-10 w-60 h-60 border-t-[3px] border-r-[3px] border-cyan-500/40 rounded-tr-3xl"></div>
        <div className="absolute bottom-10 left-10 w-60 h-60 border-b-[3px] border-l-[3px] border-blue-500/40 rounded-bl-3xl"></div>
      </div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-16 md:pb-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile Card with enhanced cyberpunk styling */}
            <div className="relative group">
              {/* Enhanced circuit-like corner decorations */}
              <div className="absolute -left-5 top-5 w-16 h-16 border-l-2 border-t-2 border-cyan-500/50 rounded-tl-xl"></div>
              <div className="absolute -right-5 bottom-5 w-16 h-16 border-r-2 border-b-2 border-blue-500/50 rounded-br-xl"></div>
              
              {/* Diagonal scan line */}
              <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-2000 ease-in-out"></div>
              </div>
              
              {/* Enhanced card with deeper glassmorphism and stronger glow effects */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-xl border-2 border-cyan-500/40 shadow-[0_0_15px_rgba(14,165,233,0.3)] rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]">
                {/* Enhanced energy glow effect */}
                <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-cyan-500/20 filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <UserProfileCard />
              </div>
            </div>
            
            {/* Courses Section with enhanced cyberpunk styling */}
            <div className="relative group">
              {/* Enhanced circuit-like corner decorations */}
              <div className="absolute -left-5 top-5 w-16 h-16 border-l-2 border-t-2 border-blue-500/50 rounded-tl-xl"></div>
              <div className="absolute -right-5 bottom-5 w-16 h-16 border-r-2 border-b-2 border-blue-600/50 rounded-br-xl"></div>
              
              {/* Tech circuit pattern on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
                  style={{background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='none' stroke='rgba(37, 99, 235, 0.1)' d='M5,5 L95,5 L95,95 L5,95 Z M20,20 H80 V80 H20 Z'/%3E%3C/svg%3E\")"}}></div>
              
              {/* Enhanced card with deeper glassmorphism and stronger glow effects */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-xl border-2 border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.3)] rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                {/* Data flow lines */}
                <div className="absolute top-0 h-1 left-0 right-0 bg-gradient-to-r from-blue-500/0 via-blue-500/80 to-blue-500/0 animate-pulse-width" style={{animationDuration: '5s'}}></div>
                <div className="absolute left-0 w-1 top-0 bottom-0 bg-gradient-to-b from-blue-500/0 via-blue-500/80 to-blue-500/0 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{animationDuration: '7s'}}></div>
                
                {/* Enhanced energy pulse */}
                <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-blue-600/20 filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute right-1/4 bottom-1/4 w-24 h-24 rounded-full bg-blue-500/20 filter blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"></div>
                
                <CoursesSection />
              </div>
            </div>
            
            {/* Battle Zone Section with enhanced cyberpunk styling */}
            <div className="relative group">
              {/* Enhanced hexagonal corner decorations */}
              <div className="absolute -left-6 top-6 w-20 h-20" style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                border: "2px solid rgba(139, 92, 246, 0.5)",
                opacity: "0.4"
              }}></div>
              <div className="absolute -right-6 bottom-6 w-20 h-20" style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                border: "2px solid rgba(139, 92, 246, 0.5)",
                opacity: "0.4",
                transform: "rotate(45deg)"
              }}></div>
              
              {/* Dynamic battle energy field effect */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-800/60 via-purple-500/80 to-purple-800/60 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-800/60 via-purple-500/80 to-purple-800/60 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
              
              {/* Enhanced card with bolder styling for battle zone */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-xl border-2 border-purple-600/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]">
                {/* Pulse energy effects */}
                <div className="absolute -top-20 right-10 w-40 h-40 rounded-full bg-purple-600/20 filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-slow-pulse"></div>
                <div className="absolute -bottom-10 left-10 w-32 h-32 rounded-full bg-purple-500/30 filter blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-700 animate-slow-pulse" style={{animationDelay: '1.5s'}}></div>
                
                {/* Battle zone digital readout line */}
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-purple-900/50 via-fuchsia-500/70 to-purple-900/50 opacity-20 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Energy nodes */}
                <div className="absolute w-2 h-2 top-2 right-10 rounded-full bg-purple-500 opacity-40 group-hover:opacity-100 animate-glow-pulse transition-opacity duration-500"></div>
                <div className="absolute w-2 h-2 top-2 right-20 rounded-full bg-fuchsia-400 opacity-30 group-hover:opacity-80 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute w-2 h-2 top-2 right-30 rounded-full bg-purple-600 opacity-20 group-hover:opacity-60 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '1s'}}></div>
                
                <BattleZoneSection />
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* Wellness Breaks Section with enhanced cyberpunk styling */}
            <div className="relative group">
              {/* Enhanced tech-inspired circular corner decorations */}
              <div className="absolute -left-4 top-4 w-12 h-12 rounded-full border-2 border-cyan-500/30 opacity-40 group-hover:opacity-80 transition-opacity duration-700"></div>
              <div className="absolute -right-4 bottom-4 w-10 h-10 rounded-full border-2 border-cyan-400/20 opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
              
              {/* Breathing effect background - subtle pulse */}
              <div className="absolute inset-0 z-0 bg-cyan-900/5 rounded-xl animate-slow-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              {/* Enhanced card with deeper glassmorphism and stronger glow effects */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-xl border-2 border-cyan-400/40 shadow-[0_0_15px_rgba(8,145,178,0.2)] rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(8,145,178,0.4)]">
                {/* Wellness waves effect */}
                <div className="absolute -bottom-10 left-0 right-0 h-24 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-cyan-400/10 filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Breathing indicator nodes */}
                <div className="absolute w-1.5 h-1.5 top-3 right-3 rounded-full bg-cyan-400 opacity-50 group-hover:opacity-100 animate-glow-pulse transition-opacity duration-500"></div>
                <div className="absolute w-1.5 h-1.5 top-3 right-7 rounded-full bg-cyan-300 opacity-30 group-hover:opacity-80 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '0.7s'}}></div>
                <div className="absolute w-1.5 h-1.5 top-3 right-11 rounded-full bg-cyan-500 opacity-40 group-hover:opacity-90 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '1.4s'}}></div>
                
                <BreaksRecommender />
              </div>
            </div>
            
            {/* Streak Section with enhanced cyberpunk styling */}
            <div className="relative group">
              {/* Enhanced diamond corner decorations */}
              <div className="absolute -left-5 top-5 w-14 h-14" style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                border: "2px solid rgba(245, 158, 11, 0.4)",
                opacity: "0.3",
                transform: "rotate(0deg)"
              }}></div>
              <div className="absolute -right-5 bottom-5 w-12 h-12" style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                border: "2px solid rgba(245, 158, 11, 0.4)",
                opacity: "0.3",
                transform: "rotate(45deg)"
              }}></div>
              
              {/* Streak flame pattern */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-amber-500/5 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-amber-600/5 to-transparent"></div>
              </div>
              
              {/* Enhanced card with deeper glassmorphism and stronger glow effects */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-xl border-2 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                {/* Fire spark effects */}
                <div className="absolute top-1/3 -right-10 w-20 h-20 rounded-full bg-amber-500/20 filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -bottom-5 left-1/4 w-16 h-16 rounded-full bg-amber-600/20 filter blur-xl opacity-0 group-hover:opacity-80 transition-opacity duration-700"></div>
                
                {/* Ember particles */}
                <div className="absolute w-1.5 h-1.5 top-3 left-1/4 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 animate-glow-pulse transition-opacity duration-500"></div>
                <div className="absolute w-1.5 h-1.5 top-6 left-1/3 rounded-full bg-amber-500 opacity-0 group-hover:opacity-80 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '0.8s'}}></div>
                <div className="absolute w-1.5 h-1.5 top-4 left-1/2 rounded-full bg-amber-300 opacity-0 group-hover:opacity-60 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '1.2s'}}></div>
                
                {/* Streak data readout line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-900/50 via-amber-500/70 to-amber-900/50 opacity-20 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <StreakSection />
              </div>
            </div>
            
            {/* Rank Section with enhanced cyberpunk styling */}
            <div className="relative group">
              {/* Enhanced hexagonal corner decorations for rank */}
              <div className="absolute -left-5 top-5 w-16 h-16" style={{
                clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                border: "2px solid rgba(16, 185, 129, 0.4)",
                opacity: "0.3"
              }}></div>
              <div className="absolute -right-3 bottom-5 w-10 h-10" style={{
                clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                border: "2px solid rgba(16, 185, 129, 0.3)",
                opacity: "0.2"
              }}></div>
              
              {/* Rank data visualization elements */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-emerald-900/5 cyber-grid-enhanced"></div>
                <div className="absolute top-0 left-5 right-5 h-[2px] bg-gradient-to-r from-emerald-900/40 via-emerald-500/60 to-emerald-900/40"></div>
              </div>
              
              {/* Enhanced card with deeper glassmorphism and stronger glow effects */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-xl border-2 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                {/* Rank energy aura */}
                <div className="absolute -left-10 top-1/3 w-28 h-28 rounded-full bg-emerald-500/10 filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-slow-pulse"></div>
                <div className="absolute right-1/3 -bottom-10 w-32 h-32 rounded-full bg-emerald-400/10 filter blur-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-700 animate-slow-pulse" style={{animationDelay: '1s'}}></div>
                
                {/* Rank status indicators */}
                <div className="absolute top-3 left-3 flex space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-30 group-hover:opacity-90 animate-glow-pulse transition-opacity duration-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-30 group-hover:opacity-80 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 opacity-30 group-hover:opacity-70 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '1s'}}></div>
                </div>
                
                {/* Rank progress scan line */}
                <div className="absolute left-0 w-full h-0.5 bottom-0 bg-gradient-to-r from-emerald-900/50 via-emerald-400/70 to-emerald-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <RankSection />
              </div>
            </div>
            
            {/* Referral Section with enhanced cyberpunk styling */}
            <div className="relative group">
              {/* Enhanced network node corner decorations */}
              <div className="absolute -left-4 top-4 w-12 h-12" style={{
                backgroundImage: "radial-gradient(circle, rgba(225, 29, 72, 0.2) 0%, transparent 70%)",
                border: "2px solid rgba(225, 29, 72, 0.3)",
                opacity: "0.3",
                borderRadius: "10px"
              }}></div>
              <div className="absolute -right-4 bottom-4 w-12 h-12" style={{
                backgroundImage: "radial-gradient(circle, rgba(225, 29, 72, 0.2) 0%, transparent 70%)",
                border: "2px solid rgba(225, 29, 72, 0.3)",
                opacity: "0.3",
                borderRadius: "10px"
              }}></div>
              
              {/* Network connection lines */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute -left-3 -top-3 w-1/4 h-1/4" style={{
                  backgroundImage: "linear-gradient(45deg, rgba(225, 29, 72, 0.3) 0%, transparent 100%)",
                  opacity: "0.2"
                }}></div>
                <div className="absolute -right-3 -bottom-3 w-1/4 h-1/4" style={{
                  backgroundImage: "linear-gradient(225deg, rgba(225, 29, 72, 0.3) 0%, transparent 100%)",
                  opacity: "0.2"
                }}></div>
              </div>
              
              {/* Enhanced card with deeper glassmorphism and stronger glow effects */}
              <div className="relative z-10 overflow-hidden bg-black/80 backdrop-blur-xl border-2 border-rose-500/40 shadow-[0_0_15px_rgba(225,29,72,0.2)] rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]">
                {/* Network connection nodes */}
                <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-rose-500/60 animate-glow-pulse"></div>
                <div className="absolute top-16 -right-10 w-24 h-24 rounded-full bg-rose-500/10 filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -bottom-10 left-16 w-32 h-32 rounded-full bg-rose-400/10 filter blur-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-700"></div>
                
                {/* Connected network nodes */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-900/40 via-rose-500/70 to-rose-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-3 left-3 flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 opacity-40 group-hover:opacity-100 animate-glow-pulse transition-opacity duration-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 opacity-30 group-hover:opacity-80 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '0.6s'}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-300 opacity-20 group-hover:opacity-60 animate-glow-pulse transition-opacity duration-500" style={{animationDelay: '1.2s'}}></div>
                </div>
                
                <ReferralSection />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
