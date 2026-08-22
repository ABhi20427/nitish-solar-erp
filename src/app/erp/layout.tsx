import React from 'react';
import { redirect } from 'next/navigation';
import { ERPShell } from '@/components/layout/shell';

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  redirect('/');
  return <ERPShell>{children}</ERPShell>;
}
