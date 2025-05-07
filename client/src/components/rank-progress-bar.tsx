import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Define all rank tiers
const rankTiers = [
  { name: 'Bronze', color: 'from-[#CD7F32] to-[#A46628]', badgeClass: 'bronze', minPoints: 0 },
  { name: 'Silver', color: 'from-[#C0C0C0] to-[#A8A8A8]', badgeClass: 'silver', minPoints: 100 },
  { name: 'Gold', color: 'from-[#FFD700] to-[#FFC000]', badgeClass: 'gold', minPoints: 250 },
  { name: 'Platinum', color: 'from-[#E5E4E2] to-[#9BC4E2]', badgeClass: 'platinum', minPoints: 500 },
  { name: 'Diamond', color: 'from-[#B9F2FF] to-[#56D0EE]', badgeClass: 'diamond', minPoints: 1000 },
  { name: 'Heroic', color: 'from-[#9D65C9] to-[#5D54A4]', badgeClass: 'heroic', minPoints: 2000 },
  { name: 'Elite', color: 'from-[#D565C9] to-[#A42EA4]', badgeClass: 'elite', minPoints: 3500 },
  { name: 'Master', color: 'from-[#CC3363] to-[#781C3C]', badgeClass: 'master', minPoints: 5000 },
  { name: 'Grandmaster', color: 'from-[#FF4500] to-[#8B0000]', badgeClass: 'grandmaster', minPoints: 7500 }
];

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
  // Find current rank tier
  const currentTier = rankTiers.find(tier => tier.name.toLowerCase() === currentRank.toLowerCase()) || rankTiers[0];
  
  // Find next rank tier
  const currentTierIndex = rankTiers.findIndex(tier => tier.name.toLowerCase() === currentRank.toLowerCase());
  const nextTier = currentTierIndex < rankTiers.length - 1 ? rankTiers[currentTierIndex + 1] : rankTiers[rankTiers.length - 1];
  
  // Calculate progress percentage
  const pointsNeeded = nextRankPoints - currentTier.minPoints;
  const pointsGained = currentPoints - currentTier.minPoints;
  const progressPercentage = Math.min(Math.round((pointsGained / pointsNeeded) * 100), 100);
  
  // For the highest rank, show 100% progress
  const isMaxRank = currentTierIndex === rankTiers.length - 1;
  
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`rank-badge ${currentTier.badgeClass} w-8 h-8 flex items-center justify-center`}>
            <div className="bg-background/90 w-7 h-7 rounded-full flex items-center justify-center z-10">
              <span className="text-xs font-bold">{currentRank.substring(0, 1)}</span>
            </div>
          </div>
          <span className="font-medium">{currentRank}</span>
        </div>
        
        {!isMaxRank && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Next:</span>
            <div className={`rank-badge ${nextTier.badgeClass} w-6 h-6 flex items-center justify-center opacity-70`}>
              <div className="bg-background/90 w-5 h-5 rounded-full flex items-center justify-center z-10">
                <span className="text-xs font-bold">{nextTier.name.substring(0, 1)}</span>
              </div>
            </div>
            <span className="font-medium">{nextTier.name}</span>
          </div>
        )}
      </div>
      
      <div className="relative">
        <Progress 
          value={progressPercentage} 
          className="h-2.5 rounded-full overflow-hidden"
        />
        
        <div className="flex justify-between mt-1 relative">
          {rankTiers.map((tier, index) => {
            // Calculate position based on min points
            const maxPoints = rankTiers[rankTiers.length - 1].minPoints;
            const position = (tier.minPoints / maxPoints) * 100;
            
            return (
              <TooltipProvider key={tier.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="absolute -top-3 h-4 w-1.5 bg-background border border-border z-10 rounded-sm cursor-pointer"
                      style={{ left: `calc(${position}% - 2px)` }}
                    >
                      <div 
                        className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tier.color}`}
                      ></div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="flex flex-col items-center">
                    <p className="font-medium">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.minPoints} points</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between text-sm">
        <div>
          <span className="font-medium">{currentPoints} </span>
          <span className="text-muted-foreground">points</span>
        </div>
        {!isMaxRank && (
          <div>
            <span className="text-muted-foreground">Next rank at </span>
            <span className="font-medium">{nextRankPoints}</span>
          </div>
        )}
      </div>
    </div>
  );
}