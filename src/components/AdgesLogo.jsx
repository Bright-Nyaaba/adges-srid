import React, { useState, useId } from 'react';

export default function AdgesLogo({
  className = 'crest',
  size = 44,
  customLogoUrl = '',
  shape = 'circle',
  style = {}
}) {
  const [imgError, setImgError] = useState(false);
  const uid = useId().replace(/:/g, '');

  const borderRadius = shape === 'square' ? '0px' : shape === 'rounded' ? '8px' : '50%';
  // Default to official ADGES crest logo
  const logoSrc = customLogoUrl && customLogoUrl.trim() ? customLogoUrl : '/adges-logo-256.png?v=2';

  if (!imgError) {
    return (
      <img
        src={logoSrc}
        alt="ADGES Official Crest Logo"
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius,
          backgroundColor: '#FFFFFF',
          ...style
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Official ADGES Vector Crest Fallback
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: '#FFFFFF',
        flexShrink: 0,
        ...style
      }}
      aria-label="ADGES Logo Crest"
    >
      <defs>
        <path id={`top-arc-${uid}`} d="M 21 100 A 79 79 0 0 1 179 100" fill="none" />
        <path id={`bot-arc-${uid}`} d="M 179 100 A 79 79 0 0 1 21 100" fill="none" />
      </defs>

      {/* Outer Golden Concentric Borders */}
      <circle cx="100" cy="100" r="97" fill="#FFFFFF" stroke="#C5961E" strokeWidth="4" />
      <circle cx="100" cy="100" r="92" fill="#FFFFFF" stroke="#E2B734" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="69" fill="#FFFDF8" stroke="#E2B734" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="66" fill="#FFFDF8" stroke="#C5961E" strokeWidth="3" />

      {/* Ring Text: Association of Drilling & Geological Engineering Students */}
      <text
        fill="#321D0E"
        fontSize="9.8"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="1.2"
      >
        <textPath href={`#top-arc-${uid}`} startOffset="50%" textAnchor="middle">
          ASSOCIATION OF DRILLING &amp;
        </textPath>
      </text>

      <text
        fill="#321D0E"
        fontSize="8.4"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="0.8"
      >
        <textPath href={`#bot-arc-${uid}`} startOffset="50%" textAnchor="middle">
          GEOLOGICAL ENGINEERING STUDENTS
        </textPath>
      </text>

      {/* Side Diamond Markers */}
      <polygon points="12,100 16.5,94 21,100 16.5,106" fill="#C5961E" />
      <polygon points="179,100 183.5,94 188,100 183.5,106" fill="#C5961E" />

      {/* Inner Central Area: Crossed Rock Picks & Core Drill Bit */}
      <g id="crest-center">
        {/* Left Pickaxe Handle & Head */}
        <g transform="rotate(-35 100 92)">
          <rect x="97" y="58" width="6" height="62" rx="2" fill="#623C1E" stroke="#3D2512" strokeWidth="0.8" />
          {/* Pickaxe Head */}
          <path
            d="M 72 58 C 84 55, 116 55, 128 58 L 100 64 Z"
            fill="#3A2314"
            stroke="#201309"
            strokeWidth="1"
          />
          {/* Pick point and flat chisel */}
          <path d="M 72 58 L 66 61 L 75 60 Z" fill="#201309" />
          <rect x="126" y="57" width="3" height="4" fill="#201309" rx="0.5" />
        </g>

        {/* Right Pickaxe Handle & Head */}
        <g transform="rotate(35 100 92)">
          <rect x="97" y="58" width="6" height="62" rx="2" fill="#623C1E" stroke="#3D2512" strokeWidth="0.8" />
          {/* Pickaxe Head */}
          <path
            d="M 72 58 C 84 55, 116 55, 128 58 L 100 64 Z"
            fill="#3A2314"
            stroke="#201309"
            strokeWidth="1"
          />
          {/* Pick point and flat chisel */}
          <path d="M 72 58 L 66 61 L 75 60 Z" fill="#201309" />
          <rect x="126" y="57" width="3" height="4" fill="#201309" rx="0.5" />
        </g>

        {/* Central Core Drill Tool */}
        <rect x="96.5" y="110" width="7" height="22" fill="#58341A" rx="1" />
        <path d="M 94 116 L 106 116 L 104 122 L 96 122 Z" fill="#C5961E" />
        <path
          d="M 91 106 C 91 102, 109 102, 109 106 L 107 114 L 93 114 Z"
          fill="#3E2514"
          stroke="#26160A"
          strokeWidth="0.8"
        />
        {/* Crown cutter notches */}
        <polygon points="94,105 96,101 98,105" fill="#FFFFFF" opacity="0.6" />
        <polygon points="102,105 104,101 106,105" fill="#FFFFFF" opacity="0.6" />

        {/* Base ground shadow */}
        <ellipse cx="100" cy="137" rx="28" ry="2.5" fill="#E2DDD5" />

        {/* ADGES Acronym in Bold Sans */}
        <text
          x="100"
          y="156"
          textAnchor="middle"
          fill="#341F12"
          fontSize="22"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="1.8"
        >
          ADGES
        </text>
      </g>
    </svg>
  );
}
