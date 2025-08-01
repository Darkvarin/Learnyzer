import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Define all the message types our real-time system will handle
export interface RealTimeMessage {
  type: string;
  timestamp: string;
  [key: string]: any;
}

// Events related to user progress and stats
interface ProgressUpdateMessage extends RealTimeMessage {
  type: 'progress_update';
  userId: number;
  xpGained: number;
  newLevel?: number;
  message: string;
}

// Events related to streaks
interface StreakUpdateMessage extends RealTimeMessage {
  type: 'streak_update';
  userId: number;
  streakDays: number;
  streakGoalsCompleted?: number;
  canClaimReward: boolean;
}

// Events related to rank changes
interface RankUpdateMessage extends RealTimeMessage {
  type: 'rank_update';
  userId: number;
  oldRank: string;
  newRank: string;
  rankPoints: number;
}

// Events related to reward system
interface RewardMessage extends RealTimeMessage {
  type: 'reward_unlocked' | 'reward_claimed';
  userId: number;
  rewardId: number;
  rewardName: string;
  rewardDescription: string;
}

// Events related to achievement system
interface AchievementMessage extends RealTimeMessage {
  type: 'achievement_progress' | 'achievement_completed';
  userId: number;
  achievementId: number;
  achievementName: string;
  progress: number;
  isCompleted: boolean;
}

// Events related to referral system
interface ReferralMessage extends RealTimeMessage {
  type: 'referral_joined';
  referrerId: number;
  referredId: number;
  referredName: string;
  xpEarned: number;
}

// Events related to AI system updates
interface AIUpdateMessage extends RealTimeMessage {
  type: 'ai_insight_generated' | 'ai_tutor_session_completed';
  userId: number;
  messageType: string;
  message: string;
}

// Events related to system-wide notifications
interface NotificationMessage extends RealTimeMessage {
  type: 'notification';
  userId: number;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

// Events related to leaderboard updates
interface LeaderboardUpdateMessage extends RealTimeMessage {
  type: 'leaderboard_update';
  userIds: number[];
  updateType: 'rank' | 'xp' | 'streak' | 'position';
  message: string;
}

// Union type of all message types
type RealTimeUpdateMessage = 
  | ProgressUpdateMessage
  | StreakUpdateMessage
  | RankUpdateMessage
  | RewardMessage
  | AchievementMessage
  | ReferralMessage
  | AIUpdateMessage
  | NotificationMessage
  | LeaderboardUpdateMessage;

// Context interface
interface RealTimeContextType {
  connected: boolean;
  reconnecting: boolean;
  lastUpdate: RealTimeUpdateMessage | null;
  notifications: NotificationMessage[];
  clearNotification: (index: number) => void;
  sendNotification: (notification: Omit<NotificationMessage, 'type' | 'timestamp' | 'userId'>) => void;
}

// Create the context
const RealTimeContext = createContext<RealTimeContextType | null>(null);

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealTimeUpdateMessage | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Function to create a WebSocket and attach event handlers
  const createWebSocketConnection = (wsUrl: string, userId: number) => {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {

      setConnected(true);
      setReconnecting(false);
      
      // Send authentication message
      ws.send(JSON.stringify({
        type: 'auth',
        userId: userId,
        timestamp: new Date().toISOString()
      }));
    };
    
    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: RealTimeUpdateMessage = JSON.parse(event.data);
        
        // Ignore messages not meant for this user
        if ('userId' in data && data.userId !== userId) return;
        
        // Process the message based on its type
        processMessage(data);
      } catch (error) {
        console.error('Error processing real-time message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Real-time WebSocket error:', error);
    };
    
    // Handle connection close and trigger reconnection
    ws.onclose = () => {

      setConnected(false);
      
      // Don't attempt to reconnect if the user has logged out
      if (!userId) return;
      
      // Set reconnecting state and attempt to reconnect after a delay
      setReconnecting(true);
      
      // Use a timeout to handle reconnection
      setTimeout(() => {

        // Only try to reconnect if we're still in CLOSED state
        if (socketRef.current === ws || socketRef.current === null || 
            socketRef.current.readyState === WebSocket.CLOSED) {
          socketRef.current = createWebSocketConnection(wsUrl, userId);
        }
      }, 3000);
    };
    
