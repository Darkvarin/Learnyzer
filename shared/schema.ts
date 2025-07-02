import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  mobile: text("mobile").unique(),
  mobileVerified: boolean("mobile_verified").default(false).notNull(),
  profileImage: text("profile_image"),
  grade: text("grade"),             // Student's class/grade (e.g., "5", "11", "undergraduate")
  track: text("track"),             // Educational track or stream
  selectedExam: text("selected_exam"), // Locked entrance exam (jee, neet, upsc, clat, cuet, cse)
  examLocked: boolean("exam_locked").default(false).notNull(), // Whether exam selection is locked
  examLockedAt: timestamp("exam_locked_at"), // When the exam was locked
  level: integer("level").default(1).notNull(),
  currentXp: integer("current_xp").default(0).notNull(),
  nextLevelXp: integer("next_level_xp").default(1000).notNull(),
  rank: text("rank").default("Bronze I").notNull(),
  rankPoints: integer("rank_points").default(0).notNull(),
  streakDays: integer("streak_days").default(0).notNull(),
  lastStreakDate: timestamp("last_streak_date"),
  referralCode: text("referral_code").notNull().unique(),
  // Subscription fields
  // Subscription fields (temporarily commented for compatibility)
  // subscriptionTier: text("subscription_tier").default("free").notNull(), // free, basic, pro, quarterly, half_yearly, yearly
  // subscriptionStatus: text("subscription_status").default("inactive").notNull(), // inactive, active, expired, cancelled
  // subscriptionStartDate: timestamp("subscription_start_date"),
  // subscriptionEndDate: timestamp("subscription_end_date"),
  // paymentId: text("payment_id"),
  // razorpayOrderId: text("razorpay_order_id"),
  // razorpayPaymentId: text("razorpay_payment_id"),
  // autoRenewal: boolean("auto_renewal").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Courses Table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subject: text("subject").notNull(),
  examType: text("exam_type").notNull(),
  coverImage: text("cover_image").notNull(),
  chapters: integer("chapters").notNull(),
  chapterDetails: jsonb("chapter_details"), // Array of chapters with titles and descriptions
  targetGrade: text("target_grade"), // Target grade/class for this course, e.g., "5", "10", "11-science"
  difficulty: text("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Course Categories Table
export const courseCategories = pgTable("course_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User Courses Progress Table
export const userCourses = pgTable("user_courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  currentChapter: text("current_chapter"),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  lastActivity: timestamp("last_activity").defaultNow().notNull()
});

// AI Tutors Table
export const aiTutors = pgTable("ai_tutors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  personalityTraits: jsonb("personality_traits").notNull()
});

