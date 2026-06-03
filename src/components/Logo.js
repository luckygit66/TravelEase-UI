import React from 'react';
import './Logo.css';

function Logo({ iconSize = 38 }) {
  return (
    <div className="logo-root">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="60%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Badge */}
        <rect width="44" height="44" rx="12" fill="url(#bg)" />

        {/* Clean bold airplane — upper-right direction */}
        <g transform="translate(22,22) rotate(-42)">
          {/* Fuselage */}
          <ellipse cx="0" cy="0" rx="3" ry="11" fill="white" />
          {/* Wings — bold, swept */}
          <path d="M-2 0 L-13 7 L-10 9 L-2 4 Z" fill="white" fillOpacity="0.9" />
          <path d="M2 0 L13 7 L10 9 L2 4 Z" fill="white" fillOpacity="0.9" />
          {/* Tail */}
          <path d="M-1.5 8 L-6 13 L-4 13 L-1.5 10 Z" fill="white" fillOpacity="0.65" />
          <path d="M1.5 8 L6 13 L4 13 L1.5 10 Z" fill="white" fillOpacity="0.65" />
        </g>
      </svg>

      {/* Wordmark */}
      <div className="logo-wordmark">
        <span className="logo-travel">Travel</span><span className="logo-ease">Ease</span>
      </div>
    </div>
  );
}

export default Logo;
