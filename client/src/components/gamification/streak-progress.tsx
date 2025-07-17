import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Target, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StreakRewardAnimation } from "./streak-reward-animation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StreakGoal {
  id: number;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  xpReward: number;
}

interface StreakData {
  streakDays: number;
  goals: StreakGoal[];
  canClaimReward: boolean;
  rewardXp: number;
  nextMilestone: number;
}

export function StreakProgress() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardType, setRewardType] = useState<"daily" | "milestone" | "perfect_week" | "monthly_champion">("daily");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const response = await apiRequest("GET", "/api/gamification/streak");
      if (response.ok) {
        const data = await response.json();
        setStreakData(data);
      }
    } catch (error) {
      // Streak data fetch failed
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async () => {
    if (!streakData) return;

    try {
      const response = await apiRequest("POST", "/api/gamification/streak/claim");
      if (response.ok) {
        const result = await response.json();
        
        // Determine reward type based on streak
        let type: "daily" | "milestone" | "perfect_week" | "monthly_champion" = "daily";
        if (streakData.streakDays >= 30) type = "monthly_champion";
        else if (streakData.streakDays % 7 === 0) type = "perfect_week";
        else if ([7, 14, 21, 50, 100].includes(streakData.streakDays)) type = "milestone";
        
        setRewardType(type);
        setShowRewardAnimation(true);
        
        toast({
          title: "Streak Reward Claimed!",
          description: `You earned ${result.xpEarned} XP for your ${streakData.streakDays}-day streak!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim streak reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRewardComplete = () => {
    setShowRewardAnimation(false);
    fetchStreakData(); // Refresh data after claiming
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-[#0a2a42] to-[#1a3b5c] border-[#47c1d6]/30">
        <div className="animate-pulse">
          <div className="h-6 bg-[#47c1d6]/20 rounded mb-4"></div>
          <div className="h-4 bg-[#47c1d6]/20 rounded mb-2"></div>
          <div className="h-4 bg-[#47c1d6]/20 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!streakData) {
    return (
      <Card className="p-6 bg-gradient-to-br from-[#0a2a42] to-[#1a3b5c] border-[#47c1d6]/30">
        <p className="text-white/60 text-center">Unable to load streak data</p>
      </Card>
    );
  }

  const streakProgress = (streakData.streakDays % 7) / 7 * 100;
  const completedGoals = streakData.goals.filter(goal => goal.completed).length;
  const totalGoals = streakData.goals.length;

  return (
    <>
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#0a2a42] to-[#1a3b5c] border-[#47c1d6]/30 p-6">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0"
          animate={{ opacity: streakData.canClaimReward ? [0, 0.3, 0] : 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-gaming">Daily Streak</h3>
                <p className="text-[#47c1d6] text-sm">Keep learning every day!</p>
              </div>
            </div>
            
            {/* Streak Counter */}
            <motion.div
              className="text-center"
              animate={{ scale: streakData.canClaimReward ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="text-3xl font-bold text-orange-400 font-gaming">
                {streakData.streakDays}
              </div>
              <div className="text-sm text-white/60">days</div>
            </motion.div>
          </div>

          {/* Streak Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/80 font-gaming">Weekly Progress</span>
              <span className="text-[#4af3c0]">{streakData.streakDays % 7}/7 days</span>
            </div>
            <div className="relative">
              <Progress 
                value={streakProgress} 
                className="h-3 bg-[#0a2a42] border border-orange-500/30"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            {/* Next Milestone */}
            <div className="flex justify-between text-xs mt-2 text-white/60">
              <span>Current: {streakData.streakDays} days</span>
              <span>Next milestone: {streakData.nextMilestone} days</span>
            </div>
          </div>

          {/* Daily Goals */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[#4af3c0]" />
              <span className="text-white font-gaming">Today's Goals</span>
              <span className="text-[#4af3c0] text-sm">({completedGoals}/{totalGoals})</span>
            </div>
            
            <div className="space-y-2">
              {streakData.goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    goal.completed 
                      ? 'bg-[#4af3c0]/10 border-[#4af3c0]/30' 
                      : 'bg-[#47c1d6]/5 border-[#47c1d6]/20'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: goal.id * 0.1 }}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    goal.completed 
                      ? 'bg-[#4af3c0] text-black' 
                      : 'bg-[#47c1d6]/20 border border-[#47c1d6]/40'
                  }`}>
                    {goal.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#47c1d6]" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm font-gaming ${goal.completed ? 'text-[#4af3c0]' : 'text-white/80'}`}>
                      {goal.description}
                    </p>
                    {!goal.completed && (
                      <div className="mt-1">
                        <Progress 
                          value={(goal.progress / goal.maxProgress) * 100} 
                          className="h-2 bg-[#0a2a42]"
                        />
                        <p className="text-xs text-white/60 mt-1">
                          {goal.progress}/{goal.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[#4af3c0] text-sm font-bold">+{goal.xpReward} XP</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Claim Reward Button */}
          {streakData.canClaimReward && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Button
                onClick={claimReward}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-3 font-gaming relative overflow-hidden"
                size="lg"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <Flame className="w-5 h-5 mr-2" />
                Claim Streak Reward (+{streakData.rewardXp} XP)
              </Button>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Reward Animation */}
      <StreakRewardAnimation
        isVisible={showRewardAnimation}
        streakDays={streakData.streakDays}
        xpEarned={streakData.rewardXp}
        rewardType={rewardType}
        onComplete={handleRewardComplete}
      />
    </>
  );
}