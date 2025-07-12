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
import { Loader2, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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
  const {
    connected,
    messages,
    participants,
    submissions,
    battleCompleted,
    sendMessage,
    submitAnswer
  } = useBattleWebSocket(battle.id);
  
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
      
      const result = await apiRequest('POST', `/api/enhanced-battles/${battle.id}/submit`, { answer });
      // Notify other participants through WebSocket
      submitAnswer();
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
    submitAnswerMutation.mutate();
  };
  
  // Check if the current user has submitted an answer
  const hasSubmitted = user && (submissions.has(user.id) || battle.participants?.some(p => 
    p.id === user.id && p.submission));
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-cyan-500/30 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold font-gaming bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {battle.title}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {battle.type} • {battle.duration} mins • Topics: {Array.isArray(battle.topics) ? battle.topics?.join(', ') : String(battle.topics)}
            </p>
          </div>
          <Button variant="outline" onClick={onClose} className="text-gray-400 border-gray-600 hover:bg-gray-700">
            ✕ Close
          </Button>
        </div>
        
        {/* Content area */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Timer */}
          {battle.status === 'in_progress' && (
            <div className="flex items-center justify-center bg-gray-800 px-4 py-2 rounded-full mb-6">
              <Clock className="w-5 h-5 mr-2 text-yellow-400" />
              <span className={`text-lg font-medium ${timeLeft === 'Time up!' ? 'text-red-400' : 'text-yellow-400'}`}>
                {timeLeft}
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Battle participants */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-400">Participants</CardTitle>
                  <CardDescription className="text-gray-400">
                    {battle.status === 'waiting' ? 'Waiting for players' : 'Currently in battle'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {battle.participants?.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-700/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.profileImage} alt={participant.name} />
                        <AvatarFallback className="bg-cyan-600 text-white">
                          {participant.name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{participant.name}</p>
                        <p className="text-xs text-gray-400">
                          Team {battle.type?.includes('v') ? (participant.team === 0 ? 'A' : 'B') : 'Solo'}
                        </p>
                      </div>
                      {battle.status === 'in_progress' && submissions.has(participant.id) && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  ))}
                  
                  {(!battle.participants || battle.participants.length === 0) && (
                    <p className="text-center text-gray-400 py-8">No participants yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Main battle area */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-400">Battle Challenge</CardTitle>
                  <CardDescription className="text-gray-400">
                    Format: {battle.format || 'Open Question'} • Difficulty: {battle.difficulty || 'Intermediate'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Battle description */}
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                    <p className="text-gray-200 leading-relaxed">
                      {battle.description || `Demonstrate your knowledge on ${Array.isArray(battle.topics) ? battle.topics?.join(', ') : String(battle.topics)}. Your answer will be judged by AI based on accuracy, clarity, and depth of understanding.`}
                    </p>
                  </div>
                  
                  {/* Answer submission area */}
                  {battle.status === 'in_progress' && !hasSubmitted && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">Your Answer</h3>
                        <Textarea 
                          placeholder="Type your detailed answer here..." 
                          className="min-h-[200px] bg-gray-900/50 border-gray-600 text-gray-200 placeholder-gray-400"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          disabled={submitAnswerMutation.isPending}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSubmitAnswer}
                          disabled={!answer.trim() || submitAnswerMutation.isPending}
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                        >
                          {submitAnswerMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Answer'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Answer submitted confirmation */}
                  {hasSubmitted && (
                    <div className="flex items-center justify-center p-6 bg-green-900/20 border border-green-600 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                      <span className="text-green-400 font-medium">Answer submitted successfully!</span>
                    </div>
                  )}
                  
                  {/* Battle status */}
                  {battle.status === 'waiting' && (
                    <div className="flex items-center justify-center p-6 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-400 mr-2" />
                      <span className="text-yellow-400 font-medium">Waiting for battle to start...</span>
                    </div>
                  )}
                  
                  {battle.status === 'completed' && (
                    <div className="flex items-center justify-center p-6 bg-blue-900/20 border border-blue-600 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-blue-400 mr-2" />
                      <span className="text-blue-400 font-medium">Battle completed! Check results in your dashboard.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Chat section */}
              <Card className="bg-gray-800/50 border-gray-700 mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-cyan-400">Battle Chat</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[200px] overflow-y-auto space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No messages yet. Be the first to cheer!</p>
                  )}
                  
                  {messages.map((message, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-700/30">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-600 text-white text-xs">
                          {message.username ? message.username.charAt(0) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-cyan-400">
                            {message.username || 'User'}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200 mt-1">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <div className="flex w-full space-x-2">
                    <Input 
                      placeholder="Send a message..." 
                      className="flex-1 bg-gray-900/50 border-gray-600 text-gray-200 placeholder-gray-400"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || !connected}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}