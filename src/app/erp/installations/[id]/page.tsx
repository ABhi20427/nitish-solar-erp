'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { HardHat, ArrowLeft, CheckCircle2, Clock, MapPin, Zap, User, Wrench, Calendar, FileText } from 'lucide-react';

export default function InstallationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const jobId = params?.id as string;

  const { installations, updateInstallationStage } = useSolarStore();

  const job = installations.find((j) => j.id === jobId);

  if (!job) {
    return (
      <ModuleGuard module="projects" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Installation Record Not Found</h2>
          <p className="text-xs text-slate-500">The requested installation job ID does not exist.</p>
          <Link href="/erp/installations">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Installation Desk
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  const handleStageToggle = (stageId: string, currentCompleted: boolean) => {
    updateInstallationStage(job.id, stageId, !currentCompleted);
    addToast({ title: 'Updated installation stage completion!', type: 'success' });
  };

  return (
    <ModuleGuard module="projects" action="view">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/erp/installations">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Installation Desk
            </Button>
          </Link>
        </div>

        {/* Executive Banner */}
        <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-400 font-mono font-bold">{job.installationNumber}</span>
                <span className="font-mono text-slate-400 text-xs">({job.projectNumber})</span>
                <StatusBadge status={job.status} />
                <Badge variant="purple">{job.systemSizeKw} kW System</Badge>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">{job.customerName}</h1>
              <p className="text-xs text-slate-300">
                Site: {job.siteAddress} • Installer Lead: <strong className="text-white">{job.installerLeadName}</strong>
              </p>
            </div>

            <div className="text-right bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[200px] text-xs space-y-1">
              <span className="text-slate-400 block uppercase font-semibold">Installation Progress</span>
              <span className="text-3xl font-black text-brand-purplelight">{job.progressPct}%</span>
              <span className="text-[11px] text-slate-300 block">Manager: <strong className="text-white">{job.projectManagerName}</strong></span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-brand-purplelight" /> Site Execution Completion
              </span>
              <span className="font-mono text-base font-black text-emerald-400">{job.progressPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-brand-purple via-brand-blue to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${job.progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 9 Stages Interactive Checklist */}
        <Card className="border-slate-200">
          <CardHeader title="9-Stage Rooftop Installation Checklist" subtitle="Check off completed installation stages to update overall site progress." />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              {job.stages.map((stg) => {
                const isDone = stg.status === 'COMPLETED';
                return (
                  <div
                    key={stg.id}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      isDone ? 'bg-emerald-50/30' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleStageToggle(stg.id, isDone)}
                        className="w-4.5 h-4.5 rounded text-brand-purple focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className={`font-bold text-sm block ${isDone ? 'line-through text-slate-500' : 'text-navy-900'}`}>
                          Stage {stg.sequence}: {stg.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Assigned to: {stg.assignedToName || job.installerLeadName} • Date: {stg.completedDate ? `Completed on ${stg.completedDate}` : (stg.dueDate || 'Pending')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-extrabold px-2.5 py-1 rounded text-[10px] ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : stg.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {stg.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </ModuleGuard>
  );
}
