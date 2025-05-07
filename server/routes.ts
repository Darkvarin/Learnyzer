import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { authService } from "./services/auth-service";
import { userService } from "./services/user-service";
import { aiService } from "./services/ai-service";
import { courseService } from "./services/course-service";
import { battleService } from "./services/battle-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up enhanced authentication with improved security and database session storage
  setupAuth(app);

  // Auth routes
  app.post("/api/auth/register", authService.register);
  app.post("/api/auth/login", authService.login);
  app.post("/api/auth/logout", authService.logout);
  app.get("/api/auth/me", authService.getCurrentUser);

  // User routes
  app.get("/api/user/stats", userService.getUserStats);
  app.get("/api/user/streak", userService.getUserStreak);
  app.post("/api/user/streak/claim", userService.claimStreakReward);
  app.get("/api/user/rank", userService.getUserRank);
  app.get("/api/user/referrals", userService.getUserReferrals);
  app.post("/api/user/referrals", userService.createReferral);
  
  // AI routes
  app.get("/api/ai/tutor", aiService.getAITutor);
  app.post("/api/ai/tutor/respond", aiService.getAITutorResponse);
  app.get("/api/ai/conversation/recent", aiService.getRecentConversation);
  app.post("/api/ai/conversation", aiService.saveConversation);
  app.get("/api/ai/tools", aiService.getAITools);
  app.get("/api/ai/tools/:id", aiService.getAITool);
  app.post("/api/ai/tools/notes", aiService.generateStudyNotes);
  app.post("/api/ai/tools/answer-check", aiService.checkAnswer);
  app.post("/api/ai/tools/flashcards", aiService.generateFlashcards);
  app.get("/api/ai/tools/insights/:userId", aiService.getPerformanceInsights);
  app.post("/api/ai/battle/judge/:battleId", aiService.judgeBattle);
  
  // Course routes
  app.get("/api/courses", courseService.getAllCourses);
  app.get("/api/courses/recent", courseService.getRecentCourses);
  app.get("/api/courses/categories", courseService.getCourseCategories);
  app.get("/api/courses/:id", courseService.getCourseById);
  app.post("/api/courses/:id/enroll", courseService.enrollCourse);
  app.patch("/api/courses/:id/progress", courseService.updateCourseProgress);
  
  // Battle routes
  app.get("/api/battles", battleService.getAllBattles);
  app.get("/api/battles/active", battleService.getActiveBattles);
  app.get("/api/battles/:id", battleService.getBattleById);
  app.post("/api/battles", battleService.createBattle);
  app.post("/api/battles/:id/join", battleService.joinBattle);
  app.post("/api/battles/:id/submit", battleService.submitBattleAnswer);
  
  // Rewards routes
  app.get("/api/rewards", userService.getAllRewards);
  app.post("/api/rewards/:id/claim", userService.claimReward);
  
  // Achievements routes
  app.get("/api/achievements", userService.getAllAchievements);
  app.get("/api/achievements/:id", userService.getAchievementById);

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time battle updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections by user ID and battle ID
  const connections = new Map<string, WebSocket>();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket connection established');
    let userId: string | null = null;
    let battleId: string | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Store user and battle IDs from incoming messages
        if (data.userId) {
          userId = data.userId;
          connections.set(`user_${userId}`, ws);
        }
        
        if (data.battleId) {
          battleId = data.battleId;
          if (userId) {
            connections.set(`battle_${battleId}_user_${userId}`, ws);
          }
        }
        
        // Handle battle join
        if (data.type === 'join_battle') {
          console.log(`User ${data.username || userId} joined battle ${battleId} via WebSocket`);
          
          // Notify all battle participants
          broadcastToBattle(data.battleId.toString(), {
            type: 'participant_joined',
            userId: data.userId,
            username: data.username,
            battleId: data.battleId,
            timestamp: data.timestamp || new Date().toISOString()
          });
        }
        
        // Handle chat message
        if (data.type === 'chat_message') {
          broadcastToBattle(data.battleId.toString(), {
            type: 'chat_message',
            userId: data.userId,
            username: data.username,
            battleId: data.battleId,
            content: data.content,
            timestamp: data.timestamp || new Date().toISOString()
          });
        }
        
        // Handle answer submission
        if (data.type === 'answer_submitted') {
          broadcastToBattle(data.battleId.toString(), {
            type: 'answer_submitted',
            userId: data.userId,
            username: data.username,
            battleId: data.battleId,
            timestamp: data.timestamp || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        connections.delete(`user_${userId}`);
        if (battleId) {
          connections.delete(`battle_${battleId}_user_${userId}`);
          broadcastToBattle(battleId, {
            type: 'user_left',
            userId: userId,
            battleId: battleId,
            timestamp: new Date().toISOString()
          });
        }
      }
      console.log('WebSocket connection closed');
    });
  });
  
  // Helper function to broadcast messages to all battle participants
  function broadcastToBattle(battleId: string, message: any) {
    const battlePrefix = `battle_${battleId}_user_`;
    
    for (const [key, connection] of connections.entries()) {
      if (key.startsWith(battlePrefix) && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message));
      }
    }
  }
  
  // Export the broadcast function for use in battle service
  (global as any).broadcastToBattle = broadcastToBattle;

  return httpServer;
}
