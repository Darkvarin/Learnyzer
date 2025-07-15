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
  
  // WebSocket for real-time updates
  const { submissions, isConnected } = useBattleWebSocket(battle.id);
  
  // Timer effect
  useEffect(() => {
    if (battle.status !== 'in_progress') return;
    
    const timer = setInterval(() => {
      if (battle.startTime) {
        const now = Date.now();
        const startTime = new Date(battle.startTime).getTime();
        const endTime = startTime + (battle.duration * 60 * 1000);
        const remaining = Math.max(0, endTime - now);
        
        if (remaining === 0) {
          setTimeLeft('Time up!');
          clearInterval(timer);
          return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [battle.status, battle.startTime, battle.duration]);
  
  // Mutations for battle actions
  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      console.log('Submitting answer for battle:', battle.id, 'answer:', answer);
      const result = await apiRequest('POST', `/api/enhanced-battles/${battle.id}/submit`, { answer });
      console.log('Submit answer result:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Answer submitted!',
        description: 'Your answer has been recorded.',
      });
      setAnswer('');
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-battles', battle.id] });
    },
    onError: (error: any) => {
      console.error('Submit answer error:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });
  
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
  
  const participants = battle.participants || [];

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="relative bg-gradient-to-r from-cyan-900/50 via-blue-900/50 to-purple-900/50 p-4 rounded-xl border border-cyan-500/30">
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
      
      {/* Content area */}
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
            <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Question 1/{battle.questionsCount || 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 p-4 rounded-lg border border-gray-600/50">
              <p className="text-white leading-relaxed">
                Sample question for {battle.examType} - {battle.subject}
              </p>
            </div>
            
            {battle.status === 'in_progress' && !hasSubmitted && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Enter your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 min-h-[100px]"
                />
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={submitAnswerMutation.isPending || !answer.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {submitAnswerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Answer
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {hasSubmitted && (
              <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">Answer submitted successfully!</span>
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
  );
}