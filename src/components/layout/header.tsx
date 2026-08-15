'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSolarStore } from '@/lib/store-context';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Role } from '@/lib/types';
import { Shield, Bell, Search, ChevronDown, Check, Sparkles, X, User as UserIcon, LogOut, Settings } from 'lucide-react';

export function ERPHeader() {
  const router = useRouter();
  const { currentUser, setCurrentRole, logout, followUps } = useSolarStore();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const ROLES: { id: Role; label: string; desc: string }[] = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full System Access & Governance' },
    { id: 'ADMIN', label: 'Admin', desc: 'Business-wide Management & Operations' },
    { id: 'SALES_MANAGER', label: 'Sales Manager', desc: 'Manage Sales Teams, Leads, & Quotes' },
    { id: 'SALES_EXECUTIVE', label: 'Sales Executive', desc: 'Assigned Leads, Surveys, & Proposals' },
    { id: 'PROJECT_MANAGER', label: 'Project Manager', desc: 'Projects & Installation Milestones' },
    { id: 'FINANCE', label: 'Finance', desc: 'Invoices, Receipts, & Financial Reports' },
    { id: 'VIEWER', label: 'Viewer', desc: 'Read-Only Permission Matrix' },
  ];

  const pendingTasks = followUps.filter((f) => !f.isCompleted);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Breadcrumbs & Search Area */}
      <div className="flex items-center gap-6 max-w-xl w-full">
        <Breadcrumbs />

        <div className="relative flex-1 hidden lg:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quick search leads, projects, invoices..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:bg-white focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-950 text-white text-xs font-semibold hover:bg-navy-900 border border-slate-800 shadow-sm transition-all"
          >
            <Shield className="w-4 h-4 text-brand-purplelight" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium -mb-0.5">Active Role</span>
              <span className="text-brand-purplelight font-bold">{currentUser.role.replace(/_/g, ' ')}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 text-xs animate-fade-in">
              <div className="p-2 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span className="font-bold text-navy-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-purple" /> Switch Active Persona
                </span>
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
                        ? 'bg-purple-50 text-brand-purple border border-purple-200 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-navy-900 text-xs">{r.label}</div>
                      <div className="text-[10px] text-slate-500">{r.desc}</div>
                    </div>
                    {currentUser.role === r.id && <Check className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Drawer Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-navy-900 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {pendingTasks.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingTasks.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-3 text-xs animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-navy-900">Notifications & Tasks</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-navy-900 block">{task.title}</span>
                    <span className="text-[10px] text-slate-500 block">{task.leadName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-brand-purple shadow-sm"
            />
            <div className="hidden md:block text-left text-xs">
              <span className="font-bold text-navy-900 block leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500 font-medium">{currentUser.email}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 text-xs animate-fade-in space-y-1">
              <div className="p-2 border-b border-slate-100">
                <span className="font-bold text-navy-900 block">{currentUser.name}</span>
                <span className="text-[10px] font-semibold text-brand-purple uppercase">{currentUser.role.replace(/_/g, ' ')}</span>
              </div>

              <Link
                href="/erp/profile"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-brand-purple" /> My User Profile
              </Link>

              <Link
                href="/erp/users"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Shield className="w-4 h-4 text-brand-blue" /> User Management
              </Link>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 font-semibold hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out of ERP
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
