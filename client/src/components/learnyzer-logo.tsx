import React from "react";

export const LearnyzerLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 500" 
      className={className}
    >
      {/* Circular outline */}
      <circle cx="250" cy="250" r="200" fill="none" stroke="url(#circleGradient)" strokeWidth="15" strokeDasharray="405 145" />
      <circle cx="250" cy="250" r="150" fill="none" stroke="url(#circleGradient)" strokeWidth="10" strokeDasharray="300 100" />
      
      {/* Connection nodes */}
      <circle cx="250" cy="50" r="15" fill="#47c1d6" />
      <circle cx="250" cy="50" r="7" fill="#0a2a42" />
      
      <circle cx="450" cy="250" r="15" fill="#4af3c0" />
      <circle cx="450" cy="250" r="7" fill="#0a2a42" />
      
      <circle cx="250" cy="450" r="15" fill="#47c1d6" />
      <circle cx="250" cy="450" r="7" fill="#0a2a42" />
      
      <circle cx="50" cy="250" r="15" fill="#4af3c0" />
      <circle cx="50" cy="250" r="7" fill="#0a2a42" />
      
      {/* Digital connection line */}
      <line x1="340" y1="250" x2="450" y2="250" stroke="#4af3c0" strokeWidth="3" />
      
      {/* Open Book Icon */}
      <g transform="translate(170, 170) scale(1.6)">
        {/* Book Pages */}
        <path 
          d="M50,80 L50,30 C50,30 65,20 80,30 C95,20 110,30 110,30 L110,80 C110,80 95,70 80,80 C65,70 50,80 50,80 Z" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="3" 
        />
        
        {/* Book Spine */}
        <path d="M80,30 L80,80" fill="none" stroke="#ffffff" strokeWidth="3" />
        
        {/* Book Cover with gradient */}
        <path 
          d="M50,80 L50,30 C50,30 65,20 80,30 L80,80 C65,70 50,80 50,80 Z" 
          fill="url(#bookLeftGradient)" 
        />
        
        <path 
          d="M110,80 L110,30 C110,30 95,20 80,30 L80,80 C95,70 110,80 110,80 Z" 
          fill="url(#bookRightGradient)" 
        />
      </g>
      
      {/* Gradients definitions */}
      <defs>
        <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#47c1d6" />
          <stop offset="100%" stopColor="#4af3c0" />
        </linearGradient>
        
        <linearGradient id="bookLeftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#47c1d6" />
          <stop offset="100%" stopColor="#47c1d6" />
        </linearGradient>
        
        <linearGradient id="bookRightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#47c1d6" />
          <stop offset="100%" stopColor="#4af3c0" />
        </linearGradient>
      </defs>
    </svg>
  );
};