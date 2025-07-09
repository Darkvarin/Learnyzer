import { db } from "@db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

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
        aiTutorSessionLimit: 0,
        visualPackageLimit: 0,
        mockTestGenerationLimit: 0
      },
      free_trial: {
        aiChatLimit: 5,
        aiVisualLabLimit: 3,
        aiTutorSessionLimit: 2,
        visualPackageLimit: 1,
        mockTestGenerationLimit: 1
      },
      basic: {
        aiChatLimit: 50,
        aiVisualLabLimit: 25,
        aiTutorSessionLimit: 0,
        visualPackageLimit: 10,
        mockTestGenerationLimit: 5
      },
      pro: {
        aiChatLimit: 20,
        aiVisualLabLimit: 20,
        aiTutorSessionLimit: 2,
        visualPackageLimit: 20,
        mockTestGenerationLimit: 15
      },
      quarterly: {
        aiChatLimit: 40,
        aiVisualLabLimit: 40,
        aiTutorSessionLimit: 3,
        visualPackageLimit: 40,
        mockTestGenerationLimit: 25
      },
      half_yearly: {
        aiChatLimit: 40,
        aiVisualLabLimit: 40,
        aiTutorSessionLimit: 3,
        visualPackageLimit: 40,
        mockTestGenerationLimit: 25
      },
      yearly: {
        aiChatLimit: 40,
        aiVisualLabLimit: 40,
        aiTutorSessionLimit: 3,
        visualPackageLimit: 40,
        mockTestGenerationLimit: 25
      },
      premium: {
        aiChatLimit: -1, // -1 means unlimited
        aiVisualLabLimit: -1,
        aiTutorSessionLimit: -1,
        visualPackageLimit: -1,
        mockTestGenerationLimit: -1
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

      // Determine access based on subscription status
      let hasAccess = false;
      if (isSubscriptionActive) {
        hasAccess = true; // Active paid subscription
      } else if (isInFreeTrial) {
        hasAccess = true; // Valid free trial
      } else {
        hasAccess = featureLimit > 0; // Free tier with limited access
      }

      const currentUsage = 0; // Reset for trial users
      const remaining = featureLimit === -1 ? -1 : (hasAccess ? featureLimit : 0); // -1 means unlimited

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

      const featureStats = features.map((featureType) => {
        const limits = this.getSubscriptionLimits(tier);
        const limit = this.getFeatureLimit(limits, featureType);
        const currentUsage = 0; // Simplified
        const remaining = limit === -1 ? -1 : Math.max(0, limit - currentUsage);
        const percentage = limit > 0 ? Math.round((currentUsage / limit) * 100) : 0;

        return {
          featureType,
          currentUsage,
          limit,
          remaining,
          percentage
        };
      });

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
      case 'ai_tutor_session':
        return limits.aiTutorSessionLimit;
      case 'visual_package_generation':
        return limits.visualPackageLimit;
      case 'mock_test_generation':
        return limits.mockTestLimit || limits.aiVisualLabLimit; // Use same limit as visual lab
      default:
        return 0;
    }
  }

  /**
   * Track feature usage (simplified - no actual tracking for premium users)
   */
  static async trackUsage(userId: number, featureType: string, metadata?: any): Promise<boolean> {
    try {
      const access = await this.hasFeatureAccess(userId, featureType);
      return access.hasAccess;
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