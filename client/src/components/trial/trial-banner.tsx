import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Zap, Crown, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function TrialBanner() {
  const { data: stats } = useQuery<{
    tier: string;
    isActive: boolean;
    expiresAt?: string;
  }>({
    queryKey: ["/api/subscription/usage-stats"],
  });

  if (!stats || stats.tier !== 'free_trial' || !stats.isActive) {
    return null;
  }

  const getTimeLeft = () => {
    if (!stats.expiresAt) return "Unknown";
    
    const endDate = new Date(stats.expiresAt);
    const now = new Date();
    const timeLeft = endDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return "Expired";
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} hours ${minutes} minutes`;
    } else {
      return `${minutes} minutes`;
    }
  };

  const timeLeft = getTimeLeft();
  const isExpiringSoon = timeLeft !== "Expired" && timeLeft !== "Unknown" && 
    (timeLeft.includes("minutes") && !timeLeft.includes("hours"));

  return (
    <Card className={`border-2 ${isExpiringSoon ? 'border-red-500/50 bg-red-500/10' : 'border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-pink-500/10'} mb-6`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isExpiringSoon ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
              <Zap className={`w-5 h-5 ${isExpiringSoon ? 'text-red-400' : 'text-orange-400'}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${isExpiringSoon ? 'text-red-400' : 'text-orange-400'}`}>
                Free Trial Active
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {timeLeft === "Expired" ? "Trial has expired" : 
                   timeLeft === "Unknown" ? "Time remaining unknown" :
                   `${timeLeft} remaining`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">
                Enjoying the trial?
              </p>
              <p className="text-xs text-muted-foreground">
                Upgrade for unlimited access
              </p>
            </div>
            <Link href="/subscription">
              <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        
        {isExpiringSoon && (
          <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-sm text-red-400">
              ⚠️ Your trial is expiring soon! Upgrade now to continue accessing all AI features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}