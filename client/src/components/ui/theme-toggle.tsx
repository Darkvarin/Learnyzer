import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";

export function ThemeToggle() {
  // Dark theme is enforced, no toggle functionality
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative h-10 w-10 group transition-all duration-300 cursor-default"
      disabled
    >
      <Moon className="h-5 w-5 text-primary" />
      <span className="sr-only">Dark theme</span>
      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
    </Button>
  );
}
