import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Lock, Crown, Zap, Star, Gift } from "lucide-react";
import { Link } from "wouter";

interface TrialLockdownProps {
  children: React.ReactNode;
  featureName: string;
}

export function TrialLockdown({ children, featureName }: TrialLockdownProps) {
  // Use existing subscription service to check access
  const { data: subscriptionStats } = useQuery({
    queryKey: ['/api/subscription/usage-stats'],
  });

  // Get feature access using subscription service
  const { data: featureAccess } = useQuery({
    queryKey: ['/api/subscription/check-access'],
    refetchOnMount: true
  });

  // If user has access to AI features (trial active or subscription), show the feature
  const hasAccess = subscriptionStats?.tier === 'free_trial' || 
                   subscriptionStats?.tier === 'basic' || 
                   subscriptionStats?.tier === 'pro' || 
                   subscriptionStats?.tier === 'quarterly' || 
                   subscriptionStats?.tier === 'half_yearly' || 
                   subscriptionStats?.tier === 'yearly';

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show lockdown screen if trial expired
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 border-red-500/30 bg-background/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Lock className="w-16 h-16 text-red-500" />
              <Clock className="w-6 h-6 text-orange-500 absolute -top-1 -right-1" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-red-500 mb-2">
              Free Trial Expired
            </CardTitle>
            <CardDescription className="text-lg">
              Your one-day free trial for <span className="font-semibold text-primary">{featureName}</span> has ended.
              Upgrade to continue your learning journey!
            </CardDescription>
          </div>

          <Badge variant="destructive" className="text-sm">
            <Clock className="w-4 h-4 mr-1" />
            Trial Period: 24 Hours (Completed)
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Subscription Plans */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Basic Plan */}
            <Card className="border-blue-500/30 hover:border-blue-500/60 transition-colors">
              <CardHeader className="text-center pb-3">
                <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Basic</CardTitle>
                <div className="text-2xl font-bold text-blue-500">₹299<span className="text-sm text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• 50 AI chats daily</div>
                <div>• 10 visual labs daily</div>
                <div>• 15 tutor sessions daily</div>
                <div>• Email support</div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-purple-500/30 hover:border-purple-500/60 transition-colors relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </Badge>
              <CardHeader className="text-center pb-3 pt-6">
                <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Pro</CardTitle>
                <div className="text-2xl font-bold text-purple-500">₹599<span className="text-sm text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• 150 AI chats daily</div>
                <div>• 30 visual labs daily</div>
                <div>• 45 tutor sessions daily</div>
                <div>• Priority support</div>
                <div>• Advanced analytics</div>
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card className="border-green-500/30 hover:border-green-500/60 transition-colors relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
                <Gift className="w-3 h-3 mr-1" />
                Best Value
              </Badge>
              <CardHeader className="text-center pb-3 pt-6">
                <Star className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Yearly</CardTitle>
                <div className="text-2xl font-bold text-green-500">₹4799<span className="text-sm text-muted-foreground">/year</span></div>
                <div className="text-xs text-green-600">Save ₹2389!</div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• 500 AI chats daily</div>
                <div>• 100 visual labs daily</div>
                <div>• 200 tutor sessions daily</div>
                <div>• VIP support</div>
                <div>• All premium features</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild size="lg" className="flex-1">
              <Link href="/pricing">
                <Crown className="w-4 h-4 mr-2" />
                Choose Your Plan
              </Link>
            </Button>
            
            <Button variant="outline" asChild size="lg" className="flex-1">
              <Link href="/dashboard">
                <Lock className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Trial Info */}
          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              You had full access to all features during your 24-hour trial period.
              <br />
              <span className="text-primary font-medium">Upgrade now to continue learning!</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to check trial status using existing subscription service
export function useTrialStatus() {
  const { data: subscriptionStats } = useQuery({
    queryKey: ['/api/subscription/usage-stats'],
  });

  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Use subscription service to determine trial status
  const isTrialExpired = subscriptionStats?.tier === 'free';
  const isOnTrial = subscriptionStats?.tier === 'free_trial';
  
  // Calculate time remaining for trial users
  const timeRemaining = userData && userData.createdAt && isOnTrial
    ? 24 * 60 * 60 * 1000 - (Date.now() - new Date(userData.createdAt).getTime())
    : 0;

  return {
    isTrialExpired,
    isOnTrial,
    timeRemaining,
    hoursRemaining: Math.floor(timeRemaining / (60 * 60 * 1000)),
    minutesRemaining: Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000)),
    subscriptionTier: subscriptionStats?.tier
  };
}