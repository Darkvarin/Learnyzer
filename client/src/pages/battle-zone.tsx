import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Sword, Plus, Users, Clock, Target, Trophy, Flame } from "lucide-react";

export default function BattleZone() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [battleForm, setBattleForm] = useState({
    title: "",
    type: "1v1",
    examType: "JEE",
    subject: "",
    duration: "10",
    difficulty: "intermediate",
    maxParticipants: "2"
  });

  // Fetch battles
  const { data: battles, isLoading } = useQuery({
    queryKey: ["/api/enhanced-battles"],
  });

  // Create battle mutation
  const createBattleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/enhanced-battles", data),
    onSuccess: () => {
      toast({
        title: "Battle Created!",
        description: "Your battle has been created successfully.",
      });
      setCreateDialogOpen(false);
      setBattleForm({
        title: "",
        type: "1v1",
        examType: "JEE",
        subject: "",
        duration: "10",
        difficulty: "intermediate",
        maxParticipants: "2"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-battles"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create battle",
        variant: "destructive",
      });
    },
  });

  // Join battle mutation
  const joinBattleMutation = useMutation({
    mutationFn: (battleId: number) => apiRequest("POST", `/api/enhanced-battles/${battleId}/join`),
    onSuccess: () => {
      toast({
        title: "Joined Battle!",
        description: "You have successfully joined the battle.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-battles"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join battle",
        variant: "destructive",
      });
    },
  });

  const handleCreateBattle = () => {
    createBattleMutation.mutate({
      ...battleForm,
      duration: parseInt(battleForm.duration),
      maxParticipants: parseInt(battleForm.maxParticipants),
      entryFee: 25,
      prizePool: parseInt(battleForm.maxParticipants) * 25,
    });
  };

  const handleJoinBattle = (battleId: number) => {
    joinBattleMutation.mutate(battleId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <Header />
        <MobileNavigation />
        <div className="pt-20 px-4">
          <div className="text-center py-12">
            <div className="text-white">Loading battles...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-purple-500/10 filter blur-[80px] animate-pulse z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-blue-500/10 filter blur-[100px] animate-pulse z-0"></div>
      
      {/* Circuit lines */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.07] z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,30 L40,40 L60,40 L100,30" stroke="rgba(125, 39, 255, 0.3)" strokeWidth="0.2" fill="none" />
        <path d="M0,60 L30,70 L70,70 L100,60" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.2" fill="none" />
        <path d="M25,0 L25,100" stroke="rgba(125, 39, 255, 0.2)" strokeWidth="0.1" fill="none" />
        <path d="M75,0 L75,100" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.1" fill="none" />
      </svg>

      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-2 md:px-4 pt-20 pb-20 md:pt-24 md:pb-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl">
                <Sword className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Battle Zone
                </h1>
                <p className="text-gray-300 text-sm md:text-base">Compete with students in academic battles</p>
              </div>
            </div>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Create Battle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md glassmorphism border-cyan-500/30">
              <DialogHeader>
                <DialogTitle className="text-cyan-400">Create New Battle</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Title</label>
                  <Input
                    placeholder="e.g. JEE Physics Challenge"
                    value={battleForm.title}
                    onChange={(e) => setBattleForm({...battleForm, title: e.target.value})}
                    className="bg-gray-800/50 border-gray-600/50 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300">Type</label>
                  <Select value={battleForm.type} onValueChange={(value) => {
                    const maxParticipants = value === "1v1" ? "2" : value === "2v2" ? "4" : "8";
                    setBattleForm({...battleForm, type: value, maxParticipants});
                  }}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1v1">1v1 (2 players)</SelectItem>
                      <SelectItem value="2v2">2v2 (4 players)</SelectItem>
                      <SelectItem value="group">Group (8 players)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Exam Type</label>
                  <Select value={battleForm.examType} onValueChange={(value) => setBattleForm({...battleForm, examType: value})}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE">JEE</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="UPSC">UPSC</SelectItem>
                      <SelectItem value="CLAT">CLAT</SelectItem>
                      <SelectItem value="CUET">CUET</SelectItem>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="CGLE">CGLE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Subject</label>
                  <Input
                    placeholder="e.g. Physics, Chemistry"
                    value={battleForm.subject}
                    onChange={(e) => setBattleForm({...battleForm, subject: e.target.value})}
                    className="bg-gray-800/50 border-gray-600/50 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Duration</label>
                  <Select value={battleForm.duration} onValueChange={(value) => setBattleForm({...battleForm, duration: value})}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Difficulty</label>
                  <Select value={battleForm.difficulty} onValueChange={(value) => setBattleForm({...battleForm, difficulty: value})}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateBattle}
                  disabled={createBattleMutation.isPending || !battleForm.title || !battleForm.subject}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                >
                  {createBattleMutation.isPending ? "Creating..." : "Create Battle"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Battles */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5" />
            Active Battles
          </h2>
          
          {battles?.active?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {battles.active.map((battle: any) => (
                <div key={battle.id} className="group relative glassmorphism border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 p-6 rounded-xl hover:shadow-lg hover:shadow-cyan-500/10">
                  {/* Glowing effect on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600/0 via-cyan-600/20 to-purple-600/0 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white">{String(battle.title || 'Untitled Battle')}</h3>
                      <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-400/10">
                        {String(battle.status || 'Active')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>{String(battle.type || 'Unknown')} • {String(battle.examType || 'Unknown')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{String(battle.duration || 'Unknown')} minutes • {String(battle.difficulty || 'Unknown')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Target className="w-4 h-4" />
                        <span>{String(battle.subject || 'Unknown')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm">
                        <span className="text-gray-400">Participants: </span>
                        <span className="text-cyan-400">{String(battle.participants || 0)}/{String(battle.maxParticipants || 0)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Prize: </span>
                        <span className="text-yellow-400">{String(battle.prizePool || 0)} XP</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleJoinBattle(battle.id)}
                      disabled={joinBattleMutation.isPending || (battle.participants >= battle.maxParticipants)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all duration-300"
                    >
                      {(battle.participants >= battle.maxParticipants) ? "Battle Full" : joinBattleMutation.isPending ? "Joining..." : "Join Battle"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glassmorphism border border-gray-500/30 rounded-xl">
              <Sword className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No active battles right now</p>
              <p className="text-sm text-gray-500">Create a new battle to start competing!</p>
            </div>
          )}
        </div>

        {/* Past Battles */}
        {battles?.past?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Battle History
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {battles.past.slice(0, 6).map((battle: any) => (
                <div key={battle.id} className="glassmorphism border border-purple-500/30 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">{String(battle.title || 'Untitled Battle')}</h3>
                    <Badge variant="outline" className="text-gray-400 border-gray-400/50 bg-gray-400/10">
                      {String(battle.status || 'Completed')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>{String(battle.type || 'Unknown')} • {String(battle.examType || 'Unknown')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Target className="w-4 h-4" />
                      <span>{String(battle.subject || 'Unknown')}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400">
                    Completed on {battle.createdAt ? new Date(battle.createdAt).toLocaleDateString() : 'Unknown date'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}