import { useState, useEffect } from "react";
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
import { Sword, Plus, Users, Clock, Target, Trophy, Flame, ArrowLeft, Send, Eye, CheckCircle, XCircle, RotateCcw } from "lucide-react";

export default function BattleZone() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState<any>(null);
  const [showBattleDetail, setShowBattleDetail] = useState(false);
  
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
    onSuccess: (data, battleId) => {
      toast({
        title: "Joined Battle!",
        description: "You have successfully joined the battle.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-battles"] });
      
      // Find the battle and open battle detail
      const battle = battles?.active?.find((b: any) => b.id === battleId);
      if (battle) {
        setSelectedBattle(battle);
        setShowBattleDetail(true);
      }
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
        {/* Battle Detail View */}
        {showBattleDetail && selectedBattle && (
          <BattleDetail 
            battle={selectedBattle} 
            onBack={() => setShowBattleDetail(false)} 
          />
        )}
        
        {/* Main Battle Zone View */}
        {!showBattleDetail && (
          <>
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
        </>
        )}
      </main>
    </div>
  );
}

// Battle Detail Component
function BattleDetail({ battle, onBack }: { battle: any; onBack: () => void }) {
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions] = useState(5); // 5 questions per battle
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [answers, setAnswers] = useState<string[]>([]);
  const [aiInsight, setAiInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Demo battle questions based on exam type (5 questions each)
  const demoQuestions = {
    JEE: [
      {
        question: "A particle moves in a straight line with constant acceleration. If its velocity changes from 10 m/s to 30 m/s in 4 seconds, what is its acceleration?",
        options: ["2.5 m/s²", "5 m/s²", "7.5 m/s²", "10 m/s²"],
        correct: "5 m/s²",
        explanation: "Using v = u + at, where v = 30 m/s, u = 10 m/s, t = 4s. So, 30 = 10 + a(4), which gives a = 5 m/s²"
      },
      {
        question: "What is the derivative of sin(x) with respect to x?",
        options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
        correct: "cos(x)",
        explanation: "The derivative of sin(x) is cos(x). This is a fundamental derivative in calculus."
      },
      {
        question: "In how many ways can 5 students be arranged in a row?",
        options: ["20", "60", "120", "240"],
        correct: "120",
        explanation: "This is 5! (5 factorial) = 5 × 4 × 3 × 2 × 1 = 120 ways"
      },
      {
        question: "The pH of pure water at 25°C is:",
        options: ["6", "7", "8", "9"],
        correct: "7",
        explanation: "Pure water has a pH of 7 at 25°C, making it neutral (neither acidic nor basic)."
      },
      {
        question: "What is the unit of electric current?",
        options: ["Volt", "Ampere", "Ohm", "Watt"],
        correct: "Ampere",
        explanation: "Electric current is measured in Amperes (A), named after André-Marie Ampère."
      }
    ],
    NEET: [
      {
        question: "Which of the following is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
        correct: "Mitochondria",
        explanation: "Mitochondria are called the powerhouse of the cell because they produce ATP through cellular respiration."
      },
      {
        question: "What is the normal human body temperature?",
        options: ["96.8°F", "98.6°F", "100.4°F", "102.2°F"],
        correct: "98.6°F",
        explanation: "Normal human body temperature is approximately 98.6°F (37°C)."
      },
      {
        question: "Which blood group is known as the universal donor?",
        options: ["A", "B", "AB", "O"],
        correct: "O",
        explanation: "O negative blood type is the universal donor because it lacks A, B, and Rh antigens."
      },
      {
        question: "DNA replication occurs during which phase of cell cycle?",
        options: ["G1 phase", "S phase", "G2 phase", "M phase"],
        correct: "S phase",
        explanation: "DNA replication occurs during the S (Synthesis) phase of the cell cycle."
      },
      {
        question: "Which enzyme is responsible for DNA replication?",
        options: ["RNA polymerase", "DNA polymerase", "Ligase", "Helicase"],
        correct: "DNA polymerase",
        explanation: "DNA polymerase is the main enzyme responsible for DNA replication, adding nucleotides to the growing DNA strand."
      }
    ],
    CSE: [
      {
        question: "What is the time complexity of binary search in a sorted array?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correct: "O(log n)",
        explanation: "Binary search has O(log n) time complexity because it eliminates half of the search space in each iteration."
      },
      {
        question: "Which data structure uses LIFO (Last In First Out) principle?",
        options: ["Queue", "Stack", "Array", "Tree"],
        correct: "Stack",
        explanation: "Stack follows LIFO principle where the last element added is the first one to be removed."
      },
      {
        question: "What does SQL stand for?",
        options: ["Simple Query Language", "Structured Query Language", "Standard Query Language", "System Query Language"],
        correct: "Structured Query Language",
        explanation: "SQL stands for Structured Query Language, used for managing relational databases."
      },
      {
        question: "In object-oriented programming, what is inheritance?",
        options: ["Creating objects", "Hiding data", "Deriving new classes from existing ones", "Combining functions"],
        correct: "Deriving new classes from existing ones",
        explanation: "Inheritance allows a class to inherit properties and methods from another class, promoting code reusability."
      },
      {
        question: "What is the worst-case time complexity of Quick Sort?",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
        correct: "O(n²)",
        explanation: "Quick Sort has O(n²) worst-case time complexity when the pivot is always the smallest or largest element."
      }
    ]
  };

  const questionSet = demoQuestions[battle.examType as keyof typeof demoQuestions] || demoQuestions.JEE;
  const currentQuestion = questionSet[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !showResults) {
      // Auto-submit when time is up
      handleSubmitAnswer();
    }
  }, [timeRemaining, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption && !answer && !submitted) {
      toast({
        title: "No Answer",
        description: "Please select an option or provide an answer.",
        variant: "destructive",
      });
      return;
    }

    const isCorrect = selectedOption === currentQuestion.correct;
    const points = isCorrect ? 10 : 0;
    
    setSubmitted(true);
    setScore(prev => prev + points);
    setAnswers(prev => [...prev, selectedOption]);
    
    // Get AI insight
    setLoadingInsight(true);
    try {
      const response = await apiRequest("POST", "/api/ai/answer-insight", {
        question: currentQuestion.question,
        userAnswer: selectedOption,
        correctAnswer: currentQuestion.correct,
        explanation: currentQuestion.explanation,
        examType: battle.examType
      });
      setAiInsight(response.insight);
    } catch (error) {
      setAiInsight("Unable to generate AI insight at this time.");
    }
    setLoadingInsight(false);

    toast({
      title: isCorrect ? "Correct!" : "Incorrect!",
      description: isCorrect 
        ? `Great job! You earned ${points} points.` 
        : `The correct answer was: ${currentQuestion.correct}`,
      variant: isCorrect ? "default" : "destructive",
    });

    // Move to next question or show final results
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        // Next question
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption("");
        setSubmitted(false);
        setAiInsight("");
      } else {
        // Show final results
        setShowResults(true);
        // Award coins and XP
        awardRewards();
      }
    }, 3000);
  };

  const awardRewards = async () => {
    try {
      const coinsEarned = Math.max(5, Math.floor(score / 2)); // Minimum 5 coins, bonus for performance
      const xpEarned = score * 2; // 2 XP per point
      
      await apiRequest("POST", "/api/coins/award", {
        coins: coinsEarned,
        reason: `Battle: ${battle.title}`
      });
      
      await apiRequest("POST", "/api/user/add-xp", {
        xp: xpEarned,
        source: "battle_completion"
      });

      queryClient.invalidateQueries({ queryKey: ["/api/coins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      
    } catch (error) {
      console.error("Error awarding rewards:", error);
    }
  };

  // Show results screen after submission
  if (showResults) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Battles
          </Button>
          <div className="h-6 w-px bg-gray-600"></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Battle Results</h1>
            <p className="text-gray-400">{battle.title}</p>
          </div>
        </div>

        {/* Results Card */}
        <div className="glassmorphism border border-purple-500/30 p-8 rounded-xl text-center">
          <div className="flex justify-center mb-6">
            {score > 0 ? (
              <CheckCircle className="w-16 h-16 text-green-400" />
            ) : (
              <XCircle className="w-16 h-16 text-red-400" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {score > 0 ? "Correct!" : "Incorrect!"}
          </h2>
          
          <p className="text-gray-300 mb-6">
            You scored <span className="text-2xl font-bold text-purple-400">{score}</span> out of {totalQuestions * 10} points
          </p>
          
          <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Battle Summary:</p>
            <div className="space-y-2">
              <p className="text-white">Questions Answered: {totalQuestions}</p>
              <p className="text-white">Correct Answers: {Math.floor(score / 10)}</p>
              <p className="text-white">Accuracy: {Math.round((score / (totalQuestions * 10)) * 100)}%</p>
              <p className="text-white">Coins Earned: {Math.max(5, Math.floor(score / 2))}</p>
              <p className="text-white">XP Earned: {score * 2}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-6 py-2"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
            
            <Button
              onClick={() => {
                setShowResults(false);
                setSubmitted(false);
                setSelectedOption("");
                setCurrentQuestionIndex(0);
                setTimeRemaining(300);
                setScore(0);
                setAnswers([]);
                setAiInsight("");
              }}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Practice Again
            </Button>
          </div>
        </div>

        {/* Battle Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glassmorphism border border-cyan-500/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Target className="w-4 h-4" />
              <span className="font-medium">Accuracy</span>
            </div>
            <p className="text-white text-xl font-bold">{Math.round((score / (totalQuestions * 10)) * 100)}%</p>
          </div>
          
          <div className="glassmorphism border border-purple-500/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Time Taken</span>
            </div>
            <p className="text-white text-xl font-bold">{formatTime(300 - timeRemaining)}</p>
          </div>
          
          <div className="glassmorphism border border-amber-500/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">Coins Earned</span>
            </div>
            <p className="text-white text-xl font-bold">{Math.max(5, Math.floor(score / 2))}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Battles
        </Button>
        <div className="h-6 w-px bg-gray-600"></div>
        <div>
          <h1 className="text-2xl font-bold text-white">{battle.title}</h1>
          <p className="text-gray-400">{battle.examType} • {battle.subject} • {battle.type}</p>
        </div>
      </div>

      {/* Battle Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glassmorphism border border-cyan-500/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="font-medium">Participants</span>
          </div>
          <p className="text-white text-xl font-bold">{battle.participants?.length || 1}</p>
        </div>
        
        <div className="glassmorphism border border-purple-500/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Time Remaining</span>
          </div>
          <p className={`text-xl font-bold ${timeRemaining < 60 ? 'text-red-400' : timeRemaining < 180 ? 'text-yellow-400' : 'text-white'}`}>
            {formatTime(timeRemaining)}
          </p>
        </div>
        
        <div className="glassmorphism border border-amber-500/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Trophy className="w-4 h-4" />
            <span className="font-medium">Prize Pool</span>
          </div>
          <p className="text-white text-xl font-bold">{battle.prizePool || 50} coins</p>
        </div>
      </div>

      {/* Question Progress */}
      <div className="glassmorphism border border-gray-600/30 p-4 rounded-xl mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Progress</span>
          <span className="text-gray-400 text-sm">{currentQuestionIndex + 1} of {totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Section */}
      <div className="glassmorphism border border-purple-500/30 p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <span className="text-purple-400 font-bold">{currentQuestionIndex + 1}</span>
          </div>
          <h2 className="text-xl font-bold text-white">Question {currentQuestionIndex + 1}</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-200 text-lg leading-relaxed mb-4">
            {currentQuestion.question}
          </p>
          
          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.correct;
              const isSubmitted = submitted;
              
              let optionStyle = 'border-gray-600/50 bg-gray-800/30 text-gray-300';
              
              if (isSubmitted) {
                if (isCorrect) {
                  optionStyle = 'border-green-500/50 bg-green-500/10 text-green-400';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-red-500/50 bg-red-500/10 text-red-400';
                } else {
                  optionStyle = 'border-gray-600/30 bg-gray-800/20 text-gray-500';
                }
              } else if (isSelected) {
                optionStyle = 'border-purple-500/50 bg-purple-500/10 text-white';
              } else {
                optionStyle = 'border-gray-600/50 bg-gray-800/30 text-gray-300 hover:border-purple-500/30 hover:bg-purple-500/5';
              }
              
              return (
                <button
                  key={index}
                  onClick={() => !submitted && setSelectedOption(option)}
                  disabled={submitted}
                  className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSubmitted && isCorrect
                        ? 'border-green-500 bg-green-500'
                        : isSubmitted && isSelected && !isCorrect
                        ? 'border-red-500 bg-red-500'
                        : isSelected && !isSubmitted
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-500'
                    }`}>
                      {isSubmitted && isCorrect ? (
                        <CheckCircle className="w-3 h-3 text-white" />
                      ) : isSubmitted && isSelected && !isCorrect ? (
                        <XCircle className="w-3 h-3 text-white" />
                      ) : isSelected && !isSubmitted ? (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      ) : null}
                    </div>
                    <span>{String.fromCharCode(65 + index)}. {option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Insights Section */}
        {submitted && (
          <div className="mt-6 p-4 bg-gray-800/50 border border-gray-600/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">📚 AI Insights & Explanation</h4>
            {loadingInsight ? (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <span>Generating AI insights...</span>
              </div>
            ) : aiInsight ? (
              <div className="text-gray-200 text-sm leading-relaxed">
                {aiInsight}
              </div>
            ) : (
              <div className="text-gray-200 text-sm leading-relaxed">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          {!submitted ? (
            <Button
              onClick={handleSubmitAnswer}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-6 py-2"
              disabled={!selectedOption}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Answer
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                selectedOption === currentQuestion.correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {selectedOption === currentQuestion.correct ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {selectedOption === currentQuestion.correct ? 'Correct!' : 'Incorrect!'}
                </span>
              </div>
              <span className="text-gray-400 text-sm">
                {currentQuestionIndex < totalQuestions - 1 
                  ? "Next question in a moment..." 
                  : "Final results loading..."
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Spectator Info */}
      <div className="glassmorphism border border-gray-600/30 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Eye className="w-4 h-4" />
          <span>Battle Status: Active • {battle.spectatorCount || 0} spectators watching</span>
        </div>
      </div>
    </div>
  );
}