import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Sword, Plus, Users, Clock, Target, Trophy, Flame } from "lucide-react";

interface Battle {
  id: number;
  title: string;
  type: string;
  examType: string;
  subject: string;
  duration: number;
  difficulty: string;
  status: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
  createdAt: string;
}

export default function BattleZone() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  
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
    queryKey: ["/api/battles"],
  });

  // Create battle mutation
  const createBattleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/battles", data),
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
      queryClient.invalidateQueries({ queryKey: ["/api/battles"] });
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
    mutationFn: (battleId: number) => apiRequest("POST", `/api/battles/${battleId}/join`),
    onSuccess: () => {
      toast({
        title: "Joined Battle!",
        description: "You have successfully joined the battle.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/battles"] });
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
      entryFee: 25, // Fixed entry fee
      prizePool: parseInt(battleForm.maxParticipants) * 25, // Winner takes all
    });
  };

  const handleJoinBattle = (battleId: number) => {
    joinBattleMutation.mutate(battleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <MobileNavigation />
      
      <div className="pt-20 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sword className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Battle Zone
              </h1>
            </div>
            <p className="text-gray-300">Compete with students in academic battles</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500">
                <Plus className="w-4 h-4 mr-2" />
                Create Battle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Battle</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="e.g. JEE Physics Challenge"
                    value={battleForm.title}
                    onChange={(e) => setBattleForm({...battleForm, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={battleForm.type} onValueChange={(value) => {
                    const maxParticipants = value === "1v1" ? "2" : value === "2v2" ? "4" : "8";
                    setBattleForm({...battleForm, type: value, maxParticipants});
                  }}>
                    <SelectTrigger>
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
                  <label className="text-sm font-medium">Exam Type</label>
                  <Select value={battleForm.examType} onValueChange={(value) => setBattleForm({...battleForm, examType: value})}>
                    <SelectTrigger>
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
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="e.g. Physics, Chemistry"
                    value={battleForm.subject}
                    onChange={(e) => setBattleForm({...battleForm, subject: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <Select value={battleForm.duration} onValueChange={(value) => setBattleForm({...battleForm, duration: value})}>
                    <SelectTrigger>
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
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={battleForm.difficulty} onValueChange={(value) => setBattleForm({...battleForm, difficulty: value})}>
                    <SelectTrigger>
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
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
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
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-800/50 p-6 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-700 rounded mb-3"></div>
                  <div className="h-3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : battles?.active?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {battles.active.map((battle: Battle) => (
                <div key={battle.id} className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 p-6 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">{battle.title}</h3>
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      {battle.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>{battle.type} • {battle.examType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{battle.duration} minutes • {battle.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Target className="w-4 h-4" />
                      <span>{battle.subject}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="text-gray-400">Participants: </span>
                      <span className="text-cyan-400">{battle.participants}/{battle.maxParticipants}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Prize: </span>
                      <span className="text-yellow-400">{battle.prizePool} XP</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleJoinBattle(battle.id)}
                    disabled={joinBattleMutation.isPending || battle.participants >= battle.maxParticipants}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                  >
                    {battle.participants >= battle.maxParticipants ? "Battle Full" : "Join Battle"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
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
              {battles.past.slice(0, 6).map((battle: Battle) => (
                <div key={battle.id} className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 p-6 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">{battle.title}</h3>
                    <Badge variant="outline" className="text-gray-400 border-gray-400/50">
                      {battle.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>{battle.type} • {battle.examType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Target className="w-4 h-4" />
                      <span>{battle.subject}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400">
                    Completed on {new Date(battle.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}