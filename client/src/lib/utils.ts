import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  BookOpen, 
  Code, 
  Globe, 
  Calculator, 
  Atom, 
  FlaskConical, 
  PenTool, 
  Clock,
  Binary,
  Building,
  Users,
  Sword,
  ShieldAlert,
  Swords,
  Trophy,
  Zap,
  BookText,
  FileCheck,
  BrainCircuit,
  Flashlight
} from "lucide-react";

/**
 * Combines classes with tailwind-merge
 * @param inputs - Class names to be combined
 * @returns Merged class names string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats XP numbers in a user-friendly way
 * @param xp - The XP value to format
 * @returns Formatted XP string
 */
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  } else {
    return xp.toString();
  }
}

/**
 * Format a number with commas
 * @param num - The number to format
 * @returns Formatted number string with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Get an icon for a specific subject
 * @param subject - The subject name
 * @returns The icon component for the subject
 */
export function getSubjectIcon(subject: string): React.ElementType {
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('math')) return Calculator;
  if (subjectLower.includes('physics')) return Atom;
  if (subjectLower.includes('chemistry')) return FlaskConical;
  if (subjectLower.includes('biology')) return Binary;
  if (subjectLower.includes('computer')) return Code;
  if (subjectLower.includes('history')) return Clock;
  if (subjectLower.includes('geography')) return Globe;
  if (subjectLower.includes('literature')) return BookOpen;
  if (subjectLower.includes('art')) return PenTool;
  if (subjectLower.includes('commerce')) return Building;
  if (subjectLower.includes('humanities')) return Users;
  
  // Default icon
  return BookOpen;
}

/**
 * Get an icon for a specific AI tool
 * @param toolName - The AI tool name
 * @returns The icon component for the AI tool
 */
export function getAIToolIcon(toolName: string): React.ElementType {
  const toolLower = toolName.toLowerCase();
  
  if (toolLower.includes('notes')) return BookText;
  if (toolLower.includes('check')) return FileCheck;
  if (toolLower.includes('flash')) return Flashlight;
  if (toolLower.includes('performance') || toolLower.includes('insight')) return BrainCircuit;
  
  // Default icon
  return Zap;
}

/**
 * Get an icon for a specific battle type
 * @param battleType - The battle type
 * @returns The icon component for the battle type
 */
export function getBattleTypeIcon(battleType: string): React.ElementType {
  const typeLower = battleType.toLowerCase();
  
  if (typeLower.includes('1v1')) return Sword;
  if (typeLower.includes('tournament')) return Trophy;
  if (typeLower.includes('team')) return Users;
  if (typeLower.includes('challenge')) return ShieldAlert;
  
  // Default icon
  return Swords;
}

/**
 * Get a color for the progress bar based on completion percentage
 * @param progress - Progress percentage (0-100)
 * @returns Tailwind CSS color classes
 */
export function getProgressColor(progress: number): string {
  if (progress < 25) return 'from-red-500 to-red-600';
  if (progress < 50) return 'from-orange-500 to-orange-600';
  if (progress < 75) return 'from-yellow-500 to-yellow-600';
  return 'from-green-500 to-green-600';
}

/**
 * Get a color for a specific rank
 * @param rank - The rank name
 * @returns Tailwind CSS color classes
 */
export function getRankColor(rank: string): string {
  const rankLower = rank.toLowerCase();
  
  if (rankLower.includes('bronze')) return 'text-[#CD7F32]';
  if (rankLower.includes('silver')) return 'text-[#C0C0C0]';
  if (rankLower.includes('gold')) return 'text-[#FFD700]';
  if (rankLower.includes('platinum')) return 'text-[#E5E4E2]';
  if (rankLower.includes('diamond')) return 'text-[#B9F2FF]';
  if (rankLower.includes('heroic')) return 'text-[#9D65C9]';
  if (rankLower.includes('elite')) return 'text-[#D565C9]';
  if (rankLower.includes('master')) return 'text-[#CC3363]';
  if (rankLower.includes('grandmaster')) return 'text-[#FF4500]';
  
  // Default color
  return 'text-primary';
}

/**
 * Get a safe color for AI tools to prevent CSS issues
 * @param color - The original color name
 * @returns A safe Tailwind CSS color
 */
export function getSafeColor(color: string | undefined): string {
  // Default safe colors that work well in UI
  const safeColors: Record<string, string> = {
    primary: "blue",
    secondary: "purple",
    success: "green",
    warning: "yellow",
    info: "sky",
    danger: "red",
    default: "gray"
  };
  
  if (!color || !safeColors[color]) {
    return safeColors.default;
  }
  
  return safeColors[color];
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - The date to format
 * @returns Formatted time string
 */
export function formatTimeSince(date: Date | string): string {
  const now = new Date();
  const pastDate = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return 'just now';
}