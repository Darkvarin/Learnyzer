import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { authService } from "./services/auth-service";
import { userService } from "./services/user-service";
import { aiService } from "./services/ai-service";
import { courseService } from "./services/course-service";
import { battleService } from "./services/battle-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "learnityX-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
    })
  );

  // Set up Passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
          return done(null, false, { message: "Incorrect password." });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

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

  return httpServer;
}
