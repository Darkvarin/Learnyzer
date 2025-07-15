import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getBattleTypeIcon } from "@/lib/utils";
import { Battle, Tournament, PowerUp } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, History, Sword, Eye, Trophy, Zap, Users, Target, Clock, Star, Shield, Flame, Crown, Award, Bot } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BattleDetail } from "@/components/battle/battle-detail";

interface EnhancedBattle extends Battle {
  format?: string;
  difficulty?: string;
  examType?: string;
  subject?: string;
  entryFee?: number;
  prizePool?: number;
  maxParticipants?: number;
  battleMode?: string;
  spectatorMode?: boolean;
  questionsCount?: number;
  participants?: any[];
  spectatorCount?: number;
}

export default function BattleZoneEnhanced() {
  const [selectedBattle, setSelectedBattle] = useState<EnhancedBattle | null>(null);
  const [activeTab, setActiveTab] = useState("battles");
  
  const { data: battlesData, isLoading } = useQuery<{
    active: EnhancedBattle[],
    upcoming: EnhancedBattle[],
    past: EnhancedBattle[]
  }>({
    queryKey: ['/api/enhanced-battles'],
  });

  const { data: tournaments, isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  const { data: powerUps, isLoading: powerUpsLoading } = useQuery<PowerUp[]>({
    queryKey: ['/api/power-ups'],
  });

  const { data: userPowerUps } = useQuery({
    queryKey: ['/api/user/power-ups'],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [battleForm, setBattleForm] = useState({
    title: "",
    type: "1v1",
    format: "standard",
    difficulty: "intermediate",
    examType: "",
    subject: "",
    duration: "20",
    topics: "",
    maxParticipants: "2", // Fixed: 1v1 should have 2 participants
    battleMode: "public",
    spectatorMode: true,
    questionsCount: "1"
  });

  const joinBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      return apiRequest("POST", `/api/enhanced-battles/${battleId}/join`, {});
    },
    onSuccess: async (data, battleId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-battles'] });
      
      // Fetch the updated battle details and auto-open the battle interface
      try {
        const battleResponse = await apiRequest("GET", `/api/enhanced-battles/${battleId}`);
        const joinedBattle = battleResponse;
        
        // Auto-open the battle interface immediately after joining
        setSelectedBattle(joinedBattle);
        
        toast({
          title: "Battle joined!",
          description: "Opening battle interface now...",
        });
      } catch (error) {
        console.error("Error fetching battle details:", error);
        toast({
          title: "Battle joined!",
          description: "Get ready to compete. The battle will start soon.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join battle",
        description: error.message || "There was an error joining the battle.",
        variant: "destructive",
      });
    }
  });

  const spectateBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      return apiRequest("POST", `/api/enhanced-battles/${battleId}/spectate`, {});
    },
    onSuccess: () => {
      toast({
        title: "Now spectating!",
        description: "You're now watching this battle as a spectator.",
      });
    }
  });

  // Calculate entry fee and prize pool automatically with coin system
  const getEntryFeeCoins = () => 10; // Fixed coin entry fee (reduced to 10)
  const getPrizePoolCoins = () => parseInt(battleForm.maxParticipants) * 10; // Winner takes all coins

  // Demo battle function for testing UI without other players
  const createDemoBattleMutation = useMutation({
    mutationFn: async (battleType: string) => {
      return apiRequest("POST", "/api/demo-battles", {
        type: battleType,
        examType: "JEE",
        subject: "Physics", 
        difficulty: "intermediate"
      });
    },
    onSuccess: (data: any, battleType: string) => {
      toast({
        title: "Demo Battle Created!",
        description: `${battleType} demo battle started with AI bots. Opening battle now...`,
      });
      
      // Close the demo dialog
      setCreateDialogOpen(false);
      setActiveTab("battles");
      
      // Automatically open the created demo battle
      if (data && data.battleId) {
        // Create a demo battle object to set as selected
        const demoBattle: EnhancedBattle = {
          id: data.battleId,
          title: `Demo ${battleType} Battle - Physics`,
          type: battleType,
          format: "standard",
          difficulty: "intermediate",
          examType: "JEE",
          subject: "Physics",
          duration: 5,
          topics: ["Physics"],
          rewardPoints: 0,
          entryFee: 0,
          prizePool: 0,
          maxParticipants: data.participants || 2,
          battleMode: "public",
          spectatorMode: true,
          questionsCount: 1,
          status: "in_progress",
          participants: [],
          spectatorCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 999
        };
        setSelectedBattle(demoBattle);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-battles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Demo Battle Failed",
        description: error.message || "Could not create demo battle.",
        variant: "destructive",
      });
    }
  });

  const createDemoBattle = (battleType: string) => {
    createDemoBattleMutation.mutate(battleType);
  };

  const createBattleMutation = useMutation({
    mutationFn: async (battleData: any) => {
      // Add calculated values to battle data
      const enhancedBattleData = {
        ...battleData,
        entryFee: getEntryFeeCoins(), // Now in coins
        prizePool: getPrizePoolCoins(), // Coins prize pool
        topics: battleData.topics.split(',').map((t: string) => t.trim()).filter(Boolean)
      };
      return apiRequest("POST", "/api/enhanced-battles", enhancedBattleData);
    },
    onSuccess: () => {
      setCreateDialogOpen(false);
      setBattleForm({
        title: "",
        type: "1v1",
        format: "standard",
        difficulty: "intermediate",
        examType: "",
        subject: "",
        duration: "20",
        topics: "",
        entryFee: "0",
        prizePool: "0",
        maxParticipants: "8",
        battleMode: "public",
        spectatorMode: true,
        questionsCount: "1"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-battles'] });
      toast({
        title: "Enhanced battle created!",
        description: "Your advanced battle challenge is ready for participants.",
      });
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-400 bg-green-400/10";
      case "intermediate": return "text-yellow-400 bg-yellow-400/10";
      case "advanced": return "text-orange-400 bg-orange-400/10";
      case "expert": return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "blitz": return <Zap className="w-4 h-4" />;
      case "endurance": return <Clock className="w-4 h-4" />;
      case "exam_simulation": return <Target className="w-4 h-4" />;
      default: return <Sword className="w-4 h-4" />;
    }
  };

  const formatTopics = (topics: unknown): string => {
    if (Array.isArray(topics)) {
      return topics.join(', ');
    }
    return String(topics || '');
  };

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'PPp');
    } catch (error) {
      return String(dateString);
    }
  };

  const BattleCard = ({ battle }: { battle: EnhancedBattle }) => (
    <Card className="bg-background/90 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 group relative overflow-hidden">
      {/* Animated border glow - with pointer-events-none */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Corner decorations - with pointer-events-none */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500/40 group-hover:border-cyan-400/60 transition-colors pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500/40 group-hover:border-cyan-400/60 transition-colors pointer-events-none" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-gaming bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {battle.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`${getDifficultyColor(battle.difficulty || 'intermediate')} border-current`}>
                {battle.difficulty || 'Intermediate'}
              </Badge>
              {battle.examType && (
                <Badge variant="outline" className="text-purple-400 bg-purple-400/10 border-purple-400/30">
                  {battle.examType}
                </Badge>
              )}
              {battle.subject && (
                <Badge variant="outline" className="text-blue-400 bg-blue-400/10 border-blue-400/30">
                  {battle.subject}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getFormatIcon(battle.format || 'standard')}
            <span className="text-xs text-gray-400 capitalize">{battle.format || 'Standard'}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{battle.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{battle.duration} mins</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>{battle.questionsCount || 1} question{(battle.questionsCount || 1) > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{battle.rewardPoints} XP</span>
            </div>
            {battle.entryFee && battle.entryFee > 0 && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span>{battle.entryFee} XP fee</span>
              </div>
            )}
            {battle.prizePool && battle.prizePool > 0 && (
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-gold-400" />
                <span>{battle.prizePool} XP pool</span>
              </div>
            )}
          </div>
        </div>

        {battle.topics && (
          <div className="space-y-1">
            <span className="text-xs text-gray-400">Topics:</span>
            <p className="text-sm text-gray-300">{formatTopics(battle.topics)}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">{battle.participants?.length || 0}/{battle.maxParticipants || 8}</span>
            </div>
            {battle.spectatorMode && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-sm">{battle.spectatorCount || 0} watching</span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative z-50" style={{ pointerEvents: 'auto' }}>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("View button clicked for battle:", battle.id, battle);
                setSelectedBattle(battle);
              }}
              className="bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/20 text-gray-400 relative z-50 flex-1 sm:flex-initial"
              style={{ pointerEvents: 'auto' }}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Watch button clicked for battle:", battle.id);
                spectateBattleMutation.mutate(battle.id);
              }}
              className="bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-400 relative z-50 flex-1 sm:flex-initial"
              style={{ pointerEvents: 'auto' }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Watch
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Join Battle button clicked for battle:", battle.id, battle);
                console.log("Current selectedBattle state before join:", selectedBattle);
                joinBattleMutation.mutate(battle.id);
              }}
              disabled={joinBattleMutation.isPending}
              className="bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-600/90 hover:to-blue-600/90 relative z-50 flex-1 sm:flex-initial"
              style={{ pointerEvents: 'auto' }}
            >
              <Sword className="w-4 h-4 mr-1" />
              Join Battle
            </Button>
          </div>
        </div>

        {battle.participants && battle.participants.length > 0 && (
          <div className="space-y-2">
            <Progress value={(battle.participants.length / (battle.maxParticipants || 8)) * 100} className="h-2" />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>Participants:</span>
              <div className="flex gap-1">
                {battle.participants.slice(0, 3).map((p: any, i: number) => (
                  <span key={i} className="text-cyan-400">{p.name}</span>
                ))}
                {battle.participants.length > 3 && <span>+{battle.participants.length - 3} more</span>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const handleCloseBattleDetail = () => {
    setSelectedBattle(null);
  };

  // Get the battle detail from our current data or fetch it
  const battleToShow = selectedBattle ? 
    (activeBattles?.find(b => b.id === selectedBattle.id) || selectedBattle) : 
    null;

  console.log("Current selectedBattle:", selectedBattle);
  console.log("Battle to show:", battleToShow);

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white relative overflow-hidden">
      {/* Enhanced background with cyberpunk aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
      
      {/* Animated grid overlay */}
      <div className="absolute inset-0 bg-grid-small-white/[0.1] animate-pulse"></div>
      
      {/* Dynamic glow effects */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 -left-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl animate-pulse delay-2000"></div>
      
      {/* Enhanced corner accents */}
      <div className="absolute top-20 left-6 w-32 h-32 border-t border-l border-cyan-500/20"></div>
      <div className="absolute bottom-10 right-6 w-32 h-32 border-b border-r border-cyan-500/20"></div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-2 md:px-4 pt-20 pb-20 md:pt-24 md:pb-6 relative z-10">
        {battleToShow ? (
          <div>
            <div className="text-white mb-4 p-4 bg-green-500/20 rounded">
              DEBUG: Battle detail opening for battle ID: {battleToShow.id}, title: {battleToShow.title}
            </div>
            <BattleDetail 
              battle={battleToShow}
              onClose={handleCloseBattleDetail}
            />
          </div>
        ) : (
        <>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl">
                <Sword className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold font-gaming bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Battle Zone 2.0
                </h1>
                <p className="text-gray-300 mt-1 text-sm md:text-base">Enhanced competitive exam challenges with advanced features</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">Power-ups enabled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Spectator mode</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-gold-400" />
                <span className="text-gray-300">Tournament system</span>
              </div>
            </div>
          </div>
      
          <Dialog open={createDialogOpen && activeTab === "create"} onOpenChange={(open) => {
            if (!open) setActiveTab("battles");
            setCreateDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button 
                className="mt-4 md:mt-0 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-gaming text-sm md:text-base px-3 md:px-4"
                onClick={() => {
                  setActiveTab("create");
                  setCreateDialogOpen(true);
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Enhanced Battle</span>
                <span className="sm:hidden">Create Battle</span>
              </Button>
            </DialogTrigger>
          </Dialog>

          {/* Demo Battle Button */}
          <Dialog open={createDialogOpen && activeTab === "demo"} onOpenChange={(open) => {
            if (!open) setActiveTab("battles");
            setCreateDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button 
                className="mt-4 md:mt-0 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-gaming text-sm md:text-base px-3 md:px-4"
                onClick={() => {
                  setActiveTab("demo");
                  setCreateDialogOpen(true);
                }}
              >
                <Bot className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Demo Battle (Practice)</span>
                <span className="sm:hidden">Demo Battle</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-sm border border-cyan-500/30">
              <DialogHeader>
                <DialogTitle className="font-gaming text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Create Enhanced Battle Challenge
                </DialogTitle>
                <DialogDescription>
                  Set up an advanced competitive exam challenge with power-ups, spectator mode, and advanced scoring.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Battle Title</label>
                  <Input
                    placeholder="e.g. JEE Advanced Physics Challenge"
                    value={battleForm.title}
                    onChange={(e) => setBattleForm({...battleForm, title: e.target.value})}
                    className="bg-background/40 border-cyan-500/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Battle Type</label>
                  <Select value={battleForm.type} onValueChange={(value) => {
                    // Auto-update maxParticipants based on battle type
                    const maxParticipants = value === "1v1" ? "2" : value === "2v2" ? "4" : value === "3v3" ? "6" : "8";
                    setBattleForm({...battleForm, type: value, maxParticipants});
                  }}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1v1">1v1 Duel (2 players)</SelectItem>
                      <SelectItem value="2v2">2v2 Team Battle (4 players)</SelectItem>
                      <SelectItem value="3v3">3v3 Squad Battle (6 players)</SelectItem>
                      <SelectItem value="4v4">4v4 Guild War (8 players)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Battle Format</label>
                  <Select value={battleForm.format} onValueChange={(value) => setBattleForm({...battleForm, format: value})}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="blitz">Blitz (Fast-paced)</SelectItem>
                      <SelectItem value="endurance">Endurance (Long)</SelectItem>
                      <SelectItem value="exam_simulation">Exam Simulation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select value={battleForm.difficulty} onValueChange={(value) => setBattleForm({...battleForm, difficulty: value})}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Exam Type</label>
                  <Select value={battleForm.examType} onValueChange={(value) => setBattleForm({...battleForm, examType: value})}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE">JEE Main/Advanced</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="UPSC">UPSC</SelectItem>
                      <SelectItem value="CLAT">CLAT</SelectItem>
                      <SelectItem value="CUET">CUET</SelectItem>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="CGLE">CGLE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="e.g. Physics, Chemistry, Mathematics"
                    value={battleForm.subject}
                    onChange={(e) => setBattleForm({...battleForm, subject: e.target.value})}
                    className="bg-background/40 border-cyan-500/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Select value={battleForm.duration} onValueChange={(value) => setBattleForm({...battleForm, duration: value})}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes (Blitz)</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="120">2 hours (Endurance)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Questions Count</label>
                  <Select value={battleForm.questionsCount} onValueChange={(value) => setBattleForm({...battleForm, questionsCount: value})}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Question</SelectItem>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-400">Entry Fee</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-yellow-400">10</span>
                      <span className="text-yellow-400 text-sm">🪙</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Coins required to enter battle</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-400">Prize Pool</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-yellow-400">{parseInt(battleForm.maxParticipants) * 10}</span>
                        <span className="text-yellow-400 text-sm">🪙</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Winner takes all coins</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Participants</label>
                  <Select value={battleForm.maxParticipants} onValueChange={(value) => setBattleForm({...battleForm, maxParticipants: value})} disabled={true}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30 opacity-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                      <SelectItem value="8">8 Players</SelectItem>
                      <SelectItem value="16">16 Players</SelectItem>
                      <SelectItem value="32">32 Players</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Automatically set based on battle type</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Battle Mode</label>
                  <Select value={battleForm.battleMode} onValueChange={(value) => setBattleForm({...battleForm, battleMode: value})}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (Anyone can join)</SelectItem>
                      <SelectItem value="private">Private (Invite only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Topics (comma-separated)</label>
                  <Input
                    placeholder="e.g. Kinematics, Forces, Energy, Momentum"
                    value={battleForm.topics}
                    onChange={(e) => setBattleForm({...battleForm, topics: e.target.value})}
                    className="bg-background/40 border-cyan-500/30"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createBattleMutation.mutate({
                    ...battleForm,
                    duration: parseInt(battleForm.duration),
                    entryFee: parseInt(battleForm.entryFee),
                    prizePool: parseInt(battleForm.prizePool),
                    maxParticipants: parseInt(battleForm.maxParticipants),
                    questionsCount: parseInt(battleForm.questionsCount),
                    topics: battleForm.topics.split(",").map(topic => topic.trim()).filter(Boolean)
                  })}
                  disabled={createBattleMutation.isPending}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Create Battle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Demo Battle Dialog - Separate dialog */}
          <Dialog open={createDialogOpen && activeTab === "demo"} onOpenChange={(open) => {
            if (!open) setActiveTab("battles");
            setCreateDialogOpen(open);
          }}>
            <DialogContent className="max-w-md bg-background/95 backdrop-blur-sm border border-orange-500/30">
              <DialogHeader>
                <DialogTitle className="font-gaming text-xl bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Demo Battle Mode
                </DialogTitle>
                <DialogDescription>
                  Practice with AI bot opponents to test your skills and explore the battle interface without spending coins.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="w-6 h-6 text-orange-400" />
                    <span className="font-semibold text-orange-400">AI Practice Mode</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• No coin cost - completely free</li>
                    <li>• Battle against smart AI opponents</li>
                    <li>• Test all battle features and UI</li>
                    <li>• Perfect for learning the system</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    onClick={() => createDemoBattle("1v1")}
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    1v1 Demo
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
                    onClick={() => createDemoBattle("2v2")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    2v2 Demo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background/40 border border-cyan-500/30 w-full justify-start mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
            <TabsTrigger value="battles" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs md:text-sm">
              <Sword className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Battles</span>
              <span className="sm:hidden">Battle</span>
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-xs md:text-sm">
              <Trophy className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Tournaments</span>
              <span className="sm:hidden">Tours</span>
            </TabsTrigger>
            <TabsTrigger value="powerups" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-xs md:text-sm">
              <Zap className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Power-ups</span>
              <span className="sm:hidden">Power</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-xs md:text-sm">
              <History className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">Hist</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Enhanced Battles Tab */}
          <TabsContent value="battles" className="space-y-6">
            <div className="grid gap-6">
              {/* Active Battles */}
              <div className="space-y-4">
                <h3 className="text-xl font-gaming text-cyan-400 flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Live Battles
                </h3>
                {isLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-64 rounded-lg" />
                    ))}
                  </div>
                ) : battlesData?.active && battlesData.active.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {battlesData.active.map((battle) => (
                      <BattleCard key={battle.id} battle={battle} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-background/40 border-cyan-500/20 text-center py-8">
                    <CardContent>
                      <Sword className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No active battles right now.</p>
                      <p className="text-sm text-gray-500 mt-2">Create a new battle to start competing!</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Upcoming Battles */}
              {battlesData?.upcoming && battlesData.upcoming.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-gaming text-purple-400 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Scheduled Battles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {battlesData.upcoming.map((battle) => (
                      <BattleCard key={battle.id} battle={battle} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gold-400 mx-auto mb-4" />
              <h3 className="text-2xl font-gaming text-gold-400 mb-2">Tournament System</h3>
              <p className="text-gray-400 mb-4">Compete in multi-stage tournaments for ultimate glory!</p>
              <Badge variant="outline" className="text-gold-400 bg-gold-400/10 border-gold-400/30">
                Coming Soon
              </Badge>
            </div>
          </TabsContent>

          {/* Power-ups Tab */}
          <TabsContent value="powerups" className="space-y-6">
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-gaming text-orange-400 mb-2">Power-up Store</h3>
              <p className="text-gray-400 mb-4">Enhance your battle performance with strategic power-ups!</p>
              <Badge variant="outline" className="text-orange-400 bg-orange-400/10 border-orange-400/30">
                Coming Soon
              </Badge>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {battlesData?.past && battlesData.past.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {battlesData.past.map((battle) => (
                  <BattleCard key={battle.id} battle={battle} />
                ))}
              </div>
            ) : (
              <Card className="bg-background/40 border-blue-500/20 text-center py-8">
                <CardContent>
                  <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No battle history yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Join some battles to see your competition history!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </>
        )}
      </main>
    </div>
  );
}