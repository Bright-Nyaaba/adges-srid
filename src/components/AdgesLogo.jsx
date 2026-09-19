import React, { useState } from 'react';

export default function AdgesLogo({
  className = 'crest',
  size = 44,
  customLogoUrl = '',
  shape = 'circle',
  style = {}
}) {
  const [imgError, setImgError] = useState(false);

  const borderRadius = shape === 'square' ? '0px' : shape === 'rounded' ? '8px' : '50%';
  const logoSrc = customLogoUrl && customLogoUrl.trim() ? customLogoUrl : '/adges-logo-256.png';

  if (!imgError) {
    return (
      <img
        src={logoSrc}
        alt="ADGES-SRID Logo"
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius,
          ...style
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Vector SVG Fallback
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size, ...style }}
    >
      <circle cx="50" cy="50" r="48" fill="#0C1B13" stroke="#E8B923" strokeWidth="4" />
      <circle cx="50" cy="50" r="43" fill="#0E2419" stroke="#E8B923" strokeWidth="1.5" />
      {/* Mountain peaks */}
      <polygon points="20,68 42,38 56,52 68,36 82,68" fill="#5C3A21" stroke="#2B180C" strokeWidth="1.5" />
      <polygon points="34,48 42,38 50,48" fill="#FFFFFF" opacity="0.85" />
      <polygon points="62,44 68,36 74,44" fill="#FFFFFF" opacity="0.85" />
      {/* Geological strata layers */}
      <path d="M22 71 Q 36 67, 50 71 T 78 71" stroke="#E8B923" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M24 76 Q 38 72, 50 76 T 76 76" stroke="#D4A017" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Crossed pickaxes */}
      <line x1="30" y1="28" x2="70" y2="68" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="70" y1="28" x2="30" y2="68" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
      {/* Pick heads */}
      <path d="M24 34 Q 30 24, 38 28" stroke="#333333" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M76 34 Q 70 24, 62 28" stroke="#333333" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* ADGES text */}
      <text x="50" y="86" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900" letterSpacing="1">ADGES</text>
      {/* Stars */}
      <polygon points="12,50 14,46 17,49 14,52" fill="#E8B923" />
      <polygon points="88,50 86,46 83,49 86,52" fill="#E8B923" />
    </svg>
  );
}
