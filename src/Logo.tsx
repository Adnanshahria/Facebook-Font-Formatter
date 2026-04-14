import React from 'react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        {/* Glow for the background bubble */}
        <filter id="logoDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#4F46E5" floodOpacity="0.4" />
        </filter>
        
        {/* Main Bubble Gradient */}
        <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>

        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
      </defs>

      {/* Decorative Outer Aura */}
      <circle cx="50" cy="50" r="45" fill="#6366F1" opacity="0.1" />

      {/* Background Social Chat Bubble representing "Social" Platform */}
      <path 
        d="M 18 25 
           h 64 
           a 12 12 0 0 1 12 12 
           v 36 
           a 12 12 0 0 1 -12 12 
           h -25
           l -15 15
           v -15
           h -24
           a 12 12 0 0 1 -12 -12
           v -36
           a 12 12 0 0 1 12 -12
           z"
        fill="url(#bubbleGrad)"
        filter="url(#logoDropShadow)"
        className="transition-all duration-500 hover:brightness-110 origin-center"
      />

      {/* Glassy Top Highlight for Premium Feel */}
      <path 
        d="M 18 25 h 64 a 12 12 0 0 1 12 12 v 15 c -30 10 -60 5 -76 -5 v -10 a 12 12 0 0 1 12 -12 z"
        fill="white"
        opacity="0.12"
      />

      {/* Typography: "Aa" universally representing Fonts/Typographical Formatting */}
      <text 
        x="45" 
        y="68" 
        fontFamily="Georgia, 'Times New Roman', serif" 
        fontSize="40" 
        fontWeight="800" 
        fontStyle="italic" 
        fill="url(#textGrad)" 
        textAnchor="middle"
        letterSpacing="-1"
      >
        <tspan>A</tspan>
        <tspan dx="1" fontSize="34">a</tspan>
      </text>

      {/* Magic Sparkle representing formatting, generation, and transformation */}
      <path 
        d="M 75 18 C 75 26 78 29 86 29 C 78 29 75 32 75 40 C 75 32 72 29 64 29 C 72 29 75 26 75 18 Z" 
        fill="#34D399" 
        className="animate-pulse origin-center"
        style={{ animationDuration: '2s' }}
      />
      <circle 
        cx="86" cy="44" r="2.5" 
        fill="#FDE047" 
        className="animate-pulse origin-center" 
        style={{ animationDelay: '0.5s', animationDuration: '2s' }}
      />
      <circle 
        cx="70" cy="50" r="1.5" 
        fill="#A855F7" 
      />
    </svg>
  );
}
