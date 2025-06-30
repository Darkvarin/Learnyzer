import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Star, Trophy, Crown, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StreakRewardAnimationProps {
  isVisible: boolean;
  streakDays: number;
  xpEarned: number;
  rewardType: "daily" | "milestone" | "perfect_week" | "monthly_champion";
  onComplete: () => void;
}

export function StreakRewardAnimation({
  isVisible,
  streakDays,
  xpEarned,
  rewardType,
  onComplete
}: StreakRewardAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<"entrance" | "celebration" | "reward" | "exit">("entrance");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer1 = setTimeout(() => setAnimationPhase("celebration"), 500);
    const timer2 = setTimeout(() => {
      setShowConfetti(true);
      setAnimationPhase("reward");
    }, 1500);
    const timer3 = setTimeout(() => setAnimationPhase("exit"), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible]);

  const getRewardConfig = () => {
    switch (rewardType) {
      case "daily":
        return {
          icon: Flame,
          title: "Daily Streak!",
          subtitle: `${streakDays} days strong!`,
          color: "from-orange-500 to-red-500",
          bgColor: "from-orange-500/20 to-red-500/20",
          particles: "🔥"
        };
      case "milestone":
        return {
          icon: Trophy,
          title: "Milestone Achieved!",
          subtitle: `${streakDays} day streak milestone!`,
          color: "from-yellow-500 to-amber-500",
          bgColor: "from-yellow-500/20 to-amber-500/20",
          particles: "🏆"
        };
      case "perfect_week":
        return {
          icon: Crown,
          title: "Perfect Week!",
          subtitle: "7 days of excellence!",
          color: "from-purple-500 to-pink-500",
          bgColor: "from-purple-500/20 to-pink-500/20",
          particles: "👑"
        };
      case "monthly_champion":
        return {
          icon: Star,
          title: "Monthly Champion!",
          subtitle: "30 days of dedication!",
          color: "from-cyan-500 to-blue-500",
          bgColor: "from-cyan-500/20 to-blue-500/20",
          particles: "⭐"
        };
      default:
        return {
          icon: Zap,
          title: "Streak Reward!",
          subtitle: `${streakDays} days!`,
          color: "from-green-500 to-emerald-500",
          bgColor: "from-green-500/20 to-emerald-500/20",
          particles: "✨"
        };
    }
  };

  const config = getRewardConfig();
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${config.bgColor}`}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Floating Particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  y: -50,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              >
                {config.particles}
              </motion.div>
            ))}
          </div>

          {/* Main Reward Card */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: animationPhase === "entrance" ? 0 : 1,
              rotate: animationPhase === "entrance" ? -180 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
          >
            <Card className="relative overflow-hidden bg-[#0a2a42]/95 backdrop-blur-xl border-2 border-[#47c1d6]/50 p-8 max-w-md mx-4">
              {/* Glowing Border Effect */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-20`}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Main Icon */}
              <div className="text-center mb-6">
                <motion.div
                  className="inline-block"
                  animate={{
                    scale: animationPhase === "celebration" ? [1, 1.3, 1] : 1,
                    rotate: animationPhase === "celebration" ? [0, 15, -15, 0] : 0
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: animationPhase === "celebration" ? 3 : 0
                  }}
                >
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center mb-4`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-3xl font-bold text-white mb-2 font-gaming"
                  animate={{
                    scale: animationPhase === "celebration" ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {config.title}
                </motion.h2>

                <motion.p
                  className="text-[#47c1d6] text-lg font-gaming"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {config.subtitle}
                </motion.p>
              </div>

              {/* XP Reward */}
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: animationPhase === "reward" ? 1 : 0,
                  scale: animationPhase === "reward" ? 1 : 0
                }}
                transition={{ delay: 1.5, type: "spring" }}
              >
                <div className="bg-gradient-to-r from-[#4af3c0]/20 to-[#47c1d6]/20 rounded-lg p-4 border border-[#4af3c0]/30">
                  <div className="flex items-center justify-center gap-2 text-[#4af3c0]">
                    <Zap className="w-5 h-5" />
                    <span className="text-xl font-bold font-gaming">+{xpEarned} XP</span>
                  </div>
                  <p className="text-sm text-white/70 mt-1">Streak Bonus Earned!</p>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
              >
                <Button
                  onClick={onComplete}
                  className="bg-gradient-to-r from-[#4af3c0] to-[#47c1d6] hover:from-[#4af3c0]/80 hover:to-[#47c1d6]/80 text-black font-bold px-8 py-2 font-gaming"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Claim Reward!
                </Button>
              </motion.div>

              {/* Streak Counter */}
              <motion.div
                className="absolute top-4 right-4"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: 1
                }}
              >
                <div className="bg-[#4af3c0]/20 rounded-full px-3 py-1 border border-[#4af3c0]/50">
                  <span className="text-[#4af3c0] font-bold text-sm font-gaming">
                    {streakDays} 🔥
                  </span>
                </div>
              </motion.div>
            </Card>
          </motion.div>

          {/* Confetti Effect */}
          <AnimatePresence>
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    initial={{ 
                      scale: 0, 
                      opacity: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200,
                      rotate: 360
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 0.5,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}