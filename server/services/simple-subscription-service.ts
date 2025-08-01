import { db } from "@db";
import { users, usageTracking } from "@shared/schema";
import { eq, and, gte } from "drizzle-orm";

export interface SubscriptionStats {
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
}

export interface SubscriptionPricing {
  basic: { monthly: number; currency: string };
  pro: { monthly: number; currency: string };
  quarterly: { quarterly: number; currency: string; savings: string };
  half_yearly: { half_yearly: number; currency: string; savings: string };
  yearly: { yearly: number; currency: string; savings: string };
}

export class SimpleSubscriptionService {
  /**
   * Get subscription limits for each tier
   */
  private static getSubscriptionLimits(tier: string) {
    const limits = {
      free: {
        aiChatLimit: 0,
        aiVisualLabLimit: 0,
        visualPackageLimit: 0,
        mockTestGenerationLimit: 0,
        dailyLimit: 0
      },
      free_trial: {
        aiChatLimit: 5,
        aiVisualLabLimit: 3,
        visualPackageLimit: 1,
        mockTestGenerationLimit: 1,
        dailyLimit: 5
      },
      basic: {
        aiChatLimit: 10,
        aiVisualLabLimit: 5,
        visualPackageLimit: 3,
        mockTestGenerationLimit: 5,
        dailyLimit: 10
      },
      pro: {
        aiChatLimit: 20,
        aiVisualLabLimit: 10,
        visualPackageLimit: 8,
        mockTestGenerationLimit: 10,
        dailyLimit: 20
      },
      quarterly: {
        aiChatLimit: 25,
        aiVisualLabLimit: 15,
        visualPackageLimit: 12,
        mockTestGenerationLimit: 15,
        dailyLimit: 25
      },
      half_yearly: {
        aiChatLimit: 30,
        aiVisualLabLimit: 20,
        visualPackageLimit: 15,
        mockTestGenerationLimit: 20,
        dailyLimit: 30
      },
      yearly: {
        aiChatLimit: 40,
        aiVisualLabLimit: 25,
        visualPackageLimit: 20,
        mockTestGenerationLimit: 999,
        dailyLimit: 40
      },
      premium: {
        aiChatLimit: -1, // -1 means unlimited
        aiVisualLabLimit: -1,
        visualPackageLimit: -1,
        mockTestGenerationLimit: -1,
        dailyLimit: -1
      }
    };

    return limits[tier as keyof typeof limits] || limits.free;
  }

  /**
   * Check if user has access to a specific feature (simplified version)
   */
  static async hasFeatureAccess(userId: number, featureType: string): Promise<{
    hasAccess: boolean;
    currentUsage: number;
    limit: number;
    remaining: number;
    tier: string;
    resetTime?: Date;
  }> {
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
        throw new Error('User not found');
      }

      // Check subscription status from database
      const subscriptionTier = user.subscriptionTier || 'free';
      const subscriptionStatus = user.subscriptionStatus || 'inactive';
      const subscriptionEndDate = user.subscriptionEndDate;
      
      const now = new Date();
      let isSubscriptionActive = false;
      
      // Check if subscription is active - Premium tier gets special treatment
      if (subscriptionStatus === 'active') {
        if (subscriptionTier === 'premium') {
          isSubscriptionActive = true; // Premium tier has unlimited access
        } else if (subscriptionEndDate) {
          isSubscriptionActive = new Date(subscriptionEndDate) > now;
        }
      }
      
      // For free trial, check if it's expired
      let isInFreeTrial = false;
      if (subscriptionTier === 'free_trial') {
        if (subscriptionEndDate) {
          isInFreeTrial = new Date(subscriptionEndDate) > now;
        } else {
          // Fallback: check 24 hours from account creation
          const createdAt = new Date(user.createdAt);
          const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          isInFreeTrial = hoursSinceCreation <= 24;
        }
      }

      // Determine effective tier based on subscription status
      let effectiveTier = 'free';
      if (isSubscriptionActive) {
        effectiveTier = subscriptionTier;
      } else if (isInFreeTrial) {
        effectiveTier = 'free_trial';
      }

      // Get limits for the tier
      const limits = this.getSubscriptionLimits(effectiveTier);
      const featureLimit = this.getFeatureLimit(limits, featureType);

      // Get actual usage for today
      let currentUsage = 0;
      if (effectiveTier === 'free' || effectiveTier === 'free_trial') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const usageRecord = await db.query.usageTracking.findFirst({
          where: and(
            eq(usageTracking.userId, userId),
            eq(usageTracking.featureType, featureType),
            gte(usageTracking.usageDate, today)
          )
        });
        
