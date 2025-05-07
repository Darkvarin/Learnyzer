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

// Union type of all message types
type RealTimeUpdateMessage = 
  | ProgressUpdateMessage
  | StreakUpdateMessage
  | RankUpdateMessage
  | RewardMessage
  | AchievementMessage
  | ReferralMessage
  | AIUpdateMessage
  | NotificationMessage;

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
  const [lastUpdate, setLastUpdate] = useState<RealTimeUpdateMessage | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Setup WebSocket connection
  useEffect(() => {
    if (!user) {
      // Not authenticated yet, don't connect
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    // Create WebSocket connection for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = new WebSocket(wsUrl);
    
    socketRef.current.onopen = () => {
      console.log('Real-time WebSocket connection established');
      setConnected(true);
      
      // Send authentication message
      if (socketRef.current && user) {
        socketRef.current.send(JSON.stringify({
          type: 'auth',
          userId: user.id,
          timestamp: new Date().toISOString()
        }));
      }
    };
    
    socketRef.current.onclose = () => {
      console.log('Real-time WebSocket connection closed');
      setConnected(false);
      
      // Attempt to reconnect after a delay if user is still logged in
      if (user) {
        setTimeout(() => {
          console.log('Attempting to reconnect to real-time service...');
          // Re-establish connection if the component is still mounted
          if (socketRef.current === null || socketRef.current.readyState === WebSocket.CLOSED) {
            const newWs = new WebSocket(wsUrl);
            socketRef.current = newWs;
            
            newWs.onopen = () => {
              console.log('Real-time WebSocket reconnected');
              setConnected(true);
              
              // Re-authenticate
              newWs.send(JSON.stringify({
                type: 'auth',
                userId: user.id,
                timestamp: new Date().toISOString()
              }));
            };
            
            // Set up the same event handlers for the new connection
            newWs.onmessage = socketRef.current.onmessage;
            newWs.onerror = socketRef.current.onerror;
            newWs.onclose = socketRef.current.onclose;
          }
        }, 3000); // Wait 3 seconds before attempting to reconnect
      }
    };
    
    socketRef.current.onerror = (error) => {
      console.error('Real-time WebSocket error:', error);
    };
    
    socketRef.current.onmessage = (event) => {
      try {
        const data: RealTimeUpdateMessage = JSON.parse(event.data);
        
        // Ignore messages not meant for this user
        if ('userId' in data && data.userId !== user.id) return;
        
        // Process the message based on its type
        processMessage(data);
        
      } catch (error) {
        console.error('Error processing real-time message:', error);
      }
    };
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
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
        
      default:
        console.log('Unhandled real-time message type:', message.type);
    }
  };
  
  // Toast message handlers
  const showProgressToast = (message: ProgressUpdateMessage) => {
    toast({
      title: message.newLevel ? "Level Up!" : "XP Gained!",
      description: message.message,
      variant: "default"
    });
  };
  
  const showStreakToast = (message: StreakUpdateMessage) => {
    toast({
      title: "Streak Updated",
      description: `You're on a ${message.streakDays} day streak! ${message.canClaimReward ? 'Claim your reward!' : ''}`,
      variant: "default"
    });
  };
  
  const showRankToast = (message: RankUpdateMessage) => {
    toast({
      title: "Rank Promoted!",
      description: `You've been promoted from ${message.oldRank} to ${message.newRank}!`,
      variant: "default"
    });
  };
  
  const showRewardToast = (message: RewardMessage) => {
    toast({
      title: message.type === 'reward_unlocked' ? "Reward Unlocked!" : "Reward Claimed!",
      description: message.rewardDescription,
      variant: "default"
    });
  };
  
  const showAchievementToast = (message: AchievementMessage) => {
    if (message.type === 'achievement_completed') {
      toast({
        title: "Achievement Unlocked!",
        description: `You've completed: ${message.achievementName}`,
        variant: "default"
      });
    }
  };
  
  const showReferralToast = (message: ReferralMessage) => {
    toast({
      title: "New Referral!",
      description: `${message.referredName} joined using your referral link! You earned ${message.xpEarned} XP.`,
      variant: "default"
    });
  };
  
  const showAIToast = (message: AIUpdateMessage) => {
    let title = "";
    
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
      variant: "default"
    });
  };
  
  const showNotificationToast = (message: NotificationMessage) => {
    toast({
      title: message.title,
      description: message.message,
      variant: message.severity === 'error' ? 'destructive' : 'default'
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
      ...notification
    };
    
    setNotifications(prev => [...prev, fullNotification]);
    showNotificationToast(fullNotification);
  };
  
  return (
    <RealTimeContext.Provider value={{
      connected,
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