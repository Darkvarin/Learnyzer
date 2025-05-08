import { useUser } from "@/contexts/user-context";
import { cn, formatXP } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function UserProfileCard() {
  const { user } = useUser();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
  });

  if (!user) return null;

  const calculateXpProgress = () => {
    if (!stats) return 0;
    const { currentXp, nextLevelXp } = stats;
    return Math.min(100, Math.round((currentXp / nextLevelXp) * 100));
  };

  return (
    <div className="bg-background/50 rounded-xl overflow-hidden border border-cyan-500/30 shadow-glow-cyan">
      <div className="bg-gradient-to-r from-cyan-900/30 to-primary-900/30 backdrop-blur p-6 relative">
        {/* Solo Leveling style corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/70"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/70"></div>
        
        {/* Solo Leveling energy lines */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="monarch-profile-frame w-16 h-16 relative">
              {/* Animated monarch energy around avatar */}
              <div className="absolute inset-0 monarch-insignia opacity-40 animate-slow-spin"></div>
              
              {/* Avatar container with Solo Leveling hexagonal clip */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 hex-clip overflow-hidden">
                <div className="bg-background/80 w-full h-full flex items-center justify-center z-10 border border-cyan-500/40">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-cyan-500 font-gaming">
                      {user.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold font-gaming bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white" style={{
                textShadow: "0 0 10px rgba(6, 182, 212, 0.3)"
              }}>{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                {isLoading ? (
                  <Skeleton className="h-5 w-16" />
                ) : (
                  <div className="relative">
                    {/* Solo Leveling rank badge with glow effect */}
                    <div className="absolute inset-0 blur-sm bg-gradient-to-r from-amber-500/70 to-yellow-300/70 rounded-sm"></div>
                    <div className="relative bg-gradient-to-r from-amber-500 to-yellow-300 text-dark-surface text-xs font-bold px-2 py-0.5 rounded-sm font-gaming border border-amber-300/30">
                      {stats?.rank || "BRONZE I"}
                    </div>
                  </div>
                )}
                <span className="text-xs text-cyan-400/80">{user.track}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-cyan-400/80">Level</span>
              {isLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <span className="text-2xl font-bold font-gaming relative">
                  {/* Level number with Solo Leveling glow */}
                  <span className="relative z-10 text-white" style={{
                    textShadow: "0 0 10px rgba(6, 182, 212, 0.5)"
                  }}>
                    {stats?.level || 1}
                  </span>
                  {/* Solo Leveling decorative element */}
                  <span className="absolute -top-1 -right-2 w-3 h-3 border-t border-r border-cyan-500/60"></span>
                </span>
              )}
            </div>
            <div className="w-full md:w-52 mt-3 relative">
              {/* Solo Leveling XP bar with glowing effect */}
              <div className="solo-xp-bar relative h-2 bg-background/40 rounded-full overflow-hidden border border-cyan-500/30">
                {/* Animated energy pulse beneath progress bar */}
                <div className="absolute inset-0 solo-energy-pulse"></div>
                
                {/* Actual progress */}
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-primary-500 relative z-10"
                  style={{ width: `${calculateXpProgress()}%` }}
                >
                  {/* Glow effect at the edge of progress */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 blur-sm"></div>
                </div>
              </div>
              <div className="flex justify-between mt-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </>
                ) : (
                  <>
                    <span className="text-xs text-cyan-500/90 font-mono">{formatXP(stats?.currentXp || 0)} XP</span>
                    <span className="text-xs text-cyan-400/70 font-mono">{formatXP(stats?.nextLevelXp || 1000)} XP</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-5 relative">
        {/* Solo Leveling style corner elements */}
        <div className="absolute top-0 left-5 w-20 h-[1px] bg-gradient-to-r from-cyan-500/80 to-transparent"></div>
        <div className="absolute bottom-0 right-5 w-20 h-[1px] bg-gradient-to-l from-cyan-500/80 to-transparent"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Streak Days - Solo Leveling style */}
          <div className="relative group">
            {/* Solo Leveling hex frame for stat card */}
            <div className="absolute inset-0 hex-clip-card-sm bg-gradient-to-br from-primary-900/20 to-primary-900/5 border border-primary/30"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hex-clip-card-sm bg-gradient-to-br from-primary-900/40 to-primary-900/20 border border-primary/50"></div>
            
            {/* Solo Leveling corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60"></div>
            
            <div className="p-3 relative z-10 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold font-gaming text-primary" style={{
                  textShadow: "0 0 10px rgba(125, 39, 255, 0.3)"
                }}>{stats?.streakDays || 0}</div>
              )}
              <div className="text-xs text-primary/80 mt-1 font-gaming tracking-wide">STREAK DAYS</div>
            </div>
          </div>
          
          {/* Battles Won - Solo Leveling style */}
          <div className="relative group">
            {/* Solo Leveling hex frame for stat card */}
            <div className="absolute inset-0 hex-clip-card-sm bg-gradient-to-br from-success-900/20 to-success-900/5 border border-success/30"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hex-clip-card-sm bg-gradient-to-br from-success-900/40 to-success-900/20 border border-success/50"></div>
            
            {/* Solo Leveling corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-success/60"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-success/60"></div>
            
            <div className="p-3 relative z-10 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold font-gaming text-success" style={{
                  textShadow: "0 0 10px rgba(34, 197, 94, 0.3)"
                }}>{stats?.battlesWon || 0}</div>
              )}
              <div className="text-xs text-success/80 mt-1 font-gaming tracking-wide">BATTLES WON</div>
            </div>
          </div>
          
          {/* Accuracy - Solo Leveling style */}
          <div className="relative group">
            {/* Solo Leveling hex frame for stat card */}
            <div className="absolute inset-0 hex-clip-card-sm bg-gradient-to-br from-warning-900/20 to-warning-900/5 border border-warning/30"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hex-clip-card-sm bg-gradient-to-br from-warning-900/40 to-warning-900/20 border border-warning/50"></div>
            
            {/* Solo Leveling corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-warning/60"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-warning/60"></div>
            
            <div className="p-3 relative z-10 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold font-gaming text-warning" style={{
                  textShadow: "0 0 10px rgba(234, 179, 8, 0.3)"
                }}>{stats?.accuracy || "0%"}</div>
              )}
              <div className="text-xs text-warning/80 mt-1 font-gaming tracking-wide">ACCURACY</div>
            </div>
          </div>
          
          {/* AI Sessions - Solo Leveling style */}
          <div className="relative group">
            {/* Solo Leveling hex frame for stat card */}
            <div className="absolute inset-0 hex-clip-card-sm bg-gradient-to-br from-cyan-900/20 to-cyan-900/5 border border-cyan-500/30"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hex-clip-card-sm bg-gradient-to-br from-cyan-900/40 to-cyan-900/20 border border-cyan-500/50"></div>
            
            {/* Solo Leveling corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/60"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/60"></div>
            
            <div className="p-3 relative z-10 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold font-gaming text-cyan-500" style={{
                  textShadow: "0 0 10px rgba(6, 182, 212, 0.3)"
                }}>{stats?.aiSessions || 0}</div>
              )}
              <div className="text-xs text-cyan-500/80 mt-1 font-gaming tracking-wide">AI SESSIONS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