        currentUsage = usageRecord?.usageCount || 0;
      }

      // Determine access based on subscription status and usage
      let hasAccess = false;
      if (isSubscriptionActive) {
        hasAccess = true; // Active paid subscription
      } else if (isInFreeTrial) {
        hasAccess = currentUsage < featureLimit; // Trial with usage limits
      } else {
        hasAccess = featureLimit > 0 && currentUsage < featureLimit; // Free tier with limited access
      }

      const remaining = featureLimit === -1 ? -1 : Math.max(0, featureLimit - currentUsage);

      // Calculate reset time (next midnight)
      const resetTime = new Date();
      resetTime.setDate(resetTime.getDate() + 1);
      resetTime.setHours(0, 0, 0, 0);

      return {
        hasAccess,
        currentUsage,
        limit: featureLimit,
        remaining,
        tier: effectiveTier,
        resetTime
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        hasAccess: false,
        currentUsage: 0,
        limit: 0,
        remaining: 0,
        tier: 'free'
      };
    }
  }

  /**
   * Get user's usage statistics (simplified)
   */
  static async getUserUsageStats(userId: number): Promise<SubscriptionStats> {
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
        throw new Error('User not found');
      }

      // Check subscription status from database
      const subscriptionTier = user.subscriptionTier || 'free';
      const subscriptionStatus = user.subscriptionStatus || 'inactive';
      const subscriptionEndDate = user.subscriptionEndDate;
      
      const now = new Date();
      let isSubscriptionActive = false;
      
      // Check if subscription is active - Premium tier gets special treatment
      if (subscriptionStatus === 'active') {
        if (subscriptionTier === 'premium') {
          isSubscriptionActive = true; // Premium tier has unlimited access
        } else if (subscriptionEndDate) {
          isSubscriptionActive = new Date(subscriptionEndDate) > now;
        }
      }
      
      // For free trial, check if it's expired
      let isInFreeTrial = false;
      if (subscriptionTier === 'free_trial') {
        if (subscriptionEndDate) {
          isInFreeTrial = new Date(subscriptionEndDate) > now;
        } else {
          // Fallback: check 24 hours from account creation
          const createdAt = new Date(user.createdAt);
          const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          isInFreeTrial = hoursSinceCreation <= 24;
        }
      }

      // Determine effective tier based on subscription status
      let tier = 'free';
      let isActive = false;
      
      if (isSubscriptionActive) {
        tier = subscriptionTier;
        isActive = true;
      } else if (isInFreeTrial) {
        tier = 'free_trial';
        isActive = true;
      }

      // Define features to track
      const features = [
        'ai_chat',
        'ai_visual_lab', 
        'ai_tutor_session',
        'visual_package_generation',
        'mock_test_generation'
      ];

      const featureStats = await Promise.all(features.map(async (featureType) => {
        const limits = this.getSubscriptionLimits(tier);
        const limit = this.getFeatureLimit(limits, featureType);
        
        // Get actual usage for today
        let currentUsage = 0;
        if (tier === 'free' || tier === 'free_trial') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const usageRecord = await db.query.usageTracking.findFirst({
            where: and(
              eq(usageTracking.userId, user.id),
              eq(usageTracking.featureType, featureType),
              gte(usageTracking.usageDate, today)
            )
          });
          
          currentUsage = usageRecord?.usageCount || 0;
        }
        
        const remaining = limit === -1 ? -1 : Math.max(0, limit - currentUsage);
        const percentage = limit > 0 ? Math.round((currentUsage / limit) * 100) : 0;

        return {
          featureType,
          currentUsage,
          limit,
          remaining,
          percentage
        };
      }));

      // Calculate expiry based on subscription data
      let expiresAt: Date | undefined;
      if (isInFreeTrial && subscriptionEndDate) {
        expiresAt = new Date(subscriptionEndDate);
      } else if (isInFreeTrial) {
        // Fallback: calculate from creation time
        const userCreatedAt = new Date(user.createdAt);
        expiresAt = new Date(userCreatedAt.getTime() + 24 * 60 * 60 * 1000);
      } else if (isSubscriptionActive && subscriptionEndDate) {
        expiresAt = new Date(subscriptionEndDate);
      }

      return {
        tier,
        isActive,
        features: featureStats,
        expiresAt
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
   * Get feature limit from tier configuration
   */
  private static getFeatureLimit(limits: any, featureType: string): number {
    switch (featureType) {
      case 'ai_chat':
        return limits.aiChatLimit;
      case 'ai_visual_lab':
        return limits.aiVisualLabLimit;
      case 'visual_package_generation':
        return limits.visualPackageLimit;
      case 'mock_test_generation':
        return limits.mockTestGenerationLimit;
      default:
        return 0;
    }
  }

  /**
   * Track feature usage with real usage counting
   */
  static async trackUsage(userId: number, featureType: string, metadata?: any): Promise<boolean> {
    try {
      // First check if user has access
      const access = await this.hasFeatureAccess(userId, featureType);
      
      if (!access.hasAccess) {
        return false;
      }

      // Only track usage for free and trial users (not for paid subscriptions)
      if (access.tier === 'free' || access.tier === 'free_trial') {
        // Get today's usage record
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if we have a usage record for today
        const existingUsage = await db.query.usageTracking.findFirst({
          where: and(
            eq(usageTracking.userId, userId),
            eq(usageTracking.featureType, featureType),
            gte(usageTracking.usageDate, today)
          )
        });

        if (existingUsage) {
          // Update existing record
          const newUsageCount = existingUsage.usageCount + 1;
          await db.update(usageTracking)
            .set({ 
              usageCount: newUsageCount,
              metadata 
            })
            .where(eq(usageTracking.id, existingUsage.id));
        } else {
          // Create new record for today
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          await db.insert(usageTracking).values({
            userId,
            featureType,
            usageDate: new Date(),
            resetDate: tomorrow,
            usageCount: 1,
            metadata
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error tracking usage:', error);
      return false;
    }
  }

  /**
   * Get subscription pricing
   */
  static getSubscriptionPricing(): SubscriptionPricing {
    return {
      basic: { 
        monthly: 799, 
        currency: "INR" 
      },
      pro: { 
        monthly: 1299, 
        currency: "INR" 
      },
      quarterly: { 
        quarterly: 2999, 
        currency: "INR", 
        savings: "23%" 
      },
      half_yearly: { 
        half_yearly: 5499, 
        currency: "INR", 
        savings: "30%" 
      },
      yearly: { 
        yearly: 9999, 
        currency: "INR", 
        savings: "36%" 
      }
    };
  }
}