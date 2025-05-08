import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export function StreakSection() {
  const { data: streak, isLoading } = useQuery({
    queryKey: ['/api/user/streak'],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [claimingReward, setClaimingReward] = useState(false);
  
  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/user/streak/claim", {});
    },
    onSuccess: () => {
      setClaimingReward(true);
      setTimeout(() => {
        setClaimingReward(false);
        queryClient.invalidateQueries({ queryKey: ['/api/user/streak'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
        toast({
          title: "Reward claimed!",
          description: "You've earned XP for your daily streak. Keep it up!",
        });
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Failed to claim reward",
        description: "Please complete all daily goals first.",
        variant: "destructive",
      });
    }
  });

  const handleClaimReward = () => {
    if (!streak || !streak.canClaimReward) return;
    claimRewardMutation.mutate();
  };

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-background/90 rounded-xl overflow-hidden">
      <div className="p-6 relative">
        {/* Home page style corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-amber-500/40"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40"></div>
        
        {/* Home page style energy lines */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
        
        {/* Home page style energy glow */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-amber-500/5 filter blur-3xl"></div>
        <div className="absolute right-1/4 bottom-0 w-32 h-32 rounded-full bg-primary/5 filter blur-xl"></div>
        
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h2 className="text-xl font-bold font-gaming bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-white" style={{
            textShadow: "0 0 10px rgba(251, 191, 36, 0.3)"
          }}>Daily Streak</h2>
          {isLoading ? (
            <Skeleton className="h-6 w-20 rounded-sm" />
          ) : (
            <div className="px-3 py-1 rounded-sm relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-amber-500/30 backdrop-blur-sm border border-amber-500/30"></div>
              <div className="relative z-10 text-amber-300 text-sm font-bold font-gaming flex items-center">
                <span className="mr-1">{streak?.days || 0}</span>
                <span className="text-amber-400/80">DAYS</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-6 relative">
          {/* Solo Leveling timeline bar connecting day indicators */}
          <div className="absolute top-1/2 left-5 right-5 h-[2px] bg-gradient-to-r from-amber-500/20 via-amber-500/40 to-amber-500/20 -translate-y-1/2 z-0"></div>
          
          {isLoading ? (
            Array(7).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-11 h-11 rounded-md" />
            ))
          ) : (
            weekdays.map((day, idx) => {
              const isCompleted = streak?.completedDays?.includes(idx);
              const isCurrent = streak?.currentDay === idx;
              const isFuture = !isCompleted && !isCurrent;
              
              return (
                <div 
                  key={idx} 
                  className={`relative group z-10 w-11 h-11 flex items-center justify-center
                    ${isCompleted ? 'text-amber-400' : ''} 
                    ${isCurrent ? 'text-white' : ''} 
                    ${isFuture ? 'text-gray-500' : ''}`}
                >
                  {/* Home page style day indicators */}
                  <div className={`absolute inset-0 rounded-md overflow-hidden border ${
                    isCompleted 
                      ? 'border-amber-500/60 bg-amber-500/10' 
                      : isCurrent 
                        ? 'border-amber-400/60 bg-background/80 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                        : 'border-gray-700/40 bg-background/40'
                  }`}></div>
                  
                  {/* Day label with home page style */}
                  <span className={`relative z-10 font-gaming text-sm ${
                    isCompleted 
                      ? 'text-amber-400' 
                      : isCurrent 
                        ? 'text-white' 
                        : 'text-gray-500'
                  }`}>{day}</span>
                  
                  {/* Completed day indicator */}
                  {isCompleted && (
                    <div className="absolute right-1 bottom-1 w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-2 h-2 fill-white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Current day indicator with subtle glow */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 animate-pulse"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        <div className="relative glassmorphism p-5 rounded-lg border border-amber-500/20 overflow-hidden">
          {/* Home page style corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-500/40"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-500/40"></div>
          
          {/* Home page style glow effect */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-20 h-20 rounded-full bg-amber-500/5 filter blur-lg"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="font-bold text-sm font-gaming text-amber-400">Daily Rewards</h3>
              <p className="text-xs text-amber-400/60 mt-1">Check in daily to earn streak rewards</p>
            </div>
            <div className="w-12 h-12 relative">
              {/* Home page style rounded icon */}
              <div className="absolute inset-0 rounded-md bg-background/80 border border-amber-500/40 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-500/10"></div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber-500 relative z-10">
                  <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mt-4 relative z-10">
            {isLoading ? (
              <div className="py-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="text-sm">
                <div className="flex justify-between mb-3">
                  <span className="text-amber-400/80 font-gaming">CURRENT STREAK</span>
                  <span className="font-bold text-amber-400 font-gaming">{streak?.days || 0} DAYS</span>
                </div>
                
                {(streak?.days || 0) >= 7 && (
                  <div className="bg-background/80 p-4 rounded-md mb-4 border border-amber-500/20 relative overflow-hidden">
                    {/* Home page style corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-500/30"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-500/30"></div>
                    
                    {/* Home page style glow */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-500/5 filter blur-lg"></div>
                    
                    <div className="flex items-start relative z-10">
                      <div className="w-8 h-8 rounded-md bg-background/60 border border-amber-500/30 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500">
                          <path d="M2 12h10M12 2v10M22 12h-10M12 22v-10"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-amber-400 font-medium font-gaming">STREAK FREEZE UNLOCKED</span>
                        <p className="text-xs text-amber-400/60 mt-1">
                          You've earned a streak freeze point for maintaining a 7+ day streak
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-amber-400/60 text-xs mb-4 border-l-2 border-amber-500/30 pl-3">
                  Check in daily to build your streak. After 7 consecutive days, 
                  you'll earn a Streak Freeze that protects your streak for one day of absence.
                </p>
              </div>
            )}
          </div>
          
          <Button 
            className={`w-full mt-4 transition-all duration-300 relative overflow-hidden group
              ${claimingReward 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : !streak?.canClaimReward || isLoading || claimRewardMutation.isPending
                  ? 'bg-background/50 text-gray-500 border border-gray-700/30 cursor-not-allowed'
                  : 'bg-background/80 hover:bg-amber-950/80 border border-amber-500/40 hover:border-amber-400/60 text-amber-400 hover:text-amber-300'
              }`}
            onClick={handleClaimReward}
            disabled={isLoading || !streak?.canClaimReward || claimRewardMutation.isPending || claimingReward}
          >
            {/* Home page style button hover effect */}
            {streak?.canClaimReward && !claimingReward && !claimRewardMutation.isPending && !isLoading && (
              <>
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </>
            )}
            
            {claimingReward ? (
              <span className="flex items-center justify-center relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-amber-300">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span className="font-gaming">CHECKED IN!</span>
              </span>
            ) : (
              <span className="flex items-center justify-center relative z-10">
                {streak?.canClaimReward ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span className="font-gaming">CHECK IN TODAY</span>
                  </>
                ) : (
                  <span className="font-gaming">ALREADY CHECKED IN</span>
                )}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
