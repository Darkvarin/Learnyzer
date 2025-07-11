import { useQuery } from "@tanstack/react-query";

interface CoinDisplayProps {
  compact?: boolean;
  showHistory?: boolean;
}

export function CoinDisplay({ compact = false, showHistory = false }: CoinDisplayProps) {
  const { data: coins, isLoading } = useQuery({
    queryKey: ['/api/coins'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="w-4 h-4 bg-yellow-400/20 animate-pulse rounded"></div>
        <div className="w-8 h-4 bg-gray-600/20 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${compact ? 'text-sm' : 'text-base'}`}>
      <span className="text-yellow-400">🪙</span>
      <span className="font-semibold text-yellow-400">
        {coins?.coins?.toLocaleString() || '0'}
      </span>
      {!compact && (
        <span className="text-xs text-muted-foreground">coins</span>
      )}
    </div>
  );
}