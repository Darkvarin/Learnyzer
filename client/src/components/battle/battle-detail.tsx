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
import { Loader2, Send, Clock, CheckCircle, AlertCircle, Users, Target, Eye } from 'lucide-react';
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
}

export function BattleDetail({ battle, onClose }: BattleDetailProps) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
      
      console.log('Submitting answer to battle:', battle.id, 'Answer:', answer);
      const result = await apiRequest('POST', `/api/enhanced-battles/${battle.id}/submit`, { answer });
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
    submitAnswerMutation.mutate();
  };
  
  // Check if the current user has submitted an answer
  const hasSubmitted = user && (submissions.has(user.id) || battle.participants?.some(p => 
    p.id === user.id && p.submission));
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-cyan-500/40 rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl shadow-cyan-500/20">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-cyan-900/50 via-blue-900/50 to-purple-900/50 p-6 border-b border-cyan-500/30">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-pulse" />
          
          <div className="relative flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  {battle.title}
                </h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  {battle.type}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {battle.duration} mins
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-purple-400" />
                  {Array.isArray(battle.topics) ? battle.topics?.join(', ') : String(battle.topics)}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-all duration-200"
            >
              ✕ Close
            </Button>
          </div>
        </div>
        
        {/* Enhanced Content area */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Enhanced Timer */}
          {battle.status === 'in_progress' && (
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-sm border border-yellow-500/40 px-6 py-3 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Clock className="w-6 h-6 text-yellow-400 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <span className={`text-2xl font-bold ${timeLeft === 'Time up!' ? 'text-red-400 animate-bounce' : 'text-yellow-300'}`}>
                    {timeLeft || '15:00'}
                  </span>
                  <span className="text-yellow-300/80 text-sm">remaining</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Enhanced Battle participants */}
            <div className="xl:col-span-1">
              <Card className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 border-cyan-500/30 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-cyan-300 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Warriors
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {battle.status === 'waiting' ? '⏳ Assembling forces' : '⚔️ Battle in progress'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {battle.participants?.map((participant, index) => (
                    <div key={participant.id} className="relative">
                      <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-700/50 to-gray-600/50 border border-gray-600/50 hover:border-cyan-500/50 transition-all duration-200">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-cyan-500/50">
                            <AvatarImage src={participant.profileImage} alt={participant.name} />
                            <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white font-bold">
                              {participant.name?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                            battle.status === 'in_progress' && submissions.has(participant.id) ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate flex items-center gap-2">
                            {participant.name}
                            {participant.id === user?.id && <span className="text-xs bg-purple-500/50 px-2 py-1 rounded-full">YOU</span>}
                          </p>
                          <p className="text-xs text-cyan-300">
                            Rank #{index + 1} • Team {battle.type?.includes('v') ? (participant.team === 0 ? 'Alpha' : 'Beta') : 'Solo'}
                          </p>
                        </div>
                        {battle.status === 'in_progress' && submissions.has(participant.id) && (
                          <CheckCircle className="w-6 h-6 text-green-400 animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!battle.participants || battle.participants.length === 0) && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">Awaiting brave warriors...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Enhanced Main battle area */}
            <div className="xl:col-span-3">
              <Card className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 border-2 border-purple-500/30 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-purple-300 flex items-center gap-3">
                        <Target className="w-6 h-6" />
                        Battle Arena
                      </CardTitle>
                      <CardDescription className="text-gray-300 mt-1">
                        {battle.status === 'waiting' ? '🔮 Preparing mystical challenge...' : '⚡ Prove your mastery!'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-300">
                        {battle.difficulty || 'Epic'}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/20 border-blue-500/50 text-blue-300">
                        {battle.examType || 'General'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enhanced Demo Question */}
                  <div className="relative bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 p-6 rounded-2xl border border-purple-500/30">
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Question 1/{battle.questionsCount || 1}
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                        Challenge Question
                      </h4>
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-4 rounded-xl border border-gray-600/50 mb-6">
                        {battle.examType === 'JEE' ? (
                          <div>
                            <p className="text-lg text-white mb-4 leading-relaxed">
                              🚀 <strong>Physics Challenge:</strong> A projectile is launched at an angle of 45° with initial velocity 20 m/s. Find the maximum height reached.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[
                                { option: 'A', answer: '5.1 m', color: 'from-red-500/20 to-red-600/20 border-red-500/30' },
                                { option: 'B', answer: '10.2 m', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
                                { option: 'C', answer: '15.3 m', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
                                { option: 'D', answer: '20.4 m', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' }
                              ].map((item) => (
                                <div 
                                  key={item.option}
                                  onClick={() => setAnswer(item.option)}
                                  className={`bg-gradient-to-r ${item.color} p-3 rounded-lg border cursor-pointer hover:scale-105 transition-all duration-200 ${
                                    answer === item.option ? 'ring-2 ring-cyan-400 scale-105' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-white">
                                      {item.option}
                                    </div>
                                    <span className="text-white font-medium">{item.answer}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : battle.examType === 'NEET' ? (
                          <div>
                            <p className="text-lg text-white mb-4 leading-relaxed">
                              🧬 <strong>Biology Challenge:</strong> Which of the following biomolecules is the main source of energy in cells?
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[
                                { option: 'A', answer: 'Proteins', color: 'from-red-500/20 to-red-600/20 border-red-500/30' },
                                { option: 'B', answer: 'Carbohydrates', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
                                { option: 'C', answer: 'Lipids', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
                                { option: 'D', answer: 'Nucleic acids', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' }
                              ].map((item) => (
                                <div 
                                  key={item.option}
                                  onClick={() => setAnswer(item.option)}
                                  className={`bg-gradient-to-r ${item.color} p-3 rounded-lg border cursor-pointer hover:scale-105 transition-all duration-200 ${
                                    answer === item.option ? 'ring-2 ring-cyan-400 scale-105' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-white">
                                      {item.option}
                                    </div>
                                    <span className="text-white font-medium">{item.answer}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg text-white mb-4 leading-relaxed">
                              💻 <strong>Computer Science Challenge:</strong> What is the time complexity of binary search algorithm?
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[
                                { option: 'A', answer: 'O(n)', color: 'from-red-500/20 to-red-600/20 border-red-500/30' },
                                { option: 'B', answer: 'O(log n)', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
                                { option: 'C', answer: 'O(n log n)', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
                                { option: 'D', answer: 'O(n²)', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' }
                              ].map((item) => (
                                <div 
                                  key={item.option}
                                  onClick={() => setAnswer(item.option)}
                                  className={`bg-gradient-to-r ${item.color} p-3 rounded-lg border cursor-pointer hover:scale-105 transition-all duration-200 ${
                                    answer === item.option ? 'ring-2 ring-cyan-400 scale-105' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-white">
                                      {item.option}
                                    </div>
                                    <span className="text-white font-medium">{item.answer}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                    </div>
                  
                  {/* Enhanced Action Section */}
                  {battle.status !== 'completed' && (
                    <div className="space-y-4">
                      {answer && !hasSubmitted && (
                        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-4 rounded-xl border border-cyan-500/30">
                          <p className="text-cyan-300 text-center font-medium">
                            ✨ Selected Answer: <span className="text-white font-bold text-lg">{answer}</span>
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-center">
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={submitAnswerMutation.isPending || hasSubmitted || !answer.trim() || battle.status === 'waiting'}
                          className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
                        >
                          {submitAnswerMutation.isPending ? (
                            <>
                              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                              <span className="animate-pulse">Submitting Battle Response...</span>
                            </>
                          ) : hasSubmitted ? (
                            <>
                              <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                              <span className="text-green-300">Victory Submitted! ⚔️</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-6 h-6 mr-3" />
                              Submit Battle Answer
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {hasSubmitted && (
                        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-500/30 text-center">
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <CheckCircle className="w-8 h-8 text-green-400 animate-pulse" />
                            <span className="text-green-300 font-bold text-xl">Battle Response Recorded!</span>
                          </div>
                          <p className="text-green-400">⚡ Awaiting other warriors to complete their challenge...</p>
                        </div>
                      )}
                      
                      {battle.status === 'waiting' && (
                        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-6 rounded-xl border border-yellow-500/30 text-center">
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <Clock className="w-8 h-8 text-yellow-400 animate-spin" />
                            <span className="text-yellow-300 font-bold text-xl">Preparing Battle Arena...</span>
                          </div>
                          <p className="text-yellow-400">🔮 Mystical forces are aligning for epic combat!</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Enhanced Chat section */}
          <Card className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 border-cyan-500/30 backdrop-blur-sm mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-cyan-300 flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                </div>
                Battle Communications
              </CardTitle>
              <CardDescription className="text-gray-300">
                Live chat with fellow warriors • Keep it respectful and strategic!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900/50 rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-3 mb-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 font-medium">Battle chat is silent...</p>
                    <p className="text-gray-500 text-sm">Be the first to rally your team!</p>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-700/30 to-gray-600/30 border border-gray-600/20 hover:border-cyan-500/30 transition-all duration-200">
                    <Avatar className="h-10 w-10 border-2 border-cyan-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-sm font-bold">
                        {message.username?.charAt(0) || 'W'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-cyan-300">{message.username}</p>
                        <span className="text-xs text-gray-500">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 mt-1 leading-relaxed">{message.text || message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Input
                  placeholder="Send a battle message... ⚔️"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  disabled={!connected}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !connected}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 transition-all duration-200 shadow-lg shadow-cyan-500/20"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              
              {!connected && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Connection lost • Chat temporarily disabled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}