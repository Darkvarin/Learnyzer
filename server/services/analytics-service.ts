import { db } from "../../db";
import { eq, and, gte, lte, sql, desc, asc } from "drizzle-orm";
import { 
  learningAnalytics, 
  topicMastery, 
  studentProfile,
  users,
  conversations,
  userCourses,
  userAchievements,
  wellnessBreaks,
  mockTestSubmissions
} from "../../shared/schema";

interface AnalyticsFilters {
  timeRange?: string;
  subjectFilter?: string;
  analysisType?: string;
}

export class AnalyticsService {
  /**
   * Get comprehensive analytics data for a student
   */
  async getComprehensiveAnalytics(userId: number, filters: AnalyticsFilters = {}) {
    const timeRange = this.getTimeRangeFilter(filters.timeRange || 'week');
    
    const [
      performanceData,
      studyHabits,
      subjectPerformance,
      weaknessAnalysis,
      strengthAnalysis,
      recommendations
    ] = await Promise.all([
      this.getPerformanceMetrics(userId, timeRange),
      this.getStudyHabits(userId, timeRange),
      this.getSubjectPerformance(userId, filters.subjectFilter),
      this.getWeaknessAnalysis(userId),
      this.getStrengthAnalysis(userId),
      this.generateRecommendations(userId)
    ]);

    return {
      overview: {
        totalStudyTime: performanceData.totalStudyTime,
        averageScore: performanceData.averageScore,
        conceptsLearned: performanceData.conceptsLearned,
        activeDays: performanceData.activeDays,
        streak: performanceData.currentStreak,
        improvement: performanceData.improvement
      },
      performance: performanceData.chartData,
      studyHabits,
      subjects: subjectPerformance,
      weaknesses: weaknessAnalysis,
      strengths: strengthAnalysis,
      insights: [
        ...weaknessAnalysis.map(w => ({
          type: 'weakness' as const,
          title: `Improve ${w.subject}`,
          description: `Focus more on ${w.topic} - current score: ${w.score}%`
        })),
        ...strengthAnalysis.map(s => ({
          type: 'strength' as const,
          title: `Strong in ${s.subject}`,
          description: `Excellent performance in ${s.topic} - score: ${s.score}%`
        }))
      ],
      recommendations
    };
  }

  /**
   * Get student learning profile
   */
  async getStudentProfile(userId: number) {
    // Get basic user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get or create student profile
    let profile = await db.query.studentProfile.findFirst({
      where: eq(studentProfile.userId, userId)
    });

    if (!profile) {
      // Create default profile
      const [newProfile] = await db.insert(studentProfile).values({
        userId,
        learningStyle: 'visual',
        preferredPace: 'medium',
        strongSubjects: ['mathematics'],
        weakSubjects: ['physics'],
        goals: ['improve_grades'],
        studyHours: 2,
        preferredTime: 'evening'
      }).returning();
      profile = newProfile;
    }

    // Get analytics data
    const analytics = await db.query.learningAnalytics.findMany({
      where: eq(learningAnalytics.userId, userId),
      orderBy: desc(learningAnalytics.sessionDate),
      limit: 30
    });

    return {
      basic: {
        name: user.name,
        grade: user.grade,
        track: user.track,
        level: user.level,
        xp: user.currentXp,
        rank: user.rank
      },
      learning: {
        style: profile.learningStyle,
        pace: profile.preferredPace,
        strongSubjects: profile.strongSubjects,
        weakSubjects: profile.weakSubjects,
        goals: profile.goals,
        studyHours: profile.studyHours,
        preferredTime: profile.preferredTime
      },
      stats: {
        totalSessions: analytics.length,
        averageScore: analytics.length > 0 ? 
          analytics.reduce((sum, a) => sum + (a.score || 0), 0) / analytics.length : 0,
        totalTime: analytics.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
        conceptsLearned: analytics.reduce((sum, a) => sum + (a.conceptsLearned || 0), 0)
      }
    };
  }

