import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showTextSuffix?: boolean;
}

export function BrandLogo({ variant = 'dark', className = '', showTextSuffix = true }: BrandLogoProps) {
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Uploaded nitish Logo Asset */}
      <img
        src="/logo.png"
        alt="nitish solar"
        className="h-7 sm:h-8.5 w-auto object-contain shrink-0 mix-blend-screen"
      />

      {showTextSuffix && (
        <span className={`text-lg sm:text-xl font-black tracking-wider uppercase font-mono ${isLight ? 'text-amber-400' : 'text-amber-400'}`}>
          solar
        </span>
      )}
    </div>
  );
}
