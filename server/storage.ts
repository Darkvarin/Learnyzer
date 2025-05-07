import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, gte, lt, sql, isNull, asc, ne, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

// Define ranks and their point requirements - made more challenging with 2000 points for Bronze to Silver
const RANKS = [
  { name: "Bronze I", points: 0 },
  { name: "Bronze II", points: 500 },
  { name: "Bronze III", points: 1200 },
  { name: "Silver I", points: 2000 },     // Bronze to Silver at 2000 as requested
  { name: "Silver II", points: 3000 },
  { name: "Silver III", points: 4500 },
  { name: "Gold I", points: 6500 },
  { name: "Gold II", points: 9000 },
  { name: "Gold III", points: 12000 },
  { name: "Platinum I", points: 16000 },
  { name: "Platinum II", points: 21000 },
  { name: "Platinum III", points: 27000 },
  { name: "Diamond I", points: 35000 },
  { name: "Diamond II", points: 45000 },
  { name: "Diamond III", points: 60000 },
  { name: "Heroic", points: 75000 },
  { name: "Elite Heroic", points: 95000 },
  { name: "Master", points: 120000 },
  { name: "Elite Master", points: 150000 },
  { name: "Grandmaster", points: 200000 }
];

// Level XP requirements (exponential growth) - made more challenging
function getXpForLevel(level: number): number {
  // Base XP required for level 1 is 1000
  // Each level increases by a higher factor, creating a steeper curve
  return Math.floor(1000 * Math.pow(1.35, level - 1));
}

