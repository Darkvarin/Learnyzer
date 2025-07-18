"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardsRelations = exports.battleParticipantsRelations = exports.userPowerUpsRelations = exports.powerUpsRelations = exports.battleSpectatorsRelations = exports.battleQuestionsRelations = exports.tournamentsRelations = exports.battlesRelations = exports.conversationsRelations = exports.aiTutorsRelations = exports.userCoursesRelations = exports.courseCategoriesRelations = exports.coursesRelations = exports.usersRelations = exports.mockTestSubmissions = exports.mockTests = exports.feedbackComments = exports.feedbackVotes = exports.customerFeedback = exports.feedbackCategories = exports.studentProfile = exports.topicMastery = exports.learningAnalytics = exports.usageTrackingRelations = exports.usageTracking = exports.userStreakGoals = exports.wellnessBreaks = exports.wellnessPreferences = exports.streakGoals = exports.referrals = exports.userAchievements = exports.achievements = exports.userRewards = exports.rewards = exports.aiTools = exports.userPowerUps = exports.powerUps = exports.battleSpectators = exports.battleQuestions = exports.battleParticipants = exports.tournaments = exports.battles = exports.conversations = exports.aiTutors = exports.coinTransactions = exports.userCoins = exports.userCourses = exports.courseCategories = exports.courses = exports.users = void 0;
exports.insertStudentProfileSchema = exports.insertTopicMasterySchema = exports.insertLearningAnalyticsSchema = exports.insertMockTestSubmissionSchema = exports.insertMockTestSchema = exports.insertCoinTransactionSchema = exports.insertUserCoinsSchema = exports.insertFeedbackCommentSchema = exports.insertFeedbackVoteSchema = exports.insertCustomerFeedbackSchema = exports.insertFeedbackCategorySchema = exports.insertAchievementSchema = exports.insertRewardSchema = exports.insertBattleSchema = exports.insertCourseSchema = exports.registerSchema = exports.insertUserSchema = exports.studentProfileRelations = exports.topicMasteryRelations = exports.learningAnalyticsRelations = exports.mockTestSubmissionsRelations = exports.mockTestsRelations = exports.feedbackCommentsRelations = exports.feedbackVotesRelations = exports.customerFeedbackRelations = exports.feedbackCategoriesRelations = exports.wellnessBreaksRelations = exports.wellnessPreferencesRelations = exports.userStreakGoalsRelations = exports.streakGoalsRelations = exports.referralsRelations = exports.userAchievementsRelations = exports.achievementsRelations = exports.userRewardsRelations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
// Users Table
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    mobile: (0, pg_core_1.text)("mobile").unique(),
    mobileVerified: (0, pg_core_1.boolean)("mobile_verified").default(false).notNull(),
    profileImage: (0, pg_core_1.text)("profile_image"),
    grade: (0, pg_core_1.text)("grade"), // Student's class/grade (e.g., "5", "11", "undergraduate")
    track: (0, pg_core_1.text)("track"), // Educational track or stream
    selectedExam: (0, pg_core_1.text)("selected_exam"), // Locked entrance exam (jee, neet, upsc, clat, cuet, cse)
    examLocked: (0, pg_core_1.boolean)("exam_locked").default(false).notNull(), // Whether exam selection is locked
    examLockedAt: (0, pg_core_1.timestamp)("exam_locked_at"), // When the exam was locked
    level: (0, pg_core_1.integer)("level").default(1).notNull(),
    currentXp: (0, pg_core_1.integer)("current_xp").default(0).notNull(),
    nextLevelXp: (0, pg_core_1.integer)("next_level_xp").default(1000).notNull(),
    rank: (0, pg_core_1.text)("rank").default("Bronze I").notNull(),
    rankPoints: (0, pg_core_1.integer)("rank_points").default(0).notNull(),
    streakDays: (0, pg_core_1.integer)("streak_days").default(0).notNull(),
    lastStreakDate: (0, pg_core_1.timestamp)("last_streak_date"),
    referralCode: (0, pg_core_1.text)("referral_code").notNull().unique(),
    isAdmin: (0, pg_core_1.boolean)("is_admin").default(false).notNull(), // Admin access control
    // Subscription fields
    subscriptionTier: (0, pg_core_1.text)("subscription_tier").default("free").notNull(), // free, basic, pro, quarterly, half_yearly, yearly
    subscriptionStatus: (0, pg_core_1.text)("subscription_status").default("inactive").notNull(), // inactive, active, expired, cancelled
    subscriptionStartDate: (0, pg_core_1.timestamp)("subscription_start_date"),
    subscriptionEndDate: (0, pg_core_1.timestamp)("subscription_end_date"),
    paymentId: (0, pg_core_1.text)("payment_id"),
    razorpayOrderId: (0, pg_core_1.text)("razorpay_order_id"),
    razorpayPaymentId: (0, pg_core_1.text)("razorpay_payment_id"),
    autoRenewal: (0, pg_core_1.boolean)("auto_renewal").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// Courses Table
