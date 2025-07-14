import { Brain } from "lucide-react";

interface LogoProps {
  className?: string;
  showIcon?: boolean;
  iconOnly?: boolean;
}

export function Logo({ className = "", showIcon = true, iconOnly = false }: LogoProps) {
  if (iconOnly) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] flex items-center justify-center shadow-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] opacity-50 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showIcon && (
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] flex items-center justify-center shadow-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] opacity-50 animate-pulse"></div>
        </div>
      )}
      <div className="flex flex-col">
        <span 
          className="text-2xl font-black tracking-tight"
          style={{
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Learnyzer
        </span>
        <span className="text-xs text-gray-400 -mt-1">AI-Powered Exam Prep</span>
      </div>
    </div>
  );
}