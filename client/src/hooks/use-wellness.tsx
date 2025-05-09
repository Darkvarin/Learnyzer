import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { WellnessPreference, WellnessBreak } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WellnessStats {
  totalBreaks: number;
  totalBreakSeconds: number;
  breaksByType: Record<string, number>;
  recentBreaksCount: number;
}

export function useWellness() {
  const {
    data: preferences,
    isLoading: isLoadingPreferences,
    error: preferencesError
  } = useQuery({
    queryKey: ["/api/wellness/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/preferences");
      if (!res.ok) {
        throw new Error("Failed to fetch wellness preferences");
      }
      return await res.json();
    },
    retry: 1
  });

  const {
    data: history,
    isLoading: isLoadingHistory,
    error: historyError
  } = useQuery({
    queryKey: ["/api/wellness/breaks/history"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/breaks/history");
      if (!res.ok) {
        throw new Error("Failed to fetch wellness history");
      }
      return await res.json() as WellnessBreak[];
    },
    retry: 1
  });

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ["/api/wellness/stats"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch wellness stats");
      }
      return await res.json() as WellnessStats;
    },
    retry: 1
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: {
      eyeStrain: boolean;
      posture: boolean;
      hydration: boolean;
      movement: boolean;
      breathing: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/wellness/preferences", newPreferences);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your wellness preferences have been updated.",
      });
      
      // Invalidate the preferences query to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/wellness/preferences"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logBreakMutation = useMutation({
    mutationFn: async (breakData: {
      breakId: string;
      breakType: string;
      duration: number;
    }) => {
      const res = await apiRequest("POST", "/api/wellness/breaks", breakData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Break logged",
        description: `You earned ${data.xpEarned} XP for taking a wellness break!`,
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/wellness/breaks/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wellness/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to log break",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    preferences: preferences || {
      eyeStrain: true,
      posture: true,
      hydration: true,
      movement: true,
      breathing: true
    },
    history,
    stats,
    isLoadingPreferences,
    isLoadingHistory,
    isLoadingStats,
    preferencesError,
    historyError, 
    statsError,
    savePreferences: savePreferencesMutation.mutate,
    isSavingPreferences: savePreferencesMutation.isPending,
    logBreak: logBreakMutation.mutate,
    isLoggingBreak: logBreakMutation.isPending
  };
}