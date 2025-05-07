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
    <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-gaming">Daily Streak</h2>
          {isLoading ? (
            <Skeleton className="h-6 w-20 rounded-full" />
          ) : (
            <div className="bg-primary-600/20 text-primary-400 px-2.5 py-0.5 rounded-full text-sm font-bold">
              {streak?.days || 0} Days
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          {isLoading ? (
            Array(7).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-10 h-10 rounded-lg" />
            ))
          ) : (
            weekdays.map((day, idx) => {
              const isCompleted = streak?.completedDays?.includes(idx);
              const isCurrent = streak?.currentDay === idx;
              const isFuture = !isCompleted && !isCurrent;
              
              return (
                <div 
                  key={idx} 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center relative 
                    ${isCompleted ? 'bg-primary-600/20 text-primary-400 border-2 border-primary-600' : ''} 
                    ${isCurrent ? 'bg-dark-card text-white border-2 border-warning-400' : ''} 
                    ${isFuture ? 'bg-dark-card text-gray-500' : ''}`}
                >
                  <span>{day}</span>
                  {isCompleted && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        <div className="bg-dark-card p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">Daily Rewards</h3>
              <p className="text-xs text-gray-400 mt-1">Check in daily to earn streak rewards</p>
            </div>
            <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary-400">
                <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
              </svg>
            </div>
          </div>
          
          <div className="mt-4">
            {isLoading ? (
              <div className="py-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Current streak:</span>
                  <span className="font-bold text-primary-400">{streak?.days || 0} days</span>
                </div>
                
                {(streak?.days || 0) >= 7 && (
                  <div className="bg-primary-600/10 p-3 rounded-lg mb-3 border border-primary-600/30">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary-600/20 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary-400">
                          <path d="M2 12h10M12 2v10M22 12h-10M12 22v-10"/>
                        </svg>
                      </div>
                      <span className="text-primary-300 font-medium">Streak Freeze Available!</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-8">
                      You've unlocked a streak freeze point for maintaining a 7+ day streak
                    </p>
                  </div>
                )}
                
                <p className="text-gray-400 text-xs mb-3">
                  Check in daily to build your streak. After 7 consecutive days, 
                  you'll earn a Streak Freeze that protects your streak for one day of absence.
                </p>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full mt-4 bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 rounded transition-colors"
            onClick={handleClaimReward}
            disabled={isLoading || !streak?.canClaimReward || claimRewardMutation.isPending || claimingReward}
          >
            {claimingReward ? (
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Checked In!
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Check In Today
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
