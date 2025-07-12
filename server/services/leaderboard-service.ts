import { Request, Response } from "express";
import { db } from "@db";
import { storage } from "../storage";
import { users } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

export const leaderboardService = {
  // Get global leaderboard - top users by rank points (exam-specific)
  async getGlobalLeaderboard(req: Request, res: Response) {
    try {
      const { limit = 100, page = 1, type = 'rank', exam } = req.query;
      const pageSize = Number(limit);
      const pageNumber = Number(page);
      const offset = (pageNumber - 1) * pageSize;
      
      // Get current user's exam if not specified and user is authenticated
      let examFilter = exam;
      if (!examFilter && req.isAuthenticated() && req.user) {
        const currentUser = await db.query.users.findFirst({
          where: eq(users.id, req.user.id),
          columns: { track: true }
        });
        examFilter = currentUser?.track;
      }
      
      let leaderboardData;
      
      if (type === 'rank') {
        // Rank-based leaderboard with exam filtering
        leaderboardData = await db.query.users.findMany({
          columns: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            rank: true,
            rankPoints: true,
            level: true,
            grade: true,
            track: true
          },
          where: examFilter ? eq(users.track, examFilter as string) : undefined,
          orderBy: [
            desc(users.rankPoints),
            desc(users.level)
          ],
          limit: pageSize,
          offset: offset
        });
      } else if (type === 'xp') {
        // XP/Level-based leaderboard with exam filtering
        leaderboardData = await db.query.users.findMany({
          columns: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            level: true,
            currentXp: true,
            nextLevelXp: true,
            rank: true,
            grade: true,
            track: true
          },
          where: examFilter ? eq(users.track, examFilter as string) : undefined,
          orderBy: [
            desc(users.level),
            desc(users.currentXp)
          ],
          limit: pageSize,
          offset: offset
        });
      } else if (type === 'streak') {
        // Streak-based leaderboard with exam filtering
        leaderboardData = await db.query.users.findMany({
          columns: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            streakDays: true,
            lastStreakDate: true,
            level: true,
            rank: true,
            grade: true,
            track: true
          },
          where: examFilter ? eq(users.track, examFilter as string) : undefined,
          orderBy: [
            desc(users.streakDays),
            desc(users.level)
          ],
          limit: pageSize,
          offset: offset
        });
      } else {
        return res.status(400).json({ message: "Invalid leaderboard type" });
      }
      
      // Add position numbers to the results
      const rankedData = leaderboardData.map((user, index) => ({
        ...user,
        position: offset + index + 1
      }));
      
      // Get total count for pagination (with same exam filter)
      const totalUsers = await db.query.users.findMany({
        columns: { id: true },
        where: examFilter ? eq(users.track, examFilter as string) : undefined
      });
      
      return res.status(200).json({
        leaderboard: rankedData,
        examFilter: examFilter,
        pagination: {
          page: pageNumber,
          pageSize,
          total: totalUsers.length
        }
      });
      
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return res.status(500).json({ message: "Error getting leaderboard data" });
    }
  },
  
  // Get friends leaderboard - users the current user is connected to (exam-specific)
  async getFriendsLeaderboard(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { limit = 50, type = 'rank', exam } = req.query;
      const userId = req.user.id;
      const pageSize = Number(limit);
      
      // Get current user's exam if not specified
      let examFilter = exam;
      if (!examFilter) {
        const currentUser = await db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: { track: true }
        });
        examFilter = currentUser?.track;
      }
      
      // Get users who are connected to the current user through referrals
      // This includes both people who referred the user and people the user referred
      const referrals = await storage.getUserReferrals(userId);
      
      if (!referrals || referrals.length === 0) {
        return res.status(200).json({
          leaderboard: [],
          message: "No friends found. Invite friends using your referral code!"
        });
      }
      
      // Extract the user IDs from referrals
      const friendIds = new Set<number>();
      referrals.forEach(referral => {
        friendIds.add(referral.referrerId);
        friendIds.add(referral.referredId);
      });
      
      // Remove the current user's ID
      friendIds.delete(userId);
      
      if (friendIds.size === 0) {
        return res.status(200).json({
          leaderboard: [],
          message: "No friends found. Invite friends using your referral code!"
        });
      }
      
      // Convert the Set to an array for the query
      const friendIdsArray = Array.from(friendIds);
      
      let leaderboardData;
      
      // Query based on leaderboard type with exam filtering
      if (type === 'rank') {
        leaderboardData = await db.query.users.findMany({
          columns: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            rank: true,
            rankPoints: true,
            level: true,
            grade: true,
            track: true
          },
          where: examFilter ? 
            sql`${users.id} IN (${friendIdsArray.join(',')}) AND ${users.track} = ${examFilter}` :
            sql`${users.id} IN (${friendIdsArray.join(',')})`,
          orderBy: [
            desc(users.rankPoints),
            desc(users.level)
          ],
          limit: pageSize
        });
      } else if (type === 'xp') {
        leaderboardData = await db.query.users.findMany({
          columns: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            level: true,
            currentXp: true,
            nextLevelXp: true,
            rank: true,
            grade: true,
            track: true
          },
          where: examFilter ? 
            sql`${users.id} IN (${friendIdsArray.join(',')}) AND ${users.track} = ${examFilter}` :
            sql`${users.id} IN (${friendIdsArray.join(',')})`,
          orderBy: [
            desc(users.level),
            desc(users.currentXp)
          ],
          limit: pageSize
        });
      } else if (type === 'streak') {
        leaderboardData = await db.query.users.findMany({
          columns: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            streakDays: true,
            lastStreakDate: true,
            level: true,
            rank: true,
            grade: true,
            track: true
          },
          where: examFilter ? 
            sql`${users.id} IN (${friendIdsArray.join(',')}) AND ${users.track} = ${examFilter}` :
            sql`${users.id} IN (${friendIdsArray.join(',')})`,
          orderBy: [
            desc(users.streakDays),
            desc(users.level)
          ],
          limit: pageSize
        });
      } else {
        return res.status(400).json({ message: "Invalid leaderboard type" });
      }
      
      // Add position numbers to the results
      const rankedData = leaderboardData.map((user, index) => ({
        ...user,
        position: index + 1
      }));
      
      // Also get the current user's data to include in response
      const userData = await db.query.users.findFirst({
        columns: {
          id: true,
          username: true, 
          name: true,
          profileImage: true,
          rank: true,
          rankPoints: true,
          level: true,
          currentXp: true,
          nextLevelXp: true,
          streakDays: true,
          lastStreakDate: true,
          grade: true,
          track: true
        },
        where: eq(users.id, userId)
      });
      
      return res.status(200).json({
        leaderboard: rankedData,
        currentUser: userData,
        examFilter: examFilter
      });
      
    } catch (error) {
      console.error('Error getting friends leaderboard:', error);
      return res.status(500).json({ message: "Error getting friends leaderboard data" });
    }
  },
  
  // Get a specific user's rank position
  async getUserRankPosition(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = Number(req.params.userId) || req.user.id;
      
      // Get user's rank points
      const user = await db.query.users.findFirst({
        columns: {
          id: true,
          username: true,
          name: true,
          rankPoints: true,
          rank: true,
          level: true
        },
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Count users with more rank points than this user
      const usersWithHigherRankCount = await db.query.users.findMany({
        columns: {
          id: true
        },
        where: sql`${users.rankPoints} > ${user.rankPoints}`
      });
      
      // The position is the count of users with higher rank + 1
      const position = usersWithHigherRankCount.length + 1;
      
      // Get users below and above this user's rank
      const usersAroundRank = await db.query.users.findMany({
        columns: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
          rank: true,
          rankPoints: true,
          level: true
        },
        where: sql`${users.id} != ${userId}`,
        orderBy: [desc(users.rankPoints), desc(users.level)],
        limit: 6 // Get 3 users above and 3 below (approximately)
      });
      
      // Find if the current user is in this group and where to split the array
      const userPosition = usersAroundRank.findIndex(u => u.rankPoints <= user.rankPoints);
      
      // Decide where to split users above/below
      let usersAbove: typeof usersAroundRank;
      let usersBelow: typeof usersAroundRank;
      
      if (userPosition >= 0) {
        usersAbove = usersAroundRank.slice(0, userPosition).slice(-3); // Last 3 users above
        usersBelow = usersAroundRank.slice(userPosition).slice(0, 3); // First 3 users below
      } else {
        // If user is not found, they might be at the very top
        usersAbove = [];
        usersBelow = usersAroundRank.slice(0, 3);
      }
      
      return res.status(200).json({
        user: {
          ...user,
          position
        },
        usersAbove,
        usersBelow,
        totalUsers: await db.query.users.findMany({
          columns: {
            id: true
          }
        }).then(rows => rows.length)
      });
      
    } catch (error) {
      console.error('Error getting user rank position:', error);
      return res.status(500).json({ message: "Error getting user rank position" });
    }
  },
  
  // Broadcast a leaderboard update to all connected users
  async broadcastLeaderboardUpdate(userIds: number[], updateType: string, message: string) {
    try {
      if (!(global as any).broadcastToAll) {
        console.error('broadcastToAll function not available');
        return false;
      }
      
      (global as any).broadcastToAll({
        type: 'leaderboard_update',
        userIds,
        updateType,
        message,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error broadcasting leaderboard update:', error);
      return false;
    }
  }
};