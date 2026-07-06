import React from 'react';

interface OuateElseLogoProps {
  className?: string;
  size?: number | string;
}

export const OuateElseLogo: React.FC<OuateElseLogoProps> = ({ className = '', size = '100%' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients for the house structure & wave */}
        <linearGradient id="logoBlueGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B3C5D" /> {/* Deep dark blue */}
          <stop offset="50%" stopColor="#1D5F8A" />
          <stop offset="100%" stopColor="#328CC1" /> {/* Lighter cyan/blue */}
        </linearGradient>

        <linearGradient id="skyGrad" x1="40" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2f1fc" />
        </linearGradient>

        {/* Soft shadow for the cloud for a premium layered look */}
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0b3c5d" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* House contour (with roof, chimney and base integration) */}
      <path
        d="M 50 14 
           L 84 41 
           C 85.5 42.2 86 44 85 45.5
           C 84.5 46.2 83.8 46.5 83 46.5
           L 83 75
           C 83 76 82.5 76.5 81.5 76.5
           L 72.5 76.5
           C 71 76.5 70 75 70 73.5
           L 70 46.5
           L 17 46.5
           C 15.5 46.5 14.5 45 15.2 43.5
           L 50 14 Z"
        fill="url(#logoBlueGrad)"
      />

      {/* Chimney on the right of the roof */}
      <path
        d="M 72 23 
           L 72 17 
           C 72 16 73 15 74 15 
           L 79 15 
           C 80 15 81 16 81 17 
           L 81 30 Z"
        fill="url(#logoBlueGrad)"
      />

      {/* Inner house frame */}
      <path
        d="M 50 24
           L 74 43.5
           L 74 69
           L 66 69
           L 66 43.5
           L 50 31
           L 34 43.5
           L 34 69
           L 26 69
           L 26 43.5
           Z"
        fill="#ffffff"
        opacity="0.15"
      />

      {/* Main white fluff cloud inside */}
      <path
        d="M 40 68 
           C 34 68 31 62 35 56 
           C 33 50 40 44 46 47 
           C 49 42 58 42 61 47 
           C 66 44 71 49 70 55 
           C 74 60 71 68 64 68 
           Z"
        fill="url(#skyGrad)"
        filter="url(#softShadow)"
      />

      {/* Elegant swooshing bottom wave/loop that curls in from the left and frames the bottom */}
      <path
        d="M 12 70
           C 25 55, 55 55, 68 66
           C 78 74, 86 76, 88 72
           C 90 68, 88 64, 82 62
           C 76 60, 68 64, 66 66
           C 64 68, 62 66, 63 64
           C 66 58, 78 52, 86 55
           C 94 58, 96 68, 92 76
           C 88 84, 76 82, 64 74
           C 54 66, 26 64, 15 78
           C 14 79.2 12 78.5 12 77
           Z"
        fill="url(#logoBlueGrad)"
      />

      {/* A lighter blue accent curve directly inside the wave for matching the image's dynamic gradient glow */}
      <path
        d="M 16 74
           C 27 63, 53 62, 65 72
           C 74 80, 81 81, 84 78"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
};
