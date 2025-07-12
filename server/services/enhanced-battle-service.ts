import { storage } from "../storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Express, Request, Response } from "express";
import { eq, and, inArray, desc, sql } from "drizzle-orm";
import { battles, battleParticipants, tournaments, powerUps, userPowerUps, battleQuestions, battleSpectators, userCoins } from "@shared/schema";
import { db } from "../../db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enhanced battle creation schema
const enhancedBattleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.enum(["1v1", "2v2", "3v3", "4v4", "tournament", "blitz"]),
  format: z.enum(["standard", "blitz", "endurance", "exam_simulation"]).default("standard"),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
  examType: z.enum(["JEE", "NEET", "UPSC", "CLAT", "CUET", "CSE", "CGLE"]).optional(),
  subject: z.string().optional(),
  duration: z.number().min(5, "Duration must be at least 5 minutes"),
  topics: z.array(z.string()).min(1, "At least one topic is required"),
  entryFee: z.number().min(0).default(0),
  prizePool: z.number().min(0).default(0),
  maxParticipants: z.number().min(2).max(32).default(8),
  battleMode: z.enum(["public", "private"]).default("public"),
  spectatorMode: z.boolean().default(true),
  questionsCount: z.number().min(1).max(20).default(1),
  passingScore: z.number().min(0).max(100).default(60),
  timePerQuestion: z.number().min(60).max(1800).default(300), // 1 minute to 30 minutes
});

// Power-up usage schema
const powerUpUsageSchema = z.object({
  powerUpId: z.number(),
  battleId: z.number(),
  targetUserId: z.number().optional(),
  metadata: z.record(z.any()).optional()
});