exports.courses = (0, pg_core_1.pgTable)("courses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    subject: (0, pg_core_1.text)("subject").notNull(),
    examType: (0, pg_core_1.text)("exam_type").notNull(),
    coverImage: (0, pg_core_1.text)("cover_image").notNull(),
    chapters: (0, pg_core_1.integer)("chapters").notNull(),
    chapterDetails: (0, pg_core_1.jsonb)("chapter_details"), // Array of chapters with titles and descriptions
    targetGrade: (0, pg_core_1.text)("target_grade"), // Target grade/class for this course, e.g., "5", "10", "11-science"
    difficulty: (0, pg_core_1.text)("difficulty").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// Course Categories Table
exports.courseCategories = (0, pg_core_1.pgTable)("course_categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// User Courses Progress Table
exports.userCourses = (0, pg_core_1.pgTable)("user_courses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    courseId: (0, pg_core_1.integer)("course_id").references(() => exports.courses.id).notNull(),
    currentChapter: (0, pg_core_1.text)("current_chapter"),
    progress: (0, pg_core_1.integer)("progress").default(0).notNull(),
    completed: (0, pg_core_1.boolean)("completed").default(false).notNull(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    lastActivity: (0, pg_core_1.timestamp)("last_activity").defaultNow().notNull()
});
// User Coins Table
exports.userCoins = (0, pg_core_1.pgTable)("user_coins", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    coins: (0, pg_core_1.integer)("coins").default(0).notNull(),
    totalEarned: (0, pg_core_1.integer)("total_earned").default(0).notNull(),
    totalSpent: (0, pg_core_1.integer)("total_spent").default(0).notNull(),
    lastDailyBonus: (0, pg_core_1.timestamp)("last_daily_bonus"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Coin Transactions Table
exports.coinTransactions = (0, pg_core_1.pgTable)("coin_transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    amount: (0, pg_core_1.integer)("amount").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // 'earn' or 'spend'
    description: (0, pg_core_1.text)("description"),
    referenceId: (0, pg_core_1.integer)("reference_id"),
    referenceType: (0, pg_core_1.text)("reference_type"), // 'battle', 'daily_bonus', 'achievement', etc.
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// AI Tutors Table
exports.aiTutors = (0, pg_core_1.pgTable)("ai_tutors", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    specialty: (0, pg_core_1.text)("specialty").notNull(),
    image: (0, pg_core_1.text)("image").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    personalityTraits: (0, pg_core_1.jsonb)("personality_traits").notNull()
});
// User AI Conversations Table
exports.conversations = (0, pg_core_1.pgTable)("conversations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    aiTutorId: (0, pg_core_1.integer)("ai_tutor_id").references(() => exports.aiTutors.id).notNull(),
    messages: (0, pg_core_1.jsonb)("messages").notNull(),
    title: (0, pg_core_1.text)("title"), // Added for better conversation identification
    subject: (0, pg_core_1.text)("subject").default("General"), // Added subject field
    isActive: (0, pg_core_1.boolean)("is_active").default(true), // To track active vs archived conversations
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Battles Table - Enhanced for Battle Zone 2.0
exports.battles = (0, pg_core_1.pgTable)("battles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // 1v1, 2v2, 3v3, 4v4, tournament, blitz
    format: (0, pg_core_1.text)("format").default("standard").notNull(), // standard, blitz, endurance, exam_simulation
    difficulty: (0, pg_core_1.text)("difficulty").default("intermediate").notNull(), // beginner, intermediate, advanced, expert
    examType: (0, pg_core_1.text)("exam_type"), // JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE
    subject: (0, pg_core_1.text)("subject"), // Physics, Chemistry, Math, etc.
    duration: (0, pg_core_1.integer)("duration").notNull(),
    topics: (0, pg_core_1.jsonb)("topics").notNull(),
    rewardPoints: (0, pg_core_1.integer)("reward_points").notNull(),
    entryFee: (0, pg_core_1.integer)("entry_fee").default(0).notNull(), // XP cost to join
    prizePool: (0, pg_core_1.integer)("prize_pool").default(0).notNull(), // Total XP prize pool
    penaltyFee: (0, pg_core_1.integer)("penalty_fee").default(10).notNull(), // Coins deducted for leaving mid-battle
    maxParticipants: (0, pg_core_1.integer)("max_participants").default(8).notNull(),
    status: (0, pg_core_1.text)("status").default("waiting").notNull(), // waiting, in_progress, completed, cancelled
    battleMode: (0, pg_core_1.text)("battle_mode").default("public").notNull(), // public, private, tournament
    spectatorMode: (0, pg_core_1.boolean)("spectator_mode").default(true).notNull(),
    autoStart: (0, pg_core_1.boolean)("auto_start").default(false).notNull(),
    questionsCount: (0, pg_core_1.integer)("questions_count").default(1).notNull(),
    passingScore: (0, pg_core_1.integer)("passing_score").default(60).notNull(),
    timePerQuestion: (0, pg_core_1.integer)("time_per_question").default(300).notNull(), // seconds
    startTime: (0, pg_core_1.timestamp)("start_time"),
    endTime: (0, pg_core_1.timestamp)("end_time"),
    scheduledFor: (0, pg_core_1.timestamp)("scheduled_for"),
    winnerId: (0, pg_core_1.integer)("winner_id").references(() => exports.users.id),
    winnerTeam: (0, pg_core_1.integer)("winner_team"),
    createdBy: (0, pg_core_1.integer)("created_by").references(() => exports.users.id).notNull(),
    tournamentId: (0, pg_core_1.integer)("tournament_id").references(() => exports.tournaments.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Tournaments Table - New for Battle Zone 2.0
exports.tournaments = (0, pg_core_1.pgTable)("tournaments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    tournamentType: (0, pg_core_1.text)("tournament_type").default("single_elimination").notNull(), // single_elimination, double_elimination, round_robin
    examType: (0, pg_core_1.text)("exam_type"), // JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE
    subject: (0, pg_core_1.text)("subject"),
    maxParticipants: (0, pg_core_1.integer)("max_participants").default(32).notNull(),
    entryFee: (0, pg_core_1.integer)("entry_fee").default(0).notNull(),
    prizePool: (0, pg_core_1.integer)("prize_pool").default(0).notNull(),
    firstPrize: (0, pg_core_1.integer)("first_prize").default(0).notNull(),
    secondPrize: (0, pg_core_1.integer)("second_prize").default(0).notNull(),
    thirdPrize: (0, pg_core_1.integer)("third_prize").default(0).notNull(),
    status: (0, pg_core_1.text)("status").default("registration").notNull(), // registration, in_progress, completed, cancelled
    startTime: (0, pg_core_1.timestamp)("start_time"),
    endTime: (0, pg_core_1.timestamp)("end_time"),
    registrationDeadline: (0, pg_core_1.timestamp)("registration_deadline"),
    winnerId: (0, pg_core_1.integer)("winner_id").references(() => exports.users.id),
    createdBy: (0, pg_core_1.integer)("created_by").references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Battle Participants Table - Enhanced for Battle Zone 2.0
exports.battleParticipants = (0, pg_core_1.pgTable)("battle_participants", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    battleId: (0, pg_core_1.integer)("battle_id").references(() => exports.battles.id).notNull(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    team: (0, pg_core_1.integer)("team").default(0).notNull(),
    score: (0, pg_core_1.integer)("score"),
    feedback: (0, pg_core_1.text)("feedback"),
    submission: (0, pg_core_1.text)("submission"),
    accuracy: (0, pg_core_1.decimal)("accuracy", { precision: 5, scale: 2 }).default("0.00").notNull(),
    timeSpent: (0, pg_core_1.integer)("time_spent").default(0).notNull(), // seconds
    submittedAt: (0, pg_core_1.timestamp)("submitted_at"),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow().notNull(),
    leftAt: (0, pg_core_1.timestamp)("left_at"),
    rank: (0, pg_core_1.integer)("rank"),
    isSpectator: (0, pg_core_1.boolean)("is_spectator").default(false).notNull(),
    powerUpsUsed: (0, pg_core_1.jsonb)("power_ups_used").default("[]").notNull(),
    streakBonus: (0, pg_core_1.integer)("streak_bonus").default(0).notNull(),
    difficultyBonus: (0, pg_core_1.integer)("difficulty_bonus").default(0).notNull(),
    currentQuestionNumber: (0, pg_core_1.integer)("current_question_number").default(1).notNull(), // Track which question student is currently on
    questionsCompleted: (0, pg_core_1.integer)("questions_completed").default(0).notNull(), // Track total questions completed by participant
    questionStartTime: (0, pg_core_1.timestamp)("question_start_time"), // When current question was started
    questionAnswers: (0, pg_core_1.jsonb)("question_answers").default("[]").notNull(), // Store answers for each question
    hasAbandoned: (0, pg_core_1.boolean)("has_abandoned").default(false).notNull(), // Track if participant abandoned mid-battle
    penaltyApplied: (0, pg_core_1.boolean)("penalty_applied").default(false).notNull() // Track if penalty was already applied
});
// Battle Questions Table - New for Battle Zone 2.0
exports.battleQuestions = (0, pg_core_1.pgTable)("battle_questions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    battleId: (0, pg_core_1.integer)("battle_id").references(() => exports.battles.id).notNull(),
    questionNumber: (0, pg_core_1.integer)("question_number").notNull(),
    question: (0, pg_core_1.text)("question").notNull(),
    options: (0, pg_core_1.jsonb)("options"), // For MCQ questions
    correctAnswer: (0, pg_core_1.text)("correct_answer").notNull(),
    explanation: (0, pg_core_1.text)("explanation"),
    difficulty: (0, pg_core_1.text)("difficulty").default("intermediate").notNull(),
    subject: (0, pg_core_1.text)("subject"),
    topic: (0, pg_core_1.text)("topic"),
    marks: (0, pg_core_1.integer)("marks").default(1).notNull(),
    timeLimit: (0, pg_core_1.integer)("time_limit").default(300).notNull(), // seconds
    questionType: (0, pg_core_1.text)("question_type").default("descriptive").notNull(), // mcq, descriptive, numerical
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// Battle Spectators Table - New for Battle Zone 2.0
exports.battleSpectators = (0, pg_core_1.pgTable)("battle_spectators", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    battleId: (0, pg_core_1.integer)("battle_id").references(() => exports.battles.id).notNull(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow().notNull(),
    leftAt: (0, pg_core_1.timestamp)("left_at")
});
// Power-ups Table - New for Battle Zone 2.0
exports.powerUps = (0, pg_core_1.pgTable)("power_ups", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    effect: (0, pg_core_1.text)("effect").notNull(), // extra_time, hint, eliminate_option, double_points, shield
    cost: (0, pg_core_1.integer)("cost").default(50).notNull(), // XP cost
    duration: (0, pg_core_1.integer)("duration").default(0).notNull(), // seconds, 0 for instant
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    examTypes: (0, pg_core_1.jsonb)("exam_types").default('["all"]').notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// User Power-ups Inventory Table - New for Battle Zone 2.0
exports.userPowerUps = (0, pg_core_1.pgTable)("user_power_ups", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    powerUpId: (0, pg_core_1.integer)("power_up_id").references(() => exports.powerUps.id).notNull(),
    quantity: (0, pg_core_1.integer)("quantity").default(1).notNull(),
    purchasedAt: (0, pg_core_1.timestamp)("purchased_at").defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at")
});
// AI Tools Table
exports.aiTools = (0, pg_core_1.pgTable)("ai_tools", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    color: (0, pg_core_1.text)("color").default("primary").notNull(),
    features: (0, pg_core_1.jsonb)("features"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// Rewards Table
exports.rewards = (0, pg_core_1.pgTable)("rewards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    type: (0, pg_core_1.text)("type").notNull(),
    image: (0, pg_core_1.text)("image").notNull(),
    cost: (0, pg_core_1.integer)("cost").notNull(),
    featured: (0, pg_core_1.boolean)("featured").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// User Rewards Table
exports.userRewards = (0, pg_core_1.pgTable)("user_rewards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    rewardId: (0, pg_core_1.integer)("reward_id").references(() => exports.rewards.id).notNull(),
    claimedAt: (0, pg_core_1.timestamp)("claimed_at").defaultNow().notNull(),
    active: (0, pg_core_1.boolean)("active").default(false)
});
// Achievements Table
exports.achievements = (0, pg_core_1.pgTable)("achievements", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    category: (0, pg_core_1.text)("category").notNull(),
    icon: (0, pg_core_1.text)("icon").notNull(),
    target: (0, pg_core_1.integer)("target").notNull(),
    xpReward: (0, pg_core_1.integer)("xp_reward").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// User Achievements Table
exports.userAchievements = (0, pg_core_1.pgTable)("user_achievements", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    achievementId: (0, pg_core_1.integer)("achievement_id").references(() => exports.achievements.id).notNull(),
    progress: (0, pg_core_1.integer)("progress").default(0).notNull(),
    completed: (0, pg_core_1.boolean)("completed").default(false).notNull(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Referrals Table
exports.referrals = (0, pg_core_1.pgTable)("referrals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    referrerId: (0, pg_core_1.integer)("referrer_id").references(() => exports.users.id).notNull(),
    referredId: (0, pg_core_1.integer)("referred_id").references(() => exports.users.id).notNull(),
    xpEarned: (0, pg_core_1.integer)("xp_earned").default(500).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// Daily Streak Goals Table
exports.streakGoals = (0, pg_core_1.pgTable)("streak_goals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    description: (0, pg_core_1.text)("description").notNull(),
    target: (0, pg_core_1.integer)("target").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// Wellness Preferences Table
exports.wellnessPreferences = (0, pg_core_1.pgTable)("wellness_preferences", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    eyeStrain: (0, pg_core_1.boolean)("eye_strain").default(true).notNull(),
    posture: (0, pg_core_1.boolean)("posture").default(true).notNull(),
    hydration: (0, pg_core_1.boolean)("hydration").default(true).notNull(),
    movement: (0, pg_core_1.boolean)("movement").default(true).notNull(),
    breathing: (0, pg_core_1.boolean)("breathing").default(true).notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Wellness Breaks Table
exports.wellnessBreaks = (0, pg_core_1.pgTable)("wellness_breaks", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    breakId: (0, pg_core_1.text)("break_id").notNull(),
    breakType: (0, pg_core_1.text)("break_type").notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull(),
    completedAt: (0, pg_core_1.timestamp)("completed_at").defaultNow().notNull(),
});
// User Daily Streak Goals Table
exports.userStreakGoals = (0, pg_core_1.pgTable)("user_streak_goals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    streakGoalId: (0, pg_core_1.integer)("streak_goal_id").references(() => exports.streakGoals.id).notNull(),
    progress: (0, pg_core_1.integer)("progress").default(0).notNull(),
    completed: (0, pg_core_1.boolean)("completed").default(false).notNull(),
    date: (0, pg_core_1.timestamp)("date").defaultNow().notNull()
});
// Usage Tracking Table - Now active for real usage monitoring
exports.usageTracking = (0, pg_core_1.pgTable)("usage_tracking", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    featureType: (0, pg_core_1.text)("feature_type").notNull(), // ai_chat, ai_visual_lab, visual_package_generation, mock_test_generation
    usageDate: (0, pg_core_1.timestamp)("usage_date").defaultNow().notNull(),
    resetDate: (0, pg_core_1.timestamp)("reset_date").notNull(), // When the usage count resets (daily/monthly)
    usageCount: (0, pg_core_1.integer)("usage_count").default(1).notNull(),
    metadata: (0, pg_core_1.jsonb)("metadata") // Additional data like tokens used, session duration, etc.
});
exports.usageTrackingRelations = (0, drizzle_orm_1.relations)(exports.usageTracking, ({ one }) => ({
    user: one(exports.users, { fields: [exports.usageTracking.userId], references: [exports.users.id] })
}));
// Student Learning Analytics Tables
exports.learningAnalytics = (0, pg_core_1.pgTable)("learning_analytics", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    activityType: (0, pg_core_1.text)("activity_type").notNull(), // ai_tutor, mock_test, study_notes, answer_checker, visual_lab, course_progress
    subject: (0, pg_core_1.text)("subject").notNull(),
    topic: (0, pg_core_1.text)("topic"),
    difficulty: (0, pg_core_1.text)("difficulty"), // easy, medium, hard
    examType: (0, pg_core_1.text)("exam_type"), // jee, neet, upsc, etc.
    performance: (0, pg_core_1.decimal)("performance", { precision: 5, scale: 2 }), // 0-100 percentage
    timeSpent: (0, pg_core_1.integer)("time_spent"), // seconds
    questionsTotal: (0, pg_core_1.integer)("questions_total").default(0),
    questionsCorrect: (0, pg_core_1.integer)("questions_correct").default(0),
    questionsIncorrect: (0, pg_core_1.integer)("questions_incorrect").default(0),
    conceptsLearned: (0, pg_core_1.jsonb)("concepts_learned"), // Array of concepts covered
    mistakesMade: (0, pg_core_1.jsonb)("mistakes_made"), // Array of common mistakes
    strengthsShown: (0, pg_core_1.jsonb)("strengths_shown"), // Array of demonstrated strengths
    weaknessesIdentified: (0, pg_core_1.jsonb)("weaknesses_identified"), // Array of identified weaknesses
    improvementSuggestions: (0, pg_core_1.jsonb)("improvement_suggestions"), // AI-generated suggestions
    sessionMetadata: (0, pg_core_1.jsonb)("session_metadata"), // Additional session data
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
exports.topicMastery = (0, pg_core_1.pgTable)("topic_mastery", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    subject: (0, pg_core_1.text)("subject").notNull(),
    topic: (0, pg_core_1.text)("topic").notNull(),
    examType: (0, pg_core_1.text)("exam_type").notNull(),
    masteryLevel: (0, pg_core_1.decimal)("mastery_level", { precision: 5, scale: 2 }).default("0").notNull(), // 0-100
    totalAttempts: (0, pg_core_1.integer)("total_attempts").default(0).notNull(),
    correctAttempts: (0, pg_core_1.integer)("correct_attempts").default(0).notNull(),
    averageTimeSpent: (0, pg_core_1.integer)("average_time_spent").default(0), // seconds
    lastPracticed: (0, pg_core_1.timestamp)("last_practiced"),
    consistencyScore: (0, pg_core_1.decimal)("consistency_score", { precision: 5, scale: 2 }).default("0"), // How consistently correct
    difficultyHandled: (0, pg_core_1.text)("difficulty_handled").default("easy"), // Highest difficulty mastered
    conceptualGaps: (0, pg_core_1.jsonb)("conceptual_gaps"), // Identified knowledge gaps
    learningPath: (0, pg_core_1.jsonb)("learning_path"), // Suggested learning sequence
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
exports.studentProfile = (0, pg_core_1.pgTable)("student_profile", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull().unique(),
    learningStyle: (0, pg_core_1.text)("learning_style"), // visual, auditory, kinesthetic, reading
    strongSubjects: (0, pg_core_1.jsonb)("strong_subjects"), // Array of subjects with high performance
    weakSubjects: (0, pg_core_1.jsonb)("weak_subjects"), // Array of subjects needing improvement
    preferredDifficulty: (0, pg_core_1.text)("preferred_difficulty").default("medium"),
    studyPatterns: (0, pg_core_1.jsonb)("study_patterns"), // When they study, frequency, etc.
    commonMistakes: (0, pg_core_1.jsonb)("common_mistakes"), // Patterns in mistakes across subjects
    learningGoals: (0, pg_core_1.jsonb)("learning_goals"), // Student's set goals
    personalizedRecommendations: (0, pg_core_1.jsonb)("personalized_recommendations"), // AI recommendations
    overallProgress: (0, pg_core_1.decimal)("overall_progress", { precision: 5, scale: 2 }).default("0"),
    lastAnalysisUpdate: (0, pg_core_1.timestamp)("last_analysis_update").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Customer Feedback System Tables
exports.feedbackCategories = (0, pg_core_1.pgTable)("feedback_categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.text)("icon"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
exports.customerFeedback = (0, pg_core_1.pgTable)("customer_feedback", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id),
    categoryId: (0, pg_core_1.integer)("category_id").references(() => exports.feedbackCategories.id).notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // 'feedback', 'feature_request', 'bug_report', 'suggestion'
    priority: (0, pg_core_1.text)("priority").default("medium").notNull(), // 'low', 'medium', 'high', 'urgent'
    status: (0, pg_core_1.text)("status").default("open").notNull(), // 'open', 'under_review', 'in_progress', 'resolved', 'closed'
    rating: (0, pg_core_1.integer)("rating"), // 1-5 star rating (optional)
    isAnonymous: (0, pg_core_1.boolean)("is_anonymous").default(false).notNull(),
    userEmail: (0, pg_core_1.text)("user_email"), // For anonymous feedback
    userName: (0, pg_core_1.text)("user_name"), // For anonymous feedback
    tags: (0, pg_core_1.text)("tags"), // JSON array of tags
    attachments: (0, pg_core_1.text)("attachments"), // JSON array of attachment URLs
    adminResponse: (0, pg_core_1.text)("admin_response"),
    adminResponseAt: (0, pg_core_1.timestamp)("admin_response_at"),
    respondedBy: (0, pg_core_1.integer)("responded_by").references(() => exports.users.id),
    upvotes: (0, pg_core_1.integer)("upvotes").default(0).notNull(),
    downvotes: (0, pg_core_1.integer)("downvotes").default(0).notNull(),
    isPublic: (0, pg_core_1.boolean)("is_public").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
exports.feedbackVotes = (0, pg_core_1.pgTable)("feedback_votes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    feedbackId: (0, pg_core_1.integer)("feedback_id").references(() => exports.customerFeedback.id).notNull(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    voteType: (0, pg_core_1.text)("vote_type").notNull(), // 'up' or 'down'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
exports.feedbackComments = (0, pg_core_1.pgTable)("feedback_comments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    feedbackId: (0, pg_core_1.integer)("feedback_id").references(() => exports.customerFeedback.id).notNull(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    comment: (0, pg_core_1.text)("comment").notNull(),
    isAdminComment: (0, pg_core_1.boolean)("is_admin_comment").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// Mock Tests Table
exports.mockTests = (0, pg_core_1.pgTable)("mock_tests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    examType: (0, pg_core_1.text)("exam_type").notNull(), // JEE, NEET, UPSC, etc.
    subject: (0, pg_core_1.text)("subject").notNull(),
    difficulty: (0, pg_core_1.text)("difficulty").notNull(), // Easy, Medium, Hard
    duration: (0, pg_core_1.integer)("duration").notNull(), // in minutes
    totalQuestions: (0, pg_core_1.integer)("total_questions").notNull(),
    questions: (0, pg_core_1.jsonb)("questions").notNull(), // Array of question objects
    answerKey: (0, pg_core_1.jsonb)("answer_key").notNull(), // Array of correct answers
    isCompleted: (0, pg_core_1.boolean)("is_completed").default(false).notNull(),
    startedAt: (0, pg_core_1.timestamp)("started_at"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    score: (0, pg_core_1.integer)("score"),
    totalMarks: (0, pg_core_1.integer)("total_marks").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Mock Test Submissions Table
exports.mockTestSubmissions = (0, pg_core_1.pgTable)("mock_test_submissions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    mockTestId: (0, pg_core_1.integer)("mock_test_id").references(() => exports.mockTests.id).notNull(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    answers: (0, pg_core_1.jsonb)("answers").notNull(), // User's submitted answers
    score: (0, pg_core_1.integer)("score").notNull(),
    percentage: (0, pg_core_1.decimal)("percentage", { precision: 5, scale: 2 }).notNull(),
    timeTaken: (0, pg_core_1.integer)("time_taken").notNull(), // in minutes
    submittedAt: (0, pg_core_1.timestamp)("submitted_at").defaultNow().notNull(),
});
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    userCourses: many(exports.userCourses),
    conversations: many(exports.conversations),
    battleParticipations: many(exports.battleParticipants),
    createdBattles: many(exports.battles, { relationName: "createdBattles" }),
    wonBattles: many(exports.battles, { relationName: "wonBattles" }),
    userRewards: many(exports.userRewards),
    userAchievements: many(exports.userAchievements),
    referralsGiven: many(exports.referrals, { relationName: "referralsGiven" }),
    referralsReceived: many(exports.referrals, { relationName: "referralsReceived" }),
    userStreakGoals: many(exports.userStreakGoals),
    // usageTracking: many(usageTracking), // Temporarily commented for compatibility
    wellnessPreferences: many(exports.wellnessPreferences),
    wellnessBreaks: many(exports.wellnessBreaks),
    feedback: many(exports.customerFeedback),
    feedbackVotes: many(exports.feedbackVotes),
    feedbackComments: many(exports.feedbackComments),
    mockTests: many(exports.mockTests),
    mockTestSubmissions: many(exports.mockTestSubmissions),
    learningAnalytics: many(exports.learningAnalytics),
    topicMastery: many(exports.topicMastery),
    studentProfile: many(exports.studentProfile)
}));
exports.coursesRelations = (0, drizzle_orm_1.relations)(exports.courses, ({ many }) => ({
    userCourses: many(exports.userCourses)
}));
exports.courseCategoriesRelations = (0, drizzle_orm_1.relations)(exports.courseCategories, ({ many }) => ({
    courses: many(exports.courses)
}));
exports.userCoursesRelations = (0, drizzle_orm_1.relations)(exports.userCourses, ({ one }) => ({
    user: one(exports.users, { fields: [exports.userCourses.userId], references: [exports.users.id] }),
    course: one(exports.courses, { fields: [exports.userCourses.courseId], references: [exports.courses.id] })
}));
exports.aiTutorsRelations = (0, drizzle_orm_1.relations)(exports.aiTutors, ({ many }) => ({
    conversations: many(exports.conversations)
}));
exports.conversationsRelations = (0, drizzle_orm_1.relations)(exports.conversations, ({ one }) => ({
    user: one(exports.users, { fields: [exports.conversations.userId], references: [exports.users.id] }),
    aiTutor: one(exports.aiTutors, { fields: [exports.conversations.aiTutorId], references: [exports.aiTutors.id] })
}));
exports.battlesRelations = (0, drizzle_orm_1.relations)(exports.battles, ({ one, many }) => ({
    creator: one(exports.users, { fields: [exports.battles.createdBy], references: [exports.users.id] }),
    winner: one(exports.users, { fields: [exports.battles.winnerId], references: [exports.users.id] }),
    tournament: one(exports.tournaments, { fields: [exports.battles.tournamentId], references: [exports.tournaments.id] }),
    participants: many(exports.battleParticipants),
    questions: many(exports.battleQuestions),
    spectators: many(exports.battleSpectators)
}));
exports.tournamentsRelations = (0, drizzle_orm_1.relations)(exports.tournaments, ({ one, many }) => ({
    creator: one(exports.users, { fields: [exports.tournaments.createdBy], references: [exports.users.id] }),
    winner: one(exports.users, { fields: [exports.tournaments.winnerId], references: [exports.users.id] }),
    battles: many(exports.battles)
}));
exports.battleQuestionsRelations = (0, drizzle_orm_1.relations)(exports.battleQuestions, ({ one }) => ({
    battle: one(exports.battles, { fields: [exports.battleQuestions.battleId], references: [exports.battles.id] })
}));
exports.battleSpectatorsRelations = (0, drizzle_orm_1.relations)(exports.battleSpectators, ({ one }) => ({
    battle: one(exports.battles, { fields: [exports.battleSpectators.battleId], references: [exports.battles.id] }),
    user: one(exports.users, { fields: [exports.battleSpectators.userId], references: [exports.users.id] })
}));
exports.powerUpsRelations = (0, drizzle_orm_1.relations)(exports.powerUps, ({ many }) => ({
    userPowerUps: many(exports.userPowerUps)
}));
exports.userPowerUpsRelations = (0, drizzle_orm_1.relations)(exports.userPowerUps, ({ one }) => ({
    user: one(exports.users, { fields: [exports.userPowerUps.userId], references: [exports.users.id] }),
    powerUp: one(exports.powerUps, { fields: [exports.userPowerUps.powerUpId], references: [exports.powerUps.id] })
}));
exports.battleParticipantsRelations = (0, drizzle_orm_1.relations)(exports.battleParticipants, ({ one }) => ({
    battle: one(exports.battles, { fields: [exports.battleParticipants.battleId], references: [exports.battles.id] }),
    user: one(exports.users, { fields: [exports.battleParticipants.userId], references: [exports.users.id] })
}));
exports.rewardsRelations = (0, drizzle_orm_1.relations)(exports.rewards, ({ many }) => ({
    userRewards: many(exports.userRewards)
}));
exports.userRewardsRelations = (0, drizzle_orm_1.relations)(exports.userRewards, ({ one }) => ({
    user: one(exports.users, { fields: [exports.userRewards.userId], references: [exports.users.id] }),
    reward: one(exports.rewards, { fields: [exports.userRewards.rewardId], references: [exports.rewards.id] })
}));
exports.achievementsRelations = (0, drizzle_orm_1.relations)(exports.achievements, ({ many }) => ({
    userAchievements: many(exports.userAchievements)
}));
exports.userAchievementsRelations = (0, drizzle_orm_1.relations)(exports.userAchievements, ({ one }) => ({
    user: one(exports.users, { fields: [exports.userAchievements.userId], references: [exports.users.id] }),
    achievement: one(exports.achievements, { fields: [exports.userAchievements.achievementId], references: [exports.achievements.id] })
}));
exports.referralsRelations = (0, drizzle_orm_1.relations)(exports.referrals, ({ one }) => ({
    referrer: one(exports.users, { fields: [exports.referrals.referrerId], references: [exports.users.id] }),
    referred: one(exports.users, { fields: [exports.referrals.referredId], references: [exports.users.id] })
}));
exports.streakGoalsRelations = (0, drizzle_orm_1.relations)(exports.streakGoals, ({ many }) => ({
    userStreakGoals: many(exports.userStreakGoals)
}));
exports.userStreakGoalsRelations = (0, drizzle_orm_1.relations)(exports.userStreakGoals, ({ one }) => ({
    user: one(exports.users, { fields: [exports.userStreakGoals.userId], references: [exports.users.id] }),
    streakGoal: one(exports.streakGoals, { fields: [exports.userStreakGoals.streakGoalId], references: [exports.streakGoals.id] })
}));
exports.wellnessPreferencesRelations = (0, drizzle_orm_1.relations)(exports.wellnessPreferences, ({ one }) => ({
    user: one(exports.users, { fields: [exports.wellnessPreferences.userId], references: [exports.users.id] })
}));
exports.wellnessBreaksRelations = (0, drizzle_orm_1.relations)(exports.wellnessBreaks, ({ one }) => ({
    user: one(exports.users, { fields: [exports.wellnessBreaks.userId], references: [exports.users.id] })
}));
exports.feedbackCategoriesRelations = (0, drizzle_orm_1.relations)(exports.feedbackCategories, ({ many }) => ({
    feedback: many(exports.customerFeedback)
}));
exports.customerFeedbackRelations = (0, drizzle_orm_1.relations)(exports.customerFeedback, ({ one, many }) => ({
    user: one(exports.users, { fields: [exports.customerFeedback.userId], references: [exports.users.id] }),
    category: one(exports.feedbackCategories, { fields: [exports.customerFeedback.categoryId], references: [exports.feedbackCategories.id] }),
    respondent: one(exports.users, { fields: [exports.customerFeedback.respondedBy], references: [exports.users.id] }),
    votes: many(exports.feedbackVotes),
    comments: many(exports.feedbackComments)
}));
exports.feedbackVotesRelations = (0, drizzle_orm_1.relations)(exports.feedbackVotes, ({ one }) => ({
    feedback: one(exports.customerFeedback, { fields: [exports.feedbackVotes.feedbackId], references: [exports.customerFeedback.id] }),
    user: one(exports.users, { fields: [exports.feedbackVotes.userId], references: [exports.users.id] })
}));
exports.feedbackCommentsRelations = (0, drizzle_orm_1.relations)(exports.feedbackComments, ({ one }) => ({
    feedback: one(exports.customerFeedback, { fields: [exports.feedbackComments.feedbackId], references: [exports.customerFeedback.id] }),
    user: one(exports.users, { fields: [exports.feedbackComments.userId], references: [exports.users.id] })
}));
exports.mockTestsRelations = (0, drizzle_orm_1.relations)(exports.mockTests, ({ one, many }) => ({
    user: one(exports.users, { fields: [exports.mockTests.userId], references: [exports.users.id] }),
    submissions: many(exports.mockTestSubmissions)
}));
exports.mockTestSubmissionsRelations = (0, drizzle_orm_1.relations)(exports.mockTestSubmissions, ({ one }) => ({
    mockTest: one(exports.mockTests, { fields: [exports.mockTestSubmissions.mockTestId], references: [exports.mockTests.id] }),
    user: one(exports.users, { fields: [exports.mockTestSubmissions.userId], references: [exports.users.id] })
}));
// Usage Tracking Relations (temporarily commented for compatibility)
/*
export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  user: one(users, { fields: [usageTracking.userId], references: [users.id] })
}));
*/
// Learning Analytics Relations
exports.learningAnalyticsRelations = (0, drizzle_orm_1.relations)(exports.learningAnalytics, ({ one }) => ({
    user: one(exports.users, { fields: [exports.learningAnalytics.userId], references: [exports.users.id] })
}));
exports.topicMasteryRelations = (0, drizzle_orm_1.relations)(exports.topicMastery, ({ one }) => ({
    user: one(exports.users, { fields: [exports.topicMastery.userId], references: [exports.users.id] })
}));
exports.studentProfileRelations = (0, drizzle_orm_1.relations)(exports.studentProfile, ({ one }) => ({
    user: one(exports.users, { fields: [exports.studentProfile.userId], references: [exports.users.id] })
}));
// Schemas for validation
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users, {
    email: (schema) => schema.email("Must be a valid email"),
    username: (schema) => schema.min(3, "Username must be at least 3 characters"),
    password: (schema) => schema.min(6, "Password must be at least 6 characters"),
    name: (schema) => schema.min(2, "Name must be at least 2 characters"),
    mobile: (schema) => schema.regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number"),
});
// Registration schema for frontend form validation
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
    email: zod_1.z.string().email("Must be a valid email"),
    mobile: zod_1.z.string().regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string(),
    otp: zod_1.z.string().optional(), // Make OTP optional since it's only needed in step 2
    acceptTerms: zod_1.z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
exports.insertCourseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.courses, {
    title: (schema) => schema.min(3, "Title must be at least 3 characters"),
    description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});
exports.insertBattleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.battles, {
    title: (schema) => schema.min(3, "Title must be at least 3 characters"),
    duration: (schema) => schema.min(5, "Duration must be at least 5 minutes"),
});
exports.insertRewardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rewards, {
    name: (schema) => schema.min(3, "Name must be at least 3 characters"),
    description: (schema) => schema.min(10, "Description must be at least 10 characters"),
    cost: (schema) => schema.min(1, "Cost must be at least 1 point"),
});
exports.insertAchievementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.achievements, {
    name: (schema) => schema.min(3, "Name must be at least 3 characters"),
    description: (schema) => schema.min(10, "Description must be at least 10 characters"),
    target: (schema) => schema.min(1, "Target must be at least 1"),
    xpReward: (schema) => schema.min(1, "XP reward must be at least 1"),
});
exports.insertFeedbackCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.feedbackCategories, {
    name: (schema) => schema.min(2, "Category name must be at least 2 characters"),
});
exports.insertCustomerFeedbackSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customerFeedback, {
    title: (schema) => schema.min(5, "Title must be at least 5 characters").max(200, "Title too long"),
    description: (schema) => schema.min(10, "Description must be at least 10 characters"),
    type: (schema) => schema.refine((val) => ["feedback", "feature_request", "bug_report", "suggestion"].includes(val), "Invalid feedback type"),
    priority: (schema) => schema.refine((val) => ["low", "medium", "high", "urgent"].includes(val), "Invalid priority level"),
    rating: (schema) => schema.optional().refine((val) => val === undefined || (val >= 1 && val <= 5), "Rating must be between 1 and 5"),
    userEmail: (schema) => schema.optional().refine((val) => val === undefined || val === null || zod_1.z.string().email().safeParse(val).success, "Invalid email format"),
});
exports.insertFeedbackVoteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.feedbackVotes, {
    voteType: (schema) => schema.refine((val) => ["up", "down"].includes(val), "Vote type must be 'up' or 'down'"),
});
exports.insertFeedbackCommentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.feedbackComments, {
    comment: (schema) => schema.min(3, "Comment must be at least 3 characters"),
});
// User coins and transactions schemas
exports.insertUserCoinsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userCoins, {
    coins: (schema) => schema.min(0, "Coins cannot be negative"),
});
exports.insertCoinTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.coinTransactions, {
    amount: (schema) => schema.refine(val => val !== 0, "Transaction amount cannot be zero"),
    type: (schema) => schema.refine(val => ["earn", "spend"].includes(val), "Invalid transaction type"),
});
exports.insertMockTestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mockTests, {
    title: (schema) => schema.min(5, "Title must be at least 5 characters"),
    duration: (schema) => schema.min(5, "Duration must be at least 5 minutes"),
    totalQuestions: (schema) => schema.min(1, "Must have at least 1 question"),
});
exports.insertMockTestSubmissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mockTestSubmissions, {
    score: (schema) => schema.min(0, "Score cannot be negative"),
    timeTaken: (schema) => schema.min(1, "Time taken must be at least 1 minute"),
});
// Learning Analytics Schemas
exports.insertLearningAnalyticsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.learningAnalytics, {
    activityType: (schema) => schema.refine((val) => ["ai_tutor", "mock_test", "study_notes", "answer_checker", "visual_lab", "course_progress"].includes(val), "Invalid activity type"),
    subject: (schema) => schema.min(2, "Subject must be at least 2 characters"),
    performance: (schema) => schema.optional().refine((val) => val === undefined || (Number(val) >= 0 && Number(val) <= 100), "Performance must be between 0 and 100"),
});
exports.insertTopicMasterySchema = (0, drizzle_zod_1.createInsertSchema)(exports.topicMastery, {
    subject: (schema) => schema.min(2, "Subject must be at least 2 characters"),
    topic: (schema) => schema.min(2, "Topic must be at least 2 characters"),
    examType: (schema) => schema.min(2, "Exam type is required"),
    masteryLevel: (schema) => schema.refine((val) => Number(val) >= 0 && Number(val) <= 100, "Mastery level must be between 0 and 100"),
});
exports.insertStudentProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.studentProfile, {
    learningStyle: (schema) => schema.optional().refine((val) => val === undefined || ["visual", "auditory", "kinesthetic", "reading"].includes(val), "Invalid learning style"),
    preferredDifficulty: (schema) => schema.refine((val) => ["easy", "medium", "hard"].includes(val), "Invalid difficulty preference"),
});
