import React, { useState, useEffect } from 'react';
import { getStoredCustomLogo } from '../services/storage';

interface DTestLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const DTestLogo: React.FC<DTestLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  inverted = false,
}) => {
  const [customLogo, setCustomLogo] = useState<string | null>(() => getStoredCustomLogo());

  useEffect(() => {
    const handleUpdate = () => {
      setCustomLogo(getStoredCustomLogo());
    };
    window.addEventListener('dtest360_asset_updated', handleUpdate);
    return () => window.removeEventListener('dtest360_asset_updated', handleUpdate);
  }, []);

  // Try static asset fallback /dtest360-logo.png if no localStorage asset is set
  useEffect(() => {
    if (!customLogo) {
      const probe = new Image();
      probe.src = '/dtest360-logo.png';
      probe.onload = () => {
        setCustomLogo('/dtest360-logo.png');
      };
    }
  }, [customLogo]);

  // Dimensions per size
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-xl',
  };

  const imgSizes = {
    sm: 'h-7 max-w-[120px]',
    md: 'h-9 max-w-[160px]',
    lg: 'h-11 max-w-[200px]',
    xl: 'h-14 max-w-[240px]',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  };

  // If a custom logo image is uploaded, render it preserving colors, proportions & transparency
  if (customLogo) {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <img
          src={customLogo}
          alt="D-TEST 360 Logo"
          className={`${imgSizes[size]} w-auto object-contain shrink-0`}
          style={{ imageRendering: 'auto' }}
        />
        {showSubtitle && (
          <div className="flex flex-col leading-none">
            <div className={`font-heading font-extrabold tracking-tight flex items-baseline gap-1 ${textSizes[size]}`}>
              <span className={inverted ? 'text-white' : 'text-[#30302E]'}>D-TEST</span>
              <span className="text-[#A85F4B]">360</span>
            </div>
            <div
              className={`font-sans tracking-wider uppercase font-semibold mt-0.5 ${
                subSizes[size]
              } ${inverted ? 'text-[#A39D97]' : 'text-[#77716C]'}`}
            >
              Field Drug Testing Support System
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 360 Orbit Insignia */}
      <div
        className={`${iconSizes[size]} shrink-0 rounded-xl flex items-center justify-center relative shadow-xs transition-transform ${
          inverted
            ? 'bg-[#3C3C3A] border border-[#52524E] text-[#F5F0EA]'
            : 'bg-[#F5F0EA] border border-[#D3C7BD] text-[#30302E]'
        }`}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Orbital 360 Degree Ring */}
          <circle
            cx="20"
            cy="20"
            r="15"
            stroke="#A85F4B"
            strokeWidth="2.5"
            strokeDasharray="72 22"
            strokeLinecap="round"
          />
          {/* Target Reticle ticks */}
          <line x1="20" y1="2" x2="20" y2="6" stroke="#A85F4B" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="34" x2="20" y2="38" stroke="#A85F4B" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="20" x2="6" y2="20" stroke="#A85F4B" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="20" x2="38" y2="20" stroke="#A85F4B" strokeWidth="2" strokeLinecap="round" />

          {/* Central Bold 'D' Glyph */}
          <path
            d="M14 12H19C23.4183 12 27 15.5817 27 20C27 24.4183 23.4183 28 19 28H14V12Z"
            fill={inverted ? '#F5F0EA' : '#30302E'}
          />
          <path
            d="M17 15.5H19C21.4853 15.5 23.5 17.5147 23.5 20C23.5 22.4853 21.4853 24.5 19 24.5H17V15.5Z"
            fill={inverted ? '#3C3C3A' : '#F5F0EA'}
          />
          {/* 360 Degree Dot */}
          <circle cx="28" cy="12" r="2" fill="#A85F4B" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col leading-none">
        <div className={`font-heading font-extrabold tracking-tight flex items-baseline gap-1 ${textSizes[size]}`}>
          <span className={inverted ? 'text-white' : 'text-[#30302E]'}>D-TEST</span>
          <span className="text-[#A85F4B]">360</span>
        </div>
        {showSubtitle && (
          <div
            className={`font-sans tracking-wider uppercase font-semibold mt-0.5 ${
              subSizes[size]
            } ${inverted ? 'text-[#A39D97]' : 'text-[#77716C]'}`}
          >
            Field Drug Testing Support System
          </div>
        )}
      </div>
    </div>
  );
};
