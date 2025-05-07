import { useUser } from "@/contexts/user-context";
import { cn, formatXP } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function UserProfileCard() {
  const { user } = useUser();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
  });

  if (!user) return null;

  const calculateXpProgress = () => {
    if (!stats) return 0;
    const { currentXp, nextLevelXp } = stats;
    return Math.min(100, Math.round((currentXp / nextLevelXp) * 100));
  };

  return (
    <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border">
      <div className="bg-gradient-to-r from-primary-900/40 to-primary-700/40 backdrop-blur p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="rank-badge w-16 h-16">
              <div className="bg-dark-surface w-14 h-14 rounded-full flex items-center justify-center z-10">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold">
                    {user.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold font-gaming">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                {isLoading ? (
                  <Skeleton className="h-5 w-16" />
                ) : (
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-300 text-dark-surface text-xs font-bold px-2 py-0.5 rounded font-gaming">
                    {stats?.rank || "BRONZE I"}
                  </div>
                )}
                <span className="text-xs text-gray-400">{user.track}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Level</span>
              {isLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <span className="text-xl font-bold font-gaming">{stats?.level || 1}</span>
              )}
            </div>
            <div className="w-full md:w-48 mt-2">
              <div className="xp-bar">
                <div className="xp-progress" style={{ width: `${calculateXpProgress()}%` }}></div>
              </div>
              <div className="flex justify-between mt-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </>
                ) : (
                  <>
                    <span className="text-xs text-gray-400">{formatXP(stats?.currentXp || 0)} XP</span>
                    <span className="text-xs text-gray-400">{formatXP(stats?.nextLevelXp || 1000)} XP</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-card p-3 rounded-lg text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
            ) : (
              <div className="text-2xl font-bold font-gaming text-primary">{stats?.streakDays || 0}</div>
            )}
            <div className="text-xs text-gray-400 mt-1">Day Streak</div>
          </div>
          <div className="bg-dark-card p-3 rounded-lg text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
            ) : (
              <div className="text-2xl font-bold font-gaming text-success">{stats?.battlesWon || 0}</div>
            )}
            <div className="text-xs text-gray-400 mt-1">Battles Won</div>
          </div>
          <div className="bg-dark-card p-3 rounded-lg text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
            ) : (
              <div className="text-2xl font-bold font-gaming text-warning">{stats?.accuracy || "0%"}</div>
            )}
            <div className="text-xs text-gray-400 mt-1">Accuracy</div>
          </div>
          <div className="bg-dark-card p-3 rounded-lg text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
            ) : (
              <div className="text-2xl font-bold font-gaming text-info">{stats?.aiSessions || 0}</div>
            )}
            <div className="text-xs text-gray-400 mt-1">AI Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
