'use client';

import React from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { Button } from '@/components/ui/button';
import { PipelineStepper } from '@/components/ui/pipeline-stepper';
import { DashboardStatCards } from '@/features/dashboard/components/stat-cards';
import { DashboardCharts } from '@/features/dashboard/components/pipeline-chart';
import { DashboardRecentActivity } from '@/features/dashboard/components/recent-activity';
import { Plus, FileText } from 'lucide-react';

export default function ERPDashboardPage() {
  const { currentUser } = useSolarStore();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <span className="text-xs text-brand-purplelight font-bold uppercase tracking-widest">
            nitish solar Operating Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs text-slate-300">
            Active Role: <strong className="text-amber-400">{currentUser.role.replace(/_/g, ' ')}</strong> • All solar operations & revenue pipeline synced.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/erp/leads">
            <Button variant="accent" size="sm" icon={<Plus className="w-4 h-4" />}>
              Add New Lead
            </Button>
          </Link>
          <Link href="/erp/quotations">
            <Button variant="outline" size="sm" className="border-slate-700 bg-navy-900 text-slate-200 hover:bg-slate-800">
              Create Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Lifecycle Stepper Visual */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            End-to-End Solar Lifecycle Workflow Pipeline
          </h3>
          <span className="text-[11px] text-amber-600 font-semibold">Active Conversion Track</span>
        </div>
        <PipelineStepper currentStageId="quotation" />
      </div>

      {/* Step 5: Stat Cards */}
      <DashboardStatCards />

      {/* Step 5: Charts */}
      <DashboardCharts />

      {/* Step 5: Activity Widgets */}
      <DashboardRecentActivity />
    </div>
  );
}
