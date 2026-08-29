'use client';

import React, { useEffect, useRef, useState } from 'react';

// Animates a numeric display from its previous value to a new target whenever
// `value` changes — purely a presentation layer. The `value` prop passed in
// remains the single source of truth computed by the canonical metrics
// pipeline; this component never computes or alters any number itself.
export function CountUp({
  value,
  duration = 600,
  decimals = 0,
  formatter,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  formatter?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const rounded = decimals > 0 ? Number(display.toFixed(decimals)) : Math.round(display);
  return <>{formatter ? formatter(rounded) : rounded.toLocaleString('en-IN')}</>;
}