export const storage = {
  // User-related functions
  
  /**
   * Get a user by ID
   */
  async getUserById(userId: number) {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    });
  },
  
  /**
   * Get a user by username
   */
  async getUserByUsername(username: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
  },
  
  /**
   * Get a user by email
   */
  async getUserByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
  },
  
  /**
   * Get a user by referral code
   */
  async getUserByReferralCode(referralCode: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.referralCode, referralCode)
    });
  },
  
  /**
   * Insert a new user
   */
  async insertUser(user: schema.InsertUser & { referralCode: string }) {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    
    // Initialize user achievements
    const achievements = await db.query.achievements.findMany();
    
    for (const achievement of achievements) {
      await db.insert(schema.userAchievements).values({
        userId: newUser.id,
        achievementId: achievement.id,
        progress: 0,
        completed: false
      });
    }
    
    // Initialize streak goals for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const streakGoals = await db.query.streakGoals.findMany();
    
    for (const goal of streakGoals) {
      await db.insert(schema.userStreakGoals).values({
        userId: newUser.id,
        streakGoalId: goal.id,
        progress: 0,
        completed: false,
        date: today
      });
    }
    
    return newUser;
  },
  
  /**
   * Get user stats
   */
  async getUserStats(userId: number) {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Calculate accuracy based on battle performance
    const battles = await db.query.battleParticipants.findMany({
      where: eq(schema.battleParticipants.userId, userId)
    });
    
    let accuracy = "0%";
    if (battles.length > 0) {
      const avgScore = battles.reduce((sum, b) => sum + (b.score || 0), 0) / battles.length;
      accuracy = `${Math.floor(avgScore)}%`;
    }
    
    // Count AI sessions
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM ${schema.conversations}
      WHERE ${schema.conversations.userId} = ${userId}
    `);
    const aiSessions = result.rows && result.rows[0] ? Number(result.rows[0].count) : 0;
    
    // Count battles won
    const wonResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM ${schema.battles}
      WHERE ${schema.battles.winnerId} = ${userId}
    `);
    const battlesWon = wonResult.rows && wonResult.rows[0] ? Number(wonResult.rows[0].count) : 0;
    
    return {
      level: user.level,
      currentXp: user.currentXp,
      nextLevelXp: user.nextLevelXp,
      rank: user.rank,
      streakDays: user.streakDays,
      battlesWon,
      accuracy,
      aiSessions
    };
  },
  
  /**
   * Add XP to a user and handle level ups
   */
  async addUserXP(userId: number, xp: number) {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    let currentXp = user.currentXp + xp;
    let level = user.level;
    let nextLevelXp = user.nextLevelXp;
    let leveledUp = false;
    
    // Check for level ups
    while (currentXp >= nextLevelXp) {
      currentXp -= nextLevelXp;
      level++;
      nextLevelXp = getXpForLevel(level);
      leveledUp = true;
      
      // Also add some rank points on level up - reduced for more challenge
      const rankPointsForLevelUp = 40 + Math.floor(level * level * 1.5); // Reduced RP gain to make ranking up harder
      await this.updateUserRankPoints(userId, user.rankPoints + rankPointsForLevelUp);
    }
    
    // Update user
    await db.update(schema.users)
      .set({
        currentXp,
        level,
        nextLevelXp
      })
      .where(eq(schema.users.id, userId));
    
    // Check achievements
    await this.checkAchievements(userId);
    
    // Send real-time update to user if WebSocket is available
    if ((global as any).sendToUser) {
      (global as any).sendToUser(userId, {
        type: 'progress_update',
        userId: userId,
        xpGained: xp,
        newLevel: leveledUp ? level : undefined,
        message: leveledUp ? 
          `You leveled up to level ${level}! You gained ${xp} XP.` : 
          `You gained ${xp} XP.`,
        timestamp: new Date().toISOString()
      });
    }
    
    return { currentXp, level, nextLevelXp };
  },
  
  /**
   * Update user's rank points and handle rank changes
   */
  async updateUserRankPoints(userId: number, points: number) {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Ensure points don't go below 0
    const newPoints = Math.max(0, points);
    
    // Determine the new rank based on points
    let newRank = RANKS[0].name;
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (newPoints >= RANKS[i].points) {
        newRank = RANKS[i].name;
        break;
      }
    }
    
    // Check if rank changed
    const rankChanged = newRank !== user.rank;
    const oldRank = user.rank;
    
    // Update user
    await db.update(schema.users)
      .set({
        rankPoints: newPoints,
        rank: newRank
      })
      .where(eq(schema.users.id, userId));
    
    // Send real-time update if rank changed
    if (rankChanged && (global as any).sendToUser) {
      (global as any).sendToUser(userId, {
        type: 'rank_update',
        userId: userId,
        oldRank: oldRank,
        newRank: newRank,
        rankPoints: newPoints,
        timestamp: new Date().toISOString()
      });
    }
    
    return { rankPoints: newPoints, rank: newRank };
  },
  
  /**
   * Get user's rank data
   */
  async getUserRankData(userId: number) {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Find the current rank in the RANKS array
    const currentRankIndex = RANKS.findIndex(r => r.name === user.rank);
    if (currentRankIndex === -1) {
      throw new Error("Invalid rank");
    }
    
    // Get the next rank
    const nextRankIndex = Math.min(currentRankIndex + 1, RANKS.length - 1);
    const nextRank = RANKS[nextRankIndex];
    
    // Calculate progress percentage
    const currentRank = RANKS[currentRankIndex];
    const currentPoints = user.rankPoints;
    const pointsForNextRank = nextRank.points - currentRank.points;
    const pointsProgress = currentPoints - currentRank.points;
    const progressPercentage = pointsForNextRank > 0 
      ? Math.min(100, Math.floor((pointsProgress / pointsForNextRank) * 100)) 
      : 100;
    
    return {
      currentRank: user.rank,
      nextRank: nextRank.name,
      currentRankPoints: currentPoints,
      nextRankPoints: nextRank.points,
      progressPercentage
    };
  },
  
  /**
   * Check if user's streak needs to be updated
   */
  async needsStreakUpdate(userId: number) {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // If user has no lastStreakDate, they need an update
    if (!user.lastStreakDate) {
      return true;
    }
    
    // Check if the last streak date was yesterday or earlier
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDate = new Date(user.lastStreakDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const differenceInDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return differenceInDays >= 1;
  },
  
  /**
   * Update user's streak
   */
  async updateUserStreak(userId: number) {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If user has no lastStreakDate, initialize it
    if (!user.lastStreakDate) {
      await db.update(schema.users)
        .set({
          lastStreakDate: today,
          streakDays: 1
        })
        .where(eq(schema.users.id, userId));
      
      // Initialize streak goals for today
      await this.initializeStreakGoals(userId);
      
      // Send real-time update
      if ((global as any).sendToUser) {
        (global as any).sendToUser(userId, {
          type: 'streak_update',
          userId: userId,
          streakDays: 1,
          canClaimReward: false,
          timestamp: new Date().toISOString()
        });
      }
      
      return;
    }
    
    const lastDate = new Date(user.lastStreakDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const differenceInDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreakDays = user.streakDays;
    
    if (differenceInDays === 1) {
      // Consecutive day, increment streak
      newStreakDays = user.streakDays + 1;
      await db.update(schema.users)
        .set({
          lastStreakDate: today,
          streakDays: newStreakDays
        })
        .where(eq(schema.users.id, userId));
      
      // Check achievements
      await this.updateAchievementProgress(userId, 'Streak Master', 1);
      
    } else if (differenceInDays > 1) {
      // Streak broken, reset to 1
      newStreakDays = 1;
      await db.update(schema.users)
        .set({
          lastStreakDate: today,
          streakDays: newStreakDays
        })
        .where(eq(schema.users.id, userId));
    }
    
    // Initialize streak goals for today
    await this.initializeStreakGoals(userId);
    
    // Check if all goals are completed
    const streakData = await this.getUserStreakData(userId);
    
    // Send real-time update
    if ((global as any).sendToUser) {
      (global as any).sendToUser(userId, {
        type: 'streak_update',
        userId: userId,
        streakDays: newStreakDays,
        streakGoalsCompleted: streakData.goals.filter(g => g.completed).length,
        canClaimReward: streakData.canClaimReward,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  /**
   * Initialize streak goals for today
   */
  async initializeStreakGoals(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if goals already exist for today
    const existingGoals = await db.query.userStreakGoals.findMany({
      where: and(
        eq(schema.userStreakGoals.userId, userId),
        eq(schema.userStreakGoals.date, today)
      )
    });
    
    if (existingGoals.length > 0) {
      return; // Goals already initialized for today
    }
    
    // Get all streak goals
    const streakGoals = await db.query.streakGoals.findMany();
    
    // Initialize each goal for today
    for (const goal of streakGoals) {
      await db.insert(schema.userStreakGoals).values({
        userId,
        streakGoalId: goal.id,
        progress: 0,
        completed: false,
        date: today
      });
    }
  },
  
  /**
   * Update streak goal progress
   */
  async updateStreakGoalProgress(userId: number, goalDescription: string, progressIncrement: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the streak goal by description
    const goal = await db.query.streakGoals.findFirst({
      where: eq(schema.streakGoals.description, goalDescription)
    });
    
    if (!goal) {
      throw new Error("Streak goal not found");
    }
    
    // Get the user's progress on this goal
    const userGoal = await db.query.userStreakGoals.findFirst({
      where: and(
        eq(schema.userStreakGoals.userId, userId),
        eq(schema.userStreakGoals.streakGoalId, goal.id),
        eq(schema.userStreakGoals.date, today)
      )
    });
    
    if (!userGoal) {
      // Initialize the goal if it doesn't exist
      await this.initializeStreakGoals(userId);
      await this.updateStreakGoalProgress(userId, goalDescription, progressIncrement);
      return;
    }
    
    // If the goal is already completed, no need to update
    if (userGoal.completed) {
      return;
    }
    
    // Update progress
    const newProgress = userGoal.progress + progressIncrement;
    const completed = newProgress >= goal.target;
    
    await db.update(schema.userStreakGoals)
      .set({
        progress: newProgress,
        completed
      })
      .where(eq(schema.userStreakGoals.id, userGoal.id));
    
    return { progress: newProgress, completed };
  },
  
  /**
   * Get user's streak data
   */
  async getUserStreakData(userId: number) {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's streak goals
    const userGoals = await db.query.userStreakGoals.findMany({
      where: and(
        eq(schema.userStreakGoals.userId, userId),
        eq(schema.userStreakGoals.date, today)
      ),
      with: {
        streakGoal: true
      }
    });
    
    // Format goals
    const goals = userGoals.map(ug => ({
      id: ug.streakGoalId,
      description: ug.streakGoal.description,
      target: ug.streakGoal.target,
      progress: ug.progress,
      completed: ug.completed
    }));
    
    // Check if all goals are completed
    const allGoalsCompleted = goals.length > 0 && goals.every(g => g.completed);
    
    // Check if user has claimed today's reward
    const hasClaimedReward = await db.query.userStreakGoals.findFirst({
      where: and(
        eq(schema.userStreakGoals.userId, userId),
        eq(schema.userStreakGoals.date, today),
        lt(schema.userStreakGoals.progress, 0) // Using negative progress as a flag for claimed
      )
    });
    
    // Calculate the current day of the week (0-6, where 0 is Monday)
    const dayOfWeek = (today.getDay() + 6) % 7; // Convert from 0-6 where 0 is Sunday to 0-6 where 0 is Monday
    
    // Calculate completed days based on the streak
    const completedDays = [];
    for (let i = 0; i < Math.min(dayOfWeek, user.streakDays); i++) {
      completedDays.push(i);
    }
    
    // Calculate reward XP based on streak length - enhanced for more challenge
    const baseReward = 200;
    // Exponential scaling for longer streaks to make it more rewarding
    const streakMultiplier = Math.min(10, 1 + Math.floor(Math.sqrt(user.streakDays))); // Capped at 10x for balance
    const rewardXp = baseReward * streakMultiplier;
    
    return {
      days: user.streakDays,
      currentDay: dayOfWeek,
      completedDays,
      goals,
      canClaimReward: allGoalsCompleted && !hasClaimedReward,
      rewardXp
    };
  },
  
  /**
   * Mark streak reward as claimed
   */
  async markStreakRewardClaimed(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all user's streak goals for today
    const userGoals = await db.query.userStreakGoals.findMany({
      where: and(
        eq(schema.userStreakGoals.userId, userId),
        eq(schema.userStreakGoals.date, today)
      )
    });
    
    // Mark each goal as having its reward claimed (using negative progress as a flag)
    for (const goal of userGoals) {
      await db.update(schema.userStreakGoals)
        .set({
          progress: -1 // Use negative progress as a flag for claimed
        })
        .where(eq(schema.userStreakGoals.id, goal.id));
    }
    
    // Calculate streak data for real-time notification
    const streakData = await this.getUserStreakData(userId);
    
    // Send real-time update
    if ((global as any).sendToUser) {
      (global as any).sendToUser(userId, {
        type: 'streak_update',
        userId: userId,
        streakDays: streakData.days,
        canClaimReward: false, // Just claimed, so can't claim again
        timestamp: new Date().toISOString()
      });
    }
  },
  
  /**
   * Get user's referrals
   */
  async getUserReferrals(userId: number) {
    const referrals = await db.query.referrals.findMany({
      where: eq(schema.referrals.referrerId, userId),
      with: {
        referred: true
      }
    });
    
    return referrals.map(r => ({
      id: r.id,
      name: r.referred.name,
      profileImage: r.referred.profileImage,
      joinedAt: r.createdAt,
      xpEarned: r.xpEarned
    }));
  },
  
  /**
   * Get a specific referral
   */
  async getReferral(referrerId: number, referredId: number) {
    return await db.query.referrals.findFirst({
      where: and(
        eq(schema.referrals.referrerId, referrerId),
        eq(schema.referrals.referredId, referredId)
      )
    });
  },
  
  /**
   * Create a referral
   */
  async createReferral(referrerId: number, referredId: number, xpEarned: number) {
    const [referral] = await db.insert(schema.referrals).values({
      referrerId,
      referredId,
      xpEarned
    }).returning();
    
    // Get the referred user's information for the notification
    const referredUser = await this.getUserById(referredId);
    
    if (referredUser && (global as any).sendToUser) {
      (global as any).sendToUser(referrerId, {
        type: 'referral_joined',
        referrerId: referrerId,
        referredId: referredId,
        referredName: referredUser.name,
        xpEarned: xpEarned,
        timestamp: new Date().toISOString()
      });
    }
    
    return referral;
  },
  
  /**
   * Get all available and claimed rewards for a user
   */
  async getUserRewards(userId: number) {
    // Get all rewards
    const allRewards = await db.query.rewards.findMany();
    
    // Get user's claimed rewards
    const userRewards = await db.query.userRewards.findMany({
      where: eq(schema.userRewards.userId, userId),
      with: {
        reward: true
      }
    });
    
    // Map of claimed reward IDs
    const claimedRewardIds = new Set(userRewards.map(ur => ur.rewardId));
    
    // Separate available and claimed rewards
    const available = allRewards
      .filter(r => !claimedRewardIds.has(r.id))
      .map(r => ({
        ...r,
        claimedAt: null
      }));
    
    const claimed = userRewards.map(ur => ({
      ...ur.reward,
      claimedAt: ur.claimedAt
    }));
    
    return { available, claimed };
  },
  
  /**
   * Get a reward by ID
   */
  async getRewardById(rewardId: number) {
    return await db.query.rewards.findFirst({
      where: eq(schema.rewards.id, rewardId)
    });
  },
  
  /**
   * Check if a user has a specific reward
   */
  async userHasReward(userId: number, rewardId: number) {
    const userReward = await db.query.userRewards.findFirst({
      where: and(
        eq(schema.userRewards.userId, userId),
        eq(schema.userRewards.rewardId, rewardId)
      )
    });
    
    return !!userReward;
  },
  
  /**
   * Claim a reward for a user
   */
  async claimReward(userId: number, rewardId: number) {
    // Get the reward details for the notification
    const reward = await this.getRewardById(rewardId);
    
    if (!reward) {
      throw new Error("Reward not found");
    }
    
    const [userReward] = await db.insert(schema.userRewards).values({
      userId,
      rewardId,
      claimedAt: new Date(),
      active: true // Automatically activate the reward
    }).returning();
    
    // Send real-time update
    if ((global as any).sendToUser) {
      (global as any).sendToUser(userId, {
        type: 'reward_claimed',
        userId: userId,
        rewardId: reward.id,
        rewardName: reward.name,
        rewardDescription: reward.description,
        timestamp: new Date().toISOString()
      });
    }
    
    return userReward;
  },
  
  /**
   * Get all achievements for a user
   */
  async getUserAchievements(userId: number) {
    // Get all achievements
    const allAchievements = await db.query.achievements.findMany();
    
    // Get user's progress on achievements
    const userAchievements = await db.query.userAchievements.findMany({
      where: eq(schema.userAchievements.userId, userId),
      with: {
        achievement: true
      }
    });
    
    // Create a map for quick lookup
    const userAchievementMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua])
    );
    
    // Separate completed and in-progress achievements
    const completed = [];
    const inProgress = [];
    
    for (const achievement of allAchievements) {
      const userAchievement = userAchievementMap.get(achievement.id);
      
      if (userAchievement?.completed) {
        completed.push({
          ...achievement,
          progress: achievement.target,
          completed: true,
          completedAt: userAchievement.completedAt
        });
      } else {
        inProgress.push({
          ...achievement,
          progress: userAchievement?.progress || 0,
          completed: false
        });
      }
    }
    
    return { completed, inProgress };
  },
  
  /**
   * Get a specific achievement for a user
   */
  async getUserAchievementById(userId: number, achievementId: number) {
    const userAchievement = await db.query.userAchievements.findFirst({
      where: and(
        eq(schema.userAchievements.userId, userId),
        eq(schema.userAchievements.achievementId, achievementId)
      ),
      with: {
        achievement: true
      }
    });
    
    if (!userAchievement) {
      return null;
    }
    
    return {
      ...userAchievement.achievement,
      progress: userAchievement.progress,
      completed: userAchievement.completed,
      completedAt: userAchievement.completedAt
    };
  },
  
  /**
   * Update achievement progress for a user
   */
  async updateAchievementProgress(userId: number, achievementName: string, progressIncrement: number) {
    // Find the achievement by name
    const achievement = await db.query.achievements.findFirst({
      where: eq(schema.achievements.name, achievementName)
    });
    
    if (!achievement) {
      throw new Error("Achievement not found");
    }
    
    // Get the user's progress on this achievement
    const userAchievement = await db.query.userAchievements.findFirst({
      where: and(
        eq(schema.userAchievements.userId, userId),
        eq(schema.userAchievements.achievementId, achievement.id)
      )
    });
    
    let newProgress = 0;
    let completed = false;
    
    if (!userAchievement) {
      // Initialize the achievement if it doesn't exist
      newProgress = progressIncrement;
      completed = progressIncrement >= achievement.target;
      
      await db.insert(schema.userAchievements).values({
        userId,
        achievementId: achievement.id,
        progress: newProgress,
        completed,
        completedAt: completed ? new Date() : null
      });
      
      if (completed) {
        // Award XP for completing the achievement
        await this.addUserXP(userId, achievement.xpReward);
        
        // Send achievement completed notification
        if ((global as any).sendToUser) {
          (global as any).sendToUser(userId, {
            type: 'achievement_completed',
            userId: userId,
            achievementId: achievement.id,
            achievementName: achievement.name,
            progress: newProgress,
            isCompleted: true,
            timestamp: new Date().toISOString()
          });
        }
      } else if (progressIncrement > 0) {
        // Send achievement progress notification
        if ((global as any).sendToUser) {
          (global as any).sendToUser(userId, {
            type: 'achievement_progress',
            userId: userId,
            achievementId: achievement.id,
            achievementName: achievement.name,
            progress: newProgress,
            isCompleted: false,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      return { progress: newProgress, completed };
    }
    
    // If the achievement is already completed, no need to update
    if (userAchievement.completed) {
      return { progress: userAchievement.progress, completed: true };
    }
    
    // Update progress
    newProgress = userAchievement.progress + progressIncrement;
    completed = newProgress >= achievement.target;
    
    await db.update(schema.userAchievements)
      .set({
        progress: newProgress,
        completed,
        completedAt: completed ? new Date() : null
      })
      .where(eq(schema.userAchievements.id, userAchievement.id));
    
    if (completed) {
      // Award XP for completing the achievement
      await this.addUserXP(userId, achievement.xpReward);
      
      // Send achievement completed notification
      if ((global as any).sendToUser) {
        (global as any).sendToUser(userId, {
          type: 'achievement_completed',
          userId: userId,
          achievementId: achievement.id,
          achievementName: achievement.name,
          progress: newProgress,
          isCompleted: true,
          timestamp: new Date().toISOString()
        });
      }
    } else if (progressIncrement > 0) {
      // Send achievement progress notification
      if ((global as any).sendToUser) {
        (global as any).sendToUser(userId, {
          type: 'achievement_progress',
          userId: userId,
          achievementId: achievement.id,
          achievementName: achievement.name,
          progress: newProgress,
          isCompleted: false,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return { progress: newProgress, completed };
  },
  
  /**
   * Check and update all applicable achievements for a user
   */
  async checkAchievements(userId: number) {
    // This is a separate function that can be expanded to check various
    // achievement types based on user activity
    
    // For example, check "Knowledge Seeker" achievement based on lessons completed
    const lessonCount = await this.countUserCompletedLessons(userId);
    await this.updateAchievementProgress(userId, "Knowledge Seeker", 0); // Set progress directly
    
    // Check "Problem Solver" achievement
    const problemCount = await this.countUserSolvedProblems(userId);
    await this.updateAchievementProgress(userId, "Problem Solver", 0); // Set progress directly
    
    // AI Companion achievement is updated separately when AI sessions occur
  },
  
  /**
   * Count user's completed lessons
   */
  async countUserCompletedLessons(userId: number) {
    // This is a placeholder for actual implementation
    // The real implementation would query the database for completed lessons
    return 0;
  },
  
  /**
   * Count user's solved problems
   */
  async countUserSolvedProblems(userId: number) {
    // This is a placeholder for actual implementation
    // The real implementation would query the database for solved problems
    return 0;
  },
  
  /**
   * Increment user's AI session count
   */
  async incrementAISessionCount(userId: number) {
    // Update "AI Companion" achievement
    await this.updateAchievementProgress(userId, "AI Companion", 1);
  },
  
  // AI-related functions
  
  /**
   * Get the AI tutor assigned to a user
   */
  async getAITutorForUser(userId: number) {
    // Check if the user has had conversations with an AI tutor
    const conversation = await db.query.conversations.findFirst({
      where: eq(schema.conversations.userId, userId),
      orderBy: desc(schema.conversations.updatedAt),
      with: {
        aiTutor: true
      }
    });
    
    if (conversation) {
      return conversation.aiTutor;
    }
    
    // If not, return the default AI tutor
    return await this.getDefaultAITutor();
  },
  
  /**
   * Get the default AI tutor
   */
  async getDefaultAITutor() {
    return await db.query.aiTutors.findFirst({
      orderBy: asc(schema.aiTutors.id)
    });
  },
  
  /**
   * Get the most recent conversation for a user
   */
  async getRecentConversation(userId: number) {
    const conversation = await db.query.conversations.findFirst({
      where: eq(schema.conversations.userId, userId),
      orderBy: desc(schema.conversations.updatedAt)
    });
    
    return conversation;
  },
  
  /**
   * Save or update a conversation
   */
  async saveConversation(conversation: any) {
    // Check if there's an existing conversation
    const existingConversation = await db.query.conversations.findFirst({
      where: and(
        eq(schema.conversations.userId, conversation.userId),
        eq(schema.conversations.aiTutorId, conversation.aiTutorId)
      ),
      orderBy: desc(schema.conversations.updatedAt)
    });
    
    if (existingConversation) {
      // Update existing conversation
      const [updated] = await db.update(schema.conversations)
        .set({
          messages: JSON.stringify(conversation.messages),
          updatedAt: new Date()
        })
        .where(eq(schema.conversations.id, existingConversation.id))
        .returning();
      
      return updated;
    } else {
      // Create new conversation
      const [newConversation] = await db.insert(schema.conversations).values({
        userId: conversation.userId,
        aiTutorId: conversation.aiTutorId,
        messages: JSON.stringify(conversation.messages)
      }).returning();
      
      return newConversation;
    }
  },
  
  /**
   * Get all AI tools
   */
  async getAllAITools() {
    return await db.query.aiTools.findMany();
  },
  
  /**
   * Get an AI tool by ID
   */
  async getAIToolById(toolId: number) {
    return await db.query.aiTools.findFirst({
      where: eq(schema.aiTools.id, toolId)
    });
  },
  
  /**
   * Get user's performance data
   */
  async getUserPerformanceData(userId: number) {
    // Get user's course progress
    const courseProgress = await db.query.userCourses.findMany({
      where: eq(schema.userCourses.userId, userId),
      with: {
        course: true
      }
    });
    
    // Get user's battle performance
    const battlePerformance = await db.query.battleParticipants.findMany({
      where: eq(schema.battleParticipants.userId, userId),
      with: {
        battle: true
      }
    });
    
    // Organize data by subject
    const subjectPerformance: Record<string, { score: number; total: number }> = {};
    
    // Add course data
    for (const progress of courseProgress) {
      const subject = progress.course.subject;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { score: 0, total: 0 };
      }
      
      subjectPerformance[subject].score += progress.progress;
      subjectPerformance[subject].total += 100; // 100% is the max for a course
    }
    
    // Add battle data (if battles have subject information)
    for (const performance of battlePerformance) {
      if (performance.score !== null && performance.battle.topics) {
        // Use the first topic as a subject for simplicity
        const topics = performance.battle.topics as string[];
        const subject = topics[0] || "General";
        
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = { score: 0, total: 0 };
        }
        
        subjectPerformance[subject].score += performance.score;
        subjectPerformance[subject].total += 100; // 100% is the max for a battle
      }
    }
    
    return { subjectPerformance };
  },
  
  // Course-related functions
  
  /**
   * Get all courses with optional filters
   */
  async getAllCourses(filters?: { examType?: string; subject?: string }) {
    let query = db.select().from(schema.courses);
    
    if (filters?.examType) {
      query = query.where(eq(schema.courses.examType, filters.examType));
    }
    
    if (filters?.subject) {
      query = query.where(eq(schema.courses.subject, filters.subject));
    }
    
    return await query;
  },
  
  /**
   * Get a course by ID
   */
  async getCourseById(courseId: number) {
    return await db.query.courses.findFirst({
      where: eq(schema.courses.id, courseId)
    });
  },
  
  /**
   * Get all course categories
   */
  async getCourseCategories() {
    return await db.query.courseCategories.findMany();
  },
  
  /**
   * Check if a user is enrolled in a course
   */
  async isUserEnrolledInCourse(userId: number, courseId: number) {
    const enrollment = await db.query.userCourses.findFirst({
      where: and(
        eq(schema.userCourses.userId, userId),
        eq(schema.userCourses.courseId, courseId)
      )
    });
    
    return !!enrollment;
  },
  
  /**
   * Enroll a user in a course
   */
  async enrollUserInCourse(userId: number, courseId: number) {
    const [enrollment] = await db.insert(schema.userCourses).values({
      userId,
      courseId,
      currentChapter: "Chapter 1",
      progress: 0,
      completed: false,
      lastActivity: new Date()
    }).returning();
    
    return enrollment;
  },
  
  /**
   * Get user's progress for all enrolled courses
   */
  async getUserCourseProgress(userId: number) {
    return await db.query.userCourses.findMany({
      where: eq(schema.userCourses.userId, userId)
    });
  },
  
  /**
   * Get user's progress for a specific course
   */
  async getUserCourseSingleProgress(userId: number, courseId: number) {
    return await db.query.userCourses.findFirst({
      where: and(
        eq(schema.userCourses.userId, userId),
        eq(schema.userCourses.courseId, courseId)
      )
    });
  },
  
  /**
   * Update user's progress in a course
   */
  async updateUserCourseProgress(userId: number, courseId: number, data: {
    currentChapter?: string;
    progress: number;
    completed?: boolean;
    completedAt?: Date;
  }) {
    const [updated] = await db.update(schema.userCourses)
      .set({
        currentChapter: data.currentChapter,
        progress: data.progress,
        completed: data.completed ?? false,
        completedAt: data.completedAt,
        lastActivity: new Date()
      })
      .where(and(
        eq(schema.userCourses.userId, userId),
        eq(schema.userCourses.courseId, courseId)
      ))
      .returning();
    
    return updated;
  },
  
  /**
   * Get user's recently accessed courses
   */
  async getUserRecentCourses(userId: number) {
    const userCourses = await db.query.userCourses.findMany({
      where: eq(schema.userCourses.userId, userId),
      orderBy: desc(schema.userCourses.lastActivity),
      limit: 2, // Limit to the 2 most recent courses
      with: {
        course: true
      }
    });
    
    return userCourses.map(uc => ({
      id: uc.course.id,
      title: uc.course.title,
      description: uc.course.description,
      subject: uc.course.subject,
      examType: uc.course.examType,
      coverImage: uc.course.coverImage,
      currentChapter: uc.currentChapter,
      progress: uc.progress,
      lastActivity: uc.lastActivity,
      completedAt: uc.completedAt
    }));
  },
  
  // Battle-related functions
  
  /**
   * Get all active battles
   */
  async getActiveBattles() {
    const battles = await db.query.battles.findMany({
      where: eq(schema.battles.status, "waiting"),
      with: {
        participants: {
          with: {
            user: true
          }
        }
      }
    });
    
    return battles.map(battle => ({
      id: battle.id,
      title: battle.title,
      type: battle.type,
      duration: battle.duration,
      topics: battle.topics as string[],
      rewardPoints: battle.rewardPoints,
      status: battle.status,
      participants: battle.participants.map(p => ({
        id: p.userId,
        name: p.user.name,
        profileImage: p.user.profileImage || ''
      }))
    }));
  },
  
  /**
   * Get all upcoming battles
   */
  async getUpcomingBattles() {
    const battles = await db.query.battles.findMany({
      where: eq(schema.battles.status, "scheduled"),
      with: {
        participants: {
          with: {
            user: true
          }
        }
      }
    });
    
    return battles.map(battle => {
      // Calculate time until battle starts
      const now = new Date();
      const startTime = battle.startTime ? new Date(battle.startTime) : now;
      const diffMs = startTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      let startsIn;
      if (diffHours > 0) {
        startsIn = `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      } else {
        startsIn = `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
      }
      
      return {
        id: battle.id,
        title: battle.title,
        type: battle.type,
        duration: battle.duration,
        topics: battle.topics as string[],
        rewardPoints: battle.rewardPoints,
        status: battle.status,
        startsIn,
        participants: battle.participants.map(p => ({
          id: p.userId,
          name: p.user.name,
          profileImage: p.user.profileImage || ''
        }))
      };
    });
  },
  
  /**
   * Get past battles for a user
   */
  async getPastBattles(userId: number) {
    // First get the battle IDs where the user participated
    const participations = await db.query.battleParticipants.findMany({
      where: eq(schema.battleParticipants.userId, userId),
      columns: {
        battleId: true
      }
    });
    
    const battleIds = participations.map(p => p.battleId);
    
    if (battleIds.length === 0) {
      return [];
    }
    
    // Then get those battles
    const battles = await db.query.battles.findMany({
      where: and(
        eq(schema.battles.status, "completed"),
        inArray(schema.battles.id, battleIds)
      ),
      with: {
        participants: {
          with: {
            user: true
          }
        },
        winner: true
      }
    });
    
    return battles.map(battle => ({
      id: battle.id,
      title: battle.title,
      type: battle.type,
      duration: battle.duration,
      topics: battle.topics as string[],
      completedAt: battle.endTime,
      winner: battle.winner?.name || 'No winner',
      participants: battle.participants.map(p => ({
        id: p.userId,
        name: p.user.name,
        profileImage: p.user.profileImage || '',
        score: p.score
      }))
    }));
  },
  
  /**
   * Get a battle by ID
   */
  async getBattleById(battleId: number) {
    return await db.query.battles.findFirst({
      where: eq(schema.battles.id, battleId),
      with: {
        participants: {
          with: {
            user: true
          }
        },
        winner: true,
        creator: true
      }
    });
  },
  
  /**
   * Create a new battle
   */
  async createBattle(battleData: {
    title: string;
    type: string;
    duration: number;
    topics: string[];
    rewardPoints: number;
    createdBy: number;
  }) {
    const [battle] = await db.insert(schema.battles).values({
      title: battleData.title,
      type: battleData.type,
      duration: battleData.duration,
      topics: JSON.stringify(battleData.topics),
      rewardPoints: battleData.rewardPoints,
      status: "waiting", // Battle starts in "waiting" status
      createdBy: battleData.createdBy
    }).returning();
    
    return battle;
  },
  
  /**
   * Join a battle
   */
  async joinBattle(battleId: number, userId: number, team: number = 0) {
    const [participant] = await db.insert(schema.battleParticipants).values({
      battleId,
      userId,
      team
    }).returning();
    
    return participant;
  },
  
  /**
   * Check if a user is a participant in a battle
   */
  async isBattleParticipant(battleId: number, userId: number) {
    const participant = await db.query.battleParticipants.findFirst({
      where: and(
        eq(schema.battleParticipants.battleId, battleId),
        eq(schema.battleParticipants.userId, userId)
      )
    });
    
    return !!participant;
  },
  
  /**
   * Get all participants in a battle
   */
  async getBattleParticipants(battleId: number) {
    return await db.query.battleParticipants.findMany({
      where: eq(schema.battleParticipants.battleId, battleId),
      with: {
        user: true
      }
    });
  },
  
  /**
   * Start a battle
   */
  async startBattle(battleId: number) {
    const now = new Date();
    
    await db.update(schema.battles)
      .set({
        status: "in_progress",
        startTime: now
      })
      .where(eq(schema.battles.id, battleId));
  },
  
  /**
   * Submit a battle answer
   */
  async submitBattleAnswer(battleId: number, userId: number, answer: string) {
    await db.update(schema.battleParticipants)
      .set({
        submission: answer
      })
      .where(and(
        eq(schema.battleParticipants.battleId, battleId),
        eq(schema.battleParticipants.userId, userId)
      ));
  },
  
  /**
   * Complete a battle (when all answers are submitted)
   */
  async completeBattle(battleId: number) {
    const now = new Date();
    
    await db.update(schema.battles)
      .set({
        status: "completed",
        endTime: now
      })
      .where(eq(schema.battles.id, battleId));
  },
  
  /**
   * Update battle with results from AI judging
   */
  async updateBattleResults(battleId: number, judgement: {
    winnerId: number;
    scores: Record<number, number>;
    feedback: Record<number, string>;
  }) {
    // Update the battle with the winner
    await db.update(schema.battles)
      .set({
        winnerId: judgement.winnerId
      })
      .where(eq(schema.battles.id, battleId));
    
    // Update each participant with their score and feedback
    for (const [userId, score] of Object.entries(judgement.scores)) {
      await db.update(schema.battleParticipants)
        .set({
          score,
          feedback: judgement.feedback[userId] || ""
        })
        .where(and(
          eq(schema.battleParticipants.battleId, battleId),
          eq(schema.battleParticipants.userId, parseInt(userId))
        ));
    }
  },
  
  /**
   * Award XP to battle participants
   */
  async awardBattleXP(battleId: number, winnerId: number, winnerXp: number, participantXp: number) {
    // Award XP to the winner
    await this.addUserXP(winnerId, winnerXp);
    
    // Award XP to all other participants
    const participants = await this.getBattleParticipants(battleId);
    
    for (const participant of participants) {
      if (participant.userId !== winnerId) {
        await this.addUserXP(participant.userId, participantXp);
      }
    }
    
    // Update battle-related achievements
    await this.updateAchievementProgress(winnerId, "Battle Veteran", 1);
  }
};
