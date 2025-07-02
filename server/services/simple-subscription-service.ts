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
        visualPackageLimit: 0
      },
      free_trial: {
        aiChatLimit: 5,
        aiVisualLabLimit: 3,
        aiTutorSessionLimit: 2,
        visualPackageLimit: 1
      },
      basic: {
        aiChatLimit: 50,
        aiVisualLabLimit: 25,
        aiTutorSessionLimit: 15,
        visualPackageLimit: 10
      },
      pro: {
        aiChatLimit: -1, // Unlimited
        aiVisualLabLimit: -1,
        aiTutorSessionLimit: -1,
        visualPackageLimit: 50
      },
      quarterly: {
        aiChatLimit: -1,
        aiVisualLabLimit: -1,
        aiTutorSessionLimit: -1,
        visualPackageLimit: 50
      },
      half_yearly: {
        aiChatLimit: -1,
        aiVisualLabLimit: -1,
        aiTutorSessionLimit: -1,
        visualPackageLimit: 50
      },
      yearly: {
        aiChatLimit: -1,
        aiVisualLabLimit: -1,
        aiTutorSessionLimit: -1,
        visualPackageLimit: 50
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
          createdAt: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if free trial period (24 hours from account creation)
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      const isInFreeTrial = hoursSinceCreation <= 24;

      // Determine effective tier
      const effectiveTier = isInFreeTrial ? 'free_trial' : 'free';

      // Get limits for the tier
      const limits = this.getSubscriptionLimits(effectiveTier);
      const featureLimit = this.getFeatureLimit(limits, featureType);

      // Simplified usage tracking - always allow access during trial, none after
      const currentUsage = 0;
      const hasAccess = isInFreeTrial || featureLimit === -1;
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
      default:
        return 0;
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
          createdAt: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if free trial period
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      const isInFreeTrial = hoursSinceCreation <= 24;

      const tier = isInFreeTrial ? 'free_trial' : 'free';
      const isActive = true;

      const features = [
        'ai_chat',
        'ai_visual_lab',
        'ai_tutor_session',
        'visual_package_generation'
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

      // Calculate expiry for trial users
      const expiresAt = isInFreeTrial 
        ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
        : undefined;

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
   * Get subscription pricing
   */
  static getSubscriptionPricing(): SubscriptionPricing {
    return {
      basic: { monthly: 299, currency: "INR" },
      pro: { monthly: 599, currency: "INR" },
      quarterly: { quarterly: 1499, currency: "INR", savings: "Save ₹300" },
      half_yearly: { half_yearly: 2799, currency: "INR", savings: "Save ₹800" },
      yearly: { yearly: 4799, currency: "INR", savings: "Save ₹2400" }
    };
  }

  /**
   * Track usage (simplified - no actual tracking without DB tables)
   */
  static async trackUsage(userId: number, featureType: string, metadata?: any): Promise<boolean> {
    // Simplified - just return true for now
    // Would implement actual tracking when subscription tables are enabled
    console.log(`Usage tracked for user ${userId}, feature ${featureType}`);
    return true;
  }
}