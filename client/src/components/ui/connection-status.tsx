import React from 'react';
import { useRealTime } from '@/contexts/real-time-context';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectionStatusProps {
  className?: string;
  showTooltip?: boolean;
  iconSize?: number;
}

export function ConnectionStatus({
  className,
  showTooltip = true,
  iconSize = 16
}: ConnectionStatusProps) {
  const { connected, reconnecting } = useRealTime();

  const StatusIcon = reconnecting
    ? Loader2
    : connected
      ? Wifi
      : WifiOff;

  const statusText = reconnecting
    ? 'Reconnecting...'
    : connected
      ? 'Connected'
      : 'Disconnected';

  const statusColor = reconnecting
    ? 'text-yellow-500'
    : connected
      ? 'text-green-500'
      : 'text-red-500';

  const statusIndicator = (
    <div className={cn("flex items-center gap-2", className)}>
      <StatusIcon
        className={cn("transition-all", statusColor, {
          "animate-spin": reconnecting
        })}
        size={iconSize}
      />
      {showTooltip ? null : <span className={statusColor}>{statusText}</span>}
    </div>
  );

  if (!showTooltip) {
    return statusIndicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {statusIndicator}
        </TooltipTrigger>
        <TooltipContent>
          <p>Real-time system: {statusText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}