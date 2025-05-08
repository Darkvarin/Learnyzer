import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "clip-path-hexagon glassmorphism border border-primary/30 text-foreground shadow-[0_0_15px_rgba(76,29,149,0.15)] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-primary/5 before:to-purple-900/10 before:opacity-30 before:backdrop-blur-sm before:animate-pulse",
        
        destructive:
          "clip-path-hexagon destructive group border-red-700 bg-black/70 text-destructive-foreground shadow-[0_0_20px_rgba(220,38,38,0.35)] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-red-900/20 before:to-red-700/5 after:absolute after:inset-0 after:clip-path-hexagon-outline after:border-2 after:border-red-700/70 after:content-['']",
        
        achievement: 
          "clip-path-hexagon group border-amber-500/50 bg-black/75 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.4)] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-yellow-900/20 before:to-amber-700/5 after:absolute after:inset-0 after:clip-path-hexagon-outline after:border-2 after:border-amber-500/70 after:content-[''] after:animate-pulse-slow",
        
        level: 
          "clip-path-hexagon group border-cyan-500/50 bg-black/75 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.4)] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-cyan-900/20 before:to-blue-700/5 after:absolute after:inset-0 after:clip-path-hexagon-outline after:border-2 after:border-cyan-500/70 after:content-[''] after:animate-pulse-slow",
        
        reward: 
          "clip-path-hexagon group border-emerald-500/50 bg-black/75 text-emerald-200 shadow-[0_0_25px_rgba(5,150,105,0.4)] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-emerald-900/20 before:to-green-700/5 after:absolute after:inset-0 after:clip-path-hexagon-outline after:border-2 after:border-emerald-500/70 after:content-[''] after:animate-pulse-slow",
        
        rank: 
          "clip-path-hexagon group border-fuchsia-500/50 bg-black/75 text-fuchsia-200 shadow-[0_0_25px_rgba(217,70,239,0.4)] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-fuchsia-900/20 before:to-purple-700/5 after:absolute after:inset-0 after:clip-path-hexagon-outline after:border-2 after:border-fuchsia-500/70 after:content-[''] after:animate-pulse-slow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      "group-[.achievement]:border-amber-500/40 group-[.achievement]:text-amber-300 group-[.achievement]:hover:border-amber-500/70 group-[.achievement]:hover:bg-amber-500/20 group-[.achievement]:focus:ring-amber-500",
      "group-[.level]:border-cyan-500/40 group-[.level]:text-cyan-300 group-[.level]:hover:border-cyan-500/70 group-[.level]:hover:bg-cyan-500/20 group-[.level]:focus:ring-cyan-500",
      "group-[.reward]:border-emerald-500/40 group-[.reward]:text-emerald-300 group-[.reward]:hover:border-emerald-500/70 group-[.reward]:hover:bg-emerald-500/20 group-[.reward]:focus:ring-emerald-500",
      "group-[.rank]:border-fuchsia-500/40 group-[.rank]:text-fuchsia-300 group-[.rank]:hover:border-fuchsia-500/70 group-[.rank]:hover:bg-fuchsia-500/20 group-[.rank]:focus:ring-fuchsia-500",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      "group-[.achievement]:text-amber-300 group-[.achievement]:hover:text-amber-50 group-[.achievement]:focus:ring-amber-400 group-[.achievement]:focus:ring-offset-amber-600",
      "group-[.level]:text-cyan-300 group-[.level]:hover:text-cyan-50 group-[.level]:focus:ring-cyan-400 group-[.level]:focus:ring-offset-cyan-600",
      "group-[.reward]:text-emerald-300 group-[.reward]:hover:text-emerald-50 group-[.reward]:focus:ring-emerald-400 group-[.reward]:focus:ring-offset-emerald-600",
      "group-[.rank]:text-fuchsia-300 group-[.rank]:hover:text-fuchsia-50 group-[.rank]:focus:ring-fuchsia-400 group-[.rank]:focus:ring-offset-fuchsia-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-base font-gaming tracking-wide relative", 
      "group-[.achievement]:text-amber-200 group-[.achievement]:font-semibold group-[.achievement]:drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]",
      "group-[.level]:text-cyan-200 group-[.level]:font-semibold group-[.level]:drop-shadow-[0_0_3px_rgba(6,182,212,0.5)]",
      "group-[.reward]:text-emerald-200 group-[.reward]:font-semibold group-[.reward]:drop-shadow-[0_0_3px_rgba(5,150,105,0.5)]",
      "group-[.rank]:text-fuchsia-200 group-[.rank]:font-semibold group-[.rank]:drop-shadow-[0_0_3px_rgba(217,70,239,0.5)]",
      className
    )}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      "text-sm opacity-90 relative",
      "group-[.achievement]:text-amber-100/90",
      "group-[.level]:text-cyan-100/90",
      "group-[.reward]:text-emerald-100/90",
      "group-[.rank]:text-fuchsia-100/90",
      className
    )}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
