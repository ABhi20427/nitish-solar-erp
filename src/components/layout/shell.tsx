'use client';

import React, { useState } from 'react';
import { ERPSidebar } from '@/components/layout/sidebar';
import { ERPHeader } from '@/components/layout/header';
import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { ERPAuthGuard } from '@/components/auth/auth-guard';

export function ERPShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { toasts, removeToast } = useToast();

  return (
    <ERPAuthGuard>
      <div className="min-h-screen flex bg-slate-50 text-navy-900">
        <ERPSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        <div className="flex-1 flex flex-col min-w-0">
          <ERPHeader />
          <main className="p-6 md:p-8 flex-1 overflow-y-auto">{children}</main>
        </div>

        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    </ERPAuthGuard>
  );
}
