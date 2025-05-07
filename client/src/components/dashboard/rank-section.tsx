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
    <div className="game-card">
      <div className="p-6">
        <h2 className="text-xl font-bold font-gaming gaming-text mb-4">Rank Progress</h2>
        
        <div className="relative">
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
            <RankProgressBar 
              currentRank={rankData.currentRank}
              currentPoints={rankData.currentRankPoints}
              nextRankPoints={rankData.nextRankPoints}
            />
          ) : null}
        </div>
        
        <div className="mt-8">
          <div className="text-sm font-semibold mb-3">Ranking System</div>
          
          <div className="grid grid-cols-3 gap-4">
            {isLoading ? (
              Array(9).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded" />
                  <Skeleton className="w-12 h-4 mt-1" />
                </div>
              ))
            ) : (
              rankTiers.map((tier, idx) => {
                const isCurrentTier = rankData?.currentRank.toLowerCase().includes(tier.toLowerCase());
                const tierClass = tier.toLowerCase();
                
                return (
                  <div key={idx} className="flex flex-col items-center group">
                    <div 
                      className={`rank-badge ${tierClass} w-12 h-12 flex items-center justify-center transition-all duration-300 ${
                        isCurrentTier ? 'scale-110' : 'opacity-70 group-hover:opacity-100'
                      }`}
                    >
                      <div className="bg-background/90 w-10 h-10 rounded-full flex items-center justify-center z-10">
                        <Medal className={`${getRankColor(tier)}`} size={20} />
                      </div>
                    </div>
                    <span className={`text-xs font-medium mt-2 transition-colors ${isCurrentTier ? getRankColor(tier) : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {tier}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {rankData && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Total Battles Won</span>
                <p className="font-semibold">{formatNumber(rankData.battlesWon || 0)}</p>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">Win Rate</span>
                <p className="font-semibold">{rankData.winRate || '0%'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
