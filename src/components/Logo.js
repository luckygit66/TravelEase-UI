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
          <linearGradient id="logoBg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#060d1f" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="arcGrad" x1="10" y1="34" x2="36" y2="11" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="44" height="44" rx="10" fill="url(#logoBg)" />

        {/* Globe wireframe — subtle, elegant */}
        <circle cx="22" cy="23" r="12" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <ellipse cx="22" cy="23" rx="12" ry="4.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <ellipse cx="22" cy="23" rx="6" ry="12" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Flight arc — gradient, sweeping SW to NE */}
        <path d="M10 34 C14 16 26 10 36 12" stroke="url(#arcGrad)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Plane at arrival */}
        <g transform="translate(36,12) rotate(-30)">
          <ellipse rx="1" ry="4" fill="white" />
          <path d="M0 -1.5 L-5 1 L-4 2.5 L0 1 Z" fill="white" opacity="0.9" />
          <path d="M0 -1.5 L5 1 L4 2.5 L0 1 Z" fill="white" opacity="0.9" />
          <path d="M-0.8 2.8 L-3 5.5 L-2 5.5 L-0.8 3.8 Z" fill="white" opacity="0.6" />
          <path d="M0.8 2.8 L3 5.5 L2 5.5 L0.8 3.8 Z" fill="white" opacity="0.6" />
        </g>

        {/* Departure dot — glowing blue */}
        <circle cx="10" cy="34" r="2.2" fill="#60a5fa" />
        <circle cx="10" cy="34" r="1.1" fill="white" />
      </svg>

      <div className="logo-wordmark">
        <span className="logo-travel">Travels</span><span className="logo-ease">Pal</span>
      </div>
    </div>
  );
}

export default Logo;
