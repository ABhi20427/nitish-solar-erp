'use client';

import React, { useEffect, useState } from 'react';

const TICKS = 9;

// A vertical scroll-progress rail styled like a precision measurement
// instrument — tick marks, a light trail, and a sliding diamond marker —
// instead of a generic scrollbar thumb. Replaces the native scrollbar on
// large screens (see the ::-webkit-scrollbar hide rule in globals.css);
// mobile keeps its default thin overlay scrollbar.
export function ScrollProgressRail() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 h-[56vh] w-4 z-40 flex-col items-center pointer-events-none">
      <div className="relative flex-1 w-px bg-white/10">
        {/* Tick marks, like a measurement rail */}
        {Array.from({ length: TICKS }).map((_, i) => (
          <span
            key={i}
            className="absolute left-1/2 -translate-x-1/2 w-2 h-px bg-white/20"
            style={{ top: `${((i + 1) / (TICKS + 1)) * 100}%` }}
          />
        ))}

        {/* Light trail from the top down to the current marker position */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-px bg-gradient-to-b from-transparent to-amber-400/70 transition-[height] duration-150 ease-out"
          style={{ height: `${progress * 100}%` }}
        />

        {/* Diamond marker */}
        <div
          className="absolute left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-amber-400 shadow-[0_0_8px_2px_rgba(245,158,11,0.55)] transition-[top] duration-150 ease-out"
          style={{ top: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
