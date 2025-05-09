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
import { Calendar, History, Sword, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { BattleDetail } from "@/components/battle/battle-detail";

export default function BattleZone() {
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const { data: battles, isLoading } = useQuery<{
    active: Battle[],
    upcoming: Battle[],
    past: Battle[]
  }>({
    queryKey: ['/api/battles'],
  });
  
  // Fetch specific battle details when selected
  const { data: battleDetail, isLoading: isLoadingBattleDetail } = useQuery<Battle>({
    queryKey: [`/api/battles/${selectedBattle?.id}`],
    enabled: !!selectedBattle,
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
  
  const handleViewBattle = (battle: Battle) => {
    setSelectedBattle(battle);
  };
  
  const handleCloseBattleDetail = () => {
    setSelectedBattle(null);
    queryClient.invalidateQueries({ queryKey: ['/api/battles'] });
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

  // Helper function to safely format battle topics
  const formatTopics = (topics: unknown): string => {
    if (Array.isArray(topics)) {
      return topics.join(', ');
    }
    return String(topics || '');
  };

  // Helper function to safely format dates
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'PPp');
    } catch (error) {
      return String(dateString);
    }
  };

  return (
    <div className="min-h-screen flex flex-col futuristic-bg relative overflow-hidden">
      {/* Modern cyberpunk grid background with subtle Solo Leveling accents */}
      <div className="absolute inset-0 cyber-grid z-0 opacity-20"></div>
      
      {/* Minimal energy flow line - subtle Solo Leveling accent */}
      <div className="absolute h-full w-full overflow-hidden z-0">
        <div className="energy-flow-horizontal top-2/3 opacity-30"></div>
      </div>
      
      {/* Cyberpunk corner elements from home page */}
      <div className="absolute top-24 right-20 w-40 h-40 border-t-2 border-r-2 border-purple-500/20 z-0"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 border-b-2 border-l-2 border-cyan-500/20 z-0"></div>
      
      {/* Circuit lines from home page - tech aesthetic */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.07] z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,30 L40,40 L60,40 L100,30" stroke="rgba(125, 39, 255, 0.3)" strokeWidth="0.2" fill="none" />
        <path d="M0,60 L30,70 L70,70 L100,60" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.2" fill="none" />
        <path d="M25,0 L25,100" stroke="rgba(125, 39, 255, 0.2)" strokeWidth="0.1" fill="none" />
        <path d="M75,0 L75,100" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.1" fill="none" />
      </svg>
      
      {/* Solo Leveling hex pattern - reduced but maintained for battle theme */}
      <div className="absolute top-40 right-10 z-0 opacity-30">
        <div className="hex-grid">
          <div className="hex-cell"></div>
        </div>
      </div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-20 md:pt-24 md:pb-6 relative z-10">
        {selectedBattle && battleDetail ? (
          <BattleDetail 
            battle={battleDetail}
            onClose={handleCloseBattleDetail}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold font-gaming relative inline-block" style={{
                  textShadow: "0 0 10px rgba(6, 182, 212, 0.3), 0 0 15px rgba(125, 39, 255, 0.2)"
                }}>
                  Battle Zone
                  {/* Solo Leveling underline effect */}
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></span>
                </h1>
                <p className="text-gray-300 mt-2 pl-1 flex items-center">
                  <Sword className="w-4 h-4 text-cyan-500 mr-2" />
                  Compete with other students to rank up and earn rewards
                </p>
              </div>
          
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4 md:mt-0 bg-gradient-to-r from-warning-600 to-danger-600 hover:from-warning-500 hover:to-danger-500">
                    <Sword className="w-4 h-4 mr-2" />
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
                    <div key={battle.id} className="battle-card glassmorphism rounded-lg p-4 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                      {/* Cyberpunk corner decorations with subtle Solo Leveling influence */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-purple-500/30 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-purple-500/30 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Subtle energy glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                      
                      {/* Battle energy pulse - only visible on hover */}
                      <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-purple-500/10 filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div>
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 relative flex items-center justify-center`}>
                              {/* Solo Leveling hexagon clip frame */}
                              <div className="absolute inset-0 hex-clip-sm overflow-hidden">
                                <div className={`w-full h-full bg-gradient-to-br ${
                                  battle.type.includes('1v1') 
                                    ? 'from-cyan-600 to-primary-600' 
                                    : 'from-cyan-600 to-blue-600'
                                } flex items-center justify-center`}>
                                  {/* Animated energy */}
                                  <div className="absolute inset-0 w-full h-full opacity-20">
                                    <div className="absolute inset-0 solo-monarch-insignia"></div>
                                  </div>
                                </div>
                              </div>
                              <Sword className="h-5 w-5 text-white relative z-10" />
                            </div>
                            <div>
                              <h3 className="font-bold font-gaming text-white">{battle.title}</h3>
                              <p className="text-xs text-cyan-400/80">{battle.type} · {battle.duration} mins · AI Judged</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-background/50 border-l border-t border-b border-cyan-500/30 px-3 py-2 rounded-l-md text-center">
                            <span className="text-xs text-cyan-400/70">Rewards</span>
                            <div className="flex items-center space-x-1 mt-1">
                              <span className="text-primary font-bold">{battle.rewardPoints}</span>
                              <span className="text-primary">RP</span>
                            </div>
                          </div>
                          <Button 
                            className={`flex items-center justify-center border-t border-r border-b border-cyan-500/30 ${
                              battle.type.includes('1v1') 
                                ? 'bg-gradient-to-r from-cyan-600/80 to-primary/80 hover:from-cyan-600/90 hover:to-primary/90' 
                                : 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-600/90 hover:to-blue-600/90'
                            } text-white font-bold py-2 px-4 rounded-r-md transition-all duration-300 h-full shadow-glow`}
                            onClick={() => handleJoinBattle(battle.id)}
                            disabled={joinBattleMutation.isPending}
                          >
                            Join Battle
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-cyan-500/20 relative">
                        {/* Solo Leveling energy line */}
                        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent"></div>
                        
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
                          <div className="flex items-center space-x-3">
                            <div className="text-xs text-gray-400">
                              <span>Topics: </span>
                              <span className="text-white">{battle.topics ? Array.isArray(battle.topics) ? 
                                formatTopics(battle.topics) : 
                                typeof battle.topics === 'string' ? battle.topics : 'Subject Topics' : 'Subject Topics'}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-dark-card border-dark-border"
                              onClick={() => handleViewBattle(battle)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
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
                    <div key={battle.id} className="battle-card glassmorphism rounded-lg p-4 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                      {/* Cyberpunk corner decorations with subtle Solo Leveling influence */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-amber-500/30 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-amber-500/30 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Subtle calendar reminder glow */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-warning-500/5 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 relative flex items-center justify-center">
                              {/* Calendar icon with cyberpunk styling */}
                              <div className="absolute inset-0 rounded-md border border-amber-500/40 bg-gradient-to-br from-transparent to-amber-900/20 overflow-hidden flex items-center justify-center"></div>
                              <Calendar className="h-5 w-5 text-amber-400 relative z-10" />
                            </div>
                            <div>
                              <h3 className="font-bold font-gaming text-white">{battle.title}</h3>
                              <p className="text-xs text-amber-400/80">{battle.type} · {battle.duration} mins · Starts in {battle.startsIn}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            className="bg-dark-card border-dark-border text-sm"
                            onClick={() => handleViewBattle(battle)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
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
                              {battle.participants && battle.participants.length || 0} players registered
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-xs text-gray-400">
                              <span>Topics: </span>
                              <span className="text-white">{battle.topics ? Array.isArray(battle.topics) ? 
                                formatTopics(battle.topics) : 
                                typeof battle.topics === 'string' ? battle.topics : 'Subject Topics' : 'Subject Topics'}</span>
                            </div>
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
                    <div key={battle.id} className="battle-card glassmorphism rounded-lg p-4 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                      {/* Subtle cyberpunk corner decorations */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-gray-500/30 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-gray-500/30 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Very subtle history glow */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-gray-500/5 via-transparent to-gray-500/5 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 relative flex items-center justify-center">
                              {/* History icon with subtle styling */}
                              <div className="absolute inset-0 rounded-md border border-gray-500/30 bg-gradient-to-br from-transparent to-gray-800/20 overflow-hidden flex items-center justify-center"></div>
                              <History className="h-5 w-5 text-gray-400 relative z-10" />
                            </div>
                            <div>
                              <h3 className="font-bold font-gaming text-gray-300">{battle.title}</h3>
                              <p className="text-xs text-gray-400">{battle.type} · {battle.duration} mins · {formatDate(battle.completedAt)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {battle.winner && (
                            <div className="bg-warning-500/10 border border-warning-500/30 rounded-md px-3 py-1">
                              <span className="text-xs text-warning-400">Winner: {battle.winner}</span>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            className="bg-dark-card border-dark-border text-sm"
                            onClick={() => handleViewBattle(battle)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Results
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
                                    className="w-6 h-6 rounded-full bg-dark-card border border-dark-surface flex items-center justify-center text-xs opacity-70"
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
                                <div className="w-6 h-6 rounded-full bg-dark-card border border-dark-surface opacity-70" />
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {battle.participants && battle.participants.length || 0} participants
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            <span>Topics: </span>
                            <span className="text-gray-300">{battle.topics ? Array.isArray(battle.topics) ? 
                              formatTopics(battle.topics) : 
                              typeof battle.topics === 'string' ? battle.topics : 'Subject Topics' : 'Subject Topics'}</span>
                          </div>
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
          </>
        )}
      </main>
    </div>
  );
}