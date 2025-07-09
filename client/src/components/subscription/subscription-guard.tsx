import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Zap, Lock, Crown, Star, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface SubscriptionGuardProps {
  featureType: "ai_chat" | "ai_visual_lab" | "ai_tutor_session" | "visual_package_generation" | "mock_test_generation";
  children: React.ReactNode;
  onAccessDenied?: () => void;
  trackOnMount?: boolean;
}

const featureDisplayNames = {
  ai_chat: "AI Chat Messages",
  ai_visual_lab: "AI Visual Lab Generations", 
  ai_tutor_session: "AI Tutor Sessions",
  visual_package_generation: "Visual Learning Packages",
  mock_test_generation: "Mock Test Generation"
};

const featureDescriptions = {
  ai_chat: "Engage in personalized AI-powered conversations",
  ai_visual_lab: "Generate educational images and visual content",
  ai_tutor_session: "Access one-on-one AI tutoring sessions", 
  visual_package_generation: "Create comprehensive visual learning packages",
  mock_test_generation: "Generate AI-powered practice tests for exam preparation"
};

export function SubscriptionGuard({ 
  featureType, 
  children, 
  onAccessDenied,
  trackOnMount = true 
}: SubscriptionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessData, setAccessData] = useState<any>(null);
  const { checkAccess, trackUsage, usageStats } = useSubscription();

  useEffect(() => {
    async function checkFeatureAccess() {
      try {
        const result = await checkAccess.mutateAsync(featureType);
        setAccessData(result);
        setHasAccess(result.hasAccess);
        
        if (!result.hasAccess && onAccessDenied) {
          onAccessDenied();
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setHasAccess(false);
      }
    }

    checkFeatureAccess();
  }, [featureType]);

  // Track usage on mount if enabled
  useEffect(() => {
    if (trackOnMount && hasAccess) {
      trackUsage.mutate({ 
        featureType,
        metadata: { source: "auto_track" }
      });
    }
  }, [featureType, hasAccess, trackOnMount]);

  if (hasAccess === null) {
    // Loading state
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hasAccess) {
    // Access denied state
    return (
      <div className="container mx-auto px-4 pt-24 pb-20 md:pb-6">
        <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Feature Access Limited</CardTitle>
          <CardDescription>
            You've reached your daily limit for {featureDisplayNames[featureType]}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {accessData && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Daily Usage</span>
                  <Badge variant="destructive">
                    {accessData.currentUsage}/{accessData.limit}
                  </Badge>
                </div>
                <Progress value={(accessData.currentUsage / accessData.limit) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Resets daily at midnight
                </p>
              </div>

              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Upgrade your subscription to get higher limits and unlimited access to premium features.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/subscription" className="block">
              <Button className="w-full" size="lg">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
            <Link to="/dashboard" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted - render children with usage indicator
  return (
    <div className="space-y-4">
      {accessData && accessData.remaining <= 5 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <Zap className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            You have {accessData.remaining} {featureDisplayNames[featureType].toLowerCase()} remaining today.
            {accessData.remaining <= 2 && (
              <Link to="/subscription" className="ml-2 underline font-medium">
                Upgrade for unlimited access
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </div>
  );
}

// Usage tracking component for manual tracking
export function useSubscriptionTracking() {
  const { trackUsage } = useSubscription();

  const trackFeatureUsage = async (
    featureType: "ai_chat" | "ai_visual_lab" | "ai_tutor_session" | "visual_package_generation",
    metadata?: any
  ) => {
    try {
      const result = await trackUsage.mutateAsync({ featureType, metadata });
      return result.hasAccess;
    } catch (error) {
      console.error("Error tracking usage:", error);
      return false;
    }
  };

  return { trackFeatureUsage, isTracking: trackUsage.isPending };
}

// Subscription status widget
export function SubscriptionStatusWidget() {
  const { usageStats, isLoadingStats } = useSubscription();

  if (isLoadingStats || !usageStats) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-500';
      case 'basic': return 'bg-blue-500';
      case 'pro': return 'bg-purple-500';
      case 'quarterly': return 'bg-green-500';
      case 'half_yearly': return 'bg-orange-500';
      case 'yearly': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    if (tier === 'free') return Zap;
    return Crown;
  };

  const TierIcon = getTierIcon(usageStats.tier);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${getTierColor(usageStats.tier)} rounded-full flex items-center justify-center`}>
              <TierIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm capitalize">{usageStats.tier} Plan</CardTitle>
              <CardDescription className="text-xs">
                {usageStats.isActive ? 'Active' : 'Inactive'}
              </CardDescription>
            </div>
          </div>
          <Link to="/subscription">
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {usageStats.features.map((feature) => (
          <div key={feature.featureType} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">
                {featureDisplayNames[feature.featureType as keyof typeof featureDisplayNames]}
              </span>
              <span className="text-muted-foreground">
                {feature.currentUsage}/{feature.limit}
              </span>
            </div>
            <Progress value={feature.percentage} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}