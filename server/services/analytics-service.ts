import { db } from "@db";
import { 
  learningAnalytics, 
  topicMastery, 
  studentProfile, 
  users,
  mockTestSubmissions,
  conversations,
  userCourses
} from "@shared/schema";
import { eq, and, desc, asc, sql, avg, count, sum } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AnalyticsService {
  /**
   * Track student learning activity across all platform tools
   */
  static async trackLearningActivity(data: {
    userId: number;
    activityType: string;
    subject: string;
    topic?: string;
    difficulty?: string;
    examType?: string;
    performance?: number;
    timeSpent?: number;
    questionsTotal?: number;
    questionsCorrect?: number;
    questionsIncorrect?: number;
    conceptsLearned?: string[];
    mistakesMade?: string[];
    sessionMetadata?: any;
  }) {
    try {
      // Insert learning analytics record
      const [analyticsRecord] = await db.insert(learningAnalytics).values({
        userId: data.userId,
        activityType: data.activityType,
        subject: data.subject,
        topic: data.topic,
        difficulty: data.difficulty,
        examType: data.examType,
        performance: data.performance?.toString(),
        timeSpent: data.timeSpent,
        questionsTotal: data.questionsTotal || 0,
        questionsCorrect: data.questionsCorrect || 0,
        questionsIncorrect: data.questionsIncorrect || 0,
        conceptsLearned: data.conceptsLearned || [],
        mistakesMade: data.mistakesMade || [],
        strengthsShown: [],
        weaknessesIdentified: [],
        improvementSuggestions: [],
        sessionMetadata: data.sessionMetadata || {}
      }).returning();

      // Update topic mastery if topic is provided
      if (data.topic && data.performance !== undefined) {
        await this.updateTopicMastery({
          userId: data.userId,
          subject: data.subject,
          topic: data.topic,
          examType: data.examType || 'general',
          performance: data.performance,
          timeSpent: data.timeSpent || 0,
          isCorrect: data.performance > 60 // Consider 60%+ as mastery indicator
        });
      }

      // Update student profile with new insights
      await this.updateStudentProfile(data.userId);

      return analyticsRecord;
    } catch (error) {
      console.error('Error tracking learning activity:', error);
      throw error;
    }
  }

  /**
   * Update topic mastery levels based on performance
   */
  static async updateTopicMastery(data: {
    userId: number;
    subject: string;
    topic: string;
    examType: string;
    performance: number;
    timeSpent: number;
    isCorrect: boolean;
  }) {
    try {
      // Check if topic mastery record exists
      const [existingMastery] = await db
        .select()
        .from(topicMastery)
        .where(
          and(
            eq(topicMastery.userId, data.userId),
            eq(topicMastery.subject, data.subject),
            eq(topicMastery.topic, data.topic),
            eq(topicMastery.examType, data.examType)
          )
        );

      if (existingMastery) {
        // Update existing mastery record
        const newTotalAttempts = existingMastery.totalAttempts + 1;
        const newCorrectAttempts = existingMastery.correctAttempts + (data.isCorrect ? 1 : 0);
        const newMasteryLevel = (newCorrectAttempts / newTotalAttempts) * 100;
        const newAverageTime = Math.round(
          ((existingMastery.averageTimeSpent * existingMastery.totalAttempts) + data.timeSpent) / newTotalAttempts
        );

        await db
          .update(topicMastery)
          .set({
            totalAttempts: newTotalAttempts,
            correctAttempts: newCorrectAttempts,
            masteryLevel: newMasteryLevel.toString(),
            averageTimeSpent: newAverageTime,
            lastPracticed: new Date(),
            updatedAt: new Date()
          })
          .where(eq(topicMastery.id, existingMastery.id));
      } else {
        // Create new mastery record
        await db.insert(topicMastery).values({
          userId: data.userId,
          subject: data.subject,
          topic: data.topic,
          examType: data.examType,
          masteryLevel: data.performance.toString(),
          totalAttempts: 1,
          correctAttempts: data.isCorrect ? 1 : 0,
          averageTimeSpent: data.timeSpent,
          lastPracticed: new Date(),
          consistencyScore: "0",
          difficultyHandled: "easy",
          conceptualGaps: [],
          learningPath: []
        });
      }
    } catch (error) {
      console.error('Error updating topic mastery:', error);
      throw error;
    }
  }

  /**
   * Update student profile with AI-powered insights
   */
  static async updateStudentProfile(userId: number) {
    try {
      // Get comprehensive learning data
      const learningData = await this.getComprehensiveLearningData(userId);
      
      // Generate AI insights
      const insights = await this.generateAIInsights(learningData);
      
      // Check if student profile exists
      const [existingProfile] = await db
        .select()
        .from(studentProfile)
        .where(eq(studentProfile.userId, userId));

      if (existingProfile) {
        // Update existing profile
        await db
          .update(studentProfile)
          .set({
            strongSubjects: insights.strongSubjects,
            weakSubjects: insights.weakSubjects,
            learningStyle: insights.learningStyle,
            commonMistakes: insights.commonMistakes,
            personalizedRecommendations: insights.recommendations,
            overallProgress: insights.overallProgress.toString(),
            lastAnalysisUpdate: new Date(),
            updatedAt: new Date()
          })
          .where(eq(studentProfile.id, existingProfile.id));
      } else {
        // Create new profile
        await db.insert(studentProfile).values({
          userId,
          learningStyle: insights.learningStyle,
          strongSubjects: insights.strongSubjects,
          weakSubjects: insights.weakSubjects,
          preferredDifficulty: "medium",
          studyPatterns: {},
          commonMistakes: insights.commonMistakes,
          learningGoals: [],
          personalizedRecommendations: insights.recommendations,
          overallProgress: insights.overallProgress.toString(),
          lastAnalysisUpdate: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive learning data for a student
   */
  static async getComprehensiveLearningData(userId: number) {
    try {
      // Get recent learning analytics
      const recentAnalytics = await db
        .select()
        .from(learningAnalytics)
        .where(eq(learningAnalytics.userId, userId))
        .orderBy(desc(learningAnalytics.createdAt))
        .limit(50);

      // Get topic mastery data
      const masteryData = await db
        .select()
        .from(topicMastery)
        .where(eq(topicMastery.userId, userId))
        .orderBy(desc(topicMastery.masteryLevel));

      // Get mock test performance
      const mockTestPerformance = await db
        .select()
        .from(mockTestSubmissions)
        .where(eq(mockTestSubmissions.userId, userId))
        .orderBy(desc(mockTestSubmissions.submittedAt))
        .limit(20);

      // Get AI conversation count and subjects
      const aiConversations = await db
        .select({
          subject: conversations.subject,
          count: sql<number>`count(*)`.as('count')
        })
        .from(conversations)
        .where(eq(conversations.userId, userId))
        .groupBy(conversations.subject);

      // Get course progress
      const courseProgress = await db
        .select()
        .from(userCourses)
        .where(eq(userCourses.userId, userId));

      return {
        recentAnalytics,
        masteryData,
        mockTestPerformance,
        aiConversations,
        courseProgress
      };
    } catch (error) {
      console.error('Error getting comprehensive learning data:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered insights about student's learning patterns
   */
  static async generateAIInsights(learningData: any) {
    try {
      const prompt = `Analyze this student's comprehensive learning data and provide insights:

RECENT ACTIVITIES (Last 50 sessions):
${JSON.stringify(learningData.recentAnalytics.slice(0, 10), null, 2)}

TOPIC MASTERY LEVELS:
${JSON.stringify(learningData.masteryData.slice(0, 10), null, 2)}

MOCK TEST PERFORMANCE:
${JSON.stringify(learningData.mockTestPerformance.slice(0, 5), null, 2)}

AI CONVERSATION SUBJECTS:
${JSON.stringify(learningData.aiConversations, null, 2)}

COURSE PROGRESS:
${JSON.stringify(learningData.courseProgress.slice(0, 5), null, 2)}

Analyze patterns and provide insights in this JSON format:
{
  "strongSubjects": ["subject1", "subject2"],
  "weakSubjects": ["subject3", "subject4"], 
  "learningStyle": "visual|auditory|kinesthetic|reading",
  "commonMistakes": ["mistake1", "mistake2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "overallProgress": 75,
  "keyInsights": {
    "studyPatterns": "Description of when/how they study best",
    "strengthAreas": "What they excel at",
    "improvementAreas": "What needs work",
    "nextSteps": "Specific next steps for improvement"
  }
}

Focus on:
1. Subject performance patterns (strong vs weak subjects)
2. Learning style identification based on activity preferences
3. Common mistake patterns across different activities
4. Personalized recommendations for improvement
5. Overall progress percentage based on mastery levels and performance`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const insights = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        strongSubjects: insights.strongSubjects || [],
        weakSubjects: insights.weakSubjects || [],
        learningStyle: insights.learningStyle || "visual",
        commonMistakes: insights.commonMistakes || [],
        recommendations: insights.recommendations || [],
        overallProgress: insights.overallProgress || 50,
        keyInsights: insights.keyInsights || {}
      };
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Return default insights if AI fails
      return {
        strongSubjects: [],
        weakSubjects: [],
        learningStyle: "visual",
        commonMistakes: [],
        recommendations: ["Continue practicing regularly", "Focus on weak areas", "Use visual learning tools"],
        overallProgress: 50,
        keyInsights: {}
      };
    }
  }

  /**
   * Get student's weak points for AI tutor context
   */
  static async getStudentWeakPoints(userId: number) {
    try {
      // Get current student profile
      const [profile] = await db
        .select()
        .from(studentProfile)
        .where(eq(studentProfile.userId, userId));

      // Get low mastery topics
      const weakTopics = await db
        .select()
        .from(topicMastery)
        .where(
          and(
            eq(topicMastery.userId, userId),
            sql`${topicMastery.masteryLevel}::decimal < 60`
          )
        )
        .orderBy(asc(topicMastery.masteryLevel))
        .limit(10);

      // Get recent mistakes from analytics
      const recentMistakes = await db
        .select()
        .from(learningAnalytics)
        .where(
          and(
            eq(learningAnalytics.userId, userId),
            sql`${learningAnalytics.performance}::decimal < 60`
          )
        )
        .orderBy(desc(learningAnalytics.createdAt))
        .limit(10);

      return {
        weakSubjects: profile?.weakSubjects || [],
        weakTopics: weakTopics.map(t => ({
          subject: t.subject,
          topic: t.topic,
          masteryLevel: t.masteryLevel,
          conceptualGaps: t.conceptualGaps
        })),
        commonMistakes: profile?.commonMistakes || [],
        recentMistakes: recentMistakes.map(m => ({
          subject: m.subject,
          topic: m.topic,
          mistakesMade: m.mistakesMade,
          performance: m.performance
        })),
        learningStyle: profile?.learningStyle || "visual",
        recommendations: profile?.personalizedRecommendations || []
      };
    } catch (error) {
      console.error('Error getting student weak points:', error);
      return {
        weakSubjects: [],
        weakTopics: [],
        commonMistakes: [],
        recentMistakes: [],
        learningStyle: "visual",
        recommendations: []
      };
    }
  }

  /**
   * Get AI tutor context with student's complete learning profile
   */
  static async getAITutorContext(userId: number) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      const weakPoints = await this.getStudentWeakPoints(userId);
      const learningData = await this.getComprehensiveLearningData(userId);

      // Calculate performance metrics
      const overallPerformance = learningData.recentAnalytics.length > 0
        ? learningData.recentAnalytics.reduce((acc, curr) => 
            acc + (Number(curr.performance) || 0), 0) / learningData.recentAnalytics.length
        : 50;

      const subjectPerformance = learningData.recentAnalytics.reduce((acc, curr) => {
        if (!acc[curr.subject]) acc[curr.subject] = [];
        acc[curr.subject].push(Number(curr.performance) || 0);
        return acc;
      }, {} as Record<string, number[]>);

      // Calculate average performance per subject
      const avgSubjectPerformance = Object.entries(subjectPerformance).map(([subject, scores]) => ({
        subject,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        attempts: scores.length
      }));

      return {
        studentInfo: {
          name: user?.name || "Student",
          grade: user?.grade,
          selectedExam: user?.selectedExam,
          level: user?.level || 1,
          currentXp: user?.currentXp || 0
        },
        learningProfile: {
          learningStyle: weakPoints.learningStyle,
          overallPerformance: Math.round(overallPerformance),
          strongSubjects: weakPoints.weakSubjects.filter(s => 
            avgSubjectPerformance.find(sp => sp.subject === s && sp.avgScore > 70)
          ),
          weakSubjects: weakPoints.weakSubjects,
          preferredTopics: learningData.masteryData
            .filter(m => Number(m.masteryLevel) > 80)
            .map(m => m.topic)
            .slice(0, 5)
        },
        weaknessAnalysis: {
          weakTopics: weakPoints.weakTopics.slice(0, 5),
          commonMistakes: weakPoints.commonMistakes.slice(0, 5),
          recentMistakes: weakPoints.recentMistakes.slice(0, 3),
          improvementAreas: avgSubjectPerformance
            .filter(sp => sp.avgScore < 60)
            .map(sp => sp.subject)
        },
        recommendations: weakPoints.recommendations.slice(0, 3),
        studyPatterns: {
          mostActiveSubject: avgSubjectPerformance.length > 0 
            ? avgSubjectPerformance.sort((a, b) => b.attempts - a.attempts)[0]?.subject || "General"
            : "General",
          recentActivity: learningData.recentAnalytics.slice(0, 5).map(a => ({
            type: a.activityType,
            subject: a.subject,
            performance: a.performance,
            date: a.createdAt
          })),
          totalSessions: learningData.recentAnalytics.length
        }
      };
    } catch (error) {
      console.error('Error getting AI tutor context:', error);
      return {
        studentInfo: { name: "Student", grade: null, selectedExam: null, level: 1, currentXp: 0 },
        learningProfile: { learningStyle: "visual", overallPerformance: 50, strongSubjects: [], weakSubjects: [], preferredTopics: [] },
        weaknessAnalysis: { weakTopics: [], commonMistakes: [], recentMistakes: [], improvementAreas: [] },
        recommendations: [],
        studyPatterns: { mostActiveSubject: "General", recentActivity: [], totalSessions: 0 }
      };
    }
  }
}