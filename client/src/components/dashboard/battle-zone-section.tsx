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
    <div className="bg-background/90 rounded-xl overflow-hidden">
      <div className="p-6 relative">
        {/* Home page style corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-purple-500/40"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40"></div>
        
        {/* Home page style energy lines */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
        
        {/* Home page style energy glow */}
        <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-purple-500/5 filter blur-3xl"></div>
        <div className="absolute right-1/3 bottom-0 w-32 h-32 rounded-full bg-primary/5 filter blur-xl"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold font-gaming bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-white" style={{
            textShadow: "0 0 10px rgba(139, 92, 246, 0.3)"
          }}>Battle Zone</h2>
          <div className="flex gap-2">
            <Link href="/battle-zone" className="text-purple-500 hover:text-purple-400 transition-colors duration-300 text-sm flex items-center group">
              Classic Battles
              <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
            <Link href="/battle-zone-enhanced" className="text-orange-500 hover:text-orange-400 transition-colors duration-300 text-sm flex items-center group font-semibold">
              Enhanced 2.0
              <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300">🚀</span>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="relative glassmorphism p-0 overflow-hidden border border-purple-500/20 rounded-lg">
                {/* Home page style corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-purple-500/40"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-purple-500/40"></div>
                <div className="p-4">
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
                  
                  <div className="mt-4 border-t border-purple-500/10 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : battles && battles.length > 0 ? (
            battles.map((battle) => (
              <div key={battle.id} className="relative glassmorphism p-0 overflow-hidden border border-purple-500/20 group transition-all duration-300 hover:-translate-y-1 rounded-lg">
                {/* Home page style corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-purple-500/40"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-purple-500/40"></div>
                
                {/* Home page style energy line */}
                <div className="absolute -top-[1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Background glow effect */}
                <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-purple-500/5 filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="p-4 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-background/80 border border-${
                          battle.type.includes('1v1') 
                            ? 'amber-500/40' 
                            : 'purple-500/40'
                        } rounded-md flex items-center justify-center`}>
                          <i className={`${getBattleTypeIcon(battle.type)} text-xl text-${
                            battle.type.includes('1v1') 
                              ? 'amber-500' 
                              : 'purple-500'
                          }`}></i>
                        </div>
                        <div>
                          <h3 className="font-bold font-gaming">{battle.title}</h3>
                          <p className="text-xs text-gray-400">{battle.type} · {battle.duration} mins · AI Judged</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-background/80 border border-amber-500/20 border-r-0 px-3 py-2 rounded-l-md text-center">
                        <span className="text-xs text-gray-400">Rewards</span>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-amber-400 font-bold">{battle.rewardPoints}</span>
                          <i className="ri-vip-crown-line text-amber-400"></i>
                        </div>
                      </div>
                      <Button 
                        className={`bg-background/80 hover:bg-${
                          battle.type.includes('1v1') 
                            ? 'amber' 
                            : 'purple'
                        }-950/80 border border-${
                          battle.type.includes('1v1') 
                            ? 'amber' 
                            : 'purple'
                        }-500/40 hover:border-${
                          battle.type.includes('1v1') 
                            ? 'amber' 
                            : 'purple'
                        }-400/60 text-${
                          battle.type.includes('1v1') 
                            ? 'amber' 
                            : 'purple'
                        }-400 hover:text-${
                          battle.type.includes('1v1') 
                            ? 'amber' 
                            : 'purple'
                        }-300 transition-all duration-300 rounded-r-md h-full`}
                        onClick={() => handleJoinBattle(battle.id)}
                        disabled={joinBattleMutation.isPending}
                      >
                        Join Battle
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t border-purple-500/10 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          {battle.participants && battle.participants.length > 0 ? (
                            battle.participants.map((participant, idx) => (
                              <div 
                                key={idx}
                                className="w-6 h-6 rounded-full bg-background/80 border border-purple-500/30 flex items-center justify-center text-xs"
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
                            <div className="w-6 h-6 rounded-full bg-background/80 border border-purple-500/30" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {battle.participants && battle.participants.length || 0} players waiting
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span>Topics: </span>
                        <span className="text-purple-400">{battle.topics ? Array.isArray(battle.topics) ? battle.topics.join(', ') : battle.topics : 'Subject Topics'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glassmorphism py-10 px-6 relative">
              {/* Home page style corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-purple-500/40"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-purple-500/40"></div>
              
              {/* Home page style energy lines */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
              <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
              
              {/* Home page style energy glow */}
              <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-purple-500/5 filter blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-3 rounded-full bg-background/80 border border-purple-500/40 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
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
                </div>
                <p className="text-purple-400/90 font-gaming mb-2">No active battles right now</p>
                <p className="text-sm text-gray-400 max-w-md mb-6">Start a new battle or check back later for active battles</p>
                <Link href="/battle-zone">
                  <Button className="bg-background/80 hover:bg-purple-950/80 border border-purple-500/40 hover:border-purple-400/60 text-purple-400 hover:text-purple-300 transition-all duration-300 group">
                    <span>Create Battle</span>
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
