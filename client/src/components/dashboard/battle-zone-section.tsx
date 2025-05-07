import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getBattleTypeIcon } from "@/lib/utils";
import { Battle } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function BattleZoneSection() {
  const { data: battles, isLoading } = useQuery<Battle[]>({
    queryKey: ['/api/battles/active'],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const joinBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      return apiRequest("POST", `/api/battles/${battleId}/join`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/battles/active'] });
      toast({
        title: "Battle joined!",
        description: "Get ready to compete. The battle will start soon.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to join battle",
        description: "There was an error joining the battle. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleJoinBattle = (battleId: number) => {
    joinBattleMutation.mutate(battleId);
  };

  return (
    <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-gaming">Battle Zone</h2>
          <Link href="/battle-zone">
            <a className="text-primary-400 hover:text-primary-300 text-sm flex items-center">
              View All Battles
              <i className="ri-arrow-right-s-line ml-1"></i>
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="battle-card rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-10 h-10 rounded-md" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-20 rounded-l-md" />
                    <Skeleton className="h-12 w-24 rounded-r-md" />
                  </div>
                </div>
                
                <div className="mt-4 border-t border-dark-border pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            ))
          ) : battles && battles.length > 0 ? (
            battles.map((battle) => (
              <div key={battle.id} className="battle-card rounded-lg p-4 transform transition-transform hover:scale-[1.01]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-10 h-10 bg-gradient-to-br ${
                        battle.type.includes('1v1') 
                          ? 'from-warning-600 to-danger-600' 
                          : 'from-primary-600 to-info-600'
                      } rounded-md flex items-center justify-center`}>
                        <i className={`${getBattleTypeIcon(battle.type)} text-xl`}></i>
                      </div>
                      <div>
                        <h3 className="font-bold font-gaming">{battle.title}</h3>
                        <p className="text-xs text-gray-400">{battle.type} · {battle.duration} mins · AI Judged</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-dark-surface px-3 py-2 rounded-l-md text-center">
                      <span className="text-xs text-gray-400">Rewards</span>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-warning-400 font-bold">{battle.rewardPoints}</span>
                        <i className="ri-vip-crown-line text-warning-400"></i>
                      </div>
                    </div>
                    <Button 
                      className={`bg-gradient-to-r ${
                        battle.type.includes('1v1') 
                          ? 'from-warning-600 to-danger-600 hover:from-warning-500 hover:to-danger-500' 
                          : 'from-primary-600 to-info-600 hover:from-primary-500 hover:to-info-500'
                      } text-white font-bold py-2 px-4 rounded-r-md transition-colors h-full`}
                      onClick={() => handleJoinBattle(battle.id)}
                      disabled={joinBattleMutation.isPending}
                    >
                      Join Battle
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 border-t border-dark-border pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        {battle.participants && battle.participants.length > 0 ? (
                          battle.participants.map((participant, idx) => (
                            <div 
                              key={idx}
                              className="w-6 h-6 rounded-full bg-dark-card border border-dark-surface flex items-center justify-center text-xs"
                              title={participant.name || `Player ${idx + 1}`}
                            >
                              {participant.profileImage ? (
                                <img 
                                  src={participant.profileImage}
                                  alt={participant.name || `Player ${idx + 1}`}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span>{(participant.name || 'P').charAt(0)}</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-dark-card border border-dark-surface" />
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {battle.participants && battle.participants.length || 0} players waiting
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <span>Topics: </span>
                      <span className="text-white">{battle.topics ? Array.isArray(battle.topics) ? battle.topics.join(', ') : battle.topics : 'Subject Topics'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                <path d="M14.5 12.5 l4.5 -4.5"/>
                <path d="M18.5 8.5 l-4.5 -4.5"/>
                <path d="M5 5v.5"/>
                <path d="M5 11v.5"/>
                <path d="M5 17v.5"/>
                <path d="M9.5 5h.5"/>
                <path d="M9.5 11h.5"/>
                <path d="M9.5 17h.5"/>
                <path d="M14.5 5h.5"/>
                <path d="M14.5 11h.5"/>
                <path d="M14.5 17h.5"/>
              </svg>
              <p>No active battles right now.</p>
              <Button className="mt-4 bg-gradient-to-r from-warning-600 to-danger-600 hover:from-warning-500 hover:to-danger-500">
                <Link href="/battle-zone">
                  Create Battle
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
