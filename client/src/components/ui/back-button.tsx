import { ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { useLocation } from "wouter";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  label?: string;
}

export function BackButton({ 
  fallbackPath = "/dashboard", 
  className = "", 
  variant = "ghost",
  label = "Back"
}: BackButtonProps) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    // Try to go back in browser history first
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to specified path if no history
      navigate(fallbackPath);
    }
  };

  return (
    <Button 
      variant={variant}
      onClick={handleBack}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}