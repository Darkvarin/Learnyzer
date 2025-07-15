import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Clock, Target, Star, Trophy, Zap, Shield, Crown, Flame, 
  Sword, Plus, Search, Filter, TrendingUp, Award, Sparkles, 
  Calendar, MapPin, Globe, Lock, Eye, Play, Pause, RotateCcw
} from 'lucide-react';

interface BattleLobbyProps {
  onJoinBattle: (battle: any) => void;
  onCreateBattle: (battleData: any) => void;
}

export function BattleLobby({ onJoinBattle, onCreateBattle }: BattleLobbyProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("live");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedExamType, setSelectedExamType] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [quickMatchLoading, setQuickMatchLoading] = useState(false);
  
  // Battle creation form
  const [battleForm, setBattleForm] = useState({
    title: "",
    type: "1v1",
    difficulty: "intermediate",
    examType: "JEE",
    subject: "Physics",
    duration: "15",
    topics: "",
    entryFee: "10",
    prizePool: "auto",
    maxParticipants: "2",
    battleMode: "public",
    spectatorMode: true
  });
  
  // Fetch live battles
  const { data: liveBattles, isLoading: liveBattlesLoading } = useQuery({
    queryKey: ['/api/enhanced-battles', activeTab],
    refetchInterval: 5000 // Refresh every 5 seconds
  });
  
  // Fetch user's battle history
  const { data: battleHistory } = useQuery({
    queryKey: ['/api/user/battle-history'],
    enabled: activeTab === "history"
  });
  
  // Fetch leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['/api/battle-leaderboard'],
    enabled: activeTab === "leaderboard"
  });
  
  // Quick match mutation
  const quickMatchMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/battles/quick-match", {
        difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
        examType: selectedExamType !== "all" ? selectedExamType : undefined,
        userLevel: user?.level || 1
      });
    },
    onSuccess: (battle) => {
      onJoinBattle(battle);
      toast({
        title: "Match found!",
        description: "Joining battle now...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "No matches found",
        description: "Try creating a new battle or adjust your preferences.",
        variant: "destructive",
      });
    }
  });
  
  // Create battle mutation
  const createBattleMutation = useMutation({
    mutationFn: async (battleData: any) => {
      return apiRequest("POST", "/api/enhanced-battles", battleData);
    },
    onSuccess: (battle) => {
      setShowCreateForm(false);
      setBattleForm({
        title: "",
        type: "1v1",
        difficulty: "intermediate",
        examType: "JEE",
        subject: "Physics",
        duration: "15",
        topics: "",
        entryFee: "10",
        prizePool: "auto",
        maxParticipants: "2",
        battleMode: "public",
        spectatorMode: true
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-battles'] });
      toast({
        title: "Battle created!",
        description: "Your battle is ready for participants.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create battle",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Filter battles based on search and filters
  const filteredBattles = (liveBattles?.active || []).filter((battle: any) => {
    const matchesSearch = !searchQuery || 
      battle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      battle.examType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      battle.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === "all" || battle.difficulty === selectedDifficulty;
    const matchesExam = selectedExamType === "all" || battle.examType === selectedExamType;
    
    return matchesSearch && matchesDifficulty && matchesExam;
  });
  
  // Handle quick match
  const handleQuickMatch = () => {
    setQuickMatchLoading(true);
    setTimeout(() => {
      quickMatchMutation.mutate();
      setQuickMatchLoading(false);
    }, 2000); // Simulate matching time
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "advanced": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "expert": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Battle Zone Command Center
          </h1>
          <p className="text-gray-400 mt-1">Choose your battlefield and prove your academic mastery</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleQuickMatch}
            disabled={quickMatchLoading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-green-500/30"
          >
            {quickMatchLoading ? (
              <>
                <Search className="w-5 h-5 mr-2 animate-spin" />
                Finding Match...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Quick Match
              </>
            )}
          </Button>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Battle
          </Button>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700/50">
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Live Battles
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>
        
        {/* Live Battles Tab */}
        <TabsContent value="live" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Battle Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-gray-400 mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search battles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600/50"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-400 mb-2 block">Difficulty</Label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-gray-400 mb-2 block">Exam Type</Label>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams</SelectItem>
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
                
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDifficulty("all");
                      setSelectedExamType("all");
                    }}
                    variant="outline"
                    className="w-full bg-gray-700/50 border-gray-600/50 hover:bg-gray-600/50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Battle Cards */}
          {liveBattlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-gray-800/50 border-gray-700/50 animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-700/50 rounded mb-2" />
                    <div className="h-4 bg-gray-700/50 rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700/50 rounded" />
                      <div className="h-4 bg-gray-700/50 rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBattles.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="text-center py-12">
                <Sword className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No battles found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedDifficulty !== "all" || selectedExamType !== "all"
                    ? "Try adjusting your search filters or create a new battle."
                    : "No active battles at the moment. Be the first to create one!"}
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Battle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBattles.map((battle: any) => (
                <Card key={battle.id} className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-cyan-300 group-hover:text-cyan-200 transition-colors">
                          {battle.title}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          {battle.examType} • {battle.subject}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(battle.difficulty)}
                      >
                        {battle.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>{battle.participants?.length || 0}/{battle.maxParticipants}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>{battle.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span>{battle.questionsCount || 1} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{battle.prizePool || 0} coins</span>
                      </div>
                    </div>
                    
                    {battle.topics && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Topics:</p>
                        <p className="text-sm text-gray-300">{battle.topics}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {battle.battleMode === "private" && (
                          <Lock className="w-4 h-4 text-orange-400" />
                        )}
                        {battle.spectatorMode && (
                          <Eye className="w-4 h-4 text-purple-400" />
                        )}
                        <span className="text-xs text-gray-400">
                          {battle.spectatorCount || 0} watching
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => onJoinBattle(battle)}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30"
                      >
                        <Sword className="w-4 h-4 mr-2" />
                        Join Battle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Tournaments Tab */}
        <TabsContent value="tournaments">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Tournaments Coming Soon</h3>
              <p className="text-gray-500">
                Epic tournaments with massive prize pools and exclusive rewards are being prepared.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Battle History</h3>
              <p className="text-gray-500">
                Your battle history and performance analytics will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="text-center py-12">
              <Crown className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Battle Leaderboard</h3>
              <p className="text-gray-500">
                Top battle champions and their achievements will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Battle Form - You would implement this as a modal/dialog */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-cyan-400">Create New Battle</CardTitle>
              <CardDescription>
                Set up your custom battle challenge for other students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Battle Title</Label>
                  <Input
                    placeholder="Epic Physics Challenge"
                    value={battleForm.title}
                    onChange={(e) => setBattleForm({...battleForm, title: e.target.value})}
                    className="bg-gray-700/50 border-gray-600/50"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Battle Type</Label>
                  <Select value={battleForm.type} onValueChange={(value) => setBattleForm({...battleForm, type: value})}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1v1">1v1 Duel</SelectItem>
                      <SelectItem value="2v2">2v2 Team Battle</SelectItem>
                      <SelectItem value="3v3">3v3 Squad War</SelectItem>
                      <SelectItem value="4v4">4v4 Clan Battle</SelectItem>
                      <SelectItem value="free_for_all">Free For All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="border-gray-600/50 text-gray-400 hover:bg-gray-700/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createBattleMutation.mutate(battleForm)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  Create Battle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}