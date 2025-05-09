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
  profileImage: text("profile_image"),
  grade: text("grade"),             // Student's class/grade (e.g., "5", "11", "undergraduate")
  track: text("track"),             // Educational track or stream
  level: integer("level").default(1).notNull(),
  currentXp: integer("current_xp").default(0).notNull(),
  nextLevelXp: integer("next_level_xp").default(1000).notNull(),
  rank: text("rank").default("Bronze I").notNull(),
  rankPoints: integer("rank_points").default(0).notNull(),
  streakDays: integer("streak_days").default(0).notNull(),
  lastStreakDate: timestamp("last_streak_date"),
  referralCode: text("referral_code").notNull().unique(),
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
  wellnessPreferences: many(wellnessPreferences),
  wellnessBreaks: many(wellnessBreaks)
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

// Schemas for validation

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must be a valid email"),
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
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
