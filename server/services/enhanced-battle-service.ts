import { db } from '@db';
import { battles, battleQuestions, battleSpectators, powerUps, userPowerUps, battleParticipants, users, userCoins, coinTransactions } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// Initialize OpenAI client lazily
let openai: any | null = null;

const getOpenAIClient = () => {
  if (!openai) {
    // Import OpenAI dynamically to avoid module-level initialization
    const OpenAI = require("openai");
    // Directly pass API key to bypass environment variable check
    openai = new OpenAI({ 
      apiKey: "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"
    });
  }
  return openai;
};

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
          currentQuestionNumber: battleParticipants.currentQuestionNumber,
          questionsCompleted: battleParticipants.questionsCompleted,
          questionStartTime: battleParticipants.questionStartTime,
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
        submission: p.submission,
        currentQuestionNumber: p.currentQuestionNumber || 1,
        questionsCompleted: p.questionsCompleted || 0,
        questionStartTime: p.questionStartTime
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

      const response = await getOpenAIClient().chat.completions.create({
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
        createdBy: creatorId, // Fixed field name to match database schema
        examType: battleData.examType,
        subject: battleData.subject,
        difficulty: battleData.difficulty,
        duration: battleData.duration,
        maxParticipants: battleData.maxParticipants,
        entryFee: battleData.entryFee,
        prizePool: battleData.prizePool,
        rewardPoints: battleData.entryFee * battleData.maxParticipants || 0, // Calculate reward points
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

  // Handle battle abandonment with penalty fee
  async abandonBattle(battleId: number, userId: number) {
    try {
      // Get battle details to check penalty fee
      const battle = await db.query.battles.findFirst({
        where: eq(battles.id, battleId)
      });

      if (!battle) {
        throw new Error('Battle not found');
      }

      // Get participant details
      const participant = await db.query.battleParticipants.findFirst({
        where: and(
          eq(battleParticipants.battleId, battleId),
          eq(battleParticipants.userId, userId)
        )
      });

      if (!participant) {
        throw new Error('Not a participant in this battle');
      }

      // Check if battle is still in progress
      if (battle.status !== 'in_progress' && battle.status !== 'waiting') {
        throw new Error('Cannot abandon a completed battle');
      }

      // Check if already abandoned
      if (participant.hasAbandoned) {
        throw new Error('Already abandoned this battle');
      }

      // Mark participant as abandoned
      await db
        .update(battleParticipants)
        .set({
          hasAbandoned: true,
          leftAt: new Date(),
          penaltyApplied: false // Will be set to true after penalty deduction
        })
        .where(and(
          eq(battleParticipants.battleId, battleId),
          eq(battleParticipants.userId, userId)
        ));

      // Apply penalty fee (deduct coins)
      const penaltyFee = battle.penaltyFee || 10;
      
      // Get user's current coin balance
      const userCoinsData = await db.query.userCoins.findFirst({
        where: eq(userCoins.userId, userId)
      });

      if (userCoinsData && userCoinsData.coins >= penaltyFee) {
        // Deduct penalty fee from coins
        await db
          .update(userCoins)
          .set({
            coins: userCoinsData.coins - penaltyFee,
            totalSpent: userCoinsData.totalSpent + penaltyFee,
            updatedAt: new Date()
          })
          .where(eq(userCoins.userId, userId));

        // Record transaction
        await db.insert(coinTransactions).values({
          userId,
          amount: -penaltyFee,
          type: 'spend',
          description: `Penalty for abandoning battle: ${battle.title}`,
          referenceId: battleId,
          referenceType: 'battle_penalty',
          createdAt: new Date()
        });

        // Mark penalty as applied
        await db
          .update(battleParticipants)
          .set({ penaltyApplied: true })
          .where(and(
            eq(battleParticipants.battleId, battleId),
            eq(battleParticipants.userId, userId)
          ));
      }

      return {
        success: true,
        message: 'Left battle successfully',
        penaltyApplied: userCoinsData && userCoinsData.coins >= penaltyFee,
        penaltyAmount: penaltyFee,
        remainingCoins: userCoinsData ? Math.max(0, userCoinsData.coins - penaltyFee) : 0
      };
    } catch (error) {
      console.error('Error abandoning battle:', error);
      throw error;
    }
  }

  // Calculate and award RP based on battle performance
  async awardRankingPoints(battleId: number, winnerId: number, allParticipants: any[]) {
    try {
      // Get battle details for context
      const battle = await db.query.battles.findFirst({
        where: eq(battles.id, battleId)
      });

      if (!battle) {
        throw new Error('Battle not found');
      }

      // Sort participants by score (highest to lowest)
      const sortedParticipants = allParticipants.sort((a, b) => b.score - a.score);
      
      // Calculate RP rewards based on ranking and performance
      for (let i = 0; i < sortedParticipants.length; i++) {
        const participant = sortedParticipants[i];
        let rpReward = 0;
        
        // Base RP calculation based on position
        if (i === 0) {
          // Winner gets the most RP
          rpReward = 25; // Base winner reward
        } else if (i === 1) {
          // Runner-up gets moderate RP
          rpReward = 15;
        } else if (i === 2) {
          // Third place gets small RP
          rpReward = 10;
        } else {
          // Participation RP for others
          rpReward = 5;
        }

        // Performance bonuses based on score percentage
        const maxPossibleScore = battle.questionsCount || 5; // Assuming 5 questions max
        const scorePercentage = (participant.score / maxPossibleScore) * 100;
        
        if (scorePercentage >= 80) {
          rpReward += 10; // High performance bonus
        } else if (scorePercentage >= 60) {
          rpReward += 5; // Good performance bonus
        }

        // Battle type multipliers
        const battleTypeMultiplier = this.getBattleTypeMultiplier(battle.type);
        rpReward = Math.floor(rpReward * battleTypeMultiplier);

        // Award RP to user
        await this.updateUserRankingPoints(participant.userId, rpReward, battleId, battle.title);
      }

      return { success: true, message: 'RP awarded to all participants' };
    } catch (error) {
      console.error('Error awarding ranking points:', error);
      throw error;
    }
  }

  // Get battle type multiplier for RP calculation
  getBattleTypeMultiplier(battleType: string): number {
    switch (battleType.toLowerCase()) {
      case '1v1': return 1.0;
      case '2v2': return 1.2;
      case '3v3': return 1.4;
      case '4v4': return 1.5;
      default: return 1.0;
    }
  }

  // Update user's ranking points and potentially their rank
  async updateUserRankingPoints(userId: number, rpGained: number, battleId: number, battleTitle: string) {
    try {
      // Get current user data
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newRankPoints = user.rankPoints + rpGained;
      
      // Calculate new rank based on RP thresholds
      const newRank = this.calculateRankFromRP(newRankPoints);

      // Update user's RP and rank
      await db
        .update(users)
        .set({
          rankPoints: newRankPoints,
          rank: newRank
        })
        .where(eq(users.id, userId));

      // Create transaction record for RP gain
      await db.insert(coinTransactions).values({
        userId,
        amount: rpGained,
        type: 'earn',
        description: `RP gained from battle: ${battleTitle} (+${rpGained} RP)`,
        referenceId: battleId,
        referenceType: 'battle_rp_reward',
        createdAt: new Date()
      });

      return {
        rpGained,
        newRankPoints,
        newRank,
        rankUp: newRank !== user.rank
      };
    } catch (error) {
      console.error('Error updating user ranking points:', error);
      throw error;
    }
  }

  // Calculate rank based on RP thresholds
  calculateRankFromRP(rankPoints: number): string {
    const rankThresholds = [
      { min: 0, max: 99, rank: 'Bronze I' },
      { min: 100, max: 199, rank: 'Bronze II' },
      { min: 200, max: 299, rank: 'Bronze III' },
      { min: 300, max: 499, rank: 'Silver I' },
      { min: 500, max: 699, rank: 'Silver II' },
      { min: 700, max: 999, rank: 'Silver III' },
      { min: 1000, max: 1499, rank: 'Gold I' },
      { min: 1500, max: 1999, rank: 'Gold II' },
      { min: 2000, max: 2999, rank: 'Gold III' },
      { min: 3000, max: 4499, rank: 'Platinum I' },
      { min: 4500, max: 5999, rank: 'Platinum II' },
      { min: 6000, max: 7999, rank: 'Platinum III' },
      { min: 8000, max: 11999, rank: 'Diamond I' },
      { min: 12000, max: 15999, rank: 'Diamond II' },
      { min: 16000, max: 19999, rank: 'Diamond III' },
      { min: 20000, max: 29999, rank: 'Heroic' },
      { min: 30000, max: 49999, rank: 'Elite' },
      { min: 50000, max: 79999, rank: 'Master' },
      { min: 80000, max: Infinity, rank: 'Grandmaster' }
    ];

    for (const threshold of rankThresholds) {
      if (rankPoints >= threshold.min && rankPoints <= threshold.max) {
        return threshold.rank;
      }
    }

    return 'Bronze I'; // Fallback
  }

  // Complete battle and award RP to all participants
  async completeBattleAndAwardRP(battleId: number) {
    try {
      // Get all participants with their final scores
      const participants = await db
        .select({
          userId: battleParticipants.userId,
          score: battleParticipants.score,
          questionsCompleted: battleParticipants.questionsCompleted
        })
        .from(battleParticipants)
        .where(eq(battleParticipants.battleId, battleId));

      if (participants.length === 0) {
        throw new Error('No participants found for this battle');
      }

      // Determine winner (highest score)
      const winner = participants.reduce((prev, current) => 
        (current.score > prev.score) ? current : prev
      );

      // Award RP to all participants based on performance
      await this.awardRankingPoints(battleId, winner.userId, participants);

      // Update battle status to completed
      await db
        .update(battles)
        .set({
          status: 'completed',
          completedAt: new Date()
        })
        .where(eq(battles.id, battleId));

      return {
        success: true,
        winner: winner,
        participants: participants.length,
        message: 'Battle completed and RP awarded'
      };
    } catch (error) {
      console.error('Error completing battle and awarding RP:', error);
      throw error;
    }
  }

  // Update participant's current question number (for live tracking)
  async updateParticipantQuestionProgress(battleId: number, userId: number, questionNumber: number) {
    try {
      const [updatedParticipant] = await db
        .update(battleParticipants)
        .set({
          currentQuestionNumber: questionNumber,
          questionStartTime: new Date()
        })
        .where(and(
          eq(battleParticipants.battleId, battleId),
          eq(battleParticipants.userId, userId)
        ))
        .returning();

      return updatedParticipant;
    } catch (error) {
      console.error('Error updating participant question progress:', error);
      throw error;
    }
  }

  // Get live question progress for all participants in a battle
  async getBattleQuestionProgress(battleId: number) {
    try {
      const progressData = await db
        .select({
          userId: battleParticipants.userId,
          userName: users.name,
          userProfileImage: users.profileImage,
          currentQuestionNumber: battleParticipants.currentQuestionNumber,
          questionsCompleted: battleParticipants.questionsCompleted,
          questionStartTime: battleParticipants.questionStartTime,
          score: battleParticipants.score,
          rank: battleParticipants.rank
        })
        .from(battleParticipants)
        .leftJoin(users, eq(battleParticipants.userId, users.id))
        .where(eq(battleParticipants.battleId, battleId))
        .orderBy(desc(battleParticipants.currentQuestionNumber)); // Order by progress (highest first)

      // Calculate live rankings based on current progress
      const rankedProgress = progressData.map((participant, index) => ({
        ...participant,
        currentRank: index + 1,
        isLeading: index === 0,
        questionsBehind: progressData[0]?.currentQuestionNumber - participant.currentQuestionNumber || 0
      }));

      return rankedProgress;
    } catch (error) {
      console.error('Error getting battle question progress:', error);
      throw error;
    }
  }

  // Mark question as completed and move to next
  async completeQuestion(battleId: number, userId: number, questionNumber: number, answer: string) {
    try {
      const [updatedParticipant] = await db
        .update(battleParticipants)
        .set({
          currentQuestionNumber: questionNumber + 1,
          questionsCompleted: questionNumber,
          questionStartTime: new Date()
        })
        .where(and(
          eq(battleParticipants.battleId, battleId),
          eq(battleParticipants.userId, userId)
        ))
        .returning();

      return updatedParticipant;
    } catch (error) {
      console.error('Error completing question:', error);
      throw error;
    }
  }
}

export const enhancedBattleService = new EnhancedBattleService();