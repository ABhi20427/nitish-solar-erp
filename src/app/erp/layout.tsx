import React from 'react';
import { ERPShell } from '@/components/layout/shell';

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  return <ERPShell>{children}</ERPShell>;
}
