'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-slate-200 text-xs">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-4 py-2.5 font-bold transition-all border-b-2 -mb-px flex items-center gap-2',
              isActive
                ? 'border-amber-500 text-navy-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-full text-[10px]',
                  isActive ? 'bg-amber-100 text-amber-900 font-black' : 'bg-slate-100 text-slate-500'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
