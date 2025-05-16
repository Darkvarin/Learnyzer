import React from 'react';

export const LearnyzerLogo = () => {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* Main circle */}
      <circle cx="100" cy="100" r="85" fill="#0a2a42" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#47c1d6" strokeWidth="3" />
      <circle cx="100" cy="100" r="65" fill="none" stroke="#4af3c0" strokeWidth="2" />
      
      {/* Nodes and connection points */}
      <circle cx="100" cy="20" r="5" fill="#47c1d6" />
      <circle cx="180" cy="100" r="5" fill="#4af3c0" />
      <circle cx="100" cy="180" r="5" fill="#47c1d6" />
      <circle cx="20" cy="100" r="5" fill="#4af3c0" />
      
      {/* Digital dots and connection lines */}
      <line x1="135" y1="100" x2="175" y2="100" stroke="#4af3c0" strokeWidth="2" />
      
      {/* Open book icon */}
      <g transform="translate(60, 60)">
        <path d="M10,70 L10,30 C10,30 30,20 40,30 C50,20 70,30 70,30 L70,70 C70,70 50,60 40,70 C30,60 10,70 10,70 Z" 
              fill="none" stroke="white" strokeWidth="2" />
        <path d="M40,30 L40,70" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M10,70 L10,30 C10,30 30,20 40,30 L40,70 C30,60 10,70 10,70 Z" fill="#47c1d6" />
        <path d="M70,70 L70,30 C70,30 50,20 40,30 L40,70 C50,60 70,70 70,70 Z" fill="#4af3c0" />
      </g>
      
      {/* Small circuit elements */}
      <circle cx="150" cy="65" r="2" fill="white" />
      <circle cx="155" cy="70" r="2" fill="white" />
      <circle cx="160" cy="75" r="2" fill="white" />
      
      <circle cx="50" cy="135" r="2" fill="white" />
      <circle cx="45" cy="130" r="2" fill="white" />
      <circle cx="40" cy="125" r="2" fill="white" />
      
      <rect x="35" y="50" width="3" height="8" fill="#47c1d6" />
      <rect x="40" y="50" width="3" height="8" fill="#47c1d6" />
    </svg>
  );
};