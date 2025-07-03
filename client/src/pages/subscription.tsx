import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, 
  Zap, 
  Check, 
  Star, 
  TrendingUp, 
  Clock,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Gift
} from "lucide-react";

// Declare global window type for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  savings?: string;
  limits: {
    aiChatLimit: number;
    aiVisualLabLimit: number;
    aiTutorSessionLimit: number;
    visualPackageLimit: number;
  };
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Trial",
    description: "Perfect for getting started",
    price: 0,
    duration: "1 day",
    features: [
      "5 AI chat sessions",
      "3 visual lab generations", 
      "2 AI tutor sessions",
      "1 visual learning package",
      "Basic exam preparation content"
    ],
    limits: {
      aiChatLimit: 5,
      aiVisualLabLimit: 3,
      aiTutorSessionLimit: 2,
      visualPackageLimit: 1
    }
  },
  {
    id: "basic",
    name: "Monthly Basic",
    description: "Access to all AI tools",
    price: 799,
    duration: "month",
    features: [
      "Access to all AI tools",
      "No AI tutor access",
      "Basic analytics",
      "Monthly billing"
    ],
    limits: {
      aiChatLimit: 50,
      aiVisualLabLimit: 25,
      aiTutorSessionLimit: 0,
      visualPackageLimit: 10
    }
  },
  {
    id: "pro",
    name: "Monthly Pro",
    description: "2 AI tutor lessons daily",
    price: 1500,
    duration: "month",
    popular: true,
    features: [
      "2 AI tutor lessons daily",
      "All AI tools (20 uses/day)",
      "Performance analytics",
      "Monthly billing"
    ],
    limits: {
      aiChatLimit: 20,
      aiVisualLabLimit: 20,
      aiTutorSessionLimit: 2,
      visualPackageLimit: 20
    }
  },
  {
    id: "quarterly",
    name: "Quarterly",
    description: "3 AI tutor lessons daily",
    price: 4199,
    duration: "quarter",
    savings: "Save ₹1301 compared to monthly",
    features: [
      "3 AI tutor lessons daily",
      "All AI tools (40 uses/day)",
      "Advanced analytics",
      "Quarterly billing"
    ],
    limits: {
      aiChatLimit: 40,
      aiVisualLabLimit: 40,
      aiTutorSessionLimit: 3,
      visualPackageLimit: 40
    }
  },
  {
    id: "half_yearly",
    name: "Half-Yearly",
    description: "3 AI tutor lessons daily",
    price: 7599,
    duration: "6 months",
    savings: "Save ₹3401 compared to monthly",
    features: [
      "3 AI tutor lessons daily",
      "All AI tools (40 uses/day)",
      "Advanced analytics",
      "6-month billing"
    ],
    limits: {
      aiChatLimit: 40,
      aiVisualLabLimit: 40,
      aiTutorSessionLimit: 3,
      visualPackageLimit: 40
    }
  },
  {
    id: "yearly",
    name: "Yearly",
    description: "3 AI tutor lessons daily",
    price: 12999,
    duration: "year",
    popular: true,
    savings: "Save ₹5001 compared to monthly",
    features: [
      "3 AI tutor lessons daily",
      "All AI tools (40 uses/day)",
      "Priority support",
      "Annual billing"
    ],
    limits: {
      aiChatLimit: 40,
      aiVisualLabLimit: 40,
      aiTutorSessionLimit: 3,
      visualPackageLimit: 40
    }
  }
];

