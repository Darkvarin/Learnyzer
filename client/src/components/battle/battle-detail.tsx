import { useState, useEffect } from 'react';
import { useBattleWebSocket } from '@/hooks/use-battle-websocket';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Battle } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Clock, CheckCircle, AlertCircle, Users, Target, Eye, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

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

interface BattleDetailProps {
  battle: EnhancedBattle;
  onClose: () => void;
  onOpenAdvanced?: () => void;
}

export function BattleDetail({ battle, onClose, onOpenAdvanced }: BattleDetailProps) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Add debugging
  console.log('BattleDetail received battle:', battle);
  console.log('Battle ID:', battle?.id, 'Type:', typeof battle?.id);
  
  // Mock battle data for demo battles that might not have proper WebSocket
  const mockBattleData = {
    connected: true,
    messages: [],
    participants: battle.participants || [{
      id: user?.id || 1,
      name: user?.name || 'You',
      avatar: user?.profileImage || null
    }],
    submissions: [],
    battleCompleted: false,
    sendMessage: (message: string) => {
      toast({
        title: "Message sent",
        description: message,
      });
    },
    submitAnswer: (ans: string) => {
      toast({
        title: "Answer submitted",
        description: `You answered: ${ans}`,
      });
    }
  };
  
  const {
    connected = mockBattleData.connected,
    messages = mockBattleData.messages,
    participants = mockBattleData.participants,
    submissions = mockBattleData.submissions,
    battleCompleted = mockBattleData.battleCompleted,
    sendMessage = mockBattleData.sendMessage,
    submitAnswer = mockBattleData.submitAnswer
  } = useBattleWebSocket(battle.id) || mockBattleData;
  
  const [messageText, setMessageText] = useState('');
  
  // Calculate time left
  useEffect(() => {
    if (battle.status !== 'in_progress') return;
    
    const endTime = new Date(battle.startedAt || Date.now());
    endTime.setMinutes(endTime.getMinutes() + battle.duration);
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('Time up!');
        clearInterval(timer);
        return;
      }
      
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [battle]);
  
  // Handle submitting an answer
  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!answer.trim()) {
        throw new Error('Answer cannot be empty');
      }
      
      if (!battle.id) {
        throw new Error('Battle ID is missing');
      }
      
      // Ensure battle ID is properly formatted
      const battleId = String(battle.id);
      console.log('Submitting answer to battle:', battleId, 'Answer:', answer);
      const result = await apiRequest('POST', `/api/enhanced-battles/${battleId}/submit`, { answer });
      // Notify other participants through WebSocket
      submitAnswer(answer);
      return result;
    },
    onSuccess: () => {
      setAnswer('');
      queryClient.invalidateQueries({ queryKey: ['/api/battles'] });
      queryClient.invalidateQueries({ queryKey: [`/api/battles/${battle.id}`] });
      toast({
        title: 'Answer submitted',
        description: 'Your answer has been submitted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit answer',
        description: error.message || 'There was an error submitting your answer. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    sendMessage(messageText);
    setMessageText('');
  };
  
  // Handle submitting an answer
  const handleSubmitAnswer = () => {
    console.log('Handle submit answer called, battle:', battle, 'answer:', answer);
    if (!battle.id) {
      console.error('Battle ID is missing:', battle);
      toast({
        title: 'Error',
        description: 'Battle information is incomplete. Please refresh and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!answer.trim()) {
      toast({
        title: 'Select an answer',
        description: 'Please select an answer before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    submitAnswerMutation.mutate();
  };
  
  // Check if the current user has submitted an answer
  const hasSubmitted = user && (
    (Array.isArray(submissions) ? submissions.some(s => s.userId === user.id) : submissions?.has?.(user.id)) ||
    battle.participants?.some(p => p.id === user.id && p.submission)
  );
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-cyan-500/40 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl shadow-cyan-500/20">
        {/* Compact Header */}
        <div className="relative bg-gradient-to-r from-cyan-900/50 via-blue-900/50 to-purple-900/50 p-4 border-b border-cyan-500/30">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  {battle.title}
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  {battle.type}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  {battle.duration}m
                </span>
                <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                  {battle.examType}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onOpenAdvanced && (
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={onOpenAdvanced}
                  className="bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30 text-purple-300 text-xs px-3 py-1 h-7"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Advanced
                </Button>
              )}
              <Button 
                size="sm"
                variant="outline" 
                onClick={onClose} 
                className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-300 text-xs px-3 py-1 h-7"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
        
        {/* Compact Content area */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Compact Question Area */}
          <div className="space-y-4">
            {/* Timer */}
            {battle.status === 'in_progress' && (
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-3 rounded-lg border border-orange-500/30 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 font-bold">{timeLeft || 'Calculating...'}</span>
                </div>
              </div>
            )}
            
            {/* Main Question */}
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 border border-purple-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Question 1/{battle.questionsCount || 1}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">{battle.difficulty}</Badge>
                    <Badge variant="outline" className="text-xs">{battle.examType}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question */}
                <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 p-4 rounded-lg border border-gray-600/50">
                  {battle.examType === 'JEE' ? (
                    <p className="text-white leading-relaxed">
                      <strong>Physics:</strong> A projectile is launched at an angle of 45° with initial velocity 20 m/s. Find the maximum height reached.
                    </p>
                  ) : battle.examType === 'NEET' ? (
                    <p className="text-white leading-relaxed">
                      <strong>Biology:</strong> Which biomolecule is the main source of energy in cells?
                    </p>
                  ) : (
                    <p className="text-white leading-relaxed">
                      <strong>Computer Science:</strong> What is the time complexity of binary search algorithm?
                    </p>
                  )}
                </div>
                
                {/* Answer Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(battle.examType === 'JEE' ? 
                    [
                      { option: 'A', answer: '5.1 m', color: 'from-red-500/20 to-red-600/20 border-red-500/30' },
                      { option: 'B', answer: '10.2 m', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
                      { option: 'C', answer: '15.3 m', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
                      { option: 'D', answer: '20.4 m', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' }
                    ] : battle.examType === 'NEET' ?
                    [
                      { option: 'A', answer: 'Proteins', color: 'from-red-500/20 to-red-600/20 border-red-500/30' },
                      { option: 'B', answer: 'Carbohydrates', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
                      { option: 'C', answer: 'Lipids', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
                      { option: 'D', answer: 'Nucleic acids', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' }
                    ] :
                    [
                      { option: 'A', answer: 'O(n)', color: 'from-red-500/20 to-red-600/20 border-red-500/30' },
                      { option: 'B', answer: 'O(log n)', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
                      { option: 'C', answer: 'O(n log n)', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
                      { option: 'D', answer: 'O(n²)', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' }
                    ]
                  ).map((item) => (
                    <div 
                      key={item.option}
                      onClick={() => setAnswer(item.option)}
                      className={`bg-gradient-to-r ${item.color} p-3 rounded-lg border cursor-pointer hover:scale-[1.02] transition-all duration-200 ${
                        answer === item.option ? 'ring-2 ring-cyan-400 scale-[1.02]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-white text-sm">
                          {item.option}
                        </div>
                        <span className="text-white text-sm">{item.answer}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Submit Section */}
                {battle.status !== 'completed' && (
                  <div className="space-y-3">
                    {answer && !hasSubmitted && (
                      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 rounded-lg border border-cyan-500/30 text-center">
                        <p className="text-cyan-300 text-sm">
                          Selected: <span className="text-white font-bold">{answer}</span>
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={submitAnswerMutation.isPending || hasSubmitted || !answer.trim() || battle.status === 'waiting'}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-6 py-2 rounded-lg"
                      >
                        {submitAnswerMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : hasSubmitted ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            Submitted!
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Answer
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {hasSubmitted && (
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-lg border border-green-500/30 text-center">
                        <p className="text-green-300 text-sm">Answer submitted! Waiting for other participants...</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Participants */}
            <Card className="bg-gradient-to-br from-cyan-800/20 to-blue-800/20 border border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-cyan-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {participants.map((participant: any, index: number) => (
                    <div key={participant.id} className="bg-gray-700/50 p-2 rounded border border-gray-600/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-cyan-500/50">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="bg-cyan-600/50 text-cyan-100 text-xs">
                            {participant.name?.charAt(0)?.toUpperCase() || 'W'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">
                            {participant.name}
                            {participant.id === user?.id && <span className="text-purple-300"> (You)</span>}
                          </p>
                        </div>
                        {battle.status === 'in_progress' && (Array.isArray(submissions) ? submissions.some(s => s.userId === participant.id) : submissions?.has?.(participant.id)) && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!battle.participants || battle.participants.length === 0) && (
                    <div className="col-span-full text-center py-4">
                      <Users className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs">Waiting for participants...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
