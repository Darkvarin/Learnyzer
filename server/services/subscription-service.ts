import { db } from "@db";
import { users } from "@shared/schema";
// import { usageTracking, subscriptionLimits } from "@shared/schema"; // Temporarily commented for compatibility
import { eq, and, gte, desc } from "drizzle-orm";

export class SubscriptionService {
  // Define subscription tier limits
  private static readonly TIER_LIMITS = {
    free_trial: {
      aiChatLimit: 100,
      aiVisualLabLimit: 20,
      aiTutorSessionLimit: 30,
      visualPackageLimit: 10,
      mockTestGenerationLimit: 5, // 5 mock tests per month
      mockTestMaxQuestions: 20, // Max 20 questions per test
      courseAccessLevel: 'unlimited',
      prioritySupport: false,
      downloadLimit: 50,
      trialDuration: 1 // 1 day
    },
    free: {
      aiChatLimit: 0, // No access after trial expires
      aiVisualLabLimit: 0,
      aiTutorSessionLimit: 0,
      visualPackageLimit: 0,
      mockTestGenerationLimit: 0, // No mock tests
      mockTestMaxQuestions: 0,
      courseAccessLevel: 'locked',
      prioritySupport: false,
      downloadLimit: 0
    },
    basic: {
      aiChatLimit: 50,
      aiVisualLabLimit: 10,
      aiTutorSessionLimit: 15,
      visualPackageLimit: 5,
      mockTestGenerationLimit: 10, // 10 mock tests per month
      mockTestMaxQuestions: 30, // Max 30 questions per test
      courseAccessLevel: 'premium',
      prioritySupport: false,
      downloadLimit: 25
    },
    pro: {
      aiChatLimit: 150,
      aiVisualLabLimit: 30,
      aiTutorSessionLimit: 50,
      visualPackageLimit: 15,
      mockTestGenerationLimit: 25, // 25 mock tests per month
      mockTestMaxQuestions: 50, // Max 50 questions per test
      courseAccessLevel: 'unlimited',
      prioritySupport: true,
      downloadLimit: 100
    },
    quarterly: {
      aiChatLimit: 200,
      aiVisualLabLimit: 40,
      aiTutorSessionLimit: 75,
      visualPackageLimit: 25,
      mockTestGenerationLimit: 40, // 40 mock tests per month  
      mockTestMaxQuestions: 75, // Max 75 questions per test
      courseAccessLevel: 'unlimited',
      prioritySupport: true,
      downloadLimit: 150
    },
    half_yearly: {
      aiChatLimit: 300,
      aiVisualLabLimit: 60,
      aiTutorSessionLimit: 100,
      visualPackageLimit: 40,
      mockTestGenerationLimit: 60, // 60 mock tests per month
      mockTestMaxQuestions: 100, // Max 100 questions per test
      courseAccessLevel: 'unlimited',
      prioritySupport: true,
      downloadLimit: 250
    },
    yearly: {
      aiChatLimit: 500,
      aiVisualLabLimit: 100,
      aiTutorSessionLimit: 200,
      visualPackageLimit: 75,
      mockTestGenerationLimit: 100, // 100 mock tests per month
      mockTestMaxQuestions: 100, // Max 100 questions per test
      courseAccessLevel: 'unlimited',
      prioritySupport: true,
      downloadLimit: 500
    }
  };

