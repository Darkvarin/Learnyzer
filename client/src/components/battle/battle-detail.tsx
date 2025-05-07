import { useState, useEffect } from 'react';
import { useBattleWebSocket } from '@/hooks/use-battle-websocket';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Battle } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

interface BattleDetailProps {
  battle: Battle;
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
      
      const result = await apiRequest('POST', `/api/battles/${battle.id}/submit`, { answer });
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
  const hasSubmitted = user && (submissions.has(user.id) || battle.participants.some(p => 
    p.id === user.id && p.submission));
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold font-gaming">{battle.title}</h2>
          <p className="text-sm text-gray-400">
            {battle.type} • {battle.duration} mins • Topics: {Array.isArray(battle.topics) ? battle.topics.join(', ') : String(battle.topics)}
          </p>
        </div>
        {battle.status === 'in_progress' && (
          <div className="flex items-center bg-dark-card px-3 py-1 rounded-full">
            <Clock className="w-4 h-4 mr-2 text-warning-400" />
            <span className={`text-sm font-medium ${timeLeft === 'Time up!' ? 'text-danger-400' : 'text-warning-400'}`}>
              {timeLeft}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        {/* Battle participants */}
        <div className="w-full md:w-1/4">
          <Card className="bg-dark-card border-dark-border h-full">
            <CardHeader>
              <CardTitle className="text-sm">Participants</CardTitle>
              <CardDescription className="text-xs">
                {battle.status === 'waiting' ? 'Waiting for players' : 'Currently in battle'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {battle.participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.profileImage} alt={participant.name} />
                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{participant.name}</p>
                    <p className="text-xs text-gray-400">
                      Team {
                        battle.type.includes('v') ? 
                          participant.team === 0 ? 'A' : 'B' : 
                          'Solo'
                      }
                    </p>
                  </div>
                  {battle.status === 'in_progress' && submissions.has(participant.id) && (
                    <CheckCircle className="w-4 h-4 text-success-400" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Main battle area */}
        <div className="flex-1 flex flex-col">
          <Card className="bg-dark-card border-dark-border flex-1">
            <CardHeader>
              <CardTitle className="text-sm">Battle Challenge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-dark-surface p-4 rounded-md">
                <p>{battle.description || `Demonstrate your knowledge on ${Array.isArray(battle.topics) ? battle.topics.join(', ') : String(battle.topics)}. Your answer will be judged by AI based on accuracy, clarity, and depth of understanding.`}</p>
              </div>
              
              {/* Answer box */}
              {battle.status === 'in_progress' && !hasSubmitted && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Your Answer</h3>
                  <Textarea 
                    placeholder="Type your answer here..." 
                    className="min-h-[200px] bg-dark-surface border-dark-border"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={submitAnswerMutation.isPending}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmitAnswer}
                      className="bg-primary-600 hover:bg-primary-500"
                      disabled={!answer.trim() || submitAnswerMutation.isPending}
                    >
                      {submitAnswerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting
                        </>
                      ) : (
                        'Submit Answer'
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Submitted message */}
              {battle.status === 'in_progress' && hasSubmitted && (
                <div className="bg-success-500/10 border border-success-500/30 rounded-md p-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-success-400" />
                  <div>
                    <h4 className="font-medium">Answer Submitted</h4>
                    <p className="text-sm text-gray-400">You've submitted your answer. Waiting for other participants to complete.</p>
                  </div>
                </div>
              )}
              
              {/* Battle completed message */}
              {battle.status === 'completed' && (
                <div className="bg-primary-500/10 border border-primary-500/30 rounded-md p-4">
                  <h4 className="font-medium mb-2">Battle Completed</h4>
                  <p className="text-sm text-gray-400 mb-4">All participants have submitted their answers. The battle results will be announced shortly.</p>
                  
                  {battle.winner && (
                    <div className="bg-warning-500/10 border border-warning-500/30 rounded-md p-3">
                      <h5 className="text-warning-400 font-medium">Winner: {battle.winner}</h5>
                      <p className="text-xs text-gray-400">Congratulations to the winner!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Chat section */}
          <Card className="bg-dark-card border-dark-border mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Battle Chat</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[200px] overflow-y-auto space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-8">No messages yet. Be the first to cheer!</p>
              )}
              
              {messages.map((message, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {message.username ? message.username.charAt(0) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-xs font-medium">{message.username || 'User'}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{message.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <div className="flex w-full">
                <Input 
                  placeholder="Send a message..." 
                  className="flex-1 bg-dark-surface border-dark-border"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  className="ml-2 bg-primary-600 hover:bg-primary-500"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !connected}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="bg-dark-card border-dark-border"
        >
          Back to Battle List
        </Button>
      </div>
    </div>
  );
}