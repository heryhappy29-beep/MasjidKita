import React from 'react';

interface MosqueLogoProps {
  className?: string;
  size?: number | string;
}

export const MosqueLogo: React.FC<MosqueLogoProps> = ({ 
  className = 'w-10 h-10', 
  size 
}) => {
  return (
    <svg 
      viewBox="0 0 400 400" 
      className={className} 
      style={size ? { width: size, height: size } : undefined}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Exact Masjid As Shomad Emerald Green Gradient */}
        <radialGradient id="asShomadGreen" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#0a885b" />
          <stop offset="85%" stopColor="#007248" />
          <stop offset="100%" stopColor="#005d3a" />
        </radialGradient>

        {/* Text curve for AS-SHOMAD */}
        <path id="logoTextArc" d="M 68 256 A 140 140 0 0 1 332 256" fill="none" />
      </defs>

      {/* Outer Border Double Rings */}
      <circle cx="200" cy="200" r="192" stroke="#007248" strokeWidth="7" />
      <circle cx="200" cy="200" r="183" stroke="#ffffff" strokeWidth="3" />
      <circle cx="200" cy="200" r="178" stroke="#007248" strokeWidth="4" />

      {/* Main Solid Green Badge Background */}
      <circle cx="200" cy="200" r="172" fill="url(#asShomadGreen)" />

      {/* Inner Decorative Dotted Ring */}
      <circle 
        cx="200" 
        cy="200" 
        r="157" 
        stroke="#ffffff" 
        strokeWidth="4" 
        strokeDasharray="2 7.8" 
        strokeLinecap="round" 
      />
      <circle cx="200" cy="200" r="147" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.75" />

      {/* White Central Sky Arch for Mosque Silhouette */}
      <circle cx="200" cy="180" r="96" fill="#ffffff" />

      {/* Mosque Silhouette (Emerald Green #007248) */}
      <g fill="#007248">
        {/* Central Dome Body (Onion / Islamic Dome Shape) */}
        <path d="M 148 238 L 148 206 C 148 178 170 162 200 144 C 230 162 252 178 252 206 L 252 238 Z" />

        {/* Dome Finial & Crescent Moon */}
        <rect x="198.5" y="128" width="3" height="18" fill="#007248" />
        <path 
          d="M 197 124 A 8 8 0 1 1 205 137 A 6.5 6.5 0 1 0 197 124 Z" 
          fill="#007248" 
        />

        {/* Left Minaret */}
        {/* Main Shaft */}
        <rect x="122" y="150" width="17" height="88" rx="1" />
        {/* Balcony 1 (Lower) */}
        <rect x="118" y="190" width="25" height="6" rx="2" fill="#ffffff" />
        <rect x="120" y="189" width="21" height="4" rx="1" fill="#007248" />
        {/* Balcony 2 (Upper) */}
        <rect x="119" y="154" width="23" height="5" rx="1.5" fill="#ffffff" />
        <rect x="121" y="153" width="19" height="3" rx="1" fill="#007248" />
        {/* Minaret Cupola & Pointed Finial */}
        <path d="M 123 150 C 123 138 130.5 128 130.5 116 C 130.5 128 138 138 138 150 Z" />
        <circle cx="130.5" cy="114" r="2.5" />

        {/* Right Minaret */}
        {/* Main Shaft */}
        <rect x="261" y="150" width="17" height="88" rx="1" />
        {/* Balcony 1 (Lower) */}
        <rect x="257" y="190" width="25" height="6" rx="2" fill="#ffffff" />
        <rect x="259" y="189" width="21" height="4" rx="1" fill="#007248" />
        {/* Balcony 2 (Upper) */}
        <rect x="258" y="154" width="23" height="5" rx="1.5" fill="#ffffff" />
        <rect x="260" y="153" width="19" height="3" rx="1" fill="#007248" />
        {/* Minaret Cupola & Pointed Finial */}
        <path d="M 262 150 C 262 138 269.5 128 269.5 116 C 269.5 128 277 138 277 150 Z" />
        <circle cx="269.5" cy="114" r="2.5" />
      </g>

      {/* Mask Curve under dome for text frame */}
      <path 
        d="M 80 242 C 128 220 272 220 320 242 L 324 274 C 265 298 135 298 76 274 Z" 
        fill="#007248" 
      />

      {/* Arched Text: AS-SHOMAD */}
      <text 
        fontFamily="'Montserrat', 'Arial Black', -apple-system, sans-serif" 
        fontSize="34" 
        fontWeight="900" 
        fill="#ffffff" 
        letterSpacing="2.5" 
        textAnchor="middle"
      >
        <textPath href="#logoTextArc" startOffset="50%" textAnchor="middle">
          AS-SHOMAD
        </textPath>
      </text>

      {/* Subtitle: GRIYA PRAJA with ornamental dots */}
      <g transform="translate(0, 281)">
        {/* Left Dots */}
        <circle cx="106" cy="-1" r="3.5" fill="#ffffff" />
        <circle cx="116" cy="-1" r="2.5" fill="#ffffff" />
        <circle cx="125" cy="-1" r="1.8" fill="#ffffff" />

        {/* Text */}
        <text 
          x="200" 
          y="5" 
          fontFamily="'Montserrat', 'Arial Black', -apple-system, sans-serif" 
          fontSize="20" 
          fontWeight="800" 
          fill="#ffffff" 
          letterSpacing="4" 
          textAnchor="middle"
        >
          GRIYA PRAJA
        </text>

        {/* Right Dots */}
        <circle cx="275" cy="-1" r="1.8" fill="#ffffff" />
        <circle cx="284" cy="-1" r="2.5" fill="#ffffff" />
        <circle cx="294" cy="-1" r="3.5" fill="#ffffff" />
      </g>

      {/* Bottom Concentric Arcs */}
      <path 
        d="M 94 314 C 144 340 256 340 306 314" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="2.5" 
        strokeOpacity="0.9" 
      />
      <path 
        d="M 112 330 C 152 350 248 350 288 330" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        strokeOpacity="0.7" 
      />
    </svg>
  );
};
