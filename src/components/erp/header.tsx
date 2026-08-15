'use client';

import React, { useState } from 'react';
import { useSolarStore } from '@/lib/store-context';
import { Role } from '@/lib/types';
import { Shield, Bell, Search, User, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ERPHeader() {
  const { currentUser, setCurrentRole, leads, followUps } = useSolarStore();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const ROLES: { id: Role; label: string; desc: string }[] = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full System Access & Governance' },
    { id: 'ADMIN', label: 'Admin', desc: 'Business-wide Management & Operations' },
    { id: 'SALES_MANAGER', label: 'Sales Manager', desc: 'Manage Sales Teams, Leads, & Quotes' },
    { id: 'SALES_EXECUTIVE', label: 'Sales Executive', desc: 'Assigned Leads, Surveys, & Proposals' },
    { id: 'PROJECT_MANAGER', label: 'Project Manager', desc: 'Projects & Installation Milestones' },
    { id: 'FINANCE', label: 'Finance', desc: 'Invoices, Receipts, & Financial Reports' },
    { id: 'VIEWER', label: 'Viewer', desc: 'Read-Only Permission Matrix' },
  ];

  const pendingTasksCount = followUps.filter((f) => !f.isCompleted).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Search Input */}
      <div className="flex items-center gap-3 max-w-md w-full">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, customer names, quotations, project numbers..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-950 text-white text-xs font-semibold hover:bg-navy-900 border border-slate-800 shadow-sm transition-all"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium -mb-0.5">Role Switcher</span>
              <span className="text-amber-400 font-bold">{currentUser.role.replace(/_/g, ' ')}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Role Dropdown */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 text-xs animate-fade-in">
              <div className="p-2 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span className="font-bold text-navy-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Switch Active Persona
                </span>
                <span className="text-[10px] text-slate-400">Live RBAC Filter</span>
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setCurrentRole(r.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between ${
                      currentUser.role === r.id
                        ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-navy-900 text-xs">{r.label}</div>
                      <div className="text-[10px] text-slate-500">{r.desc}</div>
                    </div>
                    {currentUser.role === r.id && <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-navy-900 transition-colors relative">
            <Bell className="w-5 h-5" />
            {pendingTasksCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingTasksCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 shadow-sm"
          />
          <div className="hidden md:block text-left text-xs">
            <span className="font-bold text-navy-900 block leading-tight">{currentUser.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">{currentUser.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
