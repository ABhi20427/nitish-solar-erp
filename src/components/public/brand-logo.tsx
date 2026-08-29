import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showTextSuffix?: boolean;
}

export function BrandLogo({ variant = 'dark', className = '', showTextSuffix = true }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Official nitish Logo Asset */}
      <img
        src="/logo.png"
        alt="nitish"
        className="h-8 sm:h-10 w-auto object-contain shrink-0 mix-blend-screen"
      />

      {showTextSuffix && (
        <>
          {/* Thin Vertical Divider Line */}
          <span className="h-6 sm:h-7 w-[1.5px] bg-white/40 shrink-0" />

          {/* Clean White "Solar" Text */}
          <span className="text-xl sm:text-2xl font-medium tracking-tight text-white font-sans">
            Solar
          </span>
        </>
      )}
    </div>
  );
}
