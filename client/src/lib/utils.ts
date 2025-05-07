import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

export function formatTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  
  return Math.floor(seconds) + " seconds ago";
}

export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

export function getRankColor(rank: string): string {
  const rankLower = rank.toLowerCase();
  
  if (rankLower.includes('bronze')) return 'from-gray-600 to-gray-700';
  if (rankLower.includes('silver')) return 'from-gray-300 to-gray-400';
  if (rankLower.includes('gold')) return 'from-yellow-400 to-yellow-600';
  if (rankLower.includes('platinum')) return 'from-teal-400 to-teal-600';
  if (rankLower.includes('diamond')) return 'from-blue-400 to-blue-600';
  if (rankLower.includes('heroic') || rankLower.includes('elite')) return 'from-purple-400 to-purple-600';
  if (rankLower.includes('master')) return 'from-red-400 to-red-600';
  if (rankLower.includes('grandmaster')) return 'from-rose-400 via-purple-500 to-indigo-600';
  
  return 'from-gray-600 to-gray-700';
}

export function getProgressColor(subject: string): string {
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('math')) return 'bg-primary-600';
  if (subjectLower.includes('physics')) return 'bg-info-600';
  if (subjectLower.includes('chemistry')) return 'bg-success-600';
  if (subjectLower.includes('biology')) return 'bg-warning-600';
  
  return 'bg-primary-600';
}

export function getSubjectIcon(subject: string): string {
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('math')) return 'ri-function-line';
  if (subjectLower.includes('physics')) return 'ri-rocket-line';
  if (subjectLower.includes('chemistry')) return 'ri-test-tube-line';
  if (subjectLower.includes('biology')) return 'ri-seedling-line';
  if (subjectLower.includes('history')) return 'ri-book-open-line';
  if (subjectLower.includes('geography')) return 'ri-earth-line';
  if (subjectLower.includes('language')) return 'ri-translate-2';
  if (subjectLower.includes('computer')) return 'ri-code-s-slash-line';
  
  return 'ri-book-open-line';
}

export function getBattleTypeIcon(type: string): string {
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('1v1')) return 'ri-sword-line';
  if (typeLower.includes('2v2')) return 'ri-team-line';
  if (typeLower.includes('3v3')) return 'ri-group-line';
  if (typeLower.includes('4v4')) return 'ri-community-line';
  
  return 'ri-sword-line';
}

export function getAIToolIcon(tool: string): string {
  const toolLower = tool.toLowerCase();
  
  if (toolLower.includes('note')) return 'ri-file-text-line';
  if (toolLower.includes('check')) return 'ri-question-answer-line';
  if (toolLower.includes('flash')) return 'ri-flashcard-line';
  if (toolLower.includes('performance') || toolLower.includes('insight')) return 'ri-line-chart-line';
  if (toolLower.includes('cheat')) return 'ri-file-list-3-line';
  if (toolLower.includes('summary')) return 'ri-file-reduce-line';
  
  return 'ri-robot-line';
}
