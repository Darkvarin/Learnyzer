import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Shield, Zap, Star, Trophy, ChevronUp, AlertCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getIconByVariant = (title: string, variant: string) => {
    // Default icon based on variant
    if (variant === 'achievement') return <Star className="h-5 w-5 text-amber-300 animate-pulse" />
    if (variant === 'level') return <ChevronUp className="h-5 w-5 text-cyan-300 animate-pulse" />
    if (variant === 'reward') return <Trophy className="h-5 w-5 text-emerald-300 animate-pulse" />
    if (variant === 'rank') return <Shield className="h-5 w-5 text-fuchsia-300 animate-pulse" />
    if (variant === 'destructive') return <AlertCircle className="h-5 w-5 text-red-300 animate-pulse" />
    
    // Default and specific title-based icons
    if (title?.includes('XP') || title?.includes('Level')) return <ChevronUp className="h-5 w-5 text-cyan-300 animate-pulse" />
    if (title?.includes('Achievement') || title?.includes('Unlocked')) return <Star className="h-5 w-5 text-amber-300 animate-pulse" />
    if (title?.includes('Reward')) return <Trophy className="h-5 w-5 text-emerald-300 animate-pulse" />
    if (title?.includes('Rank') || title?.includes('Promoted')) return <Shield className="h-5 w-5 text-fuchsia-300 animate-pulse" />
    
    // Default for anything else
    return <Zap className="h-5 w-5 text-primary animate-pulse" />
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = getIconByVariant(title || '', variant as string || 'default')
        
        // Determine which variant to use based on title if not explicitly set
        let effectiveVariant = variant || 'default'
        if (!variant) {
          if (title?.includes('Level') || title?.includes('XP')) effectiveVariant = 'level'
          else if (title?.includes('Achievement') || title?.includes('Unlocked')) effectiveVariant = 'achievement'
          else if (title?.includes('Reward')) effectiveVariant = 'reward'
          else if (title?.includes('Rank') || title?.includes('Promoted')) effectiveVariant = 'rank'
        }
        
        return (
          <Toast key={id} variant={effectiveVariant as any} {...props}>
            <div className="relative flex items-start gap-2 max-w-[calc(100%-24px)]">
              {/* Hexagonal icon container with Solo Leveling glow effect */}
              <div className="relative hexagon-container w-9 h-9 flex-shrink-0 mr-1">
                <div className="absolute inset-0 hexagon-shape bg-gradient-to-r from-primary/30 to-indigo-600/30 animate-pulse"></div>
                <div className="absolute inset-[2px] hexagon-shape bg-black/80 z-10 flex items-center justify-center">
                  {icon}
                </div>
              </div>
              
              <div className="grid gap-1">
                {title && (
                  <ToastTitle className="font-gaming tracking-wide text-base flex items-center">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-sm opacity-90 max-w-full overflow-hidden text-ellipsis">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
