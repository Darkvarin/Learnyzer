import { Request, Response } from 'express';

const requireAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

export const notificationService = {
  /**
   * Send a test notification to the current user
   */
  async sendTestNotification(req: Request, res: Response) {
    requireAuth(req, () => {});
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user!.id;
    const sendToUser = (global as any).sendToUser;
    
    if (!sendToUser) {
      return res.status(500).json({ message: 'WebSocket service not available' });
    }
    
    const success = sendToUser(userId, {
      type: 'notification',
      userId,
      title: 'Test Notification',
      message: 'This is a test notification sent via the WebSocket system.',
      severity: 'info',
      timestamp: new Date().toISOString()
    });
    
    if (success) {
      return res.status(200).json({ message: 'Test notification sent successfully' });
    } else {
      return res.status(404).json({ message: 'User not connected to WebSocket' });
    }
  },
  
  /**
   * Simulate a streak update notification
   */
  async simulateStreakUpdate(req: Request, res: Response) {
    requireAuth(req, () => {});
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user!.id;
    const sendToUser = (global as any).sendToUser;
    
    if (!sendToUser) {
      return res.status(500).json({ message: 'WebSocket service not available' });
    }
    
    const { streakDays } = req.body;
    
    const success = sendToUser(userId, {
      type: 'streak_update',
      userId,
      streakDays: streakDays || 7,
      canClaimReward: true,
      timestamp: new Date().toISOString()
    });
    
    if (success) {
      return res.status(200).json({ message: 'Streak update notification sent successfully' });
    } else {
      return res.status(404).json({ message: 'User not connected to WebSocket' });
    }
  },
  
  /**
   * Simulate a rank promotion notification
   */
  async simulateRankPromotion(req: Request, res: Response) {
    requireAuth(req, () => {});
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user!.id;
    const sendToUser = (global as any).sendToUser;
    
    if (!sendToUser) {
      return res.status(500).json({ message: 'WebSocket service not available' });
    }
    
    const { oldRank, newRank, rankPoints } = req.body;
    
    const success = sendToUser(userId, {
      type: 'rank_update',
      userId,
      oldRank: oldRank || 'Bronze',
      newRank: newRank || 'Silver',
      rankPoints: rankPoints || 2000,
      timestamp: new Date().toISOString()
    });
    
    if (success) {
      return res.status(200).json({ message: 'Rank promotion notification sent successfully' });
    } else {
      return res.status(404).json({ message: 'User not connected to WebSocket' });
    }
  },
  
  /**
   * Simulate an achievement notification
   */
  async simulateAchievement(req: Request, res: Response) {
    requireAuth(req, () => {});
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user!.id;
    const sendToUser = (global as any).sendToUser;
    
    if (!sendToUser) {
      return res.status(500).json({ message: 'WebSocket service not available' });
    }
    
    const { achievementName } = req.body;
    
    const success = sendToUser(userId, {
      type: 'achievement_completed',
      userId,
      achievementId: 1,
      achievementName: achievementName || 'Study Streak Master',
      progress: 100,
      isCompleted: true,
      timestamp: new Date().toISOString()
    });
    
    if (success) {
      return res.status(200).json({ message: 'Achievement notification sent successfully' });
    } else {
      return res.status(404).json({ message: 'User not connected to WebSocket' });
    }
  },
  
  /**
   * Simulate an XP gained notification
   */
  async simulateXpGained(req: Request, res: Response) {
    requireAuth(req, () => {});
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user!.id;
    const sendToUser = (global as any).sendToUser;
    
    if (!sendToUser) {
      return res.status(500).json({ message: 'WebSocket service not available' });
    }
    
    const { xpGained, newLevel } = req.body;
    
    const success = sendToUser(userId, {
      type: 'progress_update',
      userId,
      xpGained: xpGained || 100,
      newLevel: newLevel || undefined,
      message: newLevel ? `You've leveled up to level ${newLevel}!` : `You've earned ${xpGained || 100} XP!`,
      timestamp: new Date().toISOString()
    });
    
    if (success) {
      return res.status(200).json({ message: 'XP gained notification sent successfully' });
    } else {
      return res.status(404).json({ message: 'User not connected to WebSocket' });
    }
  },
  
  /**
   * Simulate an AI tool completion notification
   */
  async simulateAiToolCompletion(req: Request, res: Response) {
    requireAuth(req, () => {});
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user!.id;
    const sendToUser = (global as any).sendToUser;
    
    if (!sendToUser) {
      return res.status(500).json({ message: 'WebSocket service not available' });
    }
    
    const { toolType } = req.body;
    let messageType, message;
    
    switch (toolType) {
      case 'insights':
        messageType = 'performance_insights';
        message = 'Your performance insights are ready. Check the AI Tools section to view them.';
        break;
      case 'notes':
        messageType = 'study_notes';
        message = 'Your study notes have been generated. Check the AI Tools section to view them.';
        break;
      case 'flashcards':
        messageType = 'flashcards';
        message = 'Your flashcards have been generated. Check the AI Tools section to view them.';
        break;
      case 'answer_check':
        messageType = 'answer_check';
        message = 'Your answer has been evaluated. Check the AI Tools section to view the feedback.';
        break;
      default:
        messageType = 'study_notes';
        message = 'Your AI tool request has completed. Check the AI Tools section to view the results.';
    }
    
    const success = sendToUser(userId, {
      type: 'ai_insight_generated',
      userId,
      messageType,
      message,
      timestamp: new Date().toISOString()
    });
    
    if (success) {
      return res.status(200).json({ message: 'AI tool completion notification sent successfully' });
    } else {
      return res.status(404).json({ message: 'User not connected to WebSocket' });
    }
  }
};