export const enhancedBattleService = {
  /**
   * Get enhanced battles with additional metadata
   */
  async getEnhancedBattles(req: Request, res: Response) {
    try {
      // Check if this is a specific battle ID request
      const battleId = req.params.battleId;
      if (battleId) {
        const battle = await db.query.battles.findFirst({
          where: eq(battles.id, parseInt(battleId)),
          with: {
            participants: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    profileImage: true,
                    level: true,
                    rank: true
                  }
                }
              }
            }
          }
        });
        
        if (!battle) {
          return res.status(404).json({ message: "Battle not found" });
        }
        
        return res.json(battle);
      }

      const [activeBattles, upcomingBattles, completedBattles] = await Promise.all([
        // Active battles with enhanced info
        db.query.battles.findMany({
          where: eq(battles.status, "waiting"),
          with: {
            participants: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    profileImage: true,
                    level: true,
                    rank: true
                  }
                }
              }
            },
            spectators: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    profileImage: true
                  }
                }
              }
            },
            creator: {
              columns: {
                id: true,
                name: true,
                profileImage: true,
                level: true,
                rank: true
              }
            }
          },
          orderBy: desc(battles.createdAt)
        }),

        // Upcoming scheduled battles
        db.query.battles.findMany({
          where: eq(battles.status, "scheduled"),
          with: {
            participants: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    profileImage: true,
                    level: true,
                    rank: true
                  }
                }
              }
            },
            creator: {
              columns: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          },
          orderBy: battles.scheduledFor
        }),

        // Past battles (user-specific)
        req.user ? storage.getPastBattles((req.user as any).id) : []
      ]);

      // Enhance battle data with spectator counts and participation info
      const enhanceeBattleData = (battleList: any[]) => {
        return battleList.map(battle => ({
          ...battle,
          participantCount: battle.participants?.length || 0,
          spectatorCount: battle.spectators?.length || 0,
          isCreator: req.user ? battle.createdBy === (req.user as any).id : false,
          isParticipant: req.user ? battle.participants?.some((p: any) => p.userId === (req.user as any).id) : false,
          isSpectating: req.user ? battle.spectators?.some((s: any) => s.userId === (req.user as any).id) : false,
          canJoin: battle.participants?.length < (battle.maxParticipants || 8),
          participants: battle.participants?.map((p: any) => ({
            id: p.user.id,
            name: p.user.name,
            profileImage: p.user.profileImage,
            level: p.user.level,
            rank: p.user.rank,
            team: p.team,
            joinedAt: p.joinedAt
          })) || []
        }));
      };

      res.json({
        active: enhanceeBattleData(activeBattles),
        upcoming: enhanceeBattleData(upcomingBattles),
        past: enhanceeBattleData(completedBattles)
      });
    } catch (error) {
      console.error("Enhanced battles fetch error:", error);
      res.status(500).json({ message: "Error fetching enhanced battles" });
    }
  },

  /**
   * Create enhanced battle with advanced features
   */
  async createEnhancedBattle(req: Request, res: Response) {
    try {
      const validatedData = enhancedBattleSchema.parse(req.body);
      const userId = (req.user as any).id;

      // Check if user has sufficient coins for entry fee (10 coins)
      const entryFeeCoins = 10;
      const { coinService } = await import("./coin-service");
      const userCoinRecord = await db.query.userCoins.findFirst({
        where: eq(userCoins.userId, userId)
      });
      
      if (!userCoinRecord || userCoinRecord.coins < entryFeeCoins) {
        return res.status(400).json({ 
          message: `Insufficient coins. You need ${entryFeeCoins} coins to create this battle.` 
        });
      }

      // Deduct entry fee coins
      await coinService.spendCoins(userId, entryFeeCoins, `Battle entry fee - ${validatedData.title}`, 'battle_entry');

      // Calculate reward points based on difficulty and format
      let baseReward = 50;
      switch (validatedData.difficulty) {
        case "expert": baseReward = 200; break;
        case "advanced": baseReward = 150; break;
        case "intermediate": baseReward = 100; break;
        case "beginner": baseReward = 75; break;
      }

      // Format multiplier
      const formatMultiplier = {
        "blitz": 1.2,
        "endurance": 1.5,
        "exam_simulation": 1.8,
        "standard": 1.0
      }[validatedData.format];

      const finalReward = Math.floor(baseReward * formatMultiplier);
      const finalPrizePool = validatedData.prizePool || (validatedData.entryFee * validatedData.maxParticipants);

      // Create the enhanced battle
      const [newBattle] = await db.insert(battles).values({
        title: validatedData.title,
        type: validatedData.type,
        format: validatedData.format,
        difficulty: validatedData.difficulty,
        examType: validatedData.examType,
        subject: validatedData.subject,
        duration: validatedData.duration,
        topics: validatedData.topics,
        rewardPoints: finalReward,
        entryFee: validatedData.entryFee,
        prizePool: finalPrizePool,
        maxParticipants: validatedData.maxParticipants,
        battleMode: validatedData.battleMode,
        spectatorMode: validatedData.spectatorMode,
        questionsCount: validatedData.questionsCount,
        passingScore: validatedData.passingScore,
        timePerQuestion: validatedData.timePerQuestion,
        createdBy: userId,
        status: "waiting"
      }).returning();

      // Generate AI questions for the battle
      await enhancedBattleService.generateBattleQuestions(newBattle.id, validatedData);

      // Deduct entry fee if applicable
      if (validatedData.entryFee > 0) {
        await storage.addUserXP(userId, -validatedData.entryFee);
      }

      // Auto-join creator to the battle
      await db.insert(battleParticipants).values({
        battleId: newBattle.id,
        userId: userId,
        team: 0
      });

      res.status(201).json({ 
        message: "Enhanced battle created successfully!",
        battleId: newBattle.id,
        battle: newBattle
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Enhanced battle creation error:", error);
      res.status(500).json({ message: "Error creating enhanced battle" });
    }
  },

  /**
   * Generate AI questions for battle
   */
  async generateBattleQuestions(battleId: number, battleData: any) {
    try {
      const questionsPrompt = `Generate ${battleData.questionsCount} competitive exam questions for a battle challenge:

Battle Details:
- Exam Type: ${battleData.examType || 'General'}
- Subject: ${battleData.subject || 'General'}
- Topics: ${battleData.topics.join(', ')}
- Difficulty: ${battleData.difficulty}
- Duration per question: ${battleData.timePerQuestion} seconds
- Format: ${battleData.format}

Requirements:
1. Questions should be ${battleData.difficulty} level
2. Each question should be answerable within ${battleData.timePerQuestion} seconds
3. Include clear, specific answers
4. Provide detailed explanations
5. Focus on ${battleData.examType} exam patterns

Generate questions in this JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "descriptive", // or "mcq" or "numerical"
      "options": ["A", "B", "C", "D"], // for MCQ only
      "correctAnswer": "Correct answer",
      "explanation": "Detailed explanation",
      "difficulty": "${battleData.difficulty}",
      "topic": "Specific topic",
      "marks": 1
    }
  ]
}

Make questions challenging but fair for ${battleData.difficulty} level students.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert exam question generator for Indian competitive exams. Generate high-quality, exam-pattern questions."
          },
          {
            role: "user",
            content: questionsPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const questionsResponse = JSON.parse(completion.choices[0].message.content || "{}");
      
      if (questionsResponse.questions) {
        for (let i = 0; i < questionsResponse.questions.length; i++) {
          const q = questionsResponse.questions[i];
          await db.insert(battleQuestions).values({
            battleId: battleId,
            questionNumber: i + 1,
            question: q.question,
            options: q.options || null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            subject: battleData.subject,
            topic: q.topic,
            marks: q.marks || 1,
            timeLimit: battleData.timePerQuestion,
            questionType: q.type || "descriptive"
          });
        }
      }
    } catch (error) {
      console.error("Error generating battle questions:", error);
      // Continue without questions - can be generated later
    }
  },

  /**
   * Join enhanced battle with entry fee handling
   */
  async joinEnhancedBattle(req: Request, res: Response) {
    try {
      const battleId = parseInt(req.params.battleId);
      const userId = (req.user as any).id;

      // Get battle details
      const battle = await db.query.battles.findFirst({
        where: eq(battles.id, battleId),
        with: {
          participants: true
        }
      });

      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }

      if (battle.status !== "waiting") {
        return res.status(400).json({ message: "Battle is not open for joining" });
      }

      // Check if already joined
      const existingParticipant = battle.participants.find(p => p.userId === userId);
      if (existingParticipant) {
        return res.status(400).json({ message: "Already joined this battle" });
      }

      // Check capacity
      if (battle.participants.length >= (battle.maxParticipants || 8)) {
        return res.status(400).json({ message: "Battle is full" });
      }

      // Check entry fee (now in coins)
      if (battle.entryFee && battle.entryFee > 0) {
        const { coinService } = await import("./coin-service");
        const userCoinRecord = await db.query.userCoins.findFirst({
          where: eq(userCoins.userId, userId)
        });
        
        if (!userCoinRecord || userCoinRecord.coins < battle.entryFee) {
          return res.status(400).json({ 
            message: `Insufficient coins. You need ${battle.entryFee} coins to join this battle.` 
          });
        }

        // Deduct entry fee coins
        await coinService.spendCoins(userId, battle.entryFee, `Battle entry fee - ${battle.title}`, 'battle_entry', battle.id);
      }

      // Determine team assignment for team battles
      let team = 0;
      if (battle.type.includes("v")) {
        // Count participants per team
        const teamCounts = battle.participants.reduce((acc, p) => {
          acc[p.team] = (acc[p.team] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        // Assign to team with fewer players
        team = (teamCounts[0] || 0) <= (teamCounts[1] || 0) ? 0 : 1;
      }

      // Join the battle
      await db.insert(battleParticipants).values({
        battleId: battleId,
        userId: userId,
        team: team
      });

      // Check if battle should auto-start
      const updatedParticipantCount = battle.participants.length + 1;
      if (battle.autoStart && updatedParticipantCount >= (battle.maxParticipants || 8)) {
        await db.update(battles)
          .set({ 
            status: "in_progress",
            startTime: new Date()
          })
          .where(eq(battles.id, battleId));
      }

      res.json({ 
        message: "Successfully joined the enhanced battle!",
        team: team,
        entryFeePaid: battle.entryFee || 0,
        currency: "coins"
      });
    } catch (error) {
      console.error("Enhanced battle join error:", error);
      res.status(500).json({ message: "Error joining enhanced battle" });
    }
  },

  /**
   * Spectate a battle
   */
  async spectateBattle(req: Request, res: Response) {
    try {
      const battleId = parseInt(req.params.battleId);
      const userId = (req.user as any).id;

      // Get battle details
      const battle = await db.query.battles.findFirst({
        where: eq(battles.id, battleId)
      });

      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }

      if (!battle.spectatorMode) {
        return res.status(400).json({ message: "Spectator mode is disabled for this battle" });
      }

      // Check if already spectating
      const existingSpectator = await db.query.battleSpectators.findFirst({
        where: and(
          eq(battleSpectators.battleId, battleId),
          eq(battleSpectators.userId, userId)
        )
      });

      if (existingSpectator) {
        return res.status(400).json({ message: "Already spectating this battle" });
      }

      // Add as spectator
      await db.insert(battleSpectators).values({
        battleId: battleId,
        userId: userId
      });

      res.json({ message: "Now spectating the battle!" });
    } catch (error) {
      console.error("Battle spectate error:", error);
      res.status(500).json({ message: "Error joining as spectator" });
    }
  },

  /**
   * Use power-up in battle
   */
  async usePowerUp(req: Request, res: Response) {
    try {
      const validatedData = powerUpUsageSchema.parse(req.body);
      const userId = (req.user as any).id;

      // Check if user owns the power-up
      const userPowerUp = await db.query.userPowerUps.findFirst({
        where: and(
          eq(userPowerUps.userId, userId),
          eq(userPowerUps.powerUpId, validatedData.powerUpId)
        ),
        with: {
          powerUp: true
        }
      });

      if (!userPowerUp || userPowerUp.quantity <= 0) {
        return res.status(400).json({ message: "You don't own this power-up" });
      }

      // Check if battle allows power-ups
      const battle = await db.query.battles.findFirst({
        where: eq(battles.id, validatedData.battleId)
      });

      if (!battle || battle.status !== "in_progress") {
        return res.status(400).json({ message: "Cannot use power-ups in this battle state" });
      }

      // Apply power-up effect (implementation depends on power-up type)
      await enhancedBattleService.applyPowerUpEffect(userPowerUp.powerUp, validatedData);

      // Consume the power-up
      if (userPowerUp.quantity === 1) {
        await db.delete(userPowerUps)
          .where(and(
            eq(userPowerUps.userId, userId),
            eq(userPowerUps.powerUpId, validatedData.powerUpId)
          ));
      } else {
        await db.update(userPowerUps)
          .set({ quantity: userPowerUp.quantity - 1 })
          .where(and(
            eq(userPowerUps.userId, userId),
            eq(userPowerUps.powerUpId, validatedData.powerUpId)
          ));
      }

      res.json({ 
        message: `Power-up "${userPowerUp.powerUp.name}" activated!`,
        effect: userPowerUp.powerUp.effect
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Power-up usage error:", error);
      res.status(500).json({ message: "Error using power-up" });
    }
  },

  /**
   * Apply power-up effects
   */
  async applyPowerUpEffect(powerUp: any, usageData: any) {
    // This would implement specific power-up effects
    // For now, just log the usage
    console.log(`Applied power-up: ${powerUp.name} with effect: ${powerUp.effect}`);
    
    // TODO: Implement specific effects like:
    // - extra_time: Add time to current question
    // - hint: Provide AI hint
    // - eliminate_option: Remove wrong MCQ options
    // - double_points: Double score for next correct answer
    // - shield: Protect from next wrong answer penalty
  },

  /**
   * Get available power-ups
   */
  async getPowerUps(req: Request, res: Response) {
    try {
      const powerUpsList = await db.query.powerUps.findMany({
        where: eq(powerUps.isActive, true),
        orderBy: [powerUps.cost]
      });

      res.json(powerUpsList);
    } catch (error) {
      console.error("Power-ups fetch error:", error);
      res.status(500).json({ message: "Error fetching power-ups" });
    }
  },

  /**
   * Get user's power-up inventory
   */
  async getUserPowerUps(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;

      const userPowerUpsList = await db.query.userPowerUps.findMany({
        where: eq(userPowerUps.userId, userId),
        with: {
          powerUp: true
        }
      });

      res.json(userPowerUpsList);
    } catch (error) {
      console.error("User power-ups fetch error:", error);
      res.status(500).json({ message: "Error fetching user power-ups" });
    }
  },

  /**
   * Get tournaments (placeholder for future implementation)
   */
  async getTournaments(req: Request, res: Response) {
    try {
      // Placeholder tournament data for now
      const tournaments = [];
      res.json({ tournaments });
    } catch (error) {
      console.error("Get tournaments error:", error);
      res.status(500).json({ message: "Error fetching tournaments" });
    }
  },

  /**
   * Create a demo battle with AI bots for testing UI
   */
  async createDemoBattle(req: Request, res: Response) {
    try {
      const { type, examType, subject, difficulty } = req.body;
      const userId = req.user ? (req.user as any).id : 999; // Use demo user ID if not authenticated

      // Determine correct participant count based on battle type
      const getMaxParticipants = (battleType: string) => {
        switch(battleType) {
          case "1v1": return 2;
          case "2v2": return 4;
          case "3v3": return 6;
          case "4v4": return 8;
          default: return 2;
        }
      };

      const maxParticipants = getMaxParticipants(type);

      // Create demo battle with AI bots - no coin cost
      const [demoBattle] = await db.insert(battles).values({
        title: `Demo ${type} Battle - ${subject}`,
        type: type || "1v1",
        format: "standard",
        difficulty: difficulty || "intermediate",
        examType: examType || "JEE",
        subject: subject || "Physics",
        duration: 5, // 5 minutes for demo
        topics: [subject || "Physics"], // JSONB array format
        rewardPoints: 0, // No reward for demo
        entryFee: 0, // No cost for demo
        prizePool: 0, // No prize for demo
        maxParticipants: maxParticipants,
        battleMode: "public",
        spectatorMode: true,
        autoStart: true,
        questionsCount: 1,
        status: "waiting",
        createdBy: userId
      }).returning();

      // Add the real user as participant
      await db.insert(battleParticipants).values({
        battleId: demoBattle.id,
        userId: userId,
        team: 0
      });

      // Create AI bot opponents based on battle type
      const totalParticipants = demoBattle.maxParticipants || 2;
      
      // Add AI bots to fill remaining slots
      for (let i = 1; i < totalParticipants; i++) {
        // Determine team assignment for team battles
        let team = 0;
        if (type.includes("v")) {
          // For team battles, alternate teams: user is team 0, bots fill both teams
          team = i % 2; // This ensures balanced teams
        }

        await db.insert(battleParticipants).values({
          battleId: demoBattle.id,
          userId: -(100 + i), // Negative IDs for AI bots
          team: team,
          answer: null,
          score: Math.floor(Math.random() * 100) // Random AI bot scores
        });
      }

      // Auto-start the demo battle since it's full
      await db.update(battles)
        .set({ 
          status: "in_progress",
          startTime: new Date()
        })
        .where(eq(battles.id, demoBattle.id));

      // Generate a simple demo question for the battle (without AI to avoid timeout)
      await db.insert(battleQuestions).values({
        battleId: demoBattle.id,
        questionNumber: 1,
        question: `Demo ${examType} ${subject} Question: What is the basic principle being tested?`,
        options: JSON.stringify(["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"]),
        correctAnswer: "A",
        explanation: "This is a demo question for practice. The correct answer demonstrates the concept.",
        difficulty: difficulty || "intermediate",
        subject: subject,
        topic: `${subject} Basics`,
        marks: 1,
        timeLimit: 300,
        questionType: "mcq"
      });

      res.json({
        message: "Demo battle created successfully!",
        battleId: demoBattle.id,
        type: type,
        participants: totalParticipants,
        status: "in_progress",
        isDemo: true,
        details: `${type} battle with ${totalParticipants} participants (1 real + ${totalParticipants - 1} AI bots)`
      });
    } catch (error) {
      console.error("Demo battle creation error:", error);
      res.status(500).json({ message: "Error creating demo battle" });
    }
  },

  /**
   * Generate a demo question for practice battles
   */
  async generateDemoQuestion(examType: string, subject: string, difficulty: string) {
    try {
      const prompt = `Generate a ${difficulty} level ${examType} ${subject} multiple choice question for educational practice.

Return ONLY a valid JSON object with this exact structure:
{
  "question": "Question text here",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correctAnswer": "A",
  "explanation": "Clear explanation of why this is correct and others are wrong"
}

Make it a realistic exam-style question with 4 options labeled A, B, C, D.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const questionData = JSON.parse(response.choices[0].message.content || "{}");
      return questionData;
    } catch (error) {
      console.error("Demo question generation error:", error);
      return null;
    }
  }
};

export function registerEnhancedBattleRoutes(app: Express) {
  // Add auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Enhanced battle routes
  app.get("/api/battles/enhanced", enhancedBattleService.getEnhancedBattles); // No auth for public viewing
  app.post("/api/battles/enhanced", requireAuth, enhancedBattleService.createEnhancedBattle);
  app.post("/api/battles/enhanced/:battleId/join", requireAuth, enhancedBattleService.joinEnhancedBattle);
  app.post("/api/battles/enhanced/:battleId/spectate", requireAuth, enhancedBattleService.spectateBattle);
  
  // Demo battle route - no authentication required
  app.post("/api/battles/demo", (req: any, res: any) => {
    enhancedBattleService.createDemoBattle(req, res);
  });
  
  // Power-up routes
  app.get("/api/power-ups", enhancedBattleService.getPowerUps); // No auth for public viewing
  app.get("/api/user/power-ups", requireAuth, enhancedBattleService.getUserPowerUps);
  app.post("/api/power-ups/use", requireAuth, enhancedBattleService.usePowerUp);
  
  // Tournament routes
  app.get("/api/tournaments", enhancedBattleService.getTournaments); // No auth for public viewing
}