  /**
   * Get topic mastery data
   */
  async getTopicMastery(userId: number, subjectFilter?: string) {
    let masteryQuery = db.query.topicMastery.findMany({
      where: eq(topicMastery.userId, userId),
      orderBy: desc(topicMastery.masteryLevel)
    });

    const masteryData = await masteryQuery;

    // Filter by subject if specified
    const filteredData = subjectFilter ? 
      masteryData.filter(topic => topic.subject === subjectFilter) : 
      masteryData;

    const topics = filteredData.map(topic => ({
      name: topic.topic,
      subject: topic.subject,
      masteryLevel: topic.masteryLevel,
      conceptsLearned: topic.conceptsLearned,
      timeSpent: topic.timeSpent,
      lastPracticed: topic.lastPracticed
    }));

    // Get mastered topics (80% or higher)
    const masteredTopics = filteredData
      .filter(topic => topic.masteryLevel >= 80)
      .map(topic => ({
        name: topic.topic,
        subject: topic.subject,
        score: topic.masteryLevel,
        masteredDate: topic.lastPracticed || new Date()
      }));

    return {
      topics,
      masteredTopics,
      totalTopics: topics.length,
      masteredCount: masteredTopics.length,
      averageMastery: topics.length > 0 ? 
        topics.reduce((sum, t) => sum + t.masteryLevel, 0) / topics.length : 0
    };
  }

  /**
   * Get learning insights and patterns
   */
  async getLearningInsights(userId: number, timeRange: string = 'month') {
    const timeFilter = this.getTimeRangeFilter(timeRange);
    
    // Get learning analytics data
    const analytics = await db.query.learningAnalytics.findMany({
      where: and(
        eq(learningAnalytics.userId, userId),
        gte(learningAnalytics.sessionDate, timeFilter.start),
        lte(learningAnalytics.sessionDate, timeFilter.end)
      ),
      orderBy: desc(learningAnalytics.sessionDate)
    });

    if (analytics.length === 0) {
      return this.getDefaultInsights();
    }

    // Analyze time patterns
    const timeDistribution = this.analyzeTimePatterns(analytics);
    
    // Analyze study patterns
    const studyPatterns = this.analyzeStudyPatterns(analytics);

    // Calculate focus metrics
    const focusDuration = analytics.length > 0 ? 
      Math.round(analytics.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / analytics.length) : 25;

    // Determine preferences
    const preferredDifficulty = this.analyzeDifficultyPreference(analytics);
    const learningSpeed = this.analyzeLearningSpeed(analytics);
    const mostActiveTime = this.getMostActiveTime(timeDistribution);
    const bestSubject = this.getBestSubject(analytics);

    return {
      timeDistribution,
      studyPatterns,
      focusDuration,
      preferredDifficulty,
      learningSpeed,
      mostActiveTime,
      bestSubject,
      preferredContentType: 'visual', // Default
      optimalTime: mostActiveTime
    };
  }

