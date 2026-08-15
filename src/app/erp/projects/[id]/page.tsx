'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { ProjectModal } from '@/components/projects/project-modal';
import { useToast } from '@/hooks/use-toast';
import {
  Wrench,
  ArrowLeft,
  Edit,
  CheckCircle2,
  Clock,
  User,
  Users,
  MapPin,
  Zap,
  Package,
  FileText,
  DollarSign,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const projectId = params?.id as string;

  const { projects, updateMilestoneStatus, updateProjectProgress } = useSolarStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <ModuleGuard module="projects" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Project Record Not Found</h2>
          <p className="text-xs text-slate-500">The requested solar project ID does not exist.</p>
          <Link href="/erp/projects">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Projects Directory
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  const val = project.projectValue || project.systemSizeKw * 45000;

  const handleMilestoneToggle = (milestoneId: string, currentCompleted: boolean) => {
    updateMilestoneStatus(project.id, milestoneId, !currentCompleted);
    addToast({ title: 'Updated milestone progress!', type: 'success' });
  };

  const getMilestoneBadge = (st: string) => {
    switch (st) {
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[10px]">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">IN PROGRESS</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">PENDING</span>;
    }
  };

  return (
    <ModuleGuard module="projects" action="view">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/erp/projects">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Projects Directory
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            icon={<Edit className="w-4 h-4" />}
          >
            Edit Project Settings
          </Button>
        </div>

        {/* Executive Progress Banner */}
        <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-400 font-mono font-bold">{project.projectNumber}</span>
                <StatusBadge status={project.status} />
                <Badge variant="purple">{project.systemSizeKw} kW System</Badge>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">{project.customerName}</h1>
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-purplelight" />
                <span>Site: {project.siteAddress}, {project.city}</span>
              </div>
            </div>

            <div className="text-right bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[220px] text-xs space-y-1">
              <span className="text-slate-400 block uppercase font-semibold">Turnkey Contract Value</span>
              <span className="text-2xl font-black text-emerald-400">₹{val.toLocaleString()}</span>
              <span className="text-[11px] text-slate-300 block">Manager: <strong className="text-white">{project.projectManagerName || 'Priya Iyer'}</strong></span>
            </div>
          </div>

          {/* Progress Bar & Stage Indicator */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-brand-purplelight" /> Overall Commissioning Progress
              </span>
              <span className="font-mono text-base font-black text-emerald-400">{project.progressPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-brand-purple via-brand-blue to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${project.progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dashboard Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Main Content: Milestones & Equipment */}
          <div className="lg:col-span-8 space-y-6">
            {/* 9 Standard Solar Milestones Interactive Checklist */}
            <Card className="border-slate-200">
              <CardHeader
                title="Engineering & Commissioning Milestones (9 Stages)"
                subtitle="Check off completed milestone stages to update project progress."
              />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {project.milestones.map((ms) => {
                    const isDone = ms.status === 'COMPLETED';
                    return (
                      <div
                        key={ms.id}
                        className={`p-4 flex items-center justify-between transition-colors ${
                          isDone ? 'bg-emerald-50/30' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => handleMilestoneToggle(ms.id, isDone)}
                            className="w-4 h-4 rounded text-brand-purple focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className={`font-bold text-sm block ${isDone ? 'line-through text-slate-500' : 'text-navy-900'}`}>
                              Stage {ms.sequence}: {ms.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Assigned: {ms.assignedToName || project.projectManagerName || 'Engineering Team'} • Target: {ms.dueDate || '2025-03-20'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getMilestoneBadge(ms.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Allocated Products / Hardware Equipment */}
            <Card className="border-slate-200">
              <CardHeader title="Allocated Solar Hardware Equipment" subtitle="Bill of materials allocated for site mounting." />
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="p-3">Component / Product Name</th>
                        <th className="p-3 text-center">Allocated Qty</th>
                        <th className="p-3 text-right">Unit Price (₹)</th>
                        <th className="p-3 text-right">Total Price (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.allocatedProducts && project.allocatedProducts.length > 0 ? (
                        project.allocatedProducts.map((prod, idx) => (
                          <tr key={prod.id || idx}>
                            <td className="p-3 font-semibold text-navy-900">{prod.productName}</td>
                            <td className="p-3 text-center font-bold">{prod.quantity}</td>
                            <td className="p-3 text-right text-slate-600">₹{prod.unitPrice.toLocaleString()}</td>
                            <td className="p-3 text-right font-black text-emerald-700">₹{prod.totalPrice.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-3 font-semibold text-navy-900">nitish solar 540W N-Type TOPCon Panel</td>
                          <td className="p-3 text-center font-bold">20</td>
                          <td className="p-3 text-right text-slate-600">₹14,500</td>
                          <td className="p-3 text-right font-black text-emerald-700">₹2,90,000</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Sidebar: Team, Documents & Financials */}
          <div className="lg:col-span-4 space-y-6">
            {/* Assigned Project Team */}
            <Card className="border-slate-200">
              <CardHeader title="Assigned Engineering Team" subtitle="Project lead executives." />
              <CardBody className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-purple text-white font-bold flex items-center justify-center text-xs">
                    {(project.projectManagerName || 'P').charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-navy-900 block">{project.projectManagerName || 'Priya Iyer'}</span>
                    <span className="text-[10px] text-slate-500">Project Manager</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center text-xs">
                    {(project.electricalEngineerName || 'A').charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-navy-900 block">{project.electricalEngineerName || 'Anil Mehta'}</span>
                    <span className="text-[10px] text-slate-500">Electrical Lead Engineer</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {(project.installerLeadName || 'V').charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-navy-900 block">{project.installerLeadName || 'Vikram Singh'}</span>
                    <span className="text-[10px] text-slate-500">Installation Lead Supervisor</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Documents & Compliance */}
            <Card className="border-slate-200">
              <CardHeader title="Engineering Documents & Approvals" subtitle="Technical drawings & DISCOM permits." />
              <CardBody className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-purple" />
                    <span className="font-semibold text-slate-800">Single Line Diagram (SLD)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">Approved</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-blue" />
                    <span className="font-semibold text-slate-800">DISCOM Sanction Letter</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">Approved</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-slate-800">Net Metering Application</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold">In Progress</span>
                </div>
              </CardBody>
            </Card>

            {/* Financial Summary */}
            <Card className="border-slate-200">
              <CardHeader title="Contract Financial Summary" subtitle="Billing & milestone payment tracking." />
              <CardBody className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Contract Value:</span>
                  <span className="font-bold text-navy-900">₹{val.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Advance Paid (20%):</span>
                  <span className="font-bold text-emerald-700">₹{Math.round(val * 0.2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Balance Pending:</span>
                  <span className="font-bold text-amber-700">₹{Math.round(val * 0.8).toLocaleString()}</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Modal */}
        <ProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          projectToEdit={project}
        />
      </div>
    </ModuleGuard>
  );
}
