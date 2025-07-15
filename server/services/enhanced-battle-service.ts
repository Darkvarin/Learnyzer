import { db } from '@db';
import { battles, battleQuestions, battleSpectators, powerUps, userPowerUps, battleParticipants, users } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class EnhancedBattleService {
  // Get enhanced battle details with participants and spectators
  async getBattleDetails(battleId: number, userId?: number) {
    try {
      // First get basic battle info
      const battle = await db.query.battles.findFirst({
        where: eq(battles.id, battleId)
      });

      if (!battle) {
        throw new Error('Battle not found');
      }

      // Get participants separately to avoid relation issues
      const participantsData = await db
        .select({
          id: battleParticipants.id,
          userId: battleParticipants.userId,
          team: battleParticipants.team,
          score: battleParticipants.score,
          submission: battleParticipants.submission,
          userName: users.name,
          userProfileImage: users.profileImage
        })
        .from(battleParticipants)
        .leftJoin(users, eq(battleParticipants.userId, users.id))
        .where(eq(battleParticipants.battleId, battleId));

      // Format participants for frontend
      const participants = participantsData.map(p => ({
        id: p.userId,
        name: p.userName,
        avatar: p.userProfileImage,
        team: p.team,
        score: p.score,
        submission: p.submission
      }));

      // Get spectator count
      const spectatorCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(battleSpectators)
        .where(eq(battleSpectators.battleId, battleId));

      // Get battle questions
      const questions = await db.query.battleQuestions.findMany({
        where: eq(battleQuestions.battleId, battleId)
      });

      // Check if user is a participant
      const isParticipant = userId ? participantsData.some(p => p.userId === userId) : false;

      // Check if user is a spectator - simplified query without leftAt reference
      const isSpectator = userId ? await db
        .select({ id: battleSpectators.id })
        .from(battleSpectators)
        .where(and(
          eq(battleSpectators.battleId, battleId),
          eq(battleSpectators.userId, userId)
        ))
        .limit(1) : [];

      return {
        ...battle,
        participants,
        spectatorCount: spectatorCountResult[0]?.count || 0,
        questions,
        isParticipant,
        isSpectator: Array.isArray(isSpectator) ? isSpectator.length > 0 : !!isSpectator,
        // Enhanced battle properties
        format: battle.type,
        difficulty: battle.difficulty || 'Medium',
        examType: battle.examType || 'General',
        subject: battle.subject || 'Mixed',
        entryFee: battle.entryFee || 10,
        prizePool: battle.prizePool || 50,
        maxParticipants: battle.maxParticipants || 8,
        battleMode: battle.battleMode || 'Standard',
        spectatorMode: true,
        questionsCount: questions.length || 1
      };
    } catch (error) {
      console.error('Error getting battle details:', error);
      throw error;
    }
  }

  // Generate AI battle questions
  async generateBattleQuestions(battleId: number, examType: string, subject: string, difficulty: string, count: number = 5) {
    try {
      const prompt = `Generate ${count} multiple choice questions for a competitive academic battle.
      
      Requirements:
      - Exam Type: ${examType}
      - Subject: ${subject}
      - Difficulty: ${difficulty}
      - Each question should have 4 options (A, B, C, D)
      - Include detailed explanations for correct answers
      - Questions should be challenging but fair for competitive exam preparation
      - Format as JSON array with structure: { question, options: [A, B, C, D], correct_answer, explanation }
      
      Focus on concepts commonly tested in ${examType} exams for ${subject}.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: 'You are an expert educator creating competitive exam questions. Generate high-quality, accurate questions with proper explanations.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const questionsData = JSON.parse(response.choices[0].message.content || '{"questions": []}');
      const questions = questionsData.questions || [];

      // Save questions to database
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await db.insert(battleQuestions).values({
          battleId,
          question: question.question,
          options: question.options,
          correctAnswer: question.correct_answer,
          explanation: question.explanation,
          order: i + 1,
          points: this.calculateQuestionPoints(difficulty),
        });
      }

      return questions;
    } catch (error) {
      console.error('Error generating battle questions:', error);
      throw error;
    }
  }

  // Calculate points based on difficulty
  private calculateQuestionPoints(difficulty: string): number {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      case 'expert': return 50;
      default: return 20;
    }
  }

  // Create tournament-style battle
  async createTournamentBattle(battleData: any, creatorId: number) {
    try {
      const [battle] = await db.insert(battles).values({
        title: battleData.title,
        type: battleData.type,
        status: 'waiting',
        creatorId,
        examType: battleData.examType,
        subject: battleData.subject,
        difficulty: battleData.difficulty,
        duration: battleData.duration,
        maxParticipants: battleData.maxParticipants,
        entryFee: battleData.entryFee,
        prizePool: battleData.prizePool,
        battleMode: battleData.battleMode || 'Tournament',
        scheduledAt: battleData.scheduledAt ? new Date(battleData.scheduledAt) : null,
        topics: battleData.topics || [],
        rules: battleData.rules || [],
        createdAt: new Date(),
      }).returning();

      // Generate questions for the battle
      await this.generateBattleQuestions(
        battle.id,
        battleData.examType,
        battleData.subject,
        battleData.difficulty,
        battleData.numQuestions || battleData.questionsCount || 5
      );

      return battle;
    } catch (error) {
      console.error('Error creating tournament battle:', error);
      throw error;
    }
  }

  // Get available power-ups for a user
  async getUserPowerUps(userId: number) {
    try {
      const userPowerUpsData = await db.query.userPowerUps.findMany({
        where: eq(userPowerUps.userId, userId),
        with: {
          powerUp: true
        }
      });

      return userPowerUpsData.map(up => ({
        id: up.powerUp.id,
        name: up.powerUp.name,
        description: up.powerUp.description,
        cost: up.powerUp.cost,
        effect: up.powerUp.effect,
        cooldown: up.powerUp.cooldown,
        quantity: up.quantity,
        active: up.active,
      }));
    } catch (error) {
      console.error('Error getting user power-ups:', error);
      throw error;
    }
  }

  // Activate power-up during battle
  async activatePowerUp(battleId: number, userId: number, powerUpId: string) {
    try {
      // Check if user has the power-up
      const userPowerUp = await db.query.userPowerUps.findFirst({
        where: and(
          eq(userPowerUps.userId, userId),
          eq(userPowerUps.powerUpId, powerUpId)
        )
      });

      if (!userPowerUp || userPowerUp.quantity <= 0) {
        throw new Error('Power-up not available');
      }

      // Update power-up quantity
      await db
        .update(userPowerUps)
        .set({ 
          quantity: userPowerUp.quantity - 1,
          active: true,
          lastUsed: new Date()
        })
        .where(and(
          eq(userPowerUps.userId, userId),
          eq(userPowerUps.powerUpId, powerUpId)
        ));

      return { success: true, message: 'Power-up activated successfully' };
    } catch (error) {
      console.error('Error activating power-up:', error);
      throw error;
    }
  }

  // Get all power-ups available in the system
  async getAllPowerUps() {
    try {
      return await db.query.powerUps.findMany({
        orderBy: [powerUps.cost]
      });
    } catch (error) {
      console.error('Error getting power-ups:', error);
      throw error;
    }
  }

  // Add spectator to battle
  async addSpectator(battleId: number, userId: number) {
    try {
      // Check if already spectating
      const existing = await db.query.battleSpectators.findFirst({
        where: and(
          eq(battleSpectators.battleId, battleId),
          eq(battleSpectators.userId, userId)
        )
      });

      if (existing) {
        return { success: true, message: 'Already spectating' };
      }

      await db.insert(battleSpectators).values({
        battleId,
        userId,
        joinedAt: new Date()
      });

      return { success: true, message: 'Added as spectator' };
    } catch (error) {
      console.error('Error adding spectator:', error);
      throw error;
    }
  }

  // Get demo battles for testing
  async getDemoBattles() {
    return [
      {
        id: 9999,
        title: "🔥 Epic JEE Physics Championship",
        type: "2v2",
        status: "waiting",
        examType: "JEE",
        subject: "Physics",
        difficulty: "Hard",
        duration: 15,
        maxParticipants: 4,
        entryFee: 25,
        prizePool: 100,
        battleMode: "Championship",
        spectatorMode: true,
        questionsCount: 5,
        participants: [
          { id: 1, name: "PhysicsKing", team: 0, score: 0, status: "ready" },
          { id: 2, name: "QuantumMaster", team: 1, score: 0, status: "ready" }
        ],
        spectatorCount: 12,
        topics: ["Mechanics", "Thermodynamics"],
        scheduledAt: new Date(Date.now() + 300000), // 5 minutes from now
        createdAt: new Date(),
      },
      {
        id: 9998,
        title: "⚡ NEET Biology Blitz",
        type: "1v1",
        status: "in_progress",
        examType: "NEET",
        subject: "Biology",
        difficulty: "Medium",
        duration: 10,
        maxParticipants: 2,
        entryFee: 15,
        prizePool: 30,
        battleMode: "Speed Round",
        spectatorMode: true,
        questionsCount: 8,
        participants: [
          { id: 3, name: "BioWarrior", team: 0, score: 45, status: "answering" },
          { id: 4, name: "CellExpert", team: 1, score: 40, status: "submitted" }
        ],
        spectatorCount: 8,
        topics: ["Cell Biology", "Genetics"],
        scheduledAt: new Date(Date.now() - 300000), // Started 5 minutes ago
        createdAt: new Date(),
      }
    ];
  }
}

export const enhancedBattleService = new EnhancedBattleService();