import { useState, useEffect, useRef } from 'react';
import { useBattleWebSocket } from '@/hooks/use-battle-websocket';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Battle } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Send, Clock, CheckCircle, AlertCircle, Users, Target, Eye, 
  Zap, Shield, Star, Trophy, Volume2, VolumeX, Settings, Mic, Camera,
  Sword, Crown, Flame, Lightning, Heart, Brain, Rocket, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

interface AdvancedBattleProps {
  battle: any;
  onClose: () => void;
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  color: string;
  effect: string;
  active: boolean;
  cooldown?: number;
}

interface BattleParticipant {
  id: number;
  name: string;
  profileImage?: string;
  team: number;
  score: number;
  status: 'ready' | 'answering' | 'submitted' | 'disconnected';
  powerUps: string[];
  rank: string;
  accuracy: number;
  streak: number;
}

export function AdvancedBattleInterface({ battle, onClose }: AdvancedBattleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Battle state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(battle.duration * 60);
  const [battlePhase, setBattlePhase] = useState<'lobby' | 'countdown' | 'active' | 'results'>('lobby');
  const [participants, setParticipants] = useState<BattleParticipant[]>([]);
  const [spectators, setSpectators] = useState<any[]>([]);
  
  // UI state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPowerUps, setShowPowerUps] = useState(false);
  const [selectedPowerUp, setSelectedPowerUp] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSpectating, setIsSpectating] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // WebSocket connection
  const { connected, sendMessage } = useBattleWebSocket(battle.id, user?.id);
  
  // Available power-ups
  const powerUps: PowerUp[] = [
    {
      id: 'extra_time',
      name: 'Extra Time',
      description: '+30 seconds for current question',
      cost: 50,
      icon: <Clock className="w-4 h-4" />,
      color: 'from-blue-500 to-cyan-500',
      effect: 'time_boost',
      active: false
    },
    {
      id: 'hint_master',
      name: 'Hint Master',
      description: 'Eliminate 2 wrong answers',
      cost: 75,
      icon: <Brain className="w-4 h-4" />,
      color: 'from-purple-500 to-pink-500',
      effect: 'hint_boost',
      active: false
    },
    {
      id: 'shield',
      name: 'Shield',
      description: 'Protect from wrong answer penalty',
      cost: 100,
      icon: <Shield className="w-4 h-4" />,
      color: 'from-green-500 to-emerald-500',
      effect: 'protection',
      active: false
    },
    {
      id: 'double_points',
      name: 'Double Points',
      description: '2x XP for next correct answer',
      cost: 150,
      icon: <Star className="w-4 h-4" />,
      color: 'from-yellow-500 to-orange-500',
      effect: 'score_boost',
      active: false
    },
    {
      id: 'speed_boost',
      name: 'Speed Boost',
      description: 'Instant submission advantage',
      cost: 80,
      icon: <Zap className="w-4 h-4" />,
      color: 'from-red-500 to-pink-500',
      effect: 'speed_boost',
      active: false
    },
    {
      id: 'mind_reader',
      name: 'Mind Reader',
      description: 'See most popular answer choice',
      cost: 120,
      icon: <Eye className="w-4 h-4" />,
      color: 'from-indigo-500 to-purple-500',
      effect: 'insight',
      active: false
    }
  ];
  
  // Sample questions for demo
  const sampleQuestions = [
    {
      id: 1,
      question: "🚀 Physics Challenge: A projectile is launched at 45° with initial velocity 20 m/s. What is the maximum height?",
      options: [
        { id: 'A', text: '5.1 m', correct: true },
        { id: 'B', text: '10.2 m', correct: false },
        { id: 'C', text: '15.3 m', correct: false },
        { id: 'D', text: '20.4 m', correct: false }
      ],
      explanation: "Using h = v²sin²θ/2g = (20)²sin²(45°)/2(10) = 400×0.5/20 = 5.1 m",
      subject: "Physics",
      difficulty: "intermediate"
    },
    {
      id: 2,
      question: "🧬 Biology Challenge: Which biomolecule serves as the primary energy currency in cells?",
      options: [
        { id: 'A', text: 'Glucose', correct: false },
        { id: 'B', text: 'ATP', correct: true },
        { id: 'C', text: 'Protein', correct: false },
        { id: 'D', text: 'Lipids', correct: false }
      ],
      explanation: "ATP (Adenosine Triphosphate) is the universal energy currency in all living cells.",
      subject: "Biology",
      difficulty: "beginner"
    }
  ];
  
  // Timer effect
  useEffect(() => {
    if (battlePhase === 'active' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setBattlePhase('results');
            playSound('battle_end');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [battlePhase, timeLeft]);
  
  // Initialize battle
  useEffect(() => {
    // Simulate battle initialization
    const mockParticipants: BattleParticipant[] = [
      {
        id: user?.id || 1,
        name: user?.name || 'You',
        profileImage: user?.profileImage,
        team: 1,
        score: 0,
        status: 'ready',
        powerUps: [],
        rank: 'Bronze I',
        accuracy: 85,
        streak: 3
      },
      {
        id: 2,
        name: 'Alex Kumar',
        team: 2,
        score: 0,
        status: 'ready',
        powerUps: ['shield'],
        rank: 'Silver II',
        accuracy: 78,
        streak: 5
      }
    ];
    
    setParticipants(mockParticipants);
    
    // Auto-start battle after 3 seconds
    setTimeout(() => {
      setBattlePhase('countdown');
      playSound('battle_start');
      
      setTimeout(() => {
        setBattlePhase('active');
        playSound('question_appear');
      }, 3000);
    }, 2000);
  }, []);
  
  // Sound effects
  const playSound = (type: string) => {
    if (!soundEnabled) return;
    
    // In a real implementation, you would have actual audio files
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'battle_start':
        oscillator.frequency.value = 440;
        break;
      case 'correct_answer':
        oscillator.frequency.value = 880;
        break;
      case 'wrong_answer':
        oscillator.frequency.value = 220;
        break;
      case 'power_up':
        oscillator.frequency.value = 660;
        break;
      case 'battle_end':
        oscillator.frequency.value = 330;
        break;
      default:
        oscillator.frequency.value = 440;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };
  
  // Handle answer submission
  const submitAnswer = useMutation({
    mutationFn: async () => {
      if (!selectedAnswer.trim()) {
        throw new Error('Please select an answer');
      }
      
      const result = await apiRequest('POST', `/api/enhanced-battles/${battle.id}/submit`, {
        answer: selectedAnswer,
        questionId: sampleQuestions[currentQuestion].id,
        timeSpent: (battle.duration * 60) - timeLeft
      });
      
      return result;
    },
    onSuccess: (data) => {
      const isCorrect = sampleQuestions[currentQuestion].options.find(opt => opt.id === selectedAnswer)?.correct;
      
      playSound(isCorrect ? 'correct_answer' : 'wrong_answer');
      
      // Update participant status
      setParticipants(prev => prev.map(p => 
        p.id === user?.id 
          ? { ...p, status: 'submitted', score: isCorrect ? p.score + 100 : p.score }
          : p
      ));
      
      toast({
        title: isCorrect ? "Correct!" : "Incorrect",
        description: isCorrect ? "Great job! Moving to next question..." : "Don't worry, keep fighting!",
        variant: isCorrect ? "default" : "destructive",
      });
      
      // Move to next question after 2 seconds
      setTimeout(() => {
        if (currentQuestion < sampleQuestions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer('');
          setParticipants(prev => prev.map(p => ({ ...p, status: 'ready' })));
        } else {
          setBattlePhase('results');
          playSound('battle_end');
        }
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });
  
  // Handle power-up activation
  const activatePowerUp = (powerUpId: string) => {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp) return;
    
    playSound('power_up');
    setSelectedPowerUp(powerUpId);
    
    // Apply power-up effect
    switch (powerUp.effect) {
      case 'time_boost':
        setTimeLeft(prev => prev + 30);
        break;
      case 'hint_boost':
        // Eliminate 2 wrong answers
        break;
      case 'protection':
        // Activate shield
        break;
      case 'score_boost':
        // Next answer gives double points
        break;
    }
    
    toast({
      title: "Power-up activated!",
      description: `${powerUp.name}: ${powerUp.description}`,
    });
  };
  
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (timeLeft > 60) return 'text-green-400';
    if (timeLeft > 30) return 'text-yellow-400';
    return 'text-red-400 animate-pulse';
  };
  
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center p-2">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-cyan-500/40 rounded-3xl w-full max-w-7xl max-h-[98vh] overflow-hidden shadow-2xl shadow-cyan-500/20">
        
        {/* Battle Header */}
        <div className="relative bg-gradient-to-r from-cyan-900/60 via-blue-900/60 to-purple-900/60 p-6 border-b border-cyan-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
          
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  {battle.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                  <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50">
                    {battle.type}
                  </Badge>
                  <span>{battle.examType}</span>
                  <span>•</span>
                  <span>{battle.difficulty}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Battle Phase Indicator */}
              <Badge 
                variant="outline" 
                className={`${
                  battlePhase === 'active' 
                    ? 'bg-green-500/20 border-green-500/50 text-green-300' 
                    : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                }`}
              >
                {battlePhase === 'lobby' && 'Preparing...'}
                {battlePhase === 'countdown' && 'Starting...'}
                {battlePhase === 'active' && 'Live Battle'}
                {battlePhase === 'results' && 'Complete'}
              </Badge>
              
              {/* Sound Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-gray-500/20 border-gray-500/50 hover:bg-gray-500/30"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              {/* Close Button */}
              <Button 
                variant="outline" 
                onClick={onClose}
                className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-300"
              >
                ✕ Exit
              </Button>
            </div>
          </div>
        </div>
        
        {/* Battle Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(98vh-120px)]">
          
          {/* Countdown Phase */}
          {battlePhase === 'countdown' && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-8xl font-bold text-cyan-400 mb-4 animate-pulse">
                  3
                </div>
                <p className="text-xl text-gray-300">Battle begins in...</p>
                <div className="flex justify-center gap-2 mt-4">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          {/* Active Battle Phase */}
          {battlePhase === 'active' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* Participants Panel */}
              <div className="xl:col-span-1">
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 border-cyan-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cyan-300 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Warriors ({participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {participants.map((participant) => (
                      <div key={participant.id} className="p-3 rounded-xl bg-gradient-to-r from-gray-700/50 to-gray-600/50 border border-gray-600/30">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-cyan-500/50">
                              <AvatarImage src={participant.profileImage} />
                              <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white font-bold">
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                              participant.status === 'submitted' ? 'bg-green-500' : 
                              participant.status === 'answering' ? 'bg-yellow-500 animate-pulse' : 
                              'bg-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate flex items-center gap-2">
                              {participant.name}
                              {participant.id === user?.id && (
                                <span className="text-xs bg-purple-500/50 px-2 py-1 rounded-full">YOU</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                              <span>{participant.rank}</span>
                              <span>•</span>
                              <span>{participant.score} XP</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Flame className="w-3 h-3 text-orange-400" />
                              <span className="text-xs text-orange-400">{participant.streak}</span>
                              <span className="text-xs text-gray-400">({participant.accuracy}%)</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Power-ups */}
                        {participant.powerUps.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {participant.powerUps.map((powerUp) => (
                              <div key={powerUp} className="w-6 h-6 bg-purple-500/30 rounded border border-purple-500/50 flex items-center justify-center">
                                <Shield className="w-3 h-3 text-purple-400" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Battle Area */}
              <div className="xl:col-span-3">
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 border-2 border-purple-500/30">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-purple-300 flex items-center gap-3">
                          <Target className="w-6 h-6" />
                          Question {currentQuestion + 1} of {sampleQuestions.length}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <div className={`text-2xl font-bold ${getTimerColor()}`}>
                            {formatTime(timeLeft)}
                          </div>
                          <Progress 
                            value={((currentQuestion + 1) / sampleQuestions.length) * 100} 
                            className="w-32 h-2"
                          />
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setShowPowerUps(!showPowerUps)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Power-ups
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Question Display */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-6 rounded-2xl border border-purple-500/30">
                      <h3 className="text-xl font-bold text-white mb-4">
                        {sampleQuestions[currentQuestion].question}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sampleQuestions[currentQuestion].options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setSelectedAnswer(option.id)}
                            disabled={submitAnswer.isPending}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              selectedAnswer === option.id
                                ? 'border-cyan-400 bg-cyan-500/20 scale-105 shadow-lg shadow-cyan-500/30'
                                : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/70 hover:bg-gray-600/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                selectedAnswer === option.id
                                  ? 'bg-cyan-400 text-gray-900'
                                  : 'bg-gray-600 text-white'
                              }`}>
                                {option.id}
                              </div>
                              <span className="text-white font-medium">{option.text}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={() => submitAnswer.mutate()}
                        disabled={!selectedAnswer || submitAnswer.isPending}
                        className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 hover:from-green-500 hover:via-emerald-500 hover:to-cyan-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
                      >
                        {submitAnswer.isPending ? (
                          <>
                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-6 h-6 mr-3" />
                            Submit Answer
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Power-ups Panel */}
          {showPowerUps && (
            <Card className="mt-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Power-ups Arsenal
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Strategic enhancements to boost your battle performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {powerUps.map((powerUp) => (
                    <div
                      key={powerUp.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedPowerUp === powerUp.id
                          ? 'border-purple-400 bg-purple-500/20 scale-105'
                          : 'border-gray-600/50 bg-gray-700/30 hover:border-purple-500/50 hover:bg-purple-500/10'
                      }`}
                      onClick={() => activatePowerUp(powerUp.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${powerUp.color} flex items-center justify-center`}>
                          {powerUp.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{powerUp.name}</h4>
                          <p className="text-xs text-gray-400">{powerUp.cost} coins</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">{powerUp.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Results Phase */}
          {battlePhase === 'results' && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
                  BATTLE COMPLETE!
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 rounded-2xl animate-pulse" />
              </div>
              
              <Card className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 border-2 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-300 flex items-center justify-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Final Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {participants
                      .sort((a, b) => b.score - a.score)
                      .map((participant, index) => (
                        <div
                          key={participant.id}
                          className={`p-4 rounded-xl border-2 ${
                            index === 0
                              ? 'border-yellow-500/50 bg-yellow-500/10'
                              : 'border-gray-600/50 bg-gray-700/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`text-2xl ${
                                index === 0 ? 'text-yellow-400' : 
                                index === 1 ? 'text-gray-400' : 
                                'text-orange-400'
                              }`}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </div>
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={participant.profileImage} />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white font-bold">
                                  {participant.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-white">{participant.name}</p>
                                <p className="text-sm text-gray-400">{participant.rank}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-cyan-400">{participant.score}</p>
                              <p className="text-sm text-gray-400">XP earned</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-6">
                    <Button
                      onClick={onClose}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                    >
                      Return to Battle Zone
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}