  /**
   * Check if user has access to a specific feature
   */
  static async hasFeatureAccess(userId: number, featureType: string): Promise<{
    hasAccess: boolean;
    currentUsage: number;
    limit: number;
    remaining: number;
    subscriptionTier: string;
  }> {
    try {
      // Get user's subscription details - temporary compatibility mode
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          createdAt: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Determine subscription tier based on user account age (trial logic)
      const accountAge = Date.now() - user.createdAt.getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      let tier: string;
      if (accountAge <= oneDayInMs) {
        tier = 'free_trial'; // First day = trial period
      } else {
        tier = 'free'; // After trial expires
      }
      
      const limits = this.TIER_LIMITS[tier as keyof typeof this.TIER_LIMITS];
      
      if (!limits) {
        throw new Error(`Invalid subscription tier: ${tier}`);
      }

      // Check if subscription is active (for paid tiers)
      const isSubscriptionActive = tier === 'free' || (
        user.subscriptionStatus === 'active' && 
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate) > new Date()
      );

      if (!isSubscriptionActive && tier !== 'free') {
        // If subscription expired, treat as free tier
        const freeLimits = this.TIER_LIMITS.free;
        const limit = this.getFeatureLimit(freeLimits, featureType);
        const currentUsage = await this.getCurrentUsage(userId, featureType);
        
        return {
          hasAccess: currentUsage < limit,
          currentUsage,
          limit,
          remaining: Math.max(0, limit - currentUsage),
          subscriptionTier: 'free'
        };
      }

      // Get feature-specific limit
      const limit = this.getFeatureLimit(limits, featureType);
      
      // Get current usage for today
      const currentUsage = await this.getCurrentUsage(userId, featureType);
      
      return {
        hasAccess: currentUsage < limit,
        currentUsage,
        limit,
        remaining: Math.max(0, limit - currentUsage),
        subscriptionTier: tier
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        hasAccess: false,
        currentUsage: 0,
        limit: 0,
        remaining: 0,
        subscriptionTier: 'free'
      };
    }
  }

  /**
   * Track feature usage
   */
  static async trackUsage(userId: number, featureType: string, metadata?: any): Promise<boolean> {
    try {
      // Check if user has access first
      const access = await this.hasFeatureAccess(userId, featureType);
      
      if (!access.hasAccess) {
        return false;
      }

      // Get current date for tracking
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check if usage record exists for today
      const existingUsage = await db.query.usageTracking.findFirst({
        where: and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.featureType, featureType),
          gte(usageTracking.usageDate, today)
        )
      });

      if (existingUsage) {
        // Update existing record
        await db.update(usageTracking)
          .set({ 
            usageCount: existingUsage.usageCount + 1,
            metadata 
          })
          .where(eq(usageTracking.id, existingUsage.id));
      } else {
        // Create new record
        await db.insert(usageTracking).values({
          userId,
          featureType,
          usageDate: new Date(),
          resetDate: tomorrow,
          usageCount: 1,
          metadata
        });
      }

      return true;
    } catch (error) {
      console.error('Error tracking usage:', error);
      return false;
    }
  }

  /**
   * Get current usage for a feature today
   */
  private static async getCurrentUsage(userId: number, featureType: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usage = await db.query.usageTracking.findFirst({
        where: and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.featureType, featureType),
          gte(usageTracking.usageDate, today)
        ),
        columns: {
          usageCount: true
        }
      });

      return usage?.usageCount || 0;
    } catch (error) {
      console.error('Error getting current usage:', error);
      return 0;
    }
  }

  /**
   * Get feature limit from tier configuration
   */
  private static getFeatureLimit(limits: any, featureType: string): number {
    switch (featureType) {
      case 'ai_chat':
        return limits.aiChatLimit;
      case 'ai_visual_lab':
        return limits.aiVisualLabLimit;
      case 'ai_tutor_session':
        return limits.aiTutorSessionLimit;
      case 'visual_package_generation':
        return limits.visualPackageLimit;
      case 'mock_test_generation':
        return limits.mockTestGenerationLimit || 0;
      default:
        return 0;
    }
  }

  /**
   * Get user's usage statistics
   */
  static async getUserUsageStats(userId: number): Promise<{
    tier: string;
    isActive: boolean;
    features: {
      featureType: string;
      currentUsage: number;
      limit: number;
      remaining: number;
      percentage: number;
    }[];
    expiresAt?: Date;
  }> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionEndDate: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const tier = user.subscriptionTier || 'free';
      const isActive = tier === 'free' || (
        user.subscriptionStatus === 'active' && 
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate) > new Date()
      );

      const features = [
        'ai_chat',
        'ai_visual_lab', 
        'ai_tutor_session',
        'visual_package_generation',
        'mock_test_generation'
      ];

      const featureStats = await Promise.all(
        features.map(async (featureType) => {
          const access = await this.hasFeatureAccess(userId, featureType);
          return {
            featureType,
            currentUsage: access.currentUsage,
            limit: access.limit,
            remaining: access.remaining,
            percentage: access.limit > 0 ? Math.round((access.currentUsage / access.limit) * 100) : 0
          };
        })
      );

      return {
        tier,
        isActive,
        features: featureStats,
        expiresAt: user.subscriptionEndDate || undefined
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        tier: 'free',
        isActive: true,
        features: []
      };
    }
  }

  /**
   * Update user subscription
   */
  static async updateSubscription(userId: number, subscriptionData: {
    tier: string;
    status: string;
    startDate?: Date;
    endDate?: Date;
    paymentId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    autoRenewal?: boolean;
  }): Promise<boolean> {
    try {
      await db.update(users)
        .set({
          subscriptionTier: subscriptionData.tier,
          subscriptionStatus: subscriptionData.status,
          subscriptionStartDate: subscriptionData.startDate,
          subscriptionEndDate: subscriptionData.endDate,
          paymentId: subscriptionData.paymentId,
          razorpayOrderId: subscriptionData.razorpayOrderId,
          razorpayPaymentId: subscriptionData.razorpayPaymentId,
          autoRenewal: subscriptionData.autoRenewal || false
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  }

  /**
   * Get subscription pricing
   */
  static getSubscriptionPricing() {
    return {
      basic: {
        monthly: 299,
        currency: 'INR',
        features: ['50 AI chats/day', '10 Visual labs/day', '15 Tutor sessions/day', '10 Mock tests/month (30 questions)', 'Premium courses']
      },
      pro: {
        monthly: 599,
        currency: 'INR', 
        features: ['150 AI chats/day', '30 Visual labs/day', '50 Tutor sessions/day', '25 Mock tests/month (50 questions)', 'All courses', 'Priority support']
      },
      quarterly: {
        total: 1499,
        monthly: 500,
        currency: 'INR',
        features: ['200 AI chats/day', '40 Visual labs/day', '75 Tutor sessions/day', '40 Mock tests/month (75 questions)', 'All courses', 'Priority support'],
        savings: '16% off'
      },
      half_yearly: {
        total: 2699,
        monthly: 450,
        currency: 'INR',
        features: ['300 AI chats/day', '60 Visual labs/day', '100 Tutor sessions/day', '60 Mock tests/month (100 questions)', 'All courses', 'Priority support'],
        savings: '25% off'
      },
      yearly: {
        total: 4799,
        monthly: 400,
        currency: 'INR',
        features: ['500 AI chats/day', '100 Visual labs/day', '200 Tutor sessions/day', '100 Mock tests/month (100 questions)', 'All courses', 'Priority support'],
        savings: '33% off'
      }
    };
  }

  /**
   * Get maximum questions allowed for mock tests based on subscription tier
   */
  static async getMockTestQuestionLimit(userId: number): Promise<number> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          createdAt: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionEndDate: true
        }
      });

      if (!user) {
        return 0;
      }

      // Determine subscription tier based on user account age (trial logic)
      const accountAge = Date.now() - user.createdAt.getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      let tier: string;
      if (accountAge <= oneDayInMs) {
        tier = 'free_trial'; // First day = trial period
      } else if (user.subscriptionTier && user.subscriptionStatus === 'active' && 
                 user.subscriptionEndDate && new Date(user.subscriptionEndDate) > new Date()) {
        tier = user.subscriptionTier; // Use paid subscription tier
      } else {
        tier = 'free'; // After trial expires or no active subscription
      }
      
      const limits = this.TIER_LIMITS[tier as keyof typeof this.TIER_LIMITS];
      
      if (!limits) {
        return 0;
      }

      return limits.mockTestMaxQuestions || 0;
    } catch (error) {
      console.error('Error getting mock test question limit:', error);
      return 0;
    }
  }
}