export default function SubscriptionPage() {
  const { toast } = useToast();
  const { usageStats, pricing, isLoadingStats } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string>("basic");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const upgradePlan = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/payment/create-order", { 
        planId: planId === "basic" ? "MONTHLY_BASIC" : 
               planId === "pro" ? "MONTHLY_PRO" :
               planId === "quarterly" ? "QUARTERLY" :
               planId === "half_yearly" ? "HALF_YEARLY" :
               planId === "yearly" ? "YEARLY" : "MONTHLY_BASIC"
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.orderId && data.amount) {
        // Open Razorpay checkout
        openRazorpayCheckout(data);
      } else {
        toast({
          title: "Order Creation Failed",
          description: "Failed to create payment order. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Upgrade Failed",
        description: "Failed to upgrade your plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const openRazorpayCheckout = (orderData: any) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_9YrKzZqaP7xJEV', // Use environment variable or fallback
      amount: orderData.amount,
      currency: 'INR',
      name: 'Learnyzer',
      description: `Subscription: ${orderData.planName}`,
      order_id: orderData.orderId,
      handler: function (response: any) {
        // Payment successful
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated. Enjoy your premium features!",
        });
        
        // Verify payment on server
        verifyPayment(response);
      },
      prefill: {
        name: 'Student',
        email: 'student@example.com'
      },
      theme: {
        color: '#4af3c0'
      },
      modal: {
        ondismiss: function() {
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled. You can try again anytime.",
            variant: "destructive",
          });
        }
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Load Razorpay script and then open
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.head.appendChild(script);
    }
  };

  const verifyPayment = async (paymentData: any) => {
    try {
      await apiRequest("POST", "/api/payment/verify-payment", paymentData);
      
      // Refresh the subscription data after successful payment
      window.location.reload();
    } catch (error) {
      console.error("Payment verification failed:", error);
    }
  };

  const getTierIcon = (planId: string) => {
    return planId === "free" ? Zap : Crown;
  };

  const getTierColor = (planId: string) => {
    switch (planId) {
      case "free": return "bg-gray-500";
      case "basic": return "bg-blue-500";
      case "pro": return "bg-purple-500";
      case "quarterly": return "bg-green-500";
      case "half_yearly": return "bg-orange-500";
      case "yearly": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? "Unlimited" : limit.toString();
  };

  const currentPlan = usageStats?.tier || "free";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600/20 to-purple-600/20 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Upgrade Your Learning
            </h1>
            <p className="text-xl text-cyan-200 mb-8 max-w-3xl mx-auto">
              Unlock unlimited AI-powered learning with our premium plans designed for Indian competitive exams
            </p>
            
            {/* Current Plan Badge */}
            {usageStats && (
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <div className={`w-6 h-6 ${getTierColor(currentPlan)} rounded-full flex items-center justify-center`}>
                  {React.createElement(getTierIcon(currentPlan), { className: "w-3 h-3 text-white" })}
                </div>
                <span className="text-white font-medium">Current: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="plans">Pricing Plans</TabsTrigger>
            <TabsTrigger value="usage">Current Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-8">
            {/* Pricing Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => {
                const Icon = getTierIcon(plan.id);
                const isCurrentPlan = currentPlan === plan.id;
                const canUpgrade = plan.id !== "free" && !isCurrentPlan;
                
                return (
                  <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''} ${isCurrentPlan ? 'bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/50' : 'bg-white/5 border-white/10'} backdrop-blur-sm`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                      </div>
                    )}
                    
                    {plan.savings && (
                      <div className="absolute -top-3 right-4">
                        <Badge variant="outline" className="bg-green-600 text-white border-green-500">
                          {plan.savings}
                        </Badge>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-4">
                        <Badge className="bg-green-600 text-white">
                          <Check className="w-3 h-3 mr-1" />
                          Current
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className={`w-12 h-12 ${getTierColor(plan.id)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                      <CardDescription className="text-cyan-200">{plan.description}</CardDescription>
                      
                      <div className="mt-4">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                          <span className="text-cyan-300 ml-2">/{plan.duration}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Usage Limits */}
                      <div className="pt-4 border-t border-white/10">
                        <h4 className="text-sm font-medium text-white mb-2">Daily Limits</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                          <div>AI Chat: {formatLimit(plan.limits.aiChatLimit)}</div>
                          <div>Visual Lab: {formatLimit(plan.limits.aiVisualLabLimit)}</div>
                          <div>AI Tutor: {formatLimit(plan.limits.aiTutorSessionLimit)}</div>
                          <div>Packages: {formatLimit(plan.limits.visualPackageLimit)}</div>
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-6" 
                        variant={plan.popular ? "default" : "outline"}
                        disabled={!canUpgrade || upgradePlan.isPending}
                        onClick={() => upgradePlan.mutate(plan.id)}
                      >
                        {isCurrentPlan ? (
                          "Current Plan"
                        ) : plan.id === "free" ? (
                          "Free Trial"
                        ) : (
                          <>
                            Upgrade to {plan.name}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Features Comparison */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-white text-center mb-8">Why Choose Premium?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Unlimited AI Access</h3>
                  <p className="text-gray-400">Get unlimited access to our advanced AI tutoring system with personalized learning paths.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Performance Analytics</h3>
                  <p className="text-gray-400">Track your progress with detailed analytics and get insights to improve your performance.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Priority Support</h3>
                  <p className="text-gray-400">Get priority support from our expert team to resolve any issues quickly.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            {isLoadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-600 rounded w-full"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : usageStats ? (
              <>
                {/* Current Plan Overview */}
                <Card className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-purple-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${getTierColor(usageStats.tier)} rounded-full flex items-center justify-center`}>
                          {React.createElement(getTierIcon(usageStats.tier), { className: "w-6 h-6 text-white" })}
                        </div>
                        <div>
                          <CardTitle className="text-white capitalize">{usageStats.tier} Plan</CardTitle>
                          <CardDescription className="text-cyan-200">
                            Status: {usageStats.isActive ? 'Active' : 'Inactive'}
                          </CardDescription>
                        </div>
                      </div>
                      {usageStats.expiresAt && (
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Expires</div>
                          <div className="text-white font-medium">
                            {new Date(usageStats.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {usageStats.features.map((feature) => (
                    <Card key={feature.featureType} className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-white capitalize">
                            {feature.featureType.replace(/_/g, ' ')}
                          </CardTitle>
                          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                            {feature.currentUsage}/{feature.limit === -1 ? '∞' : feature.limit}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Progress 
                          value={feature.limit === -1 ? 0 : feature.percentage} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {feature.remaining === -1 ? 'Unlimited' : `${feature.remaining} remaining`}
                          </span>
                          <span className="text-cyan-400">
                            {feature.limit === -1 ? 'Unlimited' : `${feature.percentage}% used`}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Upgrade Prompt */}
                {usageStats.tier === "free" && (
                  <Card className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-orange-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Gift className="w-12 h-12 text-orange-400" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            Upgrade for Unlimited Access
                          </h3>
                          <p className="text-gray-300 text-sm">
                            Get unlimited AI sessions, advanced features, and priority support.
                          </p>
                        </div>
                        <Button 
                          onClick={() => setSelectedPlan("basic")}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          View Plans
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Usage Data</h3>
                  <p className="text-gray-400">Start using our AI features to see your usage statistics.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}