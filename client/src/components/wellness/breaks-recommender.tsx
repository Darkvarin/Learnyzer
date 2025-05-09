import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WellnessBreak {
  id: string;
  type: "eye" | "posture" | "hydration" | "movement" | "breathing";
  title: string;
  description: string;
  duration: number; // in seconds
  animationSrc: string;
  benefits: string[];
}

const wellnessBreaks: WellnessBreak[] = [
  {
    id: "eye-strain",
    type: "eye",
    title: "20-20-20 Eye Exercise",
    description: "Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.",
    duration: 20,
    animationSrc: "/animations/eye-exercise.svg",
    benefits: ["Reduces eye strain", "Prevents dry eyes", "Improves focus"]
  },
  {
    id: "posture-check",
    type: "posture",
    title: "Posture Reset",
    description: "Straighten your back, align your neck, and position your screen at eye level.",
    duration: 30,
    animationSrc: "/animations/posture-check.svg",
    benefits: ["Prevents back pain", "Improves breathing", "Reduces fatigue"]
  },
  {
    id: "hydration-reminder",
    type: "hydration",
    title: "Hydration Break",
    description: "Take a moment to drink water and stay hydrated for optimal brain function.",
    duration: 20,
    animationSrc: "/animations/hydration.svg",
    benefits: ["Improves concentration", "Prevents headaches", "Maintains energy levels"]
  },
  {
    id: "desk-stretch",
    type: "movement",
    title: "Quick Desk Stretch",
    description: "Stand up and perform these simple stretches to relieve tension.",
    duration: 60,
    animationSrc: "/animations/desk-stretch.svg",
    benefits: ["Reduces muscle tension", "Improves circulation", "Boosts energy"]
  },
  {
    id: "breathing-exercise",
    type: "breathing",
    title: "Deep Breathing",
    description: "Take 5 deep breaths, holding each for 4 seconds before exhaling slowly.",
    duration: 45,
    animationSrc: "/animations/breathing.svg",
    benefits: ["Reduces stress", "Lowers heart rate", "Improves mental clarity"]
  }
];

interface BreaksRecommenderProps {
  studyDuration?: number; // in minutes, how long the user has been studying
  userPreferences?: {
    eyeStrain?: boolean;
    posture?: boolean;
    hydration?: boolean;
    movement?: boolean;
    breathing?: boolean;
  };
  onBreakComplete?: () => void;
}

