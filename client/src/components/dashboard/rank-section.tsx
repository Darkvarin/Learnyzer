import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { RankProgressBar } from "@/components/rank-progress-bar";
import { formatNumber, getRankColor } from "@/lib/utils";
import { Medal } from "lucide-react";

export function RankSection() {
  const { data: rankData, isLoading } = useQuery({
    queryKey: ['/api/user/rank'],
  });

  // All rank tiers including new high-level ranks
  const rankTiers = [
    'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Elite', 'Master', 'Grandmaster'
  ];
  
  return (
    <div className="bg-background/70 rounded-xl overflow-hidden border border-emerald-500/30 shadow-glow-emerald relative">
      <div className="p-4 relative">
        {/* Solo Leveling corner accents - emerald theme for rank */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500/70"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500/70"></div>
        
        {/* Solo Leveling energy lines */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>
        
        {/* Solo Leveling rank mark - smaller */}
        <div className="absolute -top-2 -right-2 w-12 h-12 rank-power-mark opacity-40 z-0"></div>
        
        <h2 className="text-lg font-bold font-gaming bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-white relative z-10" style={{
          textShadow: "0 0 10px rgba(16, 185, 129, 0.3)"
        }}>Rank Progress</h2>
        
        <div className="relative mt-6 z-10">
          {isLoading ? (
            <>
              <div className="flex justify-between mb-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-3 w-full rounded-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-14" />
              </div>
            </>
          ) : rankData ? (
            <div className="rank-container relative">
              {/* Solo Leveling energy pulse beneath progress bar */}
              <div className="absolute inset-0 rank-energy-pulse opacity-40"></div>
              
              <RankProgressBar 
                currentRank={rankData.currentRank}
                currentPoints={rankData.currentRankPoints}
                nextRankPoints={rankData.nextRankPoints}
              />
            </div>
          ) : null}
        </div>
        
        <div className="mt-4">
          <div className="text-xs font-gaming text-emerald-400 mb-2 border-l-2 border-emerald-500/50 pl-2">RANK TIERS</div>
          
          <div className="flex items-center justify-between gap-1 mt-2 overflow-x-auto py-1 no-scrollbar">
            {isLoading ? (
              Array(9).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center flex-shrink-0">
                  <Skeleton className="w-8 h-8 rounded-sm" />
                  <Skeleton className="w-10 h-3 mt-1" />
                </div>
              ))
            ) : (
              rankTiers.map((tier, idx) => {
                const isCurrentTier = rankData?.currentRank.toLowerCase().includes(tier.toLowerCase());
                const tierClass = tier.toLowerCase();
                
                return (
                  <div key={idx} className="flex flex-col items-center group flex-shrink-0">
                    {/* Solo Leveling rank badge with hex clip-path - smaller size */}
                    <div 
                      className={`relative w-8 h-8 transition-all duration-300 ${
                        isCurrentTier ? 'scale-110' : 'opacity-70 group-hover:opacity-100'
                      }`}
                    >
                      {/* Hex clip container */}
                      <div className={`absolute inset-0 hex-clip overflow-hidden ${
                        isCurrentTier ? 'shadow-glow-sm' : ''
                      } ${
                        tierClass === 'bronze' ? 'shadow-amber-500/30' : 
                        tierClass === 'silver' ? 'shadow-slate-300/30' :
                        tierClass === 'gold' ? 'shadow-yellow-500/30' :
                        tierClass === 'platinum' ? 'shadow-cyan-300/30' :
                        tierClass === 'diamond' ? 'shadow-blue-400/30' :
                        tierClass === 'heroic' ? 'shadow-purple-500/30' :
                        tierClass === 'elite' ? 'shadow-pink-500/30' :
                        tierClass === 'master' ? 'shadow-red-500/30' :
                        'shadow-rose-500/30'
                      }`}>
                        {/* Background with gradient based on rank */}
                        <div className={`w-full h-full 
                          ${tierClass === 'bronze' ? 'bg-gradient-to-br from-amber-800/30 to-amber-600/10' : 
                          tierClass === 'silver' ? 'bg-gradient-to-br from-slate-500/30 to-slate-300/10' :
                          tierClass === 'gold' ? 'bg-gradient-to-br from-yellow-600/30 to-yellow-300/10' :
                          tierClass === 'platinum' ? 'bg-gradient-to-br from-cyan-600/30 to-cyan-300/10' :
                          tierClass === 'diamond' ? 'bg-gradient-to-br from-blue-600/30 to-blue-300/10' :
                          tierClass === 'heroic' ? 'bg-gradient-to-br from-purple-700/30 to-purple-400/10' :
                          tierClass === 'elite' ? 'bg-gradient-to-br from-pink-700/30 to-pink-400/10' :
                          tierClass === 'master' ? 'bg-gradient-to-br from-red-700/30 to-red-400/10' :
                          'bg-gradient-to-br from-rose-700/30 to-rose-400/10'
                        } border border-emerald-500/30`}>
                        </div>
                      </div>
                      
                      {/* Medal icon with Solo Leveling styling */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background/40 w-6 h-6 rounded-full border border-emerald-500/30 flex items-center justify-center z-10">
                        <Medal className={`${getRankColor(tier)}`} size={12} />
                      </div>
                      
                      {/* Current tier indicator with pulsing effect */}
                      {isCurrentTier && (
                        <div className="absolute inset-0 rank-pulse-effect"></div>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium mt-1 font-gaming transition-colors ${
                      isCurrentTier 
                        ? `${tier.toLowerCase()}-rank-text` 
                        : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      {tier}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {rankData && (
          <div className="mt-3 pt-2 border-t border-emerald-500/20 relative">
            <div className="flex justify-between text-sm">
              <div className="inline-flex items-center gap-1">
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-gaming px-1.5 py-0.5 rounded">BATTLES</span>
                <p className="font-bold font-gaming text-emerald-400 text-xs">{formatNumber(rankData.battlesWon || 0)}</p>
              </div>
              <div className="inline-flex items-center gap-1">
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-gaming px-1.5 py-0.5 rounded">WIN RATE</span>
                <p className="font-bold font-gaming text-emerald-400 text-xs">{rankData.winRate || '0%'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
