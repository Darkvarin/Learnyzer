import { db } from "../../db";
import { userCoins, coinTransactions, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { Request, Response } from "express";

export const coinService = {
  /**
   * Initialize coins for a new user
   */
  async initializeUserCoins(userId: number) {
    try {
      const [userCoin] = await db.insert(userCoins).values({
        userId,
        coins: 100, // Starting bonus
        totalEarned: 100,
        totalSpent: 0
      }).returning();

      // Log the initial bonus
      await db.insert(coinTransactions).values({
        userId,
        amount: 100,
        type: 'earn',
        description: 'Welcome bonus',
        referenceType: 'welcome_bonus'
      });

      return userCoin;
    } catch (error) {
      console.error("Error initializing user coins:", error);
      throw error;
    }
  },

  /**
   * Get user's coin balance
   */
  async getUserCoins(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      
      let userCoin = await db.query.userCoins.findFirst({
        where: eq(userCoins.userId, userId)
      });

      // Initialize coins if not exists
      if (!userCoin) {
        userCoin = await this.initializeUserCoins(userId);
      }

      res.json(userCoin);
    } catch (error) {
      console.error("Error fetching user coins:", error);
      res.status(500).json({ message: "Error fetching coins" });
    }
  },

  /**
   * Add coins to user account
   */
  async addCoins(userId: number, amount: number, description: string, referenceType?: string, referenceId?: number) {
    try {
      // Get or create user coins record
      let userCoin = await db.query.userCoins.findFirst({
        where: eq(userCoins.userId, userId)
      });

      if (!userCoin) {
        userCoin = await this.initializeUserCoins(userId);
      }

      // Update coins
      const [updatedCoins] = await db.update(userCoins)
        .set({
          coins: userCoin.coins + amount,
          totalEarned: userCoin.totalEarned + amount,
          updatedAt: new Date()
        })
        .where(eq(userCoins.userId, userId))
        .returning();

      // Log transaction
      await db.insert(coinTransactions).values({
        userId,
        amount,
        type: 'earn',
        description,
        referenceType,
        referenceId
      });

      return updatedCoins;
    } catch (error) {
      console.error("Error adding coins:", error);
      throw error;
    }
  },

  /**
   * Spend coins from user account
   */
  async spendCoins(userId: number, amount: number, description: string, referenceType?: string, referenceId?: number) {
    try {
      const userCoin = await db.query.userCoins.findFirst({
        where: eq(userCoins.userId, userId)
      });

      if (!userCoin || userCoin.coins < amount) {
        throw new Error("Insufficient coins");
      }

      // Update coins
      const [updatedCoins] = await db.update(userCoins)
        .set({
          coins: userCoin.coins - amount,
          totalSpent: userCoin.totalSpent + amount,
          updatedAt: new Date()
        })
        .where(eq(userCoins.userId, userId))
        .returning();

      // Log transaction
      await db.insert(coinTransactions).values({
        userId,
        amount: -amount,
        type: 'spend',
        description,
        referenceType,
        referenceId
      });

      return updatedCoins;
    } catch (error) {
      console.error("Error spending coins:", error);
      throw error;
    }
  },

  /**
   * Get user's coin transaction history
   */
  async getCoinHistory(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const limit = parseInt(req.query.limit as string) || 20;

      const transactions = await db.query.coinTransactions.findMany({
        where: eq(coinTransactions.userId, userId),
        orderBy: desc(coinTransactions.createdAt),
        limit
      });

      res.json(transactions);
    } catch (error) {
      console.error("Error fetching coin history:", error);
      res.status(500).json({ message: "Error fetching coin history" });
    }
  },

  /**
   * Claim daily coin bonus
   */
  async claimDailyBonus(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const today = new Date().toDateString();

      let userCoin = await db.query.userCoins.findFirst({
        where: eq(userCoins.userId, userId)
      });

      if (!userCoin) {
        userCoin = await this.initializeUserCoins(userId);
      }

      // Check if already claimed today
      const lastBonus = userCoin.lastDailyBonus?.toDateString();
      if (lastBonus === today) {
        return res.status(400).json({ message: "Daily bonus already claimed today" });
      }

      const bonusAmount = 25; // Daily bonus amount
      
      // Update coins and last bonus date
      const [updatedCoins] = await db.update(userCoins)
        .set({
          coins: userCoin.coins + bonusAmount,
          totalEarned: userCoin.totalEarned + bonusAmount,
          lastDailyBonus: new Date(),
          updatedAt: new Date()
        })
        .where(eq(userCoins.userId, userId))
        .returning();

      // Log transaction
      await db.insert(coinTransactions).values({
        userId,
        amount: bonusAmount,
        type: 'earn',
        description: 'Daily bonus',
        referenceType: 'daily_bonus'
      });

      res.json({
        message: "Daily bonus claimed!",
        coinsEarned: bonusAmount,
        totalCoins: updatedCoins.coins
      });
    } catch (error) {
      console.error("Error claiming daily bonus:", error);
      res.status(500).json({ message: "Error claiming daily bonus" });
    }
  },

  /**
   * Award coins for activities
   */
  async awardActivityCoins(userId: number, activityType: string) {
    const rewards = {
      'ai_tutor_session': 5,
      'course_completion': 15,
      'mock_test_completion': 10,
      'battle_participation': 8,
      'battle_win': 20,
      'streak_milestone': 12
    };

    const amount = rewards[activityType as keyof typeof rewards] || 5;
    const description = `${activityType.replace('_', ' ')} reward`;

    return await this.addCoins(userId, amount, description, 'activity', 0);
  }
};