export function BreaksRecommender({ 
  studyDuration = 0, 
  userPreferences = {
    eyeStrain: true,
    posture: true,
    hydration: true,
    movement: true,
    breathing: true
  },
  onBreakComplete
}: BreaksRecommenderProps) {
  const { toast } = useToast();
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [currentBreak, setCurrentBreak] = useState<WellnessBreak | null>(null);
  const [breakInProgress, setBreakInProgress] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const logBreakMutation = useMutation({
    mutationFn: async (breakData: { 
      breakId: string,
      breakType: string,
      duration: number 
    }) => {
      return apiRequest("POST", "/api/wellness/breaks/log", breakData);
    },
    onSuccess: () => {
      // Optionally handle successful logging
    }
  });

  // Determine when to recommend a break based on study duration
  useEffect(() => {
    // Check every 20 minutes (1200 seconds)
    const shouldRecommendBreak = studyDuration > 0 && studyDuration % 20 === 0;
    
    if (shouldRecommendBreak && !showBreakReminder && !breakInProgress) {
      // Choose a break type based on study duration and user preferences
      const recommendedBreak = getRecommendedBreak();
      if (recommendedBreak) {
        setCurrentBreak(recommendedBreak);
        setShowBreakReminder(true);
      }
    }
  }, [studyDuration, showBreakReminder, breakInProgress]);

  const getRecommendedBreak = (): WellnessBreak | null => {
    // Filter breaks based on user preferences
    const eligibleBreaks = wellnessBreaks.filter(breakItem => {
      switch (breakItem.type) {
        case 'eye': return userPreferences.eyeStrain;
        case 'posture': return userPreferences.posture;
        case 'hydration': return userPreferences.hydration;
        case 'movement': return userPreferences.movement;
        case 'breathing': return userPreferences.breathing;
        default: return true;
      }
    });

    if (eligibleBreaks.length === 0) return null;

    // Custom logic for break selection based on study duration
    if (studyDuration >= 60) {
      // Prioritize movement breaks after an hour
      const movementBreaks = eligibleBreaks.filter(b => b.type === 'movement');
      if (movementBreaks.length > 0) {
        return movementBreaks[Math.floor(Math.random() * movementBreaks.length)];
      }
    } else if (studyDuration >= 45) {
      // Suggest breathing exercises after 45 minutes
      const breathingBreaks = eligibleBreaks.filter(b => b.type === 'breathing');
      if (breathingBreaks.length > 0) {
        return breathingBreaks[Math.floor(Math.random() * breathingBreaks.length)];
      }
    } else if (studyDuration >= 30) {
      // Suggest posture checks or hydration after 30 minutes
      const postureOrHydration = eligibleBreaks.filter(b => ['posture', 'hydration'].includes(b.type));
      if (postureOrHydration.length > 0) {
        return postureOrHydration[Math.floor(Math.random() * postureOrHydration.length)];
      }
    } 

    // Default: suggest a random break
    return eligibleBreaks[Math.floor(Math.random() * eligibleBreaks.length)];
  };

  const startBreak = () => {
    if (!currentBreak) return;
    
    setBreakInProgress(true);
    setShowBreakReminder(false);
    setTimeRemaining(currentBreak.duration);
    setProgress(0);
    
    toast({
      title: "Wellness Break Started",
      description: `Taking a ${currentBreak.duration} second ${currentBreak.title} break`,
    });
  };

  const skipBreak = () => {
    setShowBreakReminder(false);
    setCurrentBreak(null);
    
    toast({
      title: "Break Skipped",
      description: "We'll remind you again later.",
      variant: "default"
    });
  };

  const completeBreak = () => {
    if (currentBreak) {
      // Log the completed break
      logBreakMutation.mutate({
        breakId: currentBreak.id,
        breakType: currentBreak.type,
        duration: currentBreak.duration
      });
      
      toast({
        title: "Break Completed",
        description: "Great job! Your body and mind thank you.",
      });
    }
    
    setBreakInProgress(false);
    setCurrentBreak(null);
    setTimeRemaining(0);
    setProgress(100);
    
    if (onBreakComplete) {
      onBreakComplete();
    }
  };

  // Handle the break timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (breakInProgress && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            completeBreak();
            clearInterval(timer);
            return 0;
          }
          return newTime;
        });
        
        if (currentBreak) {
          const newProgress = ((currentBreak.duration - timeRemaining + 1) / currentBreak.duration) * 100;
          setProgress(newProgress);
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [breakInProgress, timeRemaining]);

  // Reminder modal
  if (showBreakReminder && currentBreak) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-background/90 border border-purple-500/20 rounded-lg max-w-md w-full mx-4 overflow-hidden relative">
          {/* Home page style corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-purple-500/40"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-purple-500/40"></div>
          
          {/* Home page style energy lines */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
          <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
          
          {/* Home page style energy glow */}
          <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-purple-500/5 filter blur-3xl"></div>
          
          <div className="p-6 relative z-10">
            <h3 className="text-xl font-gaming mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-white">Time for a Quick Break!</h3>
            <p className="text-gray-300 mb-4">You've been studying for {studyDuration} minutes. Taking short breaks improves retention and focus.</p>
            
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 relative mr-4 overflow-hidden rounded-md bg-background/80 border border-purple-500/30 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10"></div>
                <div className="relative z-10 flex items-center justify-center">
                  {/* Placeholder for animation/icon - will be replaced with actual SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-purple-500">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12" y2="16"></line>
                  </svg>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-white">{currentBreak.title}</h4>
                <p className="text-sm text-gray-400">{currentBreak.duration} seconds</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-6">{currentBreak.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {currentBreak.benefits.map((benefit, idx) => (
                <span key={idx} className="text-xs bg-purple-500/10 text-purple-300 rounded-full px-3 py-1 border border-purple-500/20">
                  {benefit}
                </span>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                className="flex-1 bg-background/80 hover:bg-purple-950/80 border border-purple-500/40 hover:border-purple-400/60 text-purple-400 hover:text-purple-300 transition-all duration-300"
                onClick={skipBreak}
              >
                Later
              </Button>
              <Button 
                className="flex-1 bg-background/80 hover:bg-purple-950/80 border border-purple-500/40 hover:border-purple-400/60 text-purple-400 hover:text-purple-300 transition-all duration-300"
                onClick={startBreak}
              >
                Take Break Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Break in progress
  if (breakInProgress && currentBreak) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-background/90 border border-purple-500/20 rounded-lg max-w-md w-full mx-4 overflow-hidden relative">
          {/* Home page style corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-purple-500/40"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-purple-500/40"></div>
          
          {/* Home page style energy lines */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
          <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
          
          <div className="p-6 relative z-10">
            <h3 className="text-xl font-gaming mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-white">{currentBreak.title}</h3>
            
            <div className="mx-auto mb-8 w-56 h-56 relative overflow-hidden rounded-full bg-background/40 border border-purple-500/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10"></div>
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* This will be replaced with the actual animation SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-24 h-24 text-purple-400 animate-pulse">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12" y2="16"></line>
                </svg>
                <div className="text-2xl font-gaming mt-4 text-white">{timeRemaining}s</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-4 text-center">{currentBreak.description}</p>
            
            <Progress value={progress} className="mb-6 h-2 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400" 
                style={{ width: `${progress}%` }}
              />
            </Progress>
            
            <Button 
              className="w-full bg-background/80 hover:bg-purple-950/80 border border-purple-500/40 hover:border-purple-400/60 text-purple-400 hover:text-purple-300 transition-all duration-300"
              onClick={completeBreak}
            >
              Complete Early
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No active modal - return null
  return null;
}