  // Helper methods
  private getTimeRangeFilter(range: string) {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 7);
    }
    
    return { start, end };
  }

  private async getPerformanceMetrics(userId: number, timeRange: { start: Date; end: Date }) {
    // Get recent analytics data
    const analytics = await db.query.learningAnalytics.findMany({
      where: and(
        eq(learningAnalytics.userId, userId),
        gte(learningAnalytics.sessionDate, timeRange.start),
        lte(learningAnalytics.sessionDate, timeRange.end)
      ),
      orderBy: desc(learningAnalytics.sessionDate)
    });

    const totalStudyTime = analytics.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    const averageScore = analytics.length > 0 ? 
      analytics.reduce((sum, a) => sum + (a.score || 0), 0) / analytics.length : 0;
    const conceptsLearned = analytics.reduce((sum, a) => sum + (a.conceptsLearned || 0), 0);
    const activeDays = new Set(analytics.map(a => a.sessionDate.toDateString())).size;

    // Get user's current streak
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    // Create chart data for performance over time
    const chartData = analytics.slice(0, 10).reverse().map(a => ({
      date: a.sessionDate.toLocaleDateString(),
      score: a.score || 0,
      timeSpent: a.timeSpent || 0,
      concepts: a.conceptsLearned || 0
    }));

    return {
      totalStudyTime,
      averageScore: Math.round(averageScore),
      conceptsLearned,
      activeDays,
      currentStreak: user?.streakDays || 0,
      improvement: this.calculateImprovement(analytics),
      chartData
    };
  }

  private async getStudyHabits(userId: number, timeRange: { start: Date; end: Date }) {
    const analytics = await db.query.learningAnalytics.findMany({
      where: and(
        eq(learningAnalytics.userId, userId),
        gte(learningAnalytics.sessionDate, timeRange.start),
        lte(learningAnalytics.sessionDate, timeRange.end)
      )
    });

    const totalSessions = analytics.length;
    const avgSessionTime = totalSessions > 0 ? 
      analytics.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / totalSessions : 0;
    
    const consistencyScore = this.calculateConsistency(analytics);
    const peakPerformanceHour = this.findPeakPerformanceTime(analytics);

    return {
      totalSessions,
      avgSessionTime: Math.round(avgSessionTime),
      consistencyScore,
      peakPerformanceHour,
      preferredSessionLength: avgSessionTime > 45 ? 'long' : avgSessionTime > 25 ? 'medium' : 'short'
    };
  }

  private async getSubjectPerformance(userId: number, subjectFilter?: string) {
    const analytics = await db.query.learningAnalytics.findMany({
      where: eq(learningAnalytics.userId, userId),
      orderBy: desc(learningAnalytics.sessionDate),
      limit: 50
    });

    const subjectStats = analytics.reduce((acc, session) => {
      const subject = session.subject || 'general';
      if (!acc[subject]) {
        acc[subject] = { scores: [], time: 0, sessions: 0 };
      }
      acc[subject].scores.push(session.score || 0);
      acc[subject].time += session.timeSpent || 0;
      acc[subject].sessions += 1;
      return acc;
    }, {} as Record<string, { scores: number[]; time: number; sessions: number }>);

    return Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      averageScore: stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length,
      totalTime: stats.time,
      sessions: stats.sessions,
      improvement: this.calculateSubjectImprovement(stats.scores)
    }));
  }

  private async getWeaknessAnalysis(userId: number) {
    const masteryData = await db.query.topicMastery.findMany({
      where: eq(topicMastery.userId, userId),
      orderBy: asc(topicMastery.masteryLevel)
    });

    return masteryData
      .filter(topic => topic.masteryLevel < 60)
      .slice(0, 5)
      .map(topic => ({
        subject: topic.subject,
        topic: topic.topic,
        score: topic.masteryLevel,
        timeSpent: topic.timeSpent
      }));
  }

  private async getStrengthAnalysis(userId: number) {
    const masteryData = await db.query.topicMastery.findMany({
      where: eq(topicMastery.userId, userId),
      orderBy: desc(topicMastery.masteryLevel)
    });

    return masteryData
      .filter(topic => topic.masteryLevel >= 80)
      .slice(0, 5)
      .map(topic => ({
        subject: topic.subject,
        topic: topic.topic,
        score: topic.masteryLevel,
        timeSpent: topic.timeSpent
      }));
  }

  private async generateRecommendations(userId: number) {
    const weaknesses = await this.getWeaknessAnalysis(userId);
    const analytics = await db.query.learningAnalytics.findMany({
      where: eq(learningAnalytics.userId, userId),
      orderBy: desc(learningAnalytics.sessionDate),
      limit: 10
    });

    const recommendations = [];

    // Weakness-based recommendations
    if (weaknesses.length > 0) {
      recommendations.push({
        title: `Focus on ${weaknesses[0].subject}`,
        description: `Spend extra time on ${weaknesses[0].topic} to improve your understanding`,
        priority: 'high' as const,
        expectedImprovement: 25
      });
    }

    // Study pattern recommendations
    if (analytics.length > 0) {
      const avgScore = analytics.reduce((sum, a) => sum + (a.score || 0), 0) / analytics.length;
      if (avgScore < 70) {
        recommendations.push({
          title: 'Increase practice frequency',
          description: 'Consider shorter, more frequent study sessions to improve retention',
          priority: 'medium' as const,
          expectedImprovement: 15
        });
      }
    }

    // Add motivational recommendations
    recommendations.push({
      title: 'Maintain consistency',
      description: 'Keep up your daily learning streak for better long-term results',
      priority: 'low' as const,
      expectedImprovement: 10
    });

    return recommendations;
  }

  // Utility methods
  private calculateImprovement(analytics: any[]) {
    if (analytics.length < 2) return 0;
    const recent = analytics.slice(0, Math.ceil(analytics.length / 2));
    const older = analytics.slice(Math.ceil(analytics.length / 2));
    
    const recentAvg = recent.reduce((sum, a) => sum + (a.score || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + (a.score || 0), 0) / older.length;
    
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  }

  private calculateConsistency(analytics: any[]) {
    if (analytics.length < 3) return 50;
    
    const dates = analytics.map(a => a.sessionDate).sort();
    const gaps = [];
    for (let i = 1; i < dates.length; i++) {
      const gap = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
      gaps.push(gap);
    }
    
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    return Math.max(0, Math.min(100, 100 - (avgGap - 1) * 10));
  }

  private findPeakPerformanceTime(analytics: any[]) {
    const hourPerformance = analytics.reduce((acc, session) => {
      const hour = session.sessionDate.getHours();
      if (!acc[hour]) acc[hour] = { scores: [], count: 0 };
      acc[hour].scores.push(session.score || 0);
      acc[hour].count++;
      return acc;
    }, {} as Record<number, { scores: number[]; count: number }>);

    let bestHour = 9; // Default to 9 AM
    let bestScore = 0;

    Object.entries(hourPerformance).forEach(([hour, data]) => {
      const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestHour = parseInt(hour);
      }
    });

    return bestHour;
  }

  private calculateSubjectImprovement(scores: number[]) {
    if (scores.length < 2) return 0;
    const recent = scores.slice(0, Math.ceil(scores.length / 2));
    const older = scores.slice(Math.ceil(scores.length / 2));
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
    
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  }

  private analyzeTimePatterns(analytics: any[]) {
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    
    analytics.forEach(session => {
      const hour = session.sessionDate.getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else timeSlots.evening++;
    });

    const total = analytics.length;
    return {
      morning: total > 0 ? Math.round((timeSlots.morning / total) * 100) : 0,
      afternoon: total > 0 ? Math.round((timeSlots.afternoon / total) * 100) : 0,
      evening: total > 0 ? Math.round((timeSlots.evening / total) * 100) : 0
    };
  }

  private analyzeStudyPatterns(analytics: any[]) {
    // Create dummy data for study patterns
    return [
      { name: 'Consistent', value: 70 },
      { name: 'Intensive', value: 20 },
      { name: 'Casual', value: 10 }
    ];
  }

  private analyzeDifficultyPreference(analytics: any[]) {
    // Analyze the difficulty of topics the user engages with most
    return 'Medium';
  }

  private analyzeLearningSpeed(analytics: any[]) {
    const avgConceptsPerSession = analytics.length > 0 ? 
      analytics.reduce((sum, a) => sum + (a.conceptsLearned || 0), 0) / analytics.length : 0;
    
    if (avgConceptsPerSession > 5) return 'Fast';
    if (avgConceptsPerSession > 3) return 'Normal';
    return 'Steady';
  }

  private getMostActiveTime(timeDistribution: any) {
    const { morning, afternoon, evening } = timeDistribution;
    if (morning >= afternoon && morning >= evening) return 'morning';
    if (afternoon >= evening) return 'afternoon';
    return 'evening';
  }

  private getBestSubject(analytics: any[]) {
    const subjectScores = analytics.reduce((acc, session) => {
      const subject = session.subject || 'general';
      if (!acc[subject]) acc[subject] = { scores: [], count: 0 };
      acc[subject].scores.push(session.score || 0);
      acc[subject].count++;
      return acc;
    }, {} as Record<string, { scores: number[]; count: number }>);

    let bestSubject = 'mathematics';
    let bestScore = 0;

    Object.entries(subjectScores).forEach(([subject, data]) => {
      const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestSubject = subject;
      }
    });

    return bestSubject;
  }

  private getDefaultInsights() {
    return {
      timeDistribution: { morning: 40, afternoon: 30, evening: 30 },
      studyPatterns: [
        { name: 'Consistent', value: 60 },
        { name: 'Intensive', value: 25 },
        { name: 'Casual', value: 15 }
      ],
      focusDuration: 25,
      preferredDifficulty: 'Medium',
      learningSpeed: 'Normal',
      mostActiveTime: 'evening',
      bestSubject: 'mathematics',
      preferredContentType: 'visual',
      optimalTime: 'evening'
    };
  }
}