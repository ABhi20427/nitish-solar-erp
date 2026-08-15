'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);

  if (!segments.length) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      <Link href="/erp" className="hover:text-navy-900 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5 text-amber-500" />
        <span>ERP</span>
      </Link>

      {segments.map((seg, idx) => {
        if (seg === 'erp') return null;
        const href = `/${segments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === segments.length - 1;
        const formatted = seg.replace(/-/g, ' ').toUpperCase();

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-bold text-navy-900">{formatted}</span>
            ) : (
              <Link href={href} className="hover:text-navy-900 transition-colors">
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
