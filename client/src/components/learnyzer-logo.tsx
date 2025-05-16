import React from "react";

export const LearnyzerLogo: React.FC = () => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* Dark blue background */}
      <circle cx="100" cy="100" r="95" fill="#0a2a42" />
      
      {/* Circular gradient rings */}
      <circle cx="100" cy="100" r="85" fill="none" stroke="#47c1d6" strokeWidth="8" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="#4af3c0" strokeWidth="4" />
      
      {/* Connection nodes */}
      <circle cx="100" cy="15" r="6" fill="#47c1d6" />
      <circle cx="185" cy="100" r="6" fill="#4af3c0" />
      <circle cx="100" cy="185" r="6" fill="#47c1d6" />
      <circle cx="15" cy="100" r="6" fill="#4af3c0" />
      
      {/* Connection line */}
      <line x1="130" y1="100" x2="179" y2="100" stroke="#4af3c0" strokeWidth="3" />
      
      {/* Digital dots */}
      <g>
        <circle cx="145" cy="70" r="2" fill="white" />
        <circle cx="150" cy="75" r="2" fill="white" />
        <circle cx="155" cy="80" r="2" fill="white" />
        
        <circle cx="60" cy="145" r="2" fill="#47c1d6" />
        <circle cx="55" cy="140" r="2" fill="#47c1d6" />
        <circle cx="50" cy="135" r="2" fill="#47c1d6" />
      </g>
      
      {/* Small digital elements */}
      <g transform="translate(30, 60)">
        <rect x="0" y="0" width="3" height="10" fill="#47c1d6" />
        <rect x="5" y="0" width="3" height="10" fill="#47c1d6" />
        <rect x="10" y="4" width="3" height="6" fill="#47c1d6" />
      </g>
      
      {/* Book icon */}
      <g transform="translate(55, 55)">
        <path d="M15,90 L15,30 C15,30 40,15 45,30 C50,15 75,30 75,30 L75,90 C75,90 50,75 45,90 C40,75 15,90 15,90 Z" 
              fill="none" stroke="white" strokeWidth="3" />
        <path d="M45,30 L45,90" fill="none" stroke="white" strokeWidth="2" />
        <path d="M15,90 L15,30 C15,30 40,15 45,30 L45,90 C40,75 15,90 15,90 Z" fill="#47c1d6" />
        <path d="M75,90 L75,30 C75,30 50,15 45,30 L45,90 C50,75 75,90 75,90 Z" fill="#4af3c0" />
      </g>
    </svg>
  );
};