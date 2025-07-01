import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { authService } from "./services/auth-service";
import { userService } from "./services/user-service";
import { aiService } from "./services/ai-service";
import { courseService } from "./services/course-service";
import { battleService } from "./services/battle-service";
import { notificationService } from "./services/notification-service";
import { supportService } from "./services/support-service";
import { wellnessService } from "./services/wellness-service";
import { leaderboardService } from "./services/leaderboard-service";
import { paymentService } from "./services/payment-service";
import { otpService } from "./services/otp-service";
import { setupSEORoutes } from "./services/sitemap-generator";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up enhanced authentication with improved security and database session storage
  setupAuth(app);

  // Set up SEO routes (sitemap.xml, robots.txt, schema.json)
  setupSEORoutes(app);

  // Auth routes
  app.post("/api/auth/register", authService.register);
  app.post("/api/auth/login", authService.login);
  app.post("/api/auth/logout", authService.logout);
  app.get("/api/auth/me", authService.getCurrentUser);

  // OTP routes for mobile verification
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { mobile, purpose } = req.body;
      
      if (!mobile || !purpose) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mobile number and purpose are required' 
        });
      }

      const result = await otpService.sendOTP(mobile, purpose);
      res.json(result);
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { mobile, otp, purpose } = req.body;
      
      if (!mobile || !otp || !purpose) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mobile number, OTP, and purpose are required' 
        });
      }

      const result = await otpService.verifyOTP(mobile, otp, purpose);
      res.json(result);
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Authentication middleware for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // User routes
  app.get("/api/user/stats", requireAuth, userService.getUserStats);
  app.get("/api/user/streak", requireAuth, userService.getUserStreak);
  app.post("/api/user/streak/claim", requireAuth, userService.claimStreakReward);
  app.get("/api/user/rank", requireAuth, userService.getUserRank);
  app.get("/api/user/referrals", requireAuth, userService.getUserReferrals);
  app.post("/api/user/referrals", requireAuth, userService.createReferral);

  // Gamification - Streak endpoints
  app.get("/api/gamification/streak", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const streakData = await storage.getUserStreakData(userId);
      
      // Check if streak needs to be updated
      const needsUpdate = await storage.needsStreakUpdate(userId);
      if (needsUpdate) {
        await storage.updateUserStreak(userId);
        await storage.initializeStreakGoals(userId);
      }
      
      res.json(streakData);
    } catch (error) {
      console.error("Error fetching streak data:", error);
      res.status(500).json({ message: "Failed to fetch streak data" });
    }
  });

  app.post("/api/gamification/streak/claim", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const streakData = await storage.getUserStreakData(userId);
      
      if (!streakData.canClaimReward) {
        return res.status(400).json({ message: "No reward available to claim" });
      }
      
      // Calculate XP based on streak length
      let xpEarned = 50; // Base reward
      if (streakData.days >= 30) xpEarned = 500; // Monthly champion
      else if (streakData.days % 7 === 0) xpEarned = 200; // Perfect week
      else if ([7, 14, 21, 50, 100].includes(streakData.days)) xpEarned = 300; // Milestones
      
      // Award XP and mark reward as claimed
      await storage.addUserXP(userId, xpEarned);
      await storage.markStreakRewardClaimed(userId);
      
      res.json({ xpEarned, message: "Streak reward claimed successfully!" });
    } catch (error) {
      console.error("Error claiming streak reward:", error);
      res.status(500).json({ message: "Failed to claim streak reward" });
    }
  });

  app.post("/api/gamification/streak/update-goal", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { goalDescription, progressIncrement = 1 } = req.body;
      
      await storage.updateStreakGoalProgress(userId, goalDescription, progressIncrement);
      
      // Check if all goals are completed and update achievements
      await storage.checkAchievements(userId);
      
      res.json({ message: "Goal progress updated successfully" });
    } catch (error) {
      console.error("Error updating goal progress:", error);
      res.status(500).json({ message: "Failed to update goal progress" });
    }
  });

  // AI routes - Enhanced with GPT-4o and DALL-E 3
  app.get("/api/ai/tutor", requireAuth, aiService.getAITutor);
  app.post("/api/ai/tutor/respond", requireAuth, aiService.getAITutorResponse);
  app.get("/api/ai/conversation/recent", requireAuth, aiService.getRecentConversation);
  app.post("/api/ai/conversation", requireAuth, aiService.saveConversation);
  app.get("/api/ai/tools", requireAuth, aiService.getAITools);
  app.get("/api/ai/tools/:id", requireAuth, aiService.getAITool);
  app.post("/api/ai/tools/notes", requireAuth, aiService.generateStudyNotes);
  app.post("/api/ai/tools/answer-check", requireAuth, aiService.checkAnswer);
  app.post("/api/ai/tools/flashcards", requireAuth, aiService.generateFlashcards);
  app.get("/api/ai/tools/analytics/:userId", requireAuth, aiService.getPerformanceAnalytics);
  app.post("/api/ai/battle/judge/:battleId", requireAuth, aiService.judgeBattle);
  app.post("/api/ai/generate-diagram", requireAuth, aiService.generateDiagram);
  
  // New enhanced AI visual learning routes
  app.post("/api/ai/generate-image", requireAuth, aiService.generateEducationalImage);
  app.post("/api/ai/visual-package", requireAuth, aiService.generateVisualLearningPackage);
  app.post("/api/ai/study-session", requireAuth, aiService.generateInteractiveStudySession);
  
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
  
  // Real-time notification testing routes
  app.post("/api/notifications/test", notificationService.sendTestNotification);
  app.post("/api/notifications/streak", notificationService.simulateStreakUpdate);

  // Security monitoring routes (admin only)
  app.get("/api/security/events", requireAuth, async (req, res) => {
    try {
      const { auditLogger } = await import("./security/audit");
      const events = auditLogger.getSecurityEvents(100);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security events" });
    }
  });

  app.get("/api/security/analysis", requireAuth, async (req, res) => {
    try {
      const { auditLogger } = await import("./security/audit");
      const analysis = auditLogger.analyzeSecurityPatterns();
      const riskScore = Math.min(100, (analysis.failedLogins * 5) + (analysis.rateLimitViolations * 3) + (analysis.suspiciousIPs.length * 10));
      
      res.json({
        ...analysis,
        totalEvents: auditLogger.getSecurityEvents().length,
        riskScore
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze security patterns" });
    }
  });

  app.get("/api/security/threats/active", requireAuth, async (req, res) => {
    try {
      const { auditLogger } = await import("./security/audit");
      const threats = auditLogger.getSuspiciousActivity(3600000); // Last hour
      res.json(threats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active threats" });
    }
  });

  app.get("/api/security/export", requireAuth, async (req, res) => {
    try {
      const { auditLogger } = await import("./security/audit");
      const logs = auditLogger.exportLogs("json");
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="security-logs-${new Date().toISOString().split('T')[0]}.json"`);
      res.send(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to export security logs" });
    }
  });

  // Lead Generation routes
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const { leadGenerationService } = await import("./services/lead-generation");
      const { startDate, endDate, hasEmail, hasMobile, grade, track } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        hasEmail: hasEmail === 'true',
        hasMobile: hasMobile === 'true',
        grade: grade as string,
        track: track as string
      };

      const leads = await leadGenerationService.getLeads(filters);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/stats", requireAuth, async (req, res) => {
    try {
      const { leadGenerationService } = await import("./services/lead-generation");
      const stats = await leadGenerationService.getLeadStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching lead stats:", error);
      res.status(500).json({ message: "Failed to fetch lead statistics" });
    }
  });

  app.get("/api/leads/export", requireAuth, async (req, res) => {
    try {
      const { leadGenerationService } = await import("./services/lead-generation");
      const { startDate, endDate, hasEmail, hasMobile, grade, track } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        hasEmail: hasEmail === 'true',
        hasMobile: hasMobile === 'true',
        grade: grade as string,
        track: track as string
      };

      const excelBuffer = await leadGenerationService.exportToExcel(filters);
      
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting leads:", error);
      res.status(500).json({ message: "Failed to export leads" });
    }
  });

  app.get("/api/leads/email-list", requireAuth, async (req, res) => {
    try {
      const { leadGenerationService } = await import("./services/lead-generation");
      const { startDate, endDate, grade, track } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        hasEmail: true,
        grade: grade as string,
        track: track as string
      };

      const emailList = await leadGenerationService.getEmailList(filters);
      res.json({ emails: emailList, count: emailList.length });
    } catch (error) {
      console.error("Error fetching email list:", error);
      res.status(500).json({ message: "Failed to fetch email list" });
    }
  });

  app.get("/api/leads/mobile-list", requireAuth, async (req, res) => {
    try {
      const { leadGenerationService } = await import("./services/lead-generation");
      const { startDate, endDate, grade, track } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        hasMobile: true,
        grade: grade as string,
        track: track as string
      };

      const mobileList = await leadGenerationService.getMobileList(filters);
      res.json({ mobiles: mobileList, count: mobileList.length });
    } catch (error) {
      console.error("Error fetching mobile list:", error);
      res.status(500).json({ message: "Failed to fetch mobile list" });
    }
  });

  app.get("/api/leads/search", requireAuth, async (req, res) => {
    try {
      const { leadGenerationService } = await import("./services/lead-generation");
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const results = await leadGenerationService.searchLeads(q);
      res.json(results);
    } catch (error) {
      console.error("Error searching leads:", error);
      res.status(500).json({ message: "Failed to search leads" });
    }
  });
  app.post("/api/notifications/rank", notificationService.simulateRankPromotion);
  app.post("/api/notifications/achievement", notificationService.simulateAchievement);
  app.post("/api/notifications/xp", notificationService.simulateXpGained);
  app.post("/api/notifications/ai-tool", notificationService.simulateAiToolCompletion);
  app.post("/api/notifications/leaderboard", notificationService.sendLeaderboardUpdate);
  
  // Support chatbot - available without authentication
  app.post("/api/support/chat", supportService.getChatResponse);
  
  // Wellness routes
  app.get("/api/wellness/preferences", wellnessService.getWellnessPreferences);
  app.post("/api/wellness/preferences", wellnessService.saveWellnessPreferences);
  app.post("/api/wellness/breaks", wellnessService.logWellnessBreak);
  app.get("/api/wellness/breaks/history", wellnessService.getWellnessBreakHistory);
  app.get("/api/wellness/stats", wellnessService.getWellnessStats);
  
  // Leaderboard routes
  app.get("/api/leaderboard", leaderboardService.getGlobalLeaderboard);
  app.get("/api/leaderboard/friends", leaderboardService.getFriendsLeaderboard);
  app.get("/api/leaderboard/position/:userId?", leaderboardService.getUserRankPosition);

  // Customer Feedback API Routes
  
  // Get all feedback categories
  app.get("/api/feedback/categories", async (req, res) => {
    try {
      const categories = await db.query.feedbackCategories.findMany({
        where: eq(schema.feedbackCategories.isActive, true),
        orderBy: asc(schema.feedbackCategories.name)
      });
      res.json(categories);
    } catch (error) {
      console.error("Error fetching feedback categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get all feedback with filtering and pagination
  app.get("/api/feedback", async (req, res) => {
    try {
      const { 
        type, 
        status, 
        priority, 
        categoryId, 
        isPublic, 
        page = "1", 
        limit = "10",
        sortBy = "createdAt",
        sortOrder = "desc"
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      // Build query conditions
      const whereConditions = [];
      if (type) whereConditions.push(eq(schema.customerFeedback.type, type as string));
      if (status) whereConditions.push(eq(schema.customerFeedback.status, status as string));
      if (priority) whereConditions.push(eq(schema.customerFeedback.priority, priority as string));
      if (categoryId) whereConditions.push(eq(schema.customerFeedback.categoryId, parseInt(categoryId as string)));
      if (isPublic !== undefined) whereConditions.push(eq(schema.customerFeedback.isPublic, isPublic === "true"));

      const feedback = await db.query.customerFeedback.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          user: {
            columns: { id: true, username: true, name: true, profileImage: true }
          },
          category: true,
          votes: true,
          comments: {
            with: {
              user: {
                columns: { id: true, username: true, name: true, profileImage: true }
              }
            },
            orderBy: asc(schema.feedbackComments.createdAt)
          }
        },
        limit: parseInt(limit as string),
        offset: offset,
        orderBy: sortOrder === "asc" ? asc(schema.customerFeedback.createdAt) : desc(schema.customerFeedback.createdAt)
      });

      const totalCount = await db.$count(schema.customerFeedback, 
        whereConditions.length > 0 ? and(...whereConditions) : undefined
      );

      res.json({
        feedback,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Get feedback by ID
  app.get("/api/feedback/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const feedback = await db.query.customerFeedback.findFirst({
        where: eq(schema.customerFeedback.id, parseInt(id)),
        with: {
          user: {
            columns: { id: true, username: true, name: true, profileImage: true }
          },
          category: true,
          respondent: {
            columns: { id: true, username: true, name: true }
          },
          votes: {
            with: {
              user: {
                columns: { id: true, username: true }
              }
            }
          },
          comments: {
            with: {
              user: {
                columns: { id: true, username: true, name: true, profileImage: true }
              }
            },
            orderBy: asc(schema.feedbackComments.createdAt)
          }
        }
      });

      if (!feedback) {
        return res.status(404).json({ error: "Feedback not found" });
      }

      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Submit new feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = schema.insertCustomerFeedbackSchema.parse(req.body);
      
      // If user is authenticated, use their ID, otherwise allow anonymous feedback
      if (req.isAuthenticated()) {
        validatedData.userId = (req.user as any).id;
      }

      const [newFeedback] = await db.insert(schema.customerFeedback)
        .values(validatedData)
        .returning();

      // Fetch the complete feedback with relations
      const completeFeedback = await db.query.customerFeedback.findFirst({
        where: eq(schema.customerFeedback.id, newFeedback.id),
        with: {
          user: {
            columns: { id: true, username: true, name: true, profileImage: true }
          },
          category: true
        }
      });

      res.status(201).json(completeFeedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  // Vote on feedback
  app.post("/api/feedback/:id/vote", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { voteType } = req.body;
      const userId = (req.user as any).id;

      // Check if user already voted
      const existingVote = await db.query.feedbackVotes.findFirst({
        where: and(
          eq(schema.feedbackVotes.feedbackId, parseInt(id)),
          eq(schema.feedbackVotes.userId, userId)
        )
      });

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove vote if same type
          await db.delete(schema.feedbackVotes)
            .where(eq(schema.feedbackVotes.id, existingVote.id));
        } else {
          // Update vote type
          await db.update(schema.feedbackVotes)
            .set({ voteType })
            .where(eq(schema.feedbackVotes.id, existingVote.id));
        }
      } else {
        // Create new vote
        await db.insert(schema.feedbackVotes)
          .values({
            feedbackId: parseInt(id),
            userId,
            voteType
          });
      }

      // Update vote counts
      const votes = await db.query.feedbackVotes.findMany({
        where: eq(schema.feedbackVotes.feedbackId, parseInt(id))
      });

      const upvotes = votes.filter(v => v.voteType === "up").length;
      const downvotes = votes.filter(v => v.voteType === "down").length;

      await db.update(schema.customerFeedback)
        .set({ upvotes, downvotes })
        .where(eq(schema.customerFeedback.id, parseInt(id)));

      res.json({ upvotes, downvotes });
    } catch (error) {
      console.error("Error voting on feedback:", error);
      res.status(500).json({ error: "Failed to vote on feedback" });
    }
  });

  // Add comment to feedback
  app.post("/api/feedback/:id/comments", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = (req.user as any).id;

      const validatedData = schema.insertFeedbackCommentSchema.parse({
        feedbackId: parseInt(id),
        userId,
        comment
      });

      const [newComment] = await db.insert(schema.feedbackComments)
        .values(validatedData)
        .returning();

      const completeComment = await db.query.feedbackComments.findFirst({
        where: eq(schema.feedbackComments.id, newComment.id),
        with: {
          user: {
            columns: { id: true, username: true, name: true, profileImage: true }
          }
        }
      });

      res.status(201).json(completeComment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  // Admin response to feedback
  app.patch("/api/feedback/:id/respond", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { response, status } = req.body;
      const userId = (req.user as any).id;

      const updateData: any = {
        adminResponse: response,
        adminResponseAt: new Date(),
        respondedBy: userId,
        updatedAt: new Date()
      };

      if (status) {
        updateData.status = status;
      }

      await db.update(schema.customerFeedback)
        .set(updateData)
        .where(eq(schema.customerFeedback.id, parseInt(id)));

      const updatedFeedback = await db.query.customerFeedback.findFirst({
        where: eq(schema.customerFeedback.id, parseInt(id)),
        with: {
          user: {
            columns: { id: true, username: true, name: true, profileImage: true }
          },
          category: true,
          respondent: {
            columns: { id: true, username: true, name: true }
          }
        }
      });

      res.json(updatedFeedback);
    } catch (error) {
      console.error("Error responding to feedback:", error);
      res.status(500).json({ error: "Failed to respond to feedback" });
    }
  });

  // Get feedback statistics
  app.get("/api/feedback/stats", async (req, res) => {
    try {
      const totalFeedback = await db.$count(schema.customerFeedback);
      const openFeedback = await db.$count(schema.customerFeedback, eq(schema.customerFeedback.status, "open"));
      const resolvedFeedback = await db.$count(schema.customerFeedback, eq(schema.customerFeedback.status, "resolved"));
      
      const feedbackByType = await db.select({
        type: schema.customerFeedback.type,
        count: sql<number>`count(*)`
      })
      .from(schema.customerFeedback)
      .groupBy(schema.customerFeedback.type);

      const feedbackByPriority = await db.select({
        priority: schema.customerFeedback.priority,
        count: sql<number>`count(*)`
      })
      .from(schema.customerFeedback)
      .groupBy(schema.customerFeedback.priority);

      const averageRating = await db.select({
        avgRating: sql<number>`avg(rating)`
      })
      .from(schema.customerFeedback)
      .where(isNotNull(schema.customerFeedback.rating));

      res.json({
        total: totalFeedback,
        open: openFeedback,
        resolved: resolvedFeedback,
        byType: feedbackByType,
        byPriority: feedbackByPriority,
        averageRating: averageRating[0]?.avgRating || 0
      });
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      res.status(500).json({ error: "Failed to fetch feedback statistics" });
    }
  });

  // Payment routes
  app.post("/api/payment/create-order", paymentService.createOrder);
  app.post("/api/payment/verify-payment", paymentService.verifyPayment);

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates across the platform
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
        
        // Handle authentication and store connections by user ID
        if (data.type === 'auth' && data.userId) {
          userId = data.userId.toString();
          connections.set(`user_${userId}`, ws);
          console.log(`User ${userId} authenticated via WebSocket`);
        }
        
        // Store battle-specific connections
        if (data.battleId) {
          battleId = data.battleId.toString();
          if (userId) {
            connections.set(`battle_${battleId}_user_${userId}`, ws);
          }
        }
        
        // Handle battle join
        if (data.type === 'join_battle') {
          console.log(`User ${data.username || userId} joined battle ${data.battleId} via WebSocket`);
          
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
    
    // Use Array.from to properly handle iterating through Map
    Array.from(connections.entries()).forEach(([key, connection]) => {
      if (key.startsWith(battlePrefix) && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message));
      }
    });
  }
  
  // Helper function to send a message to a specific user
  function sendToUser(userId: string | number, message: any) {
    const userKey = `user_${userId}`;
    const connection = connections.get(userKey);
    
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
  
  // Helper function to broadcast a message to all connected users
  function broadcastToAll(message: any) {
    // Use Array.from to properly handle iterating through Map
    Array.from(connections.entries()).forEach(([key, connection]) => {
      if (connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message));
      }
    });
  }
  
  // Export the broadcast functions for use throughout the application
  (global as any).broadcastToBattle = broadcastToBattle;
  (global as any).sendToUser = sendToUser;
  (global as any).broadcastToAll = broadcastToAll;

  return httpServer;
}
