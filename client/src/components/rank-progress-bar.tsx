import React from "react";
import { Progress } from "@/components/ui/progress";
import { getRankColor } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RankProgressBarProps {
  currentRank: string;
  currentPoints: number;
  nextRankPoints: number;
}

export function RankProgressBar({ 
  currentRank, 
  currentPoints, 
  nextRankPoints 
}: RankProgressBarProps) {
  // Calculate progress percentage
  const progress = Math.min(Math.round((currentPoints / nextRankPoints) * 100), 100);
  
  // Get next rank name
  const ranks = [
    'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Elite', 'Master', 'Grandmaster'
  ];
  
  // Find current rank in tiers
  const currentTierIdx = ranks.findIndex(tier => 
    currentRank.toLowerCase().includes(tier.toLowerCase())
  );
  
  // Determine next rank
  const nextRank = currentTierIdx < ranks.length - 1 
    ? ranks[currentTierIdx + 1]
    : 'Grandmaster'; // If already at highest tier
  
  // Get colors for current and next rank
  const currentRankColor = getRankColor(currentRank);
  const nextRankColor = getRankColor(nextRank);
  
  return (
    <div className="rank-progress">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-sm text-muted-foreground">Current Rank</span>
          <h3 className={`font-bold ${currentRankColor}`}>{currentRank}</h3>
        </div>
        <div className="text-right">
          <span className="text-sm text-muted-foreground">Next Rank</span>
          <h3 className={`font-bold ${nextRankColor}`}>{nextRank}</h3>
        </div>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-10 relative cursor-help">
              {/* Progress bar background */}
              <div className="absolute inset-0 bg-muted rounded-full overflow-hidden">
                {/* All rank tiers visualization */}
                <div className="h-full flex">
                  {ranks.map((rank, idx) => (
                    <div 
                      key={idx}
                      className="h-full flex-1 border-r last:border-r-0 border-background/30"
                      style={{
                        background: idx <= currentTierIdx 
                          ? `linear-gradient(90deg, var(--rank-${rank.toLowerCase()}-dim), var(--rank-${rank.toLowerCase()}))`
                          : 'transparent'
                      }}
                    >
                      {/* Current progress indicator */}
                      {idx === currentTierIdx && (
                        <div 
                          className="h-full bg-gradient-to-r from-background/50 to-background/5"
                          style={{ 
                            width: `${100 - progress}%`,
                            float: 'right'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Rank markers */}
              <div className="absolute inset-0 flex items-center justify-between px-2">
                {ranks.map((rank, idx) => (
                  <div 
                    key={idx}
                    className={`h-3 w-1 rounded-full transition-all ${
                      idx <= currentTierIdx ? getRankColor(rank).replace('text-', 'bg-') : 'bg-background/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-64 p-0" align="center">
            <div className="p-2 text-center">
              <span className="block text-xs text-muted-foreground mb-1">Rank Progress</span>
              <span className="font-semibold">
                {currentPoints} / {nextRankPoints} RP ({progress}%)
              </span>
            </div>
            <div className="p-2 border-t border-border">
              <div className="text-xs grid grid-cols-3 gap-2">
                {ranks.map((rank, idx) => (
                  <div key={idx} className={`flex items-center ${idx <= currentTierIdx ? getRankColor(rank) : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${getRankColor(rank).replace('text-', 'bg-')}`} />
                    <span>{rank}</span>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{currentPoints} RP</span>
        <span>{nextRankPoints} RP</span>
      </div>
    </div>
  );
}