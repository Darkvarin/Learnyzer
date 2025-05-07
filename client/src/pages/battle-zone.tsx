import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getBattleTypeIcon } from "@/lib/utils";
import { Battle } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, History, Sword } from "lucide-react";

export default function BattleZone() {
  const { data: battles, isLoading } = useQuery<{
    active: Battle[],
    upcoming: Battle[],
    past: Battle[]
  }>({
    queryKey: ['/api/battles'],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [battleTitle, setBattleTitle] = useState("");
  const [battleType, setBattleType] = useState("1v1");
  const [battleDuration, setBattleDuration] = useState("20");
  const [battleTopics, setBattleTopics] = useState("");
  
  const joinBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      return apiRequest("POST", `/api/battles/${battleId}/join`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/battles'] });
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
  
  const createBattleMutation = useMutation({
    mutationFn: async (battleData: any) => {
      return apiRequest("POST", "/api/battles", battleData);
    },
    onSuccess: () => {
      setCreateDialogOpen(false);
      setBattleTitle("");
      setBattleType("1v1");
      setBattleDuration("20");
      setBattleTopics("");
      queryClient.invalidateQueries({ queryKey: ['/api/battles'] });
      toast({
        title: "Battle created!",
        description: "Your battle has been created and is open for others to join.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create battle",
        description: "There was an error creating the battle. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleJoinBattle = (battleId: number) => {
    joinBattleMutation.mutate(battleId);
  };
  
  const handleCreateBattle = () => {
    if (!battleTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your battle.",
        variant: "destructive",
      });
      return;
    }
    
    if (!battleTopics.trim()) {
      toast({
        title: "Missing topics",
        description: "Please enter at least one topic for your battle.",
        variant: "destructive",
      });
      return;
    }
    
    createBattleMutation.mutate({
      title: battleTitle,
      type: battleType,
      duration: parseInt(battleDuration),
      topics: battleTopics.split(",").map(topic => topic.trim())
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-gaming">Battle Zone</h1>
            <p className="text-gray-400 mt-1">Compete with other students and earn rewards</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-warning-600 to-danger-600 hover:from-warning-500 hover:to-danger-500">
                <i className="ri-sword-line mr-2"></i>
                Create Battle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-surface border-dark-border">
              <DialogHeader>
                <DialogTitle className="font-gaming">Create a New Battle</DialogTitle>
                <DialogDescription>
                  Set up a battle challenge for other students to join. Your battle will be judged by AI.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Battle Title</label>
                  <Input
                    placeholder="e.g. Physics Challenge"
                    value={battleTitle}
                    onChange={(e) => setBattleTitle(e.target.value)}
                    className="bg-dark-card border-dark-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Battle Type</label>
                  <Select
                    value={battleType}
                    onValueChange={setBattleType}
                  >
                    <SelectTrigger className="bg-dark-card border-dark-border">
                      <SelectValue placeholder="Select battle type" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-surface border-dark-border">
                      <SelectItem value="1v1">1v1 Battle</SelectItem>
                      <SelectItem value="2v2">2v2 Team Battle</SelectItem>
                      <SelectItem value="3v3">3v3 Team Battle</SelectItem>
                      <SelectItem value="4v4">4v4 Team Battle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Select
                    value={battleDuration}
                    onValueChange={setBattleDuration}
                  >
                    <SelectTrigger className="bg-dark-card border-dark-border">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-surface border-dark-border">
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topics (comma-separated)</label>
                  <Input
                    placeholder="e.g. Mechanics, Electromagnetism"
                    value={battleTopics}
                    onChange={(e) => setBattleTopics(e.target.value)}
                    className="bg-dark-card border-dark-border"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                  className="bg-dark-card border-dark-border"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-warning-600 to-danger-600 hover:from-warning-500 hover:to-danger-500"
                  onClick={handleCreateBattle}
                  disabled={createBattleMutation.isPending}
                >
                  Create Battle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-dark-card border border-dark-border w-full justify-start mb-6">
            <TabsTrigger value="active" className="data-[state=active]:bg-primary-600">Active Battles</TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary-600">Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-primary-600">Past Battles</TabsTrigger>
          </TabsList>
          
          {/* Active Battles */}
          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
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
            ) : battles?.active && battles.active.length > 0 ? (
              battles.active.map((battle) => (
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
                          {battle.participants.map((participant, idx) => (
                            <img 
                              key={idx}
                              src={participant.profileImage}
                              alt={participant.name}
                              className="w-6 h-6 rounded-full border border-dark-surface"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {battle.participants.length} players waiting
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span>Topics: </span>
                        <span className="text-white">{battle.topics.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="flex justify-center mb-3">
                  <Sword className="h-12 w-12 opacity-50" />
                </div>
                <p className="text-lg mb-2">No active battles right now</p>
                <p className="text-sm mb-4">Create a battle and invite others to join!</p>
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-warning-600 to-danger-600 hover:from-warning-500 hover:to-danger-500"
                >
                  Create Your First Battle
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Upcoming Battles */}
          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="battle-card rounded-lg p-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ) : battles?.upcoming && battles.upcoming.length > 0 ? (
              battles.upcoming.map((battle) => (
                <div key={battle.id} className="battle-card rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-10 h-10 bg-gradient-to-br ${
                          battle.type.includes('1v1') 
                            ? 'from-warning-600/50 to-danger-600/50' 
                            : 'from-primary-600/50 to-info-600/50'
                        } rounded-md flex items-center justify-center`}>
                          <i className={`${getBattleTypeIcon(battle.type)} text-xl`}></i>
                        </div>
                        <div>
                          <h3 className="font-bold font-gaming">{battle.title}</h3>
                          <p className="text-xs text-gray-400">
                            Starts in {battle.startsIn} · {battle.type} · {battle.duration} mins
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-xs text-gray-400">
                        <span>Topics: </span>
                        <span className="text-white">{battle.topics.join(', ')}</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-primary-600/20 text-primary-400 text-xs">
                        {battle.participants.length} participants
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="flex justify-center mb-3">
                  <Calendar className="h-12 w-12 opacity-50" />
                </div>
                <p>No upcoming battles scheduled</p>
              </div>
            )}
          </TabsContent>
          
          {/* Past Battles */}
          <TabsContent value="past" className="space-y-4">
            {isLoading ? (
              <div className="battle-card rounded-lg p-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ) : battles?.past && battles.past.length > 0 ? (
              battles.past.map((battle) => (
                <div key={battle.id} className="battle-card rounded-lg p-4 opacity-80">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-10 h-10 bg-gradient-to-br ${
                          battle.type.includes('1v1') 
                            ? 'from-warning-600/30 to-danger-600/30' 
                            : 'from-primary-600/30 to-info-600/30'
                        } rounded-md flex items-center justify-center`}>
                          <i className={`${getBattleTypeIcon(battle.type)} text-xl`}></i>
                        </div>
                        <div>
                          <h3 className="font-bold font-gaming">{battle.title}</h3>
                          <p className="text-xs text-gray-400">
                            {new Date(battle.completedAt).toLocaleDateString()} · {battle.type} · {battle.duration} mins
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-xs text-gray-400">
                        <span>Winner: </span>
                        <span className="text-success-400 font-bold">{battle.winner}</span>
                      </div>
                      <Button variant="outline" size="sm" className="bg-dark-card border-dark-border">
                        View Results
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="flex justify-center mb-3">
                  <History className="h-12 w-12 opacity-50" />
                </div>
                <p>You haven't participated in any battles yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
