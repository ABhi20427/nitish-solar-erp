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
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Uploaded Logo Asset - maintaining exact proportions */}
      <img
        src="/logo.png"
        alt="nitish solar"
        className="h-9 sm:h-10 w-auto object-contain shrink-0"
      />

      {showTextSuffix && (
        <span className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-amber-400' : 'text-brand-purple'}`}>
          solar
        </span>
      )}
    </div>
  );
}
