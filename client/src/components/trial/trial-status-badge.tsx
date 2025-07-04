import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";

interface TrialStatusBadgeProps {
  showTimeLeft?: boolean;
  variant?: "default" | "compact";
}

export function TrialStatusBadge({ showTimeLeft = true, variant = "default" }: TrialStatusBadgeProps) {
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
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  if (variant === "compact") {
    return (
      <Badge variant="secondary" className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-400 border-orange-500/30">
        <Zap className="w-3 h-3 mr-1" />
        Trial
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-400 border-orange-500/30">
      <Zap className="w-3 h-3 mr-1" />
      Free Trial
      {showTimeLeft && (
        <>
          <Clock className="w-3 h-3 ml-2 mr-1" />
          {getTimeLeft()}
        </>
      )}
    </Badge>
  );
}