// User AI Conversations Table
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  aiTutorId: integer("ai_tutor_id").references(() => aiTutors.id).notNull(),
  messages: jsonb("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Battles Table
export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  topics: jsonb("topics").notNull(),
  rewardPoints: integer("reward_points").notNull(),
  status: text("status").default("waiting").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  winnerId: integer("winner_id").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Battle Participants Table
export const battleParticipants = pgTable("battle_participants", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").references(() => battles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  team: integer("team").default(0).notNull(),
  score: integer("score"),
  feedback: text("feedback"),
  submission: text("submission"),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

// AI Tools Table
export const aiTools = pgTable("ai_tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").default("primary").notNull(),
  features: jsonb("features"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Rewards Table
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  image: text("image").notNull(),
  cost: integer("cost").notNull(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User Rewards Table
export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rewardId: integer("reward_id").references(() => rewards.id).notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  active: boolean("active").default(false)
});

// Achievements Table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  target: integer("target").notNull(),
  xpReward: integer("xp_reward").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User Achievements Table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Referrals Table
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredId: integer("referred_id").references(() => users.id).notNull(),
  xpEarned: integer("xp_earned").default(500).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Daily Streak Goals Table
export const streakGoals = pgTable("streak_goals", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  target: integer("target").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Wellness Preferences Table
export const wellnessPreferences = pgTable("wellness_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  eyeStrain: boolean("eye_strain").default(true).notNull(),
  posture: boolean("posture").default(true).notNull(),
  hydration: boolean("hydration").default(true).notNull(),
  movement: boolean("movement").default(true).notNull(),
  breathing: boolean("breathing").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wellness Breaks Table
export const wellnessBreaks = pgTable("wellness_breaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  breakId: text("break_id").notNull(),
  breakType: text("break_type").notNull(),
  duration: integer("duration").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// User Daily Streak Goals Table
export const userStreakGoals = pgTable("user_streak_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  streakGoalId: integer("streak_goal_id").references(() => streakGoals.id).notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  date: timestamp("date").defaultNow().notNull()
});

// Usage Tracking Table (temporarily commented for compatibility)
/*
export const usageTracking = pgTable("usage_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  featureType: text("feature_type").notNull(), // ai_chat, ai_visual_lab, ai_tutor_session, visual_package_generation
  usageDate: timestamp("usage_date").defaultNow().notNull(),
  resetDate: timestamp("reset_date").notNull(), // When the usage count resets (daily/monthly)
  usageCount: integer("usage_count").default(1).notNull(),
  metadata: jsonb("metadata") // Additional data like tokens used, session duration, etc.
});

// Subscription Limits Table (temporarily commented for compatibility)
export const subscriptionLimits = pgTable("subscription_limits", {
  id: serial("id").primaryKey(),
  tierName: text("tier_name").notNull().unique(), // free, basic, pro, quarterly, half_yearly, yearly
  aiChatLimit: integer("ai_chat_limit").notNull(), // Messages per day
  aiVisualLabLimit: integer("ai_visual_lab_limit").notNull(), // Visual generations per day
  aiTutorSessionLimit: integer("ai_tutor_session_limit").notNull(), // Sessions per day
  visualPackageLimit: integer("visual_package_limit").notNull(), // Visual packages per day
  courseAccessLevel: text("course_access_level").notNull(), // basic, premium, unlimited
  prioritySupport: boolean("priority_support").default(false).notNull(),
  downloadLimit: integer("download_limit").notNull(), // Content downloads per month
  createdAt: timestamp("created_at").defaultNow().notNull()
});
*/

// OTP Verification Table for mobile authentication
export const otpVerification = pgTable("otp_verification", {
  id: serial("id").primaryKey(),
  mobile: text("mobile").notNull(),
  otp: text("otp").notNull(),
  purpose: text("purpose").notNull(), // 'signup', 'login', 'password_reset'
  verified: boolean("verified").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Customer Feedback System Tables
export const feedbackCategories = pgTable("feedback_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const customerFeedback = pgTable("customer_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  categoryId: integer("category_id").references(() => feedbackCategories.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'feedback', 'feature_request', 'bug_report', 'suggestion'
  priority: text("priority").default("medium").notNull(), // 'low', 'medium', 'high', 'urgent'
  status: text("status").default("open").notNull(), // 'open', 'under_review', 'in_progress', 'resolved', 'closed'
  rating: integer("rating"), // 1-5 star rating (optional)
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  userEmail: text("user_email"), // For anonymous feedback
  userName: text("user_name"), // For anonymous feedback
  tags: text("tags"), // JSON array of tags
  attachments: text("attachments"), // JSON array of attachment URLs
  adminResponse: text("admin_response"),
  adminResponseAt: timestamp("admin_response_at"),
  respondedBy: integer("responded_by").references(() => users.id),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const feedbackVotes = pgTable("feedback_votes", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").references(() => customerFeedback.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  voteType: text("vote_type").notNull(), // 'up' or 'down'
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const feedbackComments = pgTable("feedback_comments", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").references(() => customerFeedback.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  comment: text("comment").notNull(),
  isAdminComment: boolean("is_admin_comment").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  userCourses: many(userCourses),
  conversations: many(conversations),
  battleParticipations: many(battleParticipants),
  createdBattles: many(battles, { relationName: "createdBattles" }),
  wonBattles: many(battles, { relationName: "wonBattles" }),
  userRewards: many(userRewards),
  userAchievements: many(userAchievements),
  referralsGiven: many(referrals, { relationName: "referralsGiven" }),
  referralsReceived: many(referrals, { relationName: "referralsReceived" }),
  userStreakGoals: many(userStreakGoals),
  // usageTracking: many(usageTracking), // Temporarily commented for compatibility
  wellnessPreferences: many(wellnessPreferences),
  wellnessBreaks: many(wellnessBreaks),
  feedback: many(customerFeedback),
  feedbackVotes: many(feedbackVotes),
  feedbackComments: many(feedbackComments)
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  userCourses: many(userCourses)
}));

export const courseCategoriesRelations = relations(courseCategories, ({ many }) => ({
  courses: many(courses)
}));

export const userCoursesRelations = relations(userCourses, ({ one }) => ({
  user: one(users, { fields: [userCourses.userId], references: [users.id] }),
  course: one(courses, { fields: [userCourses.courseId], references: [courses.id] })
}));

export const aiTutorsRelations = relations(aiTutors, ({ many }) => ({
  conversations: many(conversations)
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
  aiTutor: one(aiTutors, { fields: [conversations.aiTutorId], references: [aiTutors.id] })
}));

export const battlesRelations = relations(battles, ({ one, many }) => ({
  creator: one(users, { fields: [battles.createdBy], references: [users.id] }),
  winner: one(users, { fields: [battles.winnerId], references: [users.id] }),
  participants: many(battleParticipants)
}));

export const battleParticipantsRelations = relations(battleParticipants, ({ one }) => ({
  battle: one(battles, { fields: [battleParticipants.battleId], references: [battles.id] }),
  user: one(users, { fields: [battleParticipants.userId], references: [users.id] })
}));

export const rewardsRelations = relations(rewards, ({ many }) => ({
  userRewards: many(userRewards)
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, { fields: [userRewards.userId], references: [users.id] }),
  reward: one(rewards, { fields: [userRewards.rewardId], references: [rewards.id] })
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements)
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] })
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id] }),
  referred: one(users, { fields: [referrals.referredId], references: [users.id] })
}));

