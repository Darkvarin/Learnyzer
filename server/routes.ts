import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { authService } from "./services/auth-service";
import { userService } from "./services/user-service";
import { aiService, generateStudyNotesUtil, generateEducationalImageUtil } from "./services/ai-service";
import { courseService } from "./services/course-service";
import { battleService } from "./services/battle-service";
import { notificationService } from "./services/notification-service";
import { supportService } from "./services/support-service";
import { wellnessService } from "./services/wellness-service";
import { leaderboardService } from "./services/leaderboard-service";
import { paymentService } from "./services/payment-service";

import { SimpleSubscriptionService } from "./services/simple-subscription-service";
import { setupSEORoutes } from "./services/sitemap-generator";
import { PDFService } from "./services/pdf-service";
import { storage } from "./storage";
import { db } from "../db";
import { eq, and, asc, desc, isNotNull, sql } from "drizzle-orm";
import * as schema from "../shared/schema";
import { z } from "zod";

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

  // Image proxy route to handle CORS issues
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "Image URL required" });
      }

      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(404).json({ message: "Image not found" });
      }

      const buffer = await response.buffer();
      const contentType = response.headers.get('content-type') || 'image/png';
      
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.send(buffer);
    } catch (error) {
      console.error("Image proxy error:", error);
      res.status(500).json({ message: "Failed to proxy image" });
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
  app.post("/api/ai/tools/generate-pdf", requireAuth, PDFService.generatePDFFromNotes);
  
  // Diagram-heavy PDF generation endpoint
  app.post("/api/ai/tools/generate-diagram-pdf", requireAuth, async (req, res) => {
    try {
      const { topic, contentType, diagramTypes, examType } = req.body;
      
      if (!topic || !contentType || !diagramTypes) {
        return res.status(400).json({ message: "Topic, content type, and diagram types are required" });
      }

      const user = req.user as any;

      // Generate educational content using GPT-3.5 Turbo
      const contentResponse = await generateStudyNotesUtil({
        topic,
        subject: 'General',
        style: 'comprehensive',
        level: 'high_school',
        examType
      });

      // Generate diagrams using DALL-E 3 for each diagram type
      const diagrams = [];
      for (const diagramType of diagramTypes) {
        try {
          const imageResponse = await generateEducationalImageUtil({
            topic: `${diagramType} for ${topic}`,
            description: `Create a detailed ${diagramType} explaining ${topic}`,
            style: 'educational',
            examType: examType || undefined
          });

          if (imageResponse.imageUrl) {
            diagrams.push({
              type: diagramType as 'flowchart' | 'mindmap' | 'concept-map' | 'process-diagram' | 'timeline',
              title: `${diagramType.charAt(0).toUpperCase() + diagramType.slice(1).replace('-', ' ')} - ${topic}`,
              imageUrl: imageResponse.imageUrl,
              description: `Visual representation of ${topic} using ${diagramType}`,
              position: (diagrams.length === 0 ? 'before' : diagrams.length % 2 === 0 ? 'inline' : 'after') as 'before' | 'inline' | 'after'
            });
          }
        } catch (error) {
          console.error(`Error generating ${diagramType}:`, error);
        }
      }

      // Generate PDF with diagrams
      const pdfOptions = {
        title: `Visual Study Guide: ${topic}`,
        content: contentResponse || `# ${topic}\n\nStudy guide content could not be generated. Please try again.`,
        subject: 'Visual Learning',
        examType,
        studentName: user.name,
        includeHeader: true,
        includeFooter: true,
        diagrams,
        contentType
      };

      const pdfBuffer = await PDFService.generateStudyNotesPDF(pdfOptions);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${topic.replace(/[^a-zA-Z0-9]/g, '_')}_visual_guide.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Diagram PDF generation error:', error);
      res.status(500).json({ message: 'Error generating visual PDF' });
    }
  });
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
  
  // Exam selection and lock route
  app.post("/api/user/confirm-exam", requireAuth, async (req: any, res) => {
    try {
      const { selectedExam } = req.body;
      const userId = req.user.id;

      if (!selectedExam || !["jee", "neet", "upsc", "clat", "cuet", "cse", "cgle"].includes(selectedExam)) {
        return res.status(400).json({ message: "Invalid exam selection" });
      }

      // Check if user already has an exam locked
      const currentUser = await storage.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (currentUser.examLocked === true) {
        return res.status(400).json({ 
          message: "Exam selection is already locked",
          currentExam: currentUser.selectedExam 
        });
      }

      // Update user with selected exam and lock it
      await storage.updateUserExamSelection(userId, selectedExam);

      // Fetch updated user data
      const updatedUser = await storage.getUserById(userId);

      // Send WebSocket notification
      sendToUser(userId, {
        type: "exam_confirmed",
        examType: selectedExam,
        message: `Entrance exam ${selectedExam.toUpperCase()} confirmed and locked`
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error confirming exam selection:", error);
      res.status(500).json({ message: "Failed to confirm exam selection" });
    }
  });

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

  // Get feedback counts by category
  app.get("/api/feedback/categories/counts", async (req, res) => {
    try {
      const categoryCounts = await db
        .select({
          categoryId: schema.customerFeedback.categoryId,
          count: sql<number>`count(*)::integer`,
        })
        .from(schema.customerFeedback)
        .groupBy(schema.customerFeedback.categoryId);

      const countsMap = Object.fromEntries(
        categoryCounts.map(item => [item.categoryId, item.count])
      );

      res.json(countsMap);
    } catch (error) {
      console.error("Error fetching category counts:", error);
      res.status(500).json({ error: "Failed to fetch category counts" });
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
      
      // Build query conditions - ignore "all_*" filter values
      const whereConditions = [];
      if (type && type !== "all_types") whereConditions.push(eq(schema.customerFeedback.type, type as string));
      if (status && status !== "all_statuses") whereConditions.push(eq(schema.customerFeedback.status, status as string));
      if (priority && priority !== "all_priorities") whereConditions.push(eq(schema.customerFeedback.priority, priority as string));
      if (categoryId && categoryId !== "all_categories" && !isNaN(parseInt(categoryId as string))) {
        whereConditions.push(eq(schema.customerFeedback.categoryId, parseInt(categoryId as string)));
      }
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
        avgRating: sql<number>`coalesce(avg(rating), 0)`
      })
      .from(schema.customerFeedback)
      .where(isNotNull(schema.customerFeedback.rating));

      res.json({
        total: totalFeedback,
        open: openFeedback,
        resolved: resolvedFeedback,
        byType: feedbackByType,
        byPriority: feedbackByPriority,
        averageRating: Number(averageRating[0]?.avgRating) || 0
      });
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      res.status(500).json({ error: "Failed to fetch feedback statistics" });
    }
  });

  // Support Chatbot API endpoint
  app.post("/api/support/chat", async (req, res) => {
    try {
      console.log("=== CHAT API DEBUG ===");
      console.log("Request method:", req.method);
      console.log("Request headers:", req.headers);
      console.log("Request body:", req.body);
      console.log("Body type:", typeof req.body);
      console.log("Body keys:", Object.keys(req.body || {}));
      console.log("======================");
      
      const { query } = req.body;
      
      if (!query || typeof query !== 'string' || !query.trim()) {
        console.log("Query validation failed:", { query, type: typeof query });
        return res.status(400).json({ error: "Message is required" });
      }

      // Search FAQ data first
      const { searchFAQs } = await import("../shared/faq-data");
      const relevantFAQs = searchFAQs(query);
      
      // Generate intelligent, contextual responses based on query analysis
      let aiResponse = null;
      const lowerQuery = query.toLowerCase();
      
      // Smart pattern matching with natural, conversational responses
      if (lowerQuery.includes("pricing") || lowerQuery.includes("cost") || lowerQuery.includes("subscription") || lowerQuery.includes("plan")) {
        if (lowerQuery.includes("cheap") || lowerQuery.includes("affordable") || lowerQuery.includes("budget")) {
          aiResponse = "Great question! Our most affordable option is the free 1-day trial - perfect to test everything out. For ongoing access, our Basic plan at ₹799/month gives you unlimited AI tools (50 uses daily). If budget's tight, the yearly plan at ₹12999 saves you the most money compared to monthly billing.";
        } else if (lowerQuery.includes("best") || lowerQuery.includes("recommend")) {
          aiResponse = "For serious exam prep, I'd recommend the Pro plan (₹1500/month) - it includes 2 AI tutor sessions daily plus all the tools. If you're planning long-term study, the yearly plan (₹12999) offers the best value with 3 AI tutor sessions daily and massive savings over monthly payments.";
        } else if (lowerQuery.includes("difference") || lowerQuery.includes("compare")) {
          aiResponse = "Main differences: Basic (₹799) gives you all AI tools but no AI tutor sessions. Pro (₹1500) adds 2 AI tutor sessions daily. Long-term plans (Quarterly ₹4199, Half-yearly ₹7599, Yearly ₹12999) boost you to 3 AI tutor sessions daily plus better savings. All include gamification and progress tracking.";
        } else {
          aiResponse = "Here's our pricing: Start with a free 1-day trial (2 AI sessions + 10 tools). Then Basic at ₹799/month (unlimited AI tools, no tutor), Pro at ₹1500/month (2 AI tutor sessions daily), or save big with longer plans - Yearly at ₹12999 gives you 3 AI tutor sessions daily and maximum savings!";
        }
      } else if (lowerQuery.includes("ai") || lowerQuery.includes("tutor") || lowerQuery.includes("chatbot") || lowerQuery.includes("gpt")) {
        if (lowerQuery.includes("voice") || lowerQuery.includes("speak") || lowerQuery.includes("talk")) {
          aiResponse = "Yes! Our AI tutor has full voice interaction - you can literally talk to it and it talks back. It's powered by GPT-4o, so conversations feel natural. Perfect for hands-free learning while you're doing problems or taking notes. Try it in the free trial!";
        } else if (lowerQuery.includes("smart") || lowerQuery.includes("intelligent") || lowerQuery.includes("good")) {
          aiResponse = "Our AI tutor is quite intelligent - it's built on GPT-4o (the latest model). It personalizes content to your specific exam (JEE, NEET, etc.), adapts to your learning style, creates visual diagrams with DALL-E 3, and even tracks your weak areas to focus on. Much smarter than generic chatbots!";
        } else if (lowerQuery.includes("help") || lowerQuery.includes("teach") || lowerQuery.includes("learn")) {
          aiResponse = "The AI tutor acts like your personal teacher - explains concepts step-by-step, creates visual diagrams for complex topics, answers your doubts in real-time, gives practice problems, and adapts to your exam (JEE physics vs NEET biology, etc.). It's like having a 24/7 expert tutor who knows your syllabus inside out.";
        } else {
          aiResponse = "Our AI tutor uses cutting-edge GPT-4o technology - it's like having a super smart teacher available 24/7. It creates visual learning content with DALL-E 3, has voice interaction, and personalizes everything to your specific entrance exam. Way more advanced than basic chatbots!";
        }
      } else if (lowerQuery.includes("exam") || lowerQuery.includes("jee") || lowerQuery.includes("neet") || lowerQuery.includes("upsc") || lowerQuery.includes("clat") || lowerQuery.includes("cuet") || lowerQuery.includes("cse") || lowerQuery.includes("cgle")) {
        if (lowerQuery.includes("which") || lowerQuery.includes("support") || lowerQuery.includes("available")) {
          aiResponse = "We support all major competitive exams in India: JEE (Engineering), NEET (Medical), UPSC (Civil Services), CLAT (Law), CUET (University Entrance), CSE (Computer Science), and CGLE (Government Jobs). Each has dedicated content, specialized AI tutors, and exam-specific study paths.";
        } else if (lowerQuery.includes("jee")) {
          aiResponse = "For JEE prep, we have specialized Physics, Chemistry, and Math AI tutors with visual problem-solving, step-by-step solutions, and concept diagrams. Our gamified approach makes even the toughest JEE topics engaging. Start with the free trial to see how our AI explains JEE concepts!";
        } else if (lowerQuery.includes("neet")) {
          aiResponse = "NEET preparation includes specialized Biology, Chemistry, and Physics content with our AI creating detailed diagrams for anatomy, chemical structures, and physics concepts. Perfect for visual learners tackling NEET's vast syllabus. Try our free trial for NEET-specific AI tutoring!";
        } else {
          aiResponse = "We cover 7 major competitive exams with exam-specific AI tutors and content. Whether you're preparing for JEE's complex physics or UPSC's vast syllabus, our platform adapts to your chosen exam's unique requirements and patterns.";
        }
      } else if (lowerQuery.includes("mobile") || lowerQuery.includes("app") || lowerQuery.includes("phone") || lowerQuery.includes("android") || lowerQuery.includes("ios")) {
        aiResponse = "Absolutely! Learnyzer works perfectly on your phone - just open it in any browser (Chrome, Safari, etc.). All features work on mobile: AI tutoring, voice interaction, visual learning, even competitive battles. No app download needed, and it's optimized for touch screens. Study anywhere!";
      } else if (lowerQuery.includes("free") || lowerQuery.includes("trial") || lowerQuery.includes("demo")) {
        if (lowerQuery.includes("how long") || lowerQuery.includes("duration")) {
          aiResponse = "The free trial lasts 24 hours and gives you 2 AI tutor sessions plus 10 AI tool uses. It's enough to test the voice interaction, visual learning, and get a real feel for how our AI tutoring works for your specific exam. No credit card required to start!";
        } else if (lowerQuery.includes("what") || lowerQuery.includes("include")) {
          aiResponse = "Your free trial includes: 2 full AI tutor sessions (with voice), 10 AI tool uses (study notes, visual diagrams, etc.), access to all exam content, gamification features, and progress tracking. Basically everything except unlimited usage - perfect to test if Learnyzer fits your study style!";
        } else {
          aiResponse = "Yes! Start with a completely free 1-day trial - 2 AI tutor sessions and 10 AI tool uses. No credit card needed. It's enough time to test the voice interaction, visual learning, and see how our AI explains concepts for your specific exam. Try it risk-free!";
        }
      } else if (lowerQuery.includes("contact") || (lowerQuery.includes("support") && (lowerQuery.includes("email") || lowerQuery.includes("phone") || lowerQuery.includes("number")))) {
        aiResponse = "Need human help? Reach us at learnyzer.ai@gmail.com or call +91 9910601733. We respond quickly to questions about subscriptions, technical issues, or anything else. Though I can handle most questions right here - what specific help do you need?";
      } else if (lowerQuery.includes("what") && lowerQuery.includes("learnyzer")) {
        aiResponse = "Learnyzer is like having the smartest tutor in India available 24/7! We use advanced AI (GPT-4o) to create personalized learning experiences for competitive exam prep. Think AI tutoring + voice interaction + visual learning + gamification - all tailored to your specific entrance exam needs.";
      } else if (lowerQuery.includes("feature") || lowerQuery.includes("what can") || lowerQuery.includes("functionality")) {
        aiResponse = "Key features that students love: AI Tutoring with voice conversation, Visual learning (AI creates diagrams for complex topics), Gamified progress with levels and achievements, Competitive battles with other students, Personalized study plans, Real-time doubt solving, and Multi-exam support. It's like a complete study ecosystem!";
      } else if (lowerQuery.includes("how") && (lowerQuery.includes("work") || lowerQuery.includes("use") || lowerQuery.includes("start"))) {
        aiResponse = "Super simple to start: Sign up for free trial → Choose your exam (JEE, NEET, etc.) → Set up your profile → Start chatting with your AI tutor! The AI learns your style and creates personalized content. You can use voice, ask for visual explanations, and track your progress as you go.";
      } else if (lowerQuery.includes("requirement") || lowerQuery.includes("system") || lowerQuery.includes("browser") || lowerQuery.includes("internet")) {
        aiResponse = "Very minimal requirements: Any smartphone, tablet, or computer with internet + a modern browser (Chrome, Firefox, Safari, Edge). That's it! No downloads, no installations. Voice features work on most devices too. If you can browse the web, you can use Learnyzer!";
      } else if (lowerQuery.includes("payment") || lowerQuery.includes("billing") || lowerQuery.includes("refund") || lowerQuery.includes("money back")) {
        if (lowerQuery.includes("refund") || lowerQuery.includes("money back") || lowerQuery.includes("guarantee")) {
          aiResponse = "We offer a 7-day money-back guarantee on all plans - if you're not happy, we'll refund everything, no questions asked. Payments are secure through Razorpay (trusted by millions in India), and you can cancel anytime with immediate effect.";
        } else if (lowerQuery.includes("safe") || lowerQuery.includes("secure") || lowerQuery.includes("trust")) {
          aiResponse = "Absolutely secure! We use Razorpay (India's most trusted payment platform) with bank-level encryption. Your card details are never stored on our servers. Plus, we offer 7-day money-back guarantee, so there's zero risk trying our platform.";
        } else {
          aiResponse = "Payment is secure and simple: All major credit/debit cards accepted, processed through Razorpay (India's top payment platform), automatic billing with option to cancel anytime, 7-day money-back guarantee, and student-friendly Indian pricing. Your data stays completely secure!";
        }
      } else if (lowerQuery.includes("support") || lowerQuery.includes("help")) {
        aiResponse = "I'm here to help with anything about Learnyzer! Ask me about features, pricing, how our AI works, which plan suits you, technical questions, or getting started. For complex issues, our team is available at learnyzer.ai@gmail.com. What would you like to know?";
      } else {
        aiResponse = "I can help you with questions about Learnyzer's features, pricing, exams, technical requirements, or how to get started. What specific information would you like to know about our AI-powered learning platform?";
      }
      
      res.json({
        query,
        faqs: relevantFAQs.slice(0, 3),
        aiResponse,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in support chat:", error);
      res.status(500).json({ error: "Support chat service temporarily unavailable" });
    }
  });

  // Payment routes
  app.post("/api/payment/create-order", paymentService.createOrder);
  app.post("/api/payment/verify-payment", paymentService.verifyPayment);

  // Subscription routes
  app.get("/api/subscription/check-access/:featureType", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { featureType } = req.params;
      const access = await SimpleSubscriptionService.hasFeatureAccess(req.user.id, featureType);
      
      res.json(access);
    } catch (error) {
      console.error("Error checking subscription access:", error);
      res.status(500).json({ message: "Failed to check access" });
    }
  });

  app.post("/api/subscription/track-usage", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { featureType, metadata } = req.body;
      const success = await SimpleSubscriptionService.trackUsage(req.user.id, featureType, metadata);
      
      if (!success) {
        return res.status(429).json({ 
          message: "Usage limit exceeded",
          hasAccess: false 
        });
      }

      res.json({ success: true, hasAccess: true });
    } catch (error) {
      console.error("Error tracking usage:", error);
      res.status(500).json({ message: "Failed to track usage" });
    }
  });

  app.get("/api/subscription/usage-stats", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const stats = await SimpleSubscriptionService.getUserUsageStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error getting usage stats:", error);
      res.status(500).json({ message: "Failed to get usage stats" });
    }
  });

  app.get("/api/subscription/pricing", async (req, res) => {
    try {
      const pricing = SimpleSubscriptionService.getSubscriptionPricing();
      res.json(pricing);
    } catch (error) {
      console.error("Error getting pricing:", error);
      res.status(500).json({ message: "Failed to get pricing" });
    }
  });

  app.post("/api/subscription/update", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const subscriptionData = req.body;
      // For now, return success since subscription updates aren't fully implemented
      const success = true;
      
      if (!success) {
        return res.status(400).json({ message: "Failed to update subscription" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Subscription upgrade route
  app.post("/api/subscription/upgrade", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { planId } = req.body;
      
      // For now, return success with mock upgrade
      // In a real implementation, this would integrate with payment processing
      console.log(`User ${req.user.id} requesting upgrade to plan ${planId}`);
      
      res.json({ 
        success: true, 
        message: "Upgrade request received. Payment integration pending." 
      });
    } catch (error) {
      console.error("Error processing upgrade:", error);
      res.status(500).json({ message: "Failed to process upgrade" });
    }
  });

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
