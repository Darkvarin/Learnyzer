import type { Request, Response } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export const userService = {
  /**
   * Get user stats
   */
  async getUserStats(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const stats = await storage.getUserStats(userId);
      
      return res.status(200).json(stats);
    } catch (error) {
      
      return res.status(500).json({ message: "Error retrieving user stats" });
    }
  },
  
  /**
   * Get user streak information
   */
  async getUserStreak(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      
      // Check if user's streak has been updated today
      const needsStreakUpdate = await storage.needsStreakUpdate(userId);
      
      if (needsStreakUpdate) {
        await storage.updateUserStreak(userId);
      }
      
      // Get updated streak data
      const streak = await storage.getUserStreakData(userId);
      
      return res.status(200).json(streak);
    } catch (error) {
      
      return res.status(500).json({ message: "Error retrieving user streak" });
    }
  },
  
  /**
   * Claim streak reward
   */
  async claimStreakReward(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      
      // Check if the user can claim their reward
      const streak = await storage.getUserStreakData(userId);
      
      if (!streak.canClaimReward) {
        return res.status(400).json({ message: "You must complete all daily goals first" });
      }
      
      // Award the XP
      await storage.addUserXP(userId, streak.rewardXp);
      
      // Mark the streak reward as claimed
      await storage.markStreakRewardClaimed(userId);
      
      return res.status(200).json({ message: "Streak reward claimed successfully" });
    } catch (error) {
      
      return res.status(500).json({ message: "Error claiming streak reward" });
    }
  },
  
  /**
   * Get user rank information
   */
  async getUserRank(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const rankData = await storage.getUserRankData(userId);
      
      return res.status(200).json(rankData);
    } catch (error) {
      
      return res.status(500).json({ message: "Error retrieving user rank" });
    }
  },
  
  /**
   * Get user's referrals
   */
  async getUserReferrals(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const referrals = await storage.getUserReferrals(userId);
      
      // Generate the referral link
      const host = req.headers.host || 'learnityX.com';
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const referralLink = `${protocol}://${host}/r/${(req.user as any).referralCode}`;
      
      return res.status(200).json({
        referralLink,
        referrals
      });
    } catch (error) {
      
      return res.status(500).json({ message: "Error retrieving user referrals" });
    }
  },
  
  /**
   * Create a referral
   */
  async createReferral(req: Request, res: Response) {
    const schema = z.object({
      referralCode: z.string().min(1, "Referral code is required")
    });
    
    try {
      const { referralCode } = schema.parse(req.body);
      
      // Check if the referral code exists
      const referrer = await storage.getUserByReferralCode(referralCode);
      
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
      
      // Check if the user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        // Store the referral code in the session for later use
        if (req.session) {
          req.session.referralCode = referralCode;
        }
        return res.status(200).json({ message: "Referral code saved for later use" });
      }
      
      const userId = (req.user as any).id;
      
      // Check if the user is trying to refer themselves
      if (referrer.id === userId) {
        return res.status(400).json({ message: "You cannot refer yourself" });
      }
      
      // Check if the user has already been referred
      const existingReferral = await storage.getReferral(referrer.id, userId);
      
      if (existingReferral) {
        return res.status(400).json({ message: "You have already been referred" });
      }
      
      // Create the referral
      const xpReward = 500; // 500 XP for each referral
      const referral = await storage.createReferral(referrer.id, userId, xpReward);
      
      // Award XP to the referrer
      await storage.addUserXP(referrer.id, xpReward);
      
      return res.status(201).json(referral);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Error creating referral" });
    }
  },
  
  /**
   * Get all rewards (available and claimed)
   */
  async getAllRewards(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const rewards = await storage.getUserRewards(userId);
      
      return res.status(200).json(rewards);
    } catch (error) {
      
      return res.status(500).json({ message: "Error retrieving rewards" });
    }
  },
  
  /**
   * Claim a reward
   */
  async claimReward(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const rewardId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      if (isNaN(rewardId)) {
        return res.status(400).json({ message: "Invalid reward ID" });
      }
      
      // Check if the reward exists
      const reward = await storage.getRewardById(rewardId);
      
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      // Check if the user has already claimed this reward
      const hasReward = await storage.userHasReward(userId, rewardId);
      
      if (hasReward) {
        return res.status(400).json({ message: "You have already claimed this reward" });
      }
      
      // Check if the user has enough rank points
      const user = await storage.getUserById(userId);
      
      if (!user || user.rankPoints < reward.cost) {
        return res.status(400).json({ message: "You do not have enough rank points to claim this reward" });
      }
      
      // Claim the reward
      const userReward = await storage.claimReward(userId, rewardId);
      
      // Deduct the cost from the user's rank points
      await storage.updateUserRankPoints(userId, user.rankPoints - reward.cost);
      
      return res.status(201).json(userReward);
    } catch (error) {
      
      return res.status(500).json({ message: "Error claiming reward" });
    }
  },
  
  /**
   * Get all achievements for the user
   */
  async getAllAchievements(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const achievements = await storage.getUserAchievements(userId);
      
      return res.status(200).json(achievements);
    } catch (error) {
      
      return res.status(500).json({ message: "Error retrieving achievements" });
    }
  },
  
  /**
   * Get a specific achievement by ID
   */
  async getAchievementById(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const achievementId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: "Invalid achievement ID" });
      }
      
      const achievement = await storage.getUserAchievementById(userId, achievementId);
      
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      return res.status(200).json(achievement);
    } catch (error) {
      
      return res.status(500).json({ message: "Error retrieving achievement" });
    }
  }
};
