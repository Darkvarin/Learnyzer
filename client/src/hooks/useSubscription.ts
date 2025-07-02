import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface SubscriptionAccess {
  hasAccess: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
  subscriptionTier: string;
}

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
  basic: {
    monthly: number;
    currency: string;
    features: string[];
  };
  pro: {
    monthly: number;
    currency: string;
    features: string[];
  };
  quarterly: {
    total: number;
    monthly: number;
    currency: string;
    features: string[];
    savings: string;
  };
  half_yearly: {
    total: number;
    monthly: number;
    currency: string;
    features: string[];
    savings: string;
  };
  yearly: {
    total: number;
    monthly: number;
    currency: string;
    features: string[];
    savings: string;
  };
}

export function useSubscription() {
  const queryClient = useQueryClient();

  // Check feature access
  const checkAccess = useMutation({
    mutationFn: async (featureType: string): Promise<SubscriptionAccess> => {
      const response = await apiRequest("GET", `/api/subscription/check-access/${featureType}`);
      return response.json();
    }
  });

  // Track usage
  const trackUsage = useMutation({
    mutationFn: async ({ featureType, metadata }: { featureType: string; metadata?: any }) => {
      const response = await apiRequest("POST", "/api/subscription/track-usage", {
        featureType,
        metadata
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate usage stats to get updated data
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/usage-stats"] });
    }
  });

  // Get usage statistics
  const { data: usageStats, isLoading: isLoadingStats } = useQuery<SubscriptionStats>({
    queryKey: ["/api/subscription/usage-stats"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get pricing information
  const { data: pricing, isLoading: isLoadingPricing } = useQuery<SubscriptionPricing>({
    queryKey: ["/api/subscription/pricing"],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - pricing doesn't change often
  });

  return {
    // Mutations
    checkAccess,
    trackUsage,
    
    // Data
    usageStats,
    pricing,
    
    // Loading states
    isLoadingStats,
    isLoadingPricing,
    
    // Helper functions
    getFeatureLimit: (featureType: string) => {
      const feature = usageStats?.features.find(f => f.featureType === featureType);
      return feature?.limit || 0;
    },
    
    getFeatureUsage: (featureType: string) => {
      const feature = usageStats?.features.find(f => f.featureType === featureType);
      return feature?.currentUsage || 0;
    },
    
    getFeatureRemaining: (featureType: string) => {
      const feature = usageStats?.features.find(f => f.featureType === featureType);
      return feature?.remaining || 0;
    },
    
    isFeatureAtLimit: (featureType: string) => {
      const feature = usageStats?.features.find(f => f.featureType === featureType);
      return feature ? feature.remaining <= 0 : false;
    },
    
    getUsagePercentage: (featureType: string) => {
      const feature = usageStats?.features.find(f => f.featureType === featureType);
      return feature?.percentage || 0;
    }
  };
}