import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Clock, Target, Users, Crown, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuestionProgress {
  userId: number;
  userName: string;
  userProfileImage?: string;
  currentQuestionNumber: number;
  questionsCompleted: number;
  questionStartTime?: string;
  score?: number;
  rank?: number;
  currentRank: number;
  isLeading: boolean;
  questionsBehind: number;
}

interface LiveQuestionTrackerProps {
  battleId: number;
  totalQuestions: number;
  isParticipant?: boolean;
  currentUserId?: number;
}

export const LiveQuestionTracker: React.FC<LiveQuestionTrackerProps> = ({ 
  battleId, 
  totalQuestions, 
  isParticipant = false,
  currentUserId 
}) => {
  const [liveUpdates, setLiveUpdates] = useState<boolean>(true);

  // Fetch question progress every 2 seconds for live updates
  const { data: progressData, refetch } = useQuery<QuestionProgress[]>({
    queryKey: [`/api/enhanced-battles/${battleId}/question-progress`],
    refetchInterval: liveUpdates ? 2000 : false, // Poll every 2 seconds when live updates are on
    enabled: !!battleId
  });

  // Sort participants by current question number (descending) and then by completion time
  const sortedProgress = progressData?.sort((a, b) => {
    if (a.currentQuestionNumber !== b.currentQuestionNumber) {
      return b.currentQuestionNumber - a.currentQuestionNumber;
    }
    return a.questionsCompleted - b.questionsCompleted;
  }) || [];

  const getPositionIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 2:
        return <Trophy className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Trophy className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getProgressPercentage = (currentQ: number) => {
    return Math.min((currentQ / totalQuestions) * 100, 100);
  };

  const getCurrentUserProgress = () => {
    return sortedProgress.find(p => p.userId === currentUserId);
  };

  const currentUserProgress = getCurrentUserProgress();

  return (
    <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Live Question Progress</h3>
          <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-400/10">
            LIVE
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Users className="w-4 h-4" />
          <span>{sortedProgress.length} participants</span>
          <button
            onClick={() => setLiveUpdates(!liveUpdates)}
            className={`ml-2 px-2 py-1 rounded text-xs ${
              liveUpdates 
                ? 'bg-green-600/20 text-green-400 border border-green-400/50' 
                : 'bg-gray-600/20 text-gray-400 border border-gray-400/50'
            }`}
          >
            {liveUpdates ? 'Live On' : 'Live Off'}
          </button>
        </div>
      </div>

      {/* Current User Summary (if participant) */}
      {isParticipant && currentUserProgress && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {String(currentUserProgress.userName || 'You').charAt(0)}
              </div>
              <div>
                <div className="text-white font-semibold">Your Progress</div>
                <div className="text-sm text-gray-300">
                  Question {currentUserProgress.currentQuestionNumber} of {totalQuestions}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-cyan-400">
                #{currentUserProgress.currentRank}
              </div>
              <div className="text-xs text-gray-400">
                {currentUserProgress.questionsBehind > 0 
                  ? `${currentUserProgress.questionsBehind} behind` 
                  : currentUserProgress.isLeading 
                    ? 'Leading!' 
                    : 'On track'
                }
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(currentUserProgress.currentQuestionNumber)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {Math.round(getProgressPercentage(currentUserProgress.currentQuestionNumber))}% complete
            </div>
          </div>
        </div>
      )}

      {/* All Participants Progress */}
      <div className="space-y-2">
        {sortedProgress.map((participant, index) => (
          <div
            key={participant.userId}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
              participant.userId === currentUserId
                ? 'bg-blue-900/20 border-blue-500/50'
                : participant.isLeading
                ? 'bg-yellow-900/20 border-yellow-500/50'
                : 'bg-gray-800/50 border-gray-600/30'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Position */}
              <div className="flex items-center justify-center w-8">
                {getPositionIcon(index + 1)}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
                  {participant.userProfileImage ? (
                    <img 
                      src={participant.userProfileImage} 
                      alt={String(participant.userName)}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    String(participant.userName || 'P').charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${
                    participant.isLeading ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {String(participant.userName || 'Player')}
                    {participant.userId === currentUserId && ' (You)'}
                    {participant.isLeading && (
                      <Zap className="w-4 h-4 text-yellow-400 inline ml-1" />
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    Question {participant.currentQuestionNumber} of {totalQuestions}
                    {participant.questionsCompleted > 0 && (
                      <span className="text-green-400 ml-2">
                        • {participant.questionsCompleted} completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-32">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      participant.isLeading
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : participant.userId === currentUserId
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-gray-500 to-gray-400'
                    }`}
                    style={{ width: `${getProgressPercentage(participant.currentQuestionNumber)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {Math.round(getProgressPercentage(participant.currentQuestionNumber))}%
                </div>
              </div>

              {/* Status & Score */}
              <div className="text-right">
                {participant.score !== undefined && (
                  <div className="text-lg font-bold text-cyan-400">
                    {participant.score}
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  {participant.questionsBehind > 0 
                    ? `${participant.questionsBehind} behind`
                    : participant.isLeading 
                      ? 'Leading'
                      : 'On track'
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-600/30 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Updates every 2 seconds</span>
        </div>
        <div>
          Total Questions: {totalQuestions}
        </div>
      </div>
    </div>
  );
};

export default LiveQuestionTracker;