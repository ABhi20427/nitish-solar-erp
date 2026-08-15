'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ERP_NAVIGATION } from '@/config/navigation';
import { useSolarStore } from '@/lib/store-context';
import { hasPermission } from '@/lib/rbac';
import { BrandLogo } from '@/components/public/brand-logo';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ERPSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser } = useSolarStore();

  return (
    <aside
      className={clsx(
        'bg-navy-950 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 sticky top-0 h-screen',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div>
        {/* Logo Header */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
          <Link href="/erp" className="flex items-center gap-3 overflow-hidden">
            {!collapsed ? (
              <BrandLogo variant="light" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-magenta p-0.5 shrink-0">
                <div className="w-full h-full bg-brand-dark rounded-[10px] flex items-center justify-center font-bold text-white text-xs">
                  ns
                </div>
              </div>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 16 Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {ERP_NAVIGATION.map((item) => {
            const isAllowed = hasPermission(currentUser.role, item.module, 'view');
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (!isAllowed) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative',
                  isActive
                    ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={clsx('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-purplelight')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Public Website Link */}
      <div className="p-3 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-900 hover:text-amber-400 transition-colors"
        >
          <Globe className="w-4 h-4 shrink-0" />
          {!collapsed && <span>nitish solar Website</span>}
        </Link>
      </div>
    </aside>
  );
}
