import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Reward, Achievement } from "@shared/types";

export default function Rewards() {
  const { data: rewards, isLoading: rewardsLoading } = useQuery<{
    available: Reward[];
    claimed: Reward[];
  }>({
    queryKey: ['/api/rewards'],
  });
  
  const { data: achievements, isLoading: achievementsLoading } = useQuery<{
    completed: Achievement[];
    inProgress: Achievement[];
  }>({
    queryKey: ['/api/achievements'],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      return apiRequest("POST", `/api/rewards/${rewardId}/claim`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      toast({
        title: "Reward claimed!",
        description: "Your reward has been added to your profile.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to claim reward",
        description: "There was an error claiming your reward. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleClaimReward = (rewardId: number) => {
    claimRewardMutation.mutate(rewardId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-gaming">Rewards & Achievements</h1>
          <p className="text-gray-400 mt-1">Earn rewards, unlock achievements, and showcase your progress</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rewards Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="available" className="w-full">
              <TabsList className="bg-dark-card border border-dark-border w-full justify-start mb-6">
                <TabsTrigger value="available" className="data-[state=active]:bg-primary-600">Available Rewards</TabsTrigger>
                <TabsTrigger value="claimed" className="data-[state=active]:bg-primary-600">Claimed Rewards</TabsTrigger>
              </TabsList>
              
              {/* Available Rewards */}
              <TabsContent value="available" className="space-y-4">
                {rewardsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
                        <div className="h-32 bg-dark-card">
                          <Skeleton className="h-full w-full" />
                        </div>
                        <div className="p-4">
                          <Skeleton className="h-6 w-32 mb-2" />
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-3/4 mb-4" />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-9 w-24 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : rewards?.available && rewards.available.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.available.map(reward => (
                      <div key={reward.id} className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
                        <div 
                          className="h-32 bg-dark-card bg-cover bg-center relative" 
                          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${reward.image})` }}
                        >
                          {reward.featured && (
                            <div className="absolute top-2 right-2 bg-warning-500 text-white text-xs font-bold px-2 py-1 rounded">
                              Featured
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2">
                            <span className="text-xs font-medium bg-dark-surface/80 text-white px-2 py-0.5 rounded">
                              {reward.type}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1">{reward.name}</h3>
                          <p className="text-sm text-gray-400 mb-4">{reward.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-1">
                              <span className="text-warning-400 font-bold">{reward.cost}</span>
                              <i className="ri-vip-crown-line text-warning-400"></i>
                            </div>
                            <Button
                              className="bg-primary-600 hover:bg-primary-500"
                              onClick={() => handleClaimReward(reward.id)}
                              disabled={claimRewardMutation.isPending}
                            >
                              Claim Reward
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <i className="ri-gift-line text-5xl mb-3"></i>
                    <p className="text-lg mb-2">No available rewards</p>
                    <p className="text-sm mb-4">Complete more activities to unlock rewards</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Claimed Rewards */}
              <TabsContent value="claimed" className="space-y-4">
                {rewardsLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : rewards?.claimed && rewards.claimed.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.claimed.map(reward => (
                      <div key={reward.id} className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden opacity-90">
                        <div 
                          className="h-32 bg-dark-card bg-cover bg-center relative" 
                          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${reward.image})` }}
                        >
                          <div className="absolute top-2 right-2 bg-success-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Claimed
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="text-xs font-medium bg-dark-surface/80 text-white px-2 py-0.5 rounded">
                              {reward.type}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1">{reward.name}</h3>
                          <p className="text-sm text-gray-400 mb-4">{reward.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-400">
                              Claimed on {new Date(reward.claimedAt || Date.now()).toLocaleDateString()}
                            </div>
                            {reward.type === "Profile Frame" && (
                              <Button variant="outline" className="bg-dark-card border-dark-border">
                                Apply Frame
                              </Button>
                            )}
                            {reward.type === "Badge" && (
                              <Button variant="outline" className="bg-dark-card border-dark-border">
                                Show Badge
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <i className="ri-trophy-line text-5xl mb-3"></i>
                    <p className="text-lg mb-2">No claimed rewards yet</p>
                    <p className="text-sm mb-4">Claim your rewards to see them here</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Achievements Section */}
          <div className="lg:col-span-1">
            <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold font-gaming mb-4">Achievements</h2>
                
                {achievementsLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))}
                  </div>
                ) : achievements?.completed && achievements.completed.length > 0 ? (
                  <div className="space-y-4">
                    {achievements.completed.map(achievement => (
                      <div key={achievement.id} className="flex items-center space-x-3 bg-dark-card p-3 rounded-lg">
                        <div 
                          className={`w-12 h-12 rounded-full bg-${achievement.category.toLowerCase()}-600/20 flex items-center justify-center border-2 border-${achievement.category.toLowerCase()}-500`}
                        >
                          <i className={`${achievement.icon} text-${achievement.category.toLowerCase()}-400 text-xl`}></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm">{achievement.name}</h3>
                          <p className="text-xs text-gray-400">{achievement.description}</p>
                          <div className="mt-1 text-xs text-success-400">{achievement.xpReward} XP Earned</div>
                        </div>
                      </div>
                    ))}
                    
                    <h3 className="text-lg font-bold mt-6 mb-3">In Progress</h3>
                    
                    {achievements.inProgress.map(achievement => (
                      <div key={achievement.id} className="flex items-center space-x-3 bg-dark-card p-3 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-dark-hover flex items-center justify-center border-2 border-dark-border">
                          <i className={`${achievement.icon} text-gray-400 text-xl`}></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm">{achievement.name}</h3>
                          <p className="text-xs text-gray-400">{achievement.description}</p>
                          <div className="mt-2 w-full bg-dark-surface rounded-full h-1.5">
                            <div 
                              className="bg-primary-600 h-1.5 rounded-full" 
                              style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-right text-xs text-gray-400">
                            {achievement.progress}/{achievement.target}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <i className="ri-award-line text-3xl mb-2"></i>
                    <p>No achievements unlocked yet</p>
                    <p className="text-xs mt-2">Complete activities to earn achievements</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border">
              <div className="p-6">
                <h2 className="text-xl font-bold font-gaming mb-4">Leaderboard</h2>
                
                {achievementsLoading ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 bg-dark-card p-3 rounded-lg">
                        <div className="w-8 h-8 bg-warning-600 rounded-full flex items-center justify-center font-gaming text-dark font-bold">
                          1
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-dark-hover mr-2">
                            <img
                              src="https://images.unsplash.com/photo-1580518324671-c2f0833a3af3?auto=format&fit=crop&w=32&h=32"
                              alt="Top student"
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">Vikram Singh</h3>
                            <p className="text-xs text-gray-400">Diamond III</p>
                          </div>
                          <div className="ml-auto text-warning-400 font-bold">
                            12,450 XP
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 bg-dark-card p-3 rounded-lg">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center font-gaming text-dark font-bold">
                          2
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-dark-hover mr-2">
                            <img
                              src="https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?auto=format&fit=crop&w=32&h=32"
                              alt="Leaderboard user"
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">Priya Patel</h3>
                            <p className="text-xs text-gray-400">Platinum I</p>
                          </div>
                          <div className="ml-auto text-warning-400 font-bold">
                            10,832 XP
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 bg-dark-card p-3 rounded-lg">
                        <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center font-gaming text-dark font-bold">
                          3
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-dark-hover mr-2">
                            <span className="flex items-center justify-center h-full text-xs font-bold">
                              ?
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">More Users Coming Soon</h3>
                            <p className="text-xs text-gray-400">Join the leaderboard!</p>
                          </div>
                          <div className="ml-auto text-warning-400 font-bold">
                            --
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 bg-primary-600/10 p-3 rounded-lg border border-primary-700/30">
                        <div className="w-8 h-8 bg-dark-card rounded-full flex items-center justify-center font-gaming font-bold">
                          24
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-dark-hover mr-2">
                            <span className="flex items-center justify-center h-full text-xs font-bold">
                              YOU
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">You</h3>
                            <p className="text-xs text-gray-400">Gold II</p>
                          </div>
                          <div className="ml-auto text-warning-400 font-bold">
                            4,350 XP
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4 bg-dark-card border-dark-border">
                      View Full Leaderboard
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
