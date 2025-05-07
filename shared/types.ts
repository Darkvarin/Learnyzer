// Import types from schema
import type {
  User as UserSchema,
  Course as CourseSchema,
  UserCourse as UserCourseSchema,
  AITutor as AITutorSchema,
  Conversation as ConversationSchema,
  Battle as BattleSchema,
  BattleParticipant as BattleParticipantSchema,
  AITool as AIToolSchema,
  Reward as RewardSchema,
  UserReward as UserRewardSchema,
  Achievement as AchievementSchema,
  UserAchievement as UserAchievementSchema,
  Referral as ReferralSchema,
  StreakGoal as StreakGoalSchema,
  UserStreakGoal as UserStreakGoalSchema
} from './schema';

// Extended types with additional client-side properties

export interface User extends UserSchema {
  profileImage?: string;
}

export interface Course extends CourseSchema {
  currentChapter?: string;
  progress: number;
  lastActivity: Date | string;
  completedAt?: Date | string;
}

export interface CourseCategory {
  id: number;
  name: string;
  description?: string;
}

export interface AITutor extends AITutorSchema {}

export interface Conversation extends ConversationSchema {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date | string;
  }>;
}

export interface Battle extends BattleSchema {
  participants: Array<{
    id: number;
    name: string;
    profileImage: string;
    team?: number;
    submission?: boolean;
  }>;
  startedAt?: Date | string;
  description?: string;
  startsIn?: string;
  completedAt?: Date | string;
  winner?: string;
}

export interface BattleParticipant extends BattleParticipantSchema {}

export interface AITool extends AIToolSchema {
  features?: string[];
  usageCount?: number;
}

export interface Reward extends RewardSchema {
  claimedAt?: Date | string;
}

export interface Achievement extends AchievementSchema {
  progress: number;
  completed: boolean;
  completedAt?: Date | string;
}

export interface Referral extends ReferralSchema {
  name: string;
  profileImage?: string;
  joinedAt: Date | string;
}

export interface StreakGoal extends StreakGoalSchema {
  progress: number;
  completed: boolean;
}

export interface UserStats {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  rank: string;
  streakDays: number;
  battlesWon: number;
  accuracy: string;
  aiSessions: number;
}

export interface UserStreak {
  days: number;
  currentDay: number;
  completedDays: number[];
  goals: StreakGoal[];
  canClaimReward: boolean;
  rewardXp: number;
}

export interface UserRank {
  currentRank: string;
  nextRank: string;
  currentRankPoints: number;
  nextRankPoints: number;
  progressPercentage: number;
}

export interface UserReferrals {
  referralLink: string;
  referrals: Referral[];
}
