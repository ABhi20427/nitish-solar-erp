'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { LeadStatus, Priority } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  Filter,
  Search,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Zap,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export default function PipelinePage() {
  const { leads, updateLeadStatus, users } = useSolarStore();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [execFilter, setExecFilter] = useState<string>('ALL');

  const salesExecs = users.filter(
    (u) => u.role === 'SALES_EXECUTIVE' || u.role === 'SALES_MANAGER' || u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
  );

  const PIPELINE_STAGES: { id: LeadStatus; label: string; color: string }[] = [
    { id: 'NEW', label: 'New Lead', color: 'border-slate-300 bg-slate-50 text-slate-800' },
    { id: 'CONTACTED', label: 'Contacted', color: 'border-blue-300 bg-blue-50 text-blue-800' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'border-indigo-300 bg-indigo-50 text-indigo-800' },
    { id: 'SURVEY_SCHEDULED', label: 'Site Survey', color: 'border-purple-300 bg-purple-50 text-purple-800' },
    { id: 'PROPOSAL_SENT', label: 'Quotation', color: 'border-cyan-300 bg-cyan-50 text-cyan-800' },
    { id: 'NEGOTIATING', label: 'Negotiation', color: 'border-amber-300 bg-amber-50 text-amber-800' },
    { id: 'WON', label: 'Won', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
    { id: 'LOST', label: 'Lost', color: 'border-rose-300 bg-rose-50 text-rose-800' },
  ];

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.companyName && l.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesExec = execFilter === 'ALL' || l.assignedToId === execFilter || l.assignedToName === execFilter;
    return matchesSearch && matchesExec;
  });

  // Analytics KPIs
  const totalPipelineVal = filteredLeads.reduce(
    (acc, l) => acc + (l.estimatedProjectValue || (l.proposedCapacityKw || 10) * 45000),
    0
  );

  const qualifiedLeadsCount = filteredLeads.filter((l) => l.status === 'QUALIFIED').length;

  const quotationVal = filteredLeads
    .filter((l) => l.status === 'PROPOSAL_SENT')
    .reduce((acc, l) => acc + (l.estimatedProjectValue || (l.proposedCapacityKw || 10) * 45000), 0);

  const negotiationVal = filteredLeads
    .filter((l) => l.status === 'NEGOTIATING')
    .reduce((acc, l) => acc + (l.estimatedProjectValue || (l.proposedCapacityKw || 10) * 45000), 0);

  const wonVal = filteredLeads
    .filter((l) => l.status === 'WON')
    .reduce((acc, l) => acc + (l.estimatedProjectValue || (l.proposedCapacityKw || 10) * 45000), 0);

  const lostVal = filteredLeads
    .filter((l) => l.status === 'LOST')
    .reduce((acc, l) => acc + (l.estimatedProjectValue || (l.proposedCapacityKw || 10) * 45000), 0);

  const totalClosed = filteredLeads.filter((l) => l.status === 'WON' || l.status === 'LOST').length;
  const wonCount = filteredLeads.filter((l) => l.status === 'WON').length;
  const conversionRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

  const handleStageChange = (leadId: string, currentStatus: LeadStatus, nextStatus: LeadStatus) => {
    updateLeadStatus(leadId, nextStatus);
    addToast({ title: `Moved lead stage to ${nextStatus}`, type: 'success' });
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'URGENT':
        return <span className="bg-rose-100 text-rose-700 font-black px-1.5 py-0.5 rounded text-[9px]">URGENT</span>;
      case 'HIGH':
        return <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[9px]">HIGH</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">{p}</span>;
    }
  };

  return (
    <ModuleGuard module="leads" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-brand-purple" /> Interactive Visual Sales Pipeline
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Visual Kanban desk tracking solar prospects from lead capture through site survey to closed deal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by prospect name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
              />
            </div>

            <select
              value={execFilter}
              onChange={(e) => setExecFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-medium outline-none"
            >
              <option value="ALL">All Sales Execs</option>
              {salesExecs.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pipeline Analytics KPI Header Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div className="bg-navy-950 text-white p-3.5 rounded-2xl space-y-1 shadow-md">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Value</span>
            <span className="text-base font-black text-emerald-400">₹{(totalPipelineVal / 100000).toFixed(1)}L</span>
            <span className="text-[9px] text-slate-400 block">{filteredLeads.length} Total Leads</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Qualified</span>
            <span className="text-base font-black text-navy-900">{qualifiedLeadsCount}</span>
            <span className="text-[9px] text-indigo-600 font-bold block">Prospects</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Quotation Val</span>
            <span className="text-base font-black text-brand-purple">₹{(quotationVal / 100000).toFixed(1)}L</span>
            <span className="text-[9px] text-slate-400 block">Proposals Sent</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Negotiation Val</span>
            <span className="text-base font-black text-amber-600">₹{(negotiationVal / 100000).toFixed(1)}L</span>
            <span className="text-[9px] text-amber-600 font-bold block">Closing Soon</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Won Deals</span>
            <span className="text-base font-black text-emerald-600">₹{(wonVal / 100000).toFixed(1)}L</span>
            <span className="text-[9px] text-emerald-700 font-bold block">Converted</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Lost Deals</span>
            <span className="text-base font-black text-rose-600">₹{(lostVal / 100000).toFixed(1)}L</span>
            <span className="text-[9px] text-slate-400 block">Closed Lost</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Win Rate</span>
            <span className="text-base font-black text-navy-900">{conversionRate}%</span>
            <span className="text-[9px] text-slate-400 block">Lead Conversion</span>
          </div>
        </div>

        {/* 8-Stage Visual Kanban Board Container */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1700px]">
            {PIPELINE_STAGES.map((stage, stageIdx) => {
              const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
              const stageVal = stageLeads.reduce(
                (acc, l) => acc + (l.estimatedProjectValue || (l.proposedCapacityKw || 10) * 45000),
                0
              );

              return (
                <div key={stage.id} className="w-[210px] shrink-0 space-y-3">
                  {/* Column Header */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs ${stage.color}`}>
                    <span className="flex items-center gap-1.5">
                      {stage.label}
                      <span className="bg-white/80 px-1.5 py-0.2 text-[10px] rounded-full text-navy-900 font-mono">
                        {stageLeads.length}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono opacity-80">₹{(stageVal / 100000).toFixed(1)}L</span>
                  </div>

                  {/* Cards Column */}
                  <div className="space-y-3 min-h-[500px] p-1 bg-slate-100/60 rounded-xl border border-slate-200/60">
                    {stageLeads.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-[11px]">No leads in stage</div>
                    ) : (
                      stageLeads.map((lead) => {
                        const leadVal = lead.estimatedProjectValue || (lead.proposedCapacityKw || 10) * 45000;
                        return (
                          <div
                            key={lead.id}
                            className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2.5 text-xs"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <Link
                                href={`/erp/leads/${lead.id}`}
                                className="font-bold text-navy-900 hover:text-brand-purple transition-colors leading-snug line-clamp-1"
                              >
                                {lead.fullName}
                              </Link>
                              {getPriorityBadge(lead.priority)}
                            </div>

                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-extrabold text-brand-purple">{lead.proposedCapacityKw || 10} kWp</span>
                              <span className="font-black text-emerald-700">₹{(leadVal / 100000).toFixed(2)}L</span>
                            </div>

                            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                              <span>Exec: <strong className="text-slate-800">{lead.assignedToName?.split(' ')[0] || 'Exec'}</strong></span>
                              <span className="font-mono text-slate-400">{lead.leadNumber}</span>
                            </div>

                            {/* Interactive Stage Movement Controls */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                              <select
                                value={lead.status}
                                onChange={(e) => handleStageChange(lead.id, lead.status, e.target.value as LeadStatus)}
                                className="text-[10px] py-1 px-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none w-full font-medium"
                              >
                                {PIPELINE_STAGES.map((st) => (
                                  <option key={st.id} value={st.id}>
                                    Move to: {st.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModuleGuard>
  );
}
