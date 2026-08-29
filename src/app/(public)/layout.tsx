import React from 'react';
import { ScrollProgressRail } from '@/components/public/scroll-progress-rail';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ScrollProgressRail />
    </>
  );
}
