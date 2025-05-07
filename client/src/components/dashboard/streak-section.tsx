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
              <h3 className="font-bold text-sm">Today's Reward</h3>
              <p className="text-xs text-gray-400 mt-1">Complete today's goals to claim</p>
            </div>
            <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <i className="ri-vip-crown-line text-primary-400 text-xl"></i>
            </div>
          </div>
          
          <div className="mt-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center mb-2">
                  <Skeleton className="w-5 h-5 rounded mr-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : streak?.goals && streak.goals.length > 0 ? (
              streak.goals.map((goal, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <div className="w-5 h-5 bg-dark-surface rounded flex items-center justify-center mr-2">
                    {goal.completed && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3 fill-primary-400">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{goal.description}</span>
                  <span className="ml-auto text-xs text-primary-400">
                    {goal.progress || 0}/{goal.target || 0}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-2 text-gray-400">
                <p className="text-sm">No goals set for today</p>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full mt-4 bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 rounded transition-colors"
            onClick={handleClaimReward}
            disabled={isLoading || !streak?.canClaimReward || claimRewardMutation.isPending || claimingReward}
          >
            {claimingReward ? (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Claimed!
              </span>
            ) : (
              `Claim ${streak?.rewardXp || 0} XP`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