    return ws;
  };

  // Setup WebSocket connection
  useEffect(() => {
    if (!user) {
      // Not authenticated yet, don't connect
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
      setReconnecting(false);
      return;
    }

    // Create WebSocket connection for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Create initial connection
    socketRef.current = createWebSocketConnection(wsUrl, user.id);
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [user]);
  
  // Handle different message types
  const processMessage = (message: RealTimeUpdateMessage) => {
    setLastUpdate(message);
    
    switch (message.type) {
      case 'progress_update':
        // Invalidate user stats queries
        queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
        showProgressToast(message as ProgressUpdateMessage);
        break;
        
      case 'streak_update':
        // Invalidate streak queries
        queryClient.invalidateQueries({ queryKey: ['/api/user/streak'] });
        showStreakToast(message as StreakUpdateMessage);
        break;
        
      case 'rank_update':
        // Invalidate rank queries
        queryClient.invalidateQueries({ queryKey: ['/api/user/rank'] });
        showRankToast(message as RankUpdateMessage);
        break;
        
      case 'reward_unlocked':
      case 'reward_claimed':
        // Invalidate rewards queries
        queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
        showRewardToast(message as RewardMessage);
        break;
        
      case 'achievement_progress':
      case 'achievement_completed':
        // Invalidate achievement queries
        queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
        showAchievementToast(message as AchievementMessage);
        break;
        
      case 'referral_joined':
        // Invalidate referral queries
        queryClient.invalidateQueries({ queryKey: ['/api/user/referrals'] });
        showReferralToast(message as ReferralMessage);
        break;
        
      case 'ai_insight_generated':
      case 'ai_tutor_session_completed':
        // Handle each AI message type with specific query invalidation
        const aiMessage = message as AIUpdateMessage;
        
        // Base invalidation for all AI-related events
        queryClient.invalidateQueries({ queryKey: ['/api/ai'] });
        
        // Specific invalidation based on message type will be handled in showAIToast
        showAIToast(aiMessage);
        break;
        
      case 'notification':
        // Add to notifications
        const notificationMsg = message as NotificationMessage;
        setNotifications(prev => [...prev, notificationMsg]);
        showNotificationToast(notificationMsg);
        break;
        
      case 'leaderboard_update':
        // Handle leaderboard updates by invalidating the appropriate queries
        const leaderboardMsg = message as LeaderboardUpdateMessage;
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
        
        // Show a toast notification about the leaderboard update
        showLeaderboardToast(leaderboardMsg);
        break;

      default:
        // Type assertion to make sure TypeScript recognizes 'type' property
        const typedMessage = message as { type?: string };
        if (typedMessage.type) {
          // Unhandled message type - could log to error service in production
        } else {
          // Unknown message format - could log to error service in production
        }
    }
  };
  
  // Toast message handlers
  const showProgressToast = (message: ProgressUpdateMessage) => {
    toast({
      title: message.newLevel ? "Level Up!" : "XP Gained!",
      description: message.message,
      variant: "level" // Use our new custom variant
    });
  };
  
  const showStreakToast = (message: StreakUpdateMessage) => {
    toast({
      title: "Streak Updated",
      description: `You're on a ${message.streakDays} day streak! ${message.canClaimReward ? 'Claim your reward!' : ''}`,
      variant: "level" // Using level variant for streak too
    });
  };
  
  const showRankToast = (message: RankUpdateMessage) => {
    toast({
      title: "Rank Promoted!",
      description: `You've been promoted from ${message.oldRank} to ${message.newRank}!`,
      variant: "rank" // Use our new custom variant
    });
  };
  
  const showRewardToast = (message: RewardMessage) => {
    toast({
      title: message.type === 'reward_unlocked' ? "Reward Unlocked!" : "Reward Claimed!",
      description: message.rewardDescription,
      variant: "reward" // Use our new custom variant
    });
  };
  
  const showAchievementToast = (message: AchievementMessage) => {
    if (message.type === 'achievement_completed') {
      toast({
        title: "Achievement Unlocked!",
        description: `You've completed: ${message.achievementName}`,
        variant: "achievement" // Use our new custom variant
      });
    }
  };
  
  const showReferralToast = (message: ReferralMessage) => {
    toast({
      title: "New Referral!",
      description: `${message.referredName} joined using your referral link! You earned ${message.xpEarned} XP.`,
      variant: "reward" // Using reward variant for referrals
    });
  };
  
  const showAIToast = (message: AIUpdateMessage) => {
    let title = "";
    let variant = "level"; // Default to level variant for AI messages
    
    // Set title based on message type and specific AI feature
    if (message.type === 'ai_insight_generated') {
      if (message.messageType === 'performance_insights') {
        title = "Performance Insights Ready!";
        queryClient.invalidateQueries({ queryKey: ['/api/ai/tools/insights'] });
      } else if (message.messageType === 'study_notes') {
        title = "Study Notes Generated";
        queryClient.invalidateQueries({ queryKey: ['/api/ai/tools/notes'] });
      } else if (message.messageType === 'flashcards') {
        title = "Flashcards Generated";
        queryClient.invalidateQueries({ queryKey: ['/api/ai/tools/flashcards'] });
      } else if (message.messageType === 'answer_check') {
        title = "Answer Evaluated";
        queryClient.invalidateQueries({ queryKey: ['/api/ai/tools/check-answer'] });
      } else {
        title = "New AI Insight";
      }
    } else if (message.type === 'ai_tutor_session_completed') {
      title = "AI Tutor Session Completed";
      queryClient.invalidateQueries({ queryKey: ['/api/ai/tutor'] });
    }
    
    toast({
      title: title,
      description: message.message,
      variant: variant as any
    });
  };
  
  const showLeaderboardToast = (message: LeaderboardUpdateMessage) => {
    let title: string;
    let description: string;
    
    // Set toast title and description based on update type
    switch (message.updateType) {
      case 'rank':
        title = "Leaderboard Ranks Updated";
        description = message.message || "Some players have changed ranks. Check the leaderboard!";
        break;
      case 'xp':
        title = "Leaderboard XP Updated";
        description = message.message || "XP changes have affected the leaderboard standings!";
        break;
      case 'streak':
        title = "Streak Leaders Changed";
        description = message.message || "Streak leaders have changed positions on the leaderboard!";
        break;
      case 'position':
        title = "Leaderboard Positions Changed";
        description = message.message || "There have been changes to the leaderboard rankings!";
        break;
      default:
        title = "Leaderboard Updated";
        description = message.message || "The leaderboard has been updated with new information!";
    }
    
    toast({
      title: title,
      description: description,
      variant: "rank" // Using rank variant for leaderboard updates
    });
    
    // Also invalidate specific query keys based on update type
    if (message.updateType === 'rank') {
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard/ranks'] });
    } else if (message.updateType === 'xp') {
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard/xp'] });
    } else if (message.updateType === 'streak') {
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard/streaks'] });
    }
  };

  const showNotificationToast = (message: NotificationMessage) => {
    // Map severity to our variants with Solo Leveling theme
    let variant = "default";
    if (message.severity === 'error') {
      variant = "destructive";
    } else if (message.title.toLowerCase().includes('achievement') || message.message.toLowerCase().includes('achievement')) {
      variant = "achievement";
    } else if (
      message.title.toLowerCase().includes('level') || 
      message.title.toLowerCase().includes('xp') || 
      message.message.toLowerCase().includes('level') ||
      message.message.toLowerCase().includes('xp')
    ) {
      variant = "level";
    } else if (
      message.title.toLowerCase().includes('reward') || 
      message.message.toLowerCase().includes('reward') ||
      message.title.toLowerCase().includes('claim') ||
      message.message.toLowerCase().includes('claim')
    ) {
      variant = "reward";
    } else if (
      message.title.toLowerCase().includes('rank') || 
      message.message.toLowerCase().includes('rank') ||
      message.title.toLowerCase().includes('promo') ||
      message.message.toLowerCase().includes('promo')
    ) {
      variant = "rank";
    }
    
    toast({
      title: message.title,
      description: message.message,
      variant: variant as any
    });
  };
  
  // Clear a notification by index
  const clearNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };
  
  // Send a notification (for components to trigger notifications)
  const sendNotification = (notification: Omit<NotificationMessage, 'type' | 'timestamp' | 'userId'>) => {
    if (!user) return;
    
    const fullNotification: NotificationMessage = {
      type: 'notification',
      userId: user.id,
      timestamp: new Date().toISOString(),
      title: notification.title,
      message: notification.message,
      severity: notification.severity
    };
    
    setNotifications(prev => [...prev, fullNotification]);
    showNotificationToast(fullNotification);
  };
  
  return (
    <RealTimeContext.Provider value={{
      connected,
      reconnecting,
      lastUpdate,
      notifications,
      clearNotification,
      sendNotification
    }}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime() {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
}