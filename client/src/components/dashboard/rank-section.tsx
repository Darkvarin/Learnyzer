import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { RankProgressBar } from "@/components/rank-progress-bar";
import { formatNumber, getRankColor } from "@/lib/utils";
import { Medal } from "lucide-react";

// Define proper types for rank data
interface RankData {
  currentRank: string;
  nextRank: string;
  currentRankPoints: number;
  nextRankPoints: number;
  battlesWon: number;
  winRate: string;
}

export function RankSection() {
  const { data: rankData, isLoading } = useQuery<RankData>({
    queryKey: ['/api/user/rank'],
  });

  // All rank tiers including new high-level ranks
  const rankTiers = [
    'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Elite', 'Master', 'Grandmaster'
  ];
  
  return (
    <div className="w-full max-w-full bg-background/70 rounded-xl overflow-hidden border border-emerald-500/30 shadow-glow-emerald">
      <div className="p-4 sm:p-5 relative">
        {/* Solo Leveling corner accents - emerald theme for rank */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-500/70"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-500/70"></div>
        
        {/* Solo Leveling energy lines */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>
        
        {/* Solo Leveling rank mark - smaller */}
        <div className="absolute -top-2 -right-2 w-12 h-12 rank-power-mark opacity-40 z-0"></div>
        
        <h2 className="text-lg sm:text-xl font-bold font-gaming bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-white relative z-10 mb-3 sm:mb-4" style={{
          textShadow: "0 0 10px rgba(16, 185, 129, 0.3)"
        }}>Rank Progress</h2>
        
        <div className="relative z-10 mb-4">
          {isLoading ? (
            <>
              <div className="flex justify-between mb-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full rounded-full mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </>
          ) : rankData ? (
            <div className="rank-container relative">
              {/* Solo Leveling energy pulse beneath progress bar */}
              <div className="absolute inset-0 rank-energy-pulse opacity-40"></div>
              
              <div className="flex justify-between mb-2">
                <p className="text-emerald-400 font-bold font-gaming text-base">{rankData.currentRank}</p>
                <p className="text-emerald-400/80 font-bold font-gaming text-base">{rankData.nextRank}</p>
              </div>
              
              <RankProgressBar 
                currentRank={rankData.currentRank}
                currentPoints={rankData.currentRankPoints}
                nextRankPoints={rankData.nextRankPoints}
              />
              
              <div className="flex justify-between mt-1">
                <p className="text-emerald-400/70 font-gaming text-sm">{rankData.currentRankPoints} RP</p>
                <p className="text-emerald-400/70 font-gaming text-sm">{rankData.nextRankPoints} RP</p>
              </div>
            </div>
          ) : null}
        </div>
        
        <div className="mt-5">
          <div className="text-sm font-gaming text-emerald-400 mb-3 border-l-2 border-emerald-500/50 pl-2">RANK TIERS</div>
          
          <div className="grid grid-cols-3 gap-4 mt-2 py-1">
            {isLoading ? (
              Array(9).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded-sm" />
                  <Skeleton className="w-14 h-3 mt-1" />
                </div>
              ))
            ) : (
              rankTiers.map((tier, idx) => {
                const isCurrentTier = rankData?.currentRank.toLowerCase().includes(tier.toLowerCase());
                const tierClass = tier.toLowerCase();
                
                return (
                  <div key={idx} className="flex flex-col items-center group">
                    {/* Solo Leveling rank badge with hex clip-path */}
                    <div 
                      className={`relative w-12 h-12 transition-all duration-300 ${
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
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background/40 w-9 h-9 rounded-full border border-emerald-500/30 flex items-center justify-center z-10">
                        <Medal className={`${getRankColor(tier)}`} size={16} />
                      </div>
                      
                      {/* Current tier indicator with pulsing effect */}
                      {isCurrentTier && (
                        <div className="absolute inset-0 rank-pulse-effect"></div>
                      )}
                    </div>
                    <span className={`text-xs font-medium mt-1 font-gaming transition-colors ${
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
          <div className="mt-4 pt-3 border-t border-emerald-500/20 relative">
            <div className="flex justify-between">
              <div className="inline-flex items-center gap-1.5">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-gaming px-2 py-0.5 rounded">BATTLES</span>
                <p className="font-bold font-gaming text-emerald-400 text-sm">{formatNumber(rankData.battlesWon || 0)}</p>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-gaming px-2 py-0.5 rounded">WIN RATE</span>
                <p className="font-bold font-gaming text-emerald-400 text-sm">{rankData.winRate || '0%'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
