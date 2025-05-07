import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getRankColor } from "@/lib/utils";

export function RankSection() {
  const { data: rankData, isLoading } = useQuery({
    queryKey: ['/api/user/rank'],
  });

  const rankTiers = [
    'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'
  ];
  
  return (
    <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border">
      <div className="p-6">
        <h2 className="text-xl font-bold font-gaming mb-4">Rank Progress</h2>
        
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
            <>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">{rankData.currentRank}</span>
                <span className="text-sm font-semibold text-warning-400">{rankData.nextRank}</span>
              </div>
              
              <div className="w-full h-3 bg-dark-card rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" 
                  style={{ width: `${rankData.progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>{rankData.currentRankPoints} RP</span>
                <span>{rankData.nextRankPoints} RP</span>
              </div>
            </>
          ) : null}
        </div>
        
        <div className="mt-6">
          <div className="text-sm font-semibold mb-3">Ranking System</div>
          
          <div className="grid grid-cols-3 gap-3">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded" />
                  <Skeleton className="w-12 h-4 mt-1" />
                </div>
              ))
            ) : (
              rankTiers.map((tier, idx) => {
                const isCurrentTier = rankData?.currentRank.toLowerCase().includes(tier.toLowerCase());
                const bgGradient = getRankColor(tier);
                
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div 
                      className={`w-12 h-12 hexagon bg-gradient-to-b ${bgGradient} flex items-center justify-center ${
                        isCurrentTier ? 'animate-pulse-slow' : 'opacity-60'
                      }`}
                    >
                      <i className="ri-medal-line text-lg"></i>
                    </div>
                    <span className={`text-xs ${isCurrentTier ? `text-${tier.toLowerCase()}-400 font-bold` : 'text-gray-500'} mt-1`}>
                      {tier}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