export const streakGoalsRelations = relations(streakGoals, ({ many }) => ({
  userStreakGoals: many(userStreakGoals)
}));

export const userStreakGoalsRelations = relations(userStreakGoals, ({ one }) => ({
  user: one(users, { fields: [userStreakGoals.userId], references: [users.id] }),
  streakGoal: one(streakGoals, { fields: [userStreakGoals.streakGoalId], references: [streakGoals.id] })
}));

export const wellnessPreferencesRelations = relations(wellnessPreferences, ({ one }) => ({
  user: one(users, { fields: [wellnessPreferences.userId], references: [users.id] })
}));

export const wellnessBreaksRelations = relations(wellnessBreaks, ({ one }) => ({
  user: one(users, { fields: [wellnessBreaks.userId], references: [users.id] })
}));

export const feedbackCategoriesRelations = relations(feedbackCategories, ({ many }) => ({
  feedback: many(customerFeedback)
}));

export const customerFeedbackRelations = relations(customerFeedback, ({ one, many }) => ({
  user: one(users, { fields: [customerFeedback.userId], references: [users.id] }),
  category: one(feedbackCategories, { fields: [customerFeedback.categoryId], references: [feedbackCategories.id] }),
  respondent: one(users, { fields: [customerFeedback.respondedBy], references: [users.id] }),
  votes: many(feedbackVotes),
  comments: many(feedbackComments)
}));

export const feedbackVotesRelations = relations(feedbackVotes, ({ one }) => ({
  feedback: one(customerFeedback, { fields: [feedbackVotes.feedbackId], references: [customerFeedback.id] }),
  user: one(users, { fields: [feedbackVotes.userId], references: [users.id] })
}));

export const feedbackCommentsRelations = relations(feedbackComments, ({ one }) => ({
  feedback: one(customerFeedback, { fields: [feedbackComments.feedbackId], references: [customerFeedback.id] }),
  user: one(users, { fields: [feedbackComments.userId], references: [users.id] })
}));

