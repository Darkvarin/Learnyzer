import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useWellness } from "@/hooks/use-wellness";
import { Clock, Eye, Droplets, Flame, DumbbellIcon, Wind, XCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

// Animation components
const AnimationTypes = [
  {
    id: "eye-exercise",
    name: "Eye Exercise",
    type: "eyeStrain",
    src: "/animations/eye-exercise.svg",
    description: "Reduce eye strain with quick eye exercises",
    duration: 60,
    icon: Eye,
  },
  {
    id: "posture-check",
    name: "Posture Check",
    type: "posture",
    src: "/animations/posture-check.svg",
    description: "Improve your posture to prevent back pain",
    duration: 45,
    icon: Flame,
  },
  {
    id: "hydration",
    name: "Hydration Break",
    type: "hydration",
    src: "/animations/hydration.svg",
    description: "Stay hydrated for better focus and health",
    duration: 30,
    icon: Droplets,
  },
  {
    id: "desk-stretch",
    name: "Desk Stretch",
    type: "movement",
    src: "/animations/desk-stretch.svg",
    description: "Quick stretches to improve circulation",
    duration: 90,
    icon: DumbbellIcon,
  },
  {
    id: "breathing",
    name: "Deep Breathing",
    type: "breathing",
    src: "/animations/breathing.svg",
    description: "Reduce stress with deep breathing exercises",
    duration: 120,
    icon: Wind,
  },
];

interface BreaksRecommenderProps {
  className?: string;
}

export function BreaksRecommender({ className }: BreaksRecommenderProps) {
  const { user } = useAuth();
  const { 
    preferences, 
    savePreferences, 
    logBreak, 
    isLoggingBreak,
    stats 
  } = useWellness();
  
  const [showSettings, setShowSettings] = useState(false);
  const [currentBreak, setCurrentBreak] = useState<typeof AnimationTypes[0] | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<number | null>(null);
  
  // Check if it's time to recommend a break
  useEffect(() => {
    const shouldRecommendBreak = () => {
      // If no stats yet, recommend a break
      if (!stats) return true;
      
      const lastBreakTime = new Date();
      lastBreakTime.setHours(lastBreakTime.getHours() - 1);
      
      // If no breaks in the last hour, recommend a break
      return stats.recentBreaksCount < 1;
    };
    
    // Select a random active break type based on user preferences
    const getRandomBreakType = () => {
      const activeTypes = AnimationTypes.filter(
        animation => preferences[animation.type as keyof typeof preferences]
      );
      
      if (activeTypes.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * activeTypes.length);
      return activeTypes[randomIndex];
    };
    
    // Set a break recommendation after 5 minutes (for demo purposes)
    const recommendationTimeout = setTimeout(() => {
      if (shouldRecommendBreak() && !currentBreak) {
        const breakToRecommend = getRandomBreakType();
        if (breakToRecommend) {
          setCurrentBreak(breakToRecommend);
          setSecondsLeft(breakToRecommend.duration);
          setProgress(100);
        }
      }
    }, 300000); // 5 minutes (300,000 ms)
    
    return () => {
      clearTimeout(recommendationTimeout);
    };
  }, [preferences, currentBreak, stats]);
  
  // Start the break timer
  const startBreak = () => {
    if (!currentBreak) return;
    
    // Clear any existing timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    const totalDuration = currentBreak.duration;
    setSecondsLeft(totalDuration);
    
    // Set up the timer to count down
    timerRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // When timer reaches 0, clear interval and mark as completed
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Log the completed break
          logBreak({
            breakId: currentBreak.id,
            breakType: currentBreak.type,
            duration: totalDuration
          });
          
          return 0;
        }
        
        // Update progress percentage
        const newSeconds = prev - 1;
        const newProgress = (newSeconds / totalDuration) * 100;
        setProgress(newProgress);
        
        return newSeconds;
      });
    }, 1000);
  };
  
  // Skip the current break
  const skipBreak = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentBreak(null);
  };
  
  // Handler for preference toggle
  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    savePreferences({
      ...preferences,
      [key]: value
    });
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!user) {
    return <div>Please log in to use the wellness features</div>;
  }
  
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card className="relative overflow-hidden border-purple-600/20 bg-background/90 shadow-lg backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-700 via-blue-700 to-purple-700 opacity-80"></div>
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground">
              Wellness Breaks
            </CardTitle>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? "Hide Settings" : "Settings"}
            </Button>
          </div>
          <CardDescription>
            Take regular breaks to maintain focus and reduce strain
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            {showSettings ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-medium">Enable/Disable Break Types</h3>
                <div className="space-y-3">
                  {AnimationTypes.map((animation) => (
                    <div 
                      key={animation.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-purple-950/30 p-2">
                          <animation.icon className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{animation.name}</h4>
                          <p className="text-xs text-muted-foreground">{animation.description}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={preferences[animation.type as keyof typeof preferences]} 
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(animation.type as keyof typeof preferences, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : currentBreak ? (
              <motion.div
                key="break"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="rounded-lg bg-black/50 p-2 text-center">
                  <Badge variant="secondary" className="mb-2 font-normal">
                    {currentBreak.name}
                  </Badge>
                  <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-lg border border-border/50 bg-gradient-to-b from-background/80 to-background">
                    <img 
                      src={currentBreak.src} 
                      alt={currentBreak.name} 
                      className="h-full w-full" 
                    />
                  </div>
                  
                  <div className="mt-3 text-center">
                    <div className="mb-2 text-2xl font-bold">{formatTime(secondsLeft)}</div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {secondsLeft === currentBreak.duration ? (
                    <Button 
                      onClick={startBreak} 
                      variant="default" 
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Start Break
                    </Button>
                  ) : secondsLeft > 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Break in progress...
                    </div>
                  ) : (
                    <Button 
                      variant="default" 
                      className="gap-2 bg-purple-600 hover:bg-purple-700"
                      disabled
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Completed!
                    </Button>
                  )}
                  
                  <Button 
                    onClick={skipBreak} 
                    variant="ghost" 
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Skip
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-break"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border/50 bg-background/50 p-6 text-center"
              >
                <div className="rounded-full border border-border/50 bg-background/80 p-3">
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">No Active Breaks</h3>
                <p className="text-sm text-muted-foreground">
                  Breaks will be recommended based on your study time.
                  We'll notify you when it's time to take a break.
                </p>
                <Button
                  variant="outline"
                  className="mt-2 border-purple-500/30 bg-purple-500/10"
                  onClick={() => {
                    const randomAnimation = AnimationTypes[Math.floor(Math.random() * AnimationTypes.length)];
                    setCurrentBreak(randomAnimation);
                    setSecondsLeft(randomAnimation.duration);
                    setProgress(100);
                  }}
                >
                  Take a break now
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        {!showSettings && !currentBreak && stats && (
          <CardFooter className="flex flex-col items-start gap-1 border-t border-border/30 bg-background/50 px-6 py-3">
            <div className="flex w-full items-center justify-between text-sm">
              <span className="text-muted-foreground">Breaks today:</span>
              <Badge variant="outline" className="font-mono">
                {stats.recentBreaksCount || 0}
              </Badge>
            </div>
            <div className="flex w-full items-center justify-between text-sm">
              <span className="text-muted-foreground">Total break time:</span>
              <Badge variant="outline" className="font-mono">
                {stats.totalBreakSeconds 
                  ? `${Math.floor(stats.totalBreakSeconds / 60)} mins` 
                  : "0 mins"}
              </Badge>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}