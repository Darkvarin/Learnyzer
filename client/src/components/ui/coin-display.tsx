import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";

interface CoinDisplayProps {
  compact?: boolean;
}

export function CoinDisplay({ compact = false }: CoinDisplayProps) {
  const { data: coinData, isLoading } = useQuery({
    queryKey: ["/api/coins"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 ${compact ? 'text-sm' : 'text-base'}`}>
        <Coins className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500 animate-pulse`} />
        <span className="text-muted-foreground">---</span>
      </div>
    );
  }

  const coins = coinData?.coins || 0;

  return (
    <div className={`flex items-center gap-1 ${compact ? 'text-sm' : 'text-base'} bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-2 py-1 rounded-md border border-yellow-500/20`}>
      <Coins className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500`} />
      <span className="font-semibold text-yellow-400">{coins.toLocaleString()}</span>
      {!compact && <span className="text-xs text-yellow-300/80">coins</span>}
    </div>
  );
}