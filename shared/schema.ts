import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
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
  isAdmin: boolean("is_admin").default(false).notNull(), // Admin access control
  // Subscription fields
  subscriptionTier: text("subscription_tier").default("free").notNull(), // free, basic, pro, quarterly, half_yearly, yearly
  subscriptionStatus: text("subscription_status").default("inactive").notNull(), // inactive, active, expired, cancelled
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  paymentId: text("payment_id"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  autoRenewal: boolean("auto_renewal").default(false).notNull(),
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

// User Coins Table
export const userCoins = pgTable("user_coins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  coins: integer("coins").default(0).notNull(),
  totalEarned: integer("total_earned").default(0).notNull(),
  totalSpent: integer("total_spent").default(0).notNull(),
  lastDailyBonus: timestamp("last_daily_bonus"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Coin Transactions Table
export const coinTransactions = pgTable("coin_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'earn' or 'spend'
  description: text("description"),
  referenceId: integer("reference_id"),
  referenceType: text("reference_type"), // 'battle', 'daily_bonus', 'achievement', etc.
  createdAt: timestamp("created_at").defaultNow().notNull()
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
  title: text("title"), // Added for better conversation identification
  subject: text("subject").default("General"), // Added subject field
  isActive: boolean("is_active").default(true), // To track active vs archived conversations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Battles Table - Enhanced for Battle Zone 2.0
export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 1v1, 2v2, 3v3, 4v4, tournament, blitz
  format: text("format").default("standard").notNull(), // standard, blitz, endurance, exam_simulation
  difficulty: text("difficulty").default("intermediate").notNull(), // beginner, intermediate, advanced, expert
  examType: text("exam_type"), // JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE
  subject: text("subject"), // Physics, Chemistry, Math, etc.
  duration: integer("duration").notNull(),
  topics: jsonb("topics").notNull(),
  rewardPoints: integer("reward_points").notNull(),
  entryFee: integer("entry_fee").default(0).notNull(), // XP cost to join
  prizePool: integer("prize_pool").default(0).notNull(), // Total XP prize pool
  maxParticipants: integer("max_participants").default(8).notNull(),
  status: text("status").default("waiting").notNull(), // waiting, in_progress, completed, cancelled
  battleMode: text("battle_mode").default("public").notNull(), // public, private, tournament
  spectatorMode: boolean("spectator_mode").default(true).notNull(),
  autoStart: boolean("auto_start").default(false).notNull(),
  questionsCount: integer("questions_count").default(1).notNull(),
  passingScore: integer("passing_score").default(60).notNull(),
  timePerQuestion: integer("time_per_question").default(300).notNull(), // seconds
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  scheduledFor: timestamp("scheduled_for"),
  winnerId: integer("winner_id").references(() => users.id),
  winnerTeam: integer("winner_team"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Tournaments Table - New for Battle Zone 2.0
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  tournamentType: text("tournament_type").default("single_elimination").notNull(), // single_elimination, double_elimination, round_robin
  examType: text("exam_type"), // JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE
  subject: text("subject"),
  maxParticipants: integer("max_participants").default(32).notNull(),
  entryFee: integer("entry_fee").default(0).notNull(),
  prizePool: integer("prize_pool").default(0).notNull(),
  firstPrize: integer("first_prize").default(0).notNull(),
  secondPrize: integer("second_prize").default(0).notNull(),
  thirdPrize: integer("third_prize").default(0).notNull(),
  status: text("status").default("registration").notNull(), // registration, in_progress, completed, cancelled
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  registrationDeadline: timestamp("registration_deadline"),
  winnerId: integer("winner_id").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Battle Participants Table - Enhanced for Battle Zone 2.0
export const battleParticipants = pgTable("battle_participants", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").references(() => battles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  team: integer("team").default(0).notNull(),
  score: integer("score"),
  feedback: text("feedback"),
  submission: text("submission"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).default("0.00").notNull(),
  timeSpent: integer("time_spent").default(0).notNull(), // seconds
  submittedAt: timestamp("submitted_at"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
  rank: integer("rank"),
  isSpectator: boolean("is_spectator").default(false).notNull(),
  powerUpsUsed: jsonb("power_ups_used").default("[]").notNull(),
  streakBonus: integer("streak_bonus").default(0).notNull(),
  difficultyBonus: integer("difficulty_bonus").default(0).notNull()
});

// Battle Questions Table - New for Battle Zone 2.0
export const battleQuestions = pgTable("battle_questions", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").references(() => battles.id).notNull(),
  questionNumber: integer("question_number").notNull(),
  question: text("question").notNull(),
  options: jsonb("options"), // For MCQ questions
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").default("intermediate").notNull(),
  subject: text("subject"),
  topic: text("topic"),
  marks: integer("marks").default(1).notNull(),
  timeLimit: integer("time_limit").default(300).notNull(), // seconds
  questionType: text("question_type").default("descriptive").notNull(), // mcq, descriptive, numerical
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Battle Spectators Table - New for Battle Zone 2.0
export const battleSpectators = pgTable("battle_spectators", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").references(() => battles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at")
});

// Power-ups Table - New for Battle Zone 2.0
export const powerUps = pgTable("power_ups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  effect: text("effect").notNull(), // extra_time, hint, eliminate_option, double_points, shield
  cost: integer("cost").default(50).notNull(), // XP cost
  duration: integer("duration").default(0).notNull(), // seconds, 0 for instant
  isActive: boolean("is_active").default(true).notNull(),
  examTypes: jsonb("exam_types").default('["all"]').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User Power-ups Inventory Table - New for Battle Zone 2.0
export const userPowerUps = pgTable("user_power_ups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  powerUpId: integer("power_up_id").references(() => powerUps.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at")
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



// Student Learning Analytics Tables
export const learningAnalytics = pgTable("learning_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(), // ai_tutor, mock_test, study_notes, answer_checker, visual_lab, course_progress
  subject: text("subject").notNull(),
  topic: text("topic"),
  difficulty: text("difficulty"), // easy, medium, hard
  examType: text("exam_type"), // jee, neet, upsc, etc.
  performance: decimal("performance", { precision: 5, scale: 2 }), // 0-100 percentage
  timeSpent: integer("time_spent"), // seconds
  questionsTotal: integer("questions_total").default(0),
  questionsCorrect: integer("questions_correct").default(0),
  questionsIncorrect: integer("questions_incorrect").default(0),
  conceptsLearned: jsonb("concepts_learned"), // Array of concepts covered
  mistakesMade: jsonb("mistakes_made"), // Array of common mistakes
  strengthsShown: jsonb("strengths_shown"), // Array of demonstrated strengths
  weaknessesIdentified: jsonb("weaknesses_identified"), // Array of identified weaknesses
  improvementSuggestions: jsonb("improvement_suggestions"), // AI-generated suggestions
  sessionMetadata: jsonb("session_metadata"), // Additional session data
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const topicMastery = pgTable("topic_mastery", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  examType: text("exam_type").notNull(),
  masteryLevel: decimal("mastery_level", { precision: 5, scale: 2 }).default("0").notNull(), // 0-100
  totalAttempts: integer("total_attempts").default(0).notNull(),
  correctAttempts: integer("correct_attempts").default(0).notNull(),
  averageTimeSpent: integer("average_time_spent").default(0), // seconds
  lastPracticed: timestamp("last_practiced"),
  consistencyScore: decimal("consistency_score", { precision: 5, scale: 2 }).default("0"), // How consistently correct
  difficultyHandled: text("difficulty_handled").default("easy"), // Highest difficulty mastered
  conceptualGaps: jsonb("conceptual_gaps"), // Identified knowledge gaps
  learningPath: jsonb("learning_path"), // Suggested learning sequence
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const studentProfile = pgTable("student_profile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  learningStyle: text("learning_style"), // visual, auditory, kinesthetic, reading
  strongSubjects: jsonb("strong_subjects"), // Array of subjects with high performance
  weakSubjects: jsonb("weak_subjects"), // Array of subjects needing improvement
  preferredDifficulty: text("preferred_difficulty").default("medium"),
  studyPatterns: jsonb("study_patterns"), // When they study, frequency, etc.
  commonMistakes: jsonb("common_mistakes"), // Patterns in mistakes across subjects
  learningGoals: jsonb("learning_goals"), // Student's set goals
  personalizedRecommendations: jsonb("personalized_recommendations"), // AI recommendations
  overallProgress: decimal("overall_progress", { precision: 5, scale: 2 }).default("0"),
  lastAnalysisUpdate: timestamp("last_analysis_update").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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

// Mock Tests Table
export const mockTests = pgTable("mock_tests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  examType: text("exam_type").notNull(), // JEE, NEET, UPSC, etc.
  subject: text("subject").notNull(),
  difficulty: text("difficulty").notNull(), // Easy, Medium, Hard
  duration: integer("duration").notNull(), // in minutes
  totalQuestions: integer("total_questions").notNull(),
  questions: jsonb("questions").notNull(), // Array of question objects
  answerKey: jsonb("answer_key").notNull(), // Array of correct answers
  isCompleted: boolean("is_completed").default(false).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  totalMarks: integer("total_marks").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mock Test Submissions Table
export const mockTestSubmissions = pgTable("mock_test_submissions", {
  id: serial("id").primaryKey(),
  mockTestId: integer("mock_test_id").references(() => mockTests.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  answers: jsonb("answers").notNull(), // User's submitted answers
  score: integer("score").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  timeTaken: integer("time_taken").notNull(), // in minutes
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
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
  feedbackComments: many(feedbackComments),
  mockTests: many(mockTests),
  mockTestSubmissions: many(mockTestSubmissions),
  learningAnalytics: many(learningAnalytics),
  topicMastery: many(topicMastery),
  studentProfile: many(studentProfile)
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
  tournament: one(tournaments, { fields: [battles.tournamentId], references: [tournaments.id] }),
  participants: many(battleParticipants),
  questions: many(battleQuestions),
  spectators: many(battleSpectators)
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  creator: one(users, { fields: [tournaments.createdBy], references: [users.id] }),
  winner: one(users, { fields: [tournaments.winnerId], references: [users.id] }),
  battles: many(battles)
}));

export const battleQuestionsRelations = relations(battleQuestions, ({ one }) => ({
  battle: one(battles, { fields: [battleQuestions.battleId], references: [battles.id] })
}));

export const battleSpectatorsRelations = relations(battleSpectators, ({ one }) => ({
  battle: one(battles, { fields: [battleSpectators.battleId], references: [battles.id] }),
  user: one(users, { fields: [battleSpectators.userId], references: [users.id] })
}));

export const powerUpsRelations = relations(powerUps, ({ many }) => ({
  userPowerUps: many(userPowerUps)
}));

export const userPowerUpsRelations = relations(userPowerUps, ({ one }) => ({
  user: one(users, { fields: [userPowerUps.userId], references: [users.id] }),
  powerUp: one(powerUps, { fields: [userPowerUps.powerUpId], references: [powerUps.id] })
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

export const mockTestsRelations = relations(mockTests, ({ one, many }) => ({
  user: one(users, { fields: [mockTests.userId], references: [users.id] }),
  submissions: many(mockTestSubmissions)
}));

export const mockTestSubmissionsRelations = relations(mockTestSubmissions, ({ one }) => ({
  mockTest: one(mockTests, { fields: [mockTestSubmissions.mockTestId], references: [mockTests.id] }),
  user: one(users, { fields: [mockTestSubmissions.userId], references: [users.id] })
}));

// Usage Tracking Relations (temporarily commented for compatibility)
/*
export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  user: one(users, { fields: [usageTracking.userId], references: [users.id] })
}));
*/

// Learning Analytics Relations
export const learningAnalyticsRelations = relations(learningAnalytics, ({ one }) => ({
  user: one(users, { fields: [learningAnalytics.userId], references: [users.id] })
}));

export const topicMasteryRelations = relations(topicMastery, ({ one }) => ({
  user: one(users, { fields: [topicMastery.userId], references: [users.id] })
}));

export const studentProfileRelations = relations(studentProfile, ({ one }) => ({
  user: one(users, { fields: [studentProfile.userId], references: [users.id] })
}));

// Schemas for validation

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must be a valid email"),
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  mobile: (schema) => schema.regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number").optional(),
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

// User coins and transactions schemas
export const insertUserCoinsSchema = createInsertSchema(userCoins, {
  coins: (schema) => schema.min(0, "Coins cannot be negative"),
});

export const insertCoinTransactionSchema = createInsertSchema(coinTransactions, {
  amount: (schema) => schema.refine(val => val !== 0, "Transaction amount cannot be zero"),
  type: (schema) => schema.refine(val => ["earn", "spend"].includes(val), "Invalid transaction type"),
});

export const insertMockTestSchema = createInsertSchema(mockTests, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters"),
  duration: (schema) => schema.min(5, "Duration must be at least 5 minutes"),
  totalQuestions: (schema) => schema.min(1, "Must have at least 1 question"),
});

export const insertMockTestSubmissionSchema = createInsertSchema(mockTestSubmissions, {
  score: (schema) => schema.min(0, "Score cannot be negative"),
  timeTaken: (schema) => schema.min(1, "Time taken must be at least 1 minute"),
});

// Learning Analytics Schemas
export const insertLearningAnalyticsSchema = createInsertSchema(learningAnalytics, {
  activityType: (schema) => schema.refine(
    (val) => ["ai_tutor", "mock_test", "study_notes", "answer_checker", "visual_lab", "course_progress"].includes(val),
    "Invalid activity type"
  ),
  subject: (schema) => schema.min(2, "Subject must be at least 2 characters"),
  performance: (schema) => schema.optional().refine(
    (val) => val === undefined || (Number(val) >= 0 && Number(val) <= 100),
    "Performance must be between 0 and 100"
  ),
});

export const insertTopicMasterySchema = createInsertSchema(topicMastery, {
  subject: (schema) => schema.min(2, "Subject must be at least 2 characters"),
  topic: (schema) => schema.min(2, "Topic must be at least 2 characters"),
  examType: (schema) => schema.min(2, "Exam type is required"),
  masteryLevel: (schema) => schema.refine(
    (val) => Number(val) >= 0 && Number(val) <= 100,
    "Mastery level must be between 0 and 100"
  ),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfile, {
  learningStyle: (schema) => schema.optional().refine(
    (val) => val === undefined || ["visual", "auditory", "kinesthetic", "reading"].includes(val),
    "Invalid learning style"
  ),
  preferredDifficulty: (schema) => schema.refine(
    (val) => ["easy", "medium", "hard"].includes(val),
    "Invalid difficulty preference"
  ),
});

// Type exports for the new analytics tables
export type LearningAnalytics = typeof learningAnalytics.$inferSelect;
export type InsertLearningAnalytics = typeof learningAnalytics.$inferInsert;
export type TopicMastery = typeof topicMastery.$inferSelect;
export type InsertTopicMastery = typeof topicMastery.$inferInsert;
export type StudentProfile = typeof studentProfile.$inferSelect;
export type InsertStudentProfile = typeof studentProfile.$inferInsert;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertFeedbackCategory = z.infer<typeof insertFeedbackCategorySchema>;
export type InsertCustomerFeedback = z.infer<typeof insertCustomerFeedbackSchema>;
export type InsertFeedbackVote = z.infer<typeof insertFeedbackVoteSchema>;
export type InsertFeedbackComment = z.infer<typeof insertFeedbackCommentSchema>;
export type InsertMockTest = z.infer<typeof insertMockTestSchema>;
export type InsertMockTestSubmission = z.infer<typeof insertMockTestSubmissionSchema>;
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

// export type UsageTracking = typeof usageTracking.$inferSelect; // Temporarily commented for compatibility
// export type SubscriptionLimits = typeof subscriptionLimits.$inferSelect; // Temporarily commented for compatibility
export type FeedbackCategory = typeof feedbackCategories.$inferSelect;
export type CustomerFeedback = typeof customerFeedback.$inferSelect;
export type FeedbackVote = typeof feedbackVotes.$inferSelect;
export type FeedbackComment = typeof feedbackComments.$inferSelect;
export type MockTest = typeof mockTests.$inferSelect;
export type MockTestSubmission = typeof mockTestSubmissions.$inferSelect;

// Battle Zone 2.0 Types
export type Tournament = typeof tournaments.$inferSelect;
export type BattleQuestion = typeof battleQuestions.$inferSelect;
export type BattleSpectator = typeof battleSpectators.$inferSelect;
export type PowerUp = typeof powerUps.$inferSelect;
export type UserPowerUp = typeof userPowerUps.$inferSelect;