// Usage Tracking Relations (temporarily commented for compatibility)
/*
export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  user: one(users, { fields: [usageTracking.userId], references: [users.id] })
}));
*/

// Schemas for validation

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must be a valid email"),
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  mobile: (schema) => schema.regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number"),
});

export const insertOtpVerificationSchema = createInsertSchema(otpVerification, {
  mobile: (schema) => schema.regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number"),
  otp: (schema) => schema.length(6, "OTP must be exactly 6 digits"),
});

export const insertCourseSchema = createInsertSchema(courses, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

export const insertBattleSchema = createInsertSchema(battles, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  duration: (schema) => schema.min(5, "Duration must be at least 5 minutes"),
});

export const insertRewardSchema = createInsertSchema(rewards, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  cost: (schema) => schema.min(1, "Cost must be at least 1 point"),
});

export const insertAchievementSchema = createInsertSchema(achievements, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  target: (schema) => schema.min(1, "Target must be at least 1"),
  xpReward: (schema) => schema.min(1, "XP reward must be at least 1"),
});

export const insertFeedbackCategorySchema = createInsertSchema(feedbackCategories, {
  name: (schema) => schema.min(2, "Category name must be at least 2 characters"),
});

export const insertCustomerFeedbackSchema = createInsertSchema(customerFeedback, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters").max(200, "Title too long"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  type: (schema) => schema.refine(
    (val) => ["feedback", "feature_request", "bug_report", "suggestion"].includes(val),
    "Invalid feedback type"
  ),
  priority: (schema) => schema.refine(
    (val) => ["low", "medium", "high", "urgent"].includes(val),
    "Invalid priority level"
  ),
  rating: (schema) => schema.optional().refine(
    (val) => val === undefined || (val >= 1 && val <= 5),
    "Rating must be between 1 and 5"
  ),
  userEmail: (schema) => schema.optional().refine(
    (val) => val === undefined || val === null || z.string().email().safeParse(val).success,
    "Invalid email format"
  ),
});

export const insertFeedbackVoteSchema = createInsertSchema(feedbackVotes, {
  voteType: (schema) => schema.refine(
    (val) => ["up", "down"].includes(val),
    "Vote type must be 'up' or 'down'"
  ),
});

export const insertFeedbackCommentSchema = createInsertSchema(feedbackComments, {
  comment: (schema) => schema.min(3, "Comment must be at least 3 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type InsertFeedbackCategory = z.infer<typeof insertFeedbackCategorySchema>;
export type InsertCustomerFeedback = z.infer<typeof insertCustomerFeedbackSchema>;
export type InsertFeedbackVote = z.infer<typeof insertFeedbackVoteSchema>;
export type InsertFeedbackComment = z.infer<typeof insertFeedbackCommentSchema>;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type UserCourse = typeof userCourses.$inferSelect;
export type AITutor = typeof aiTutors.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Battle = typeof battles.$inferSelect;
export type BattleParticipant = typeof battleParticipants.$inferSelect;
export type AITool = typeof aiTools.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type UserReward = typeof userRewards.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type StreakGoal = typeof streakGoals.$inferSelect;
export type UserStreakGoal = typeof userStreakGoals.$inferSelect;
export type WellnessPreference = typeof wellnessPreferences.$inferSelect;
export type WellnessBreak = typeof wellnessBreaks.$inferSelect;
export type OtpVerification = typeof otpVerification.$inferSelect;
// export type UsageTracking = typeof usageTracking.$inferSelect; // Temporarily commented for compatibility
// export type SubscriptionLimits = typeof subscriptionLimits.$inferSelect; // Temporarily commented for compatibility
export type FeedbackCategory = typeof feedbackCategories.$inferSelect;
export type CustomerFeedback = typeof customerFeedback.$inferSelect;
export type FeedbackVote = typeof feedbackVotes.$inferSelect;
export type FeedbackComment = typeof feedbackComments.$inferSelect;
