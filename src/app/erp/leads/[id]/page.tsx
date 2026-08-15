'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { LeadModal } from '@/components/leads/lead-modal';
import { FollowUpModal } from '@/components/leads/followup-modal';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Bell,
  Edit,
  Clock,
  Send,
} from 'lucide-react';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const leadId = params?.id as string;

  const {
    leads,
    users,
    updateLead,
    updateLeadStatus,
    convertLeadToCustomer,
    followUps,
    quotations,
    auditLogs,
    toggleFollowUp,
  } = useSolarStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    return (
      <ModuleGuard module="leads" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Lead Record Not Found</h2>
          <p className="text-xs text-slate-500">The requested lead ID does not exist in the database.</p>
          <Link href="/erp/leads">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Lead Management
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  const salesExecs = users.filter(
    (u) => u.role === 'SALES_EXECUTIVE' || u.role === 'SALES_MANAGER' || u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
  );

  const leadFollowUps = followUps.filter((f) => f.leadId === lead.id || f.leadName === lead.fullName);
  const leadQuotations = quotations.filter((q) => q.leadId === lead.id);
  const leadAuditLogs = auditLogs.filter((log) => log.details.includes(lead.leadNumber) || log.details.includes(lead.fullName));

  const estValue = lead.estimatedProjectValue || (lead.proposedCapacityKw || 10) * 45000;

  const handleReassignExec = (execId: string) => {
    const matched = users.find((u) => u.id === execId);
    if (matched) {
      updateLead(lead.id, {
        assignedToId: matched.id,
        assignedToName: matched.name,
      });
      addToast({ title: `Reassigned lead to ${matched.name}`, type: 'success' });
    }
  };

  const handleConvertCustomer = () => {
    try {
      const newCustomer = convertLeadToCustomer(lead.id);
      addToast({ title: `Successfully converted lead to Customer ${newCustomer.customerNumber}!`, type: 'success' });
      router.push(`/erp/customers/${newCustomer.id}`);
    } catch (e: any) {
      addToast({ title: e.message || 'Failed to convert lead', type: 'error' });
    }
  };

  const handleMarkWon = () => {
    updateLeadStatus(lead.id, 'WON');
    addToast({ title: 'Lead marked as WON!', type: 'success' });
  };

  const handleMarkLost = () => {
    updateLeadStatus(lead.id, 'LOST');
    addToast({ title: 'Lead marked as LOST', type: 'info' });
  };

  return (
    <ModuleGuard module="leads" action="view">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/erp/leads">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Leads Directory
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              icon={<Edit className="w-4 h-4" />}
            >
              Edit Lead
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFollowUpModalOpen(true)}
              icon={<Bell className="w-4 h-4 text-brand-purple" />}
            >
              Add Follow-up
            </Button>

            <Link href="/erp/quotations">
              <Button variant="outline" size="sm" icon={<FileText className="w-4 h-4 text-brand-blue" />}>
                Create Quotation
              </Button>
            </Link>

            {lead.status !== 'WON' && (
              <Button
                variant="accent"
                size="sm"
                onClick={handleConvertCustomer}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                icon={<UserCheck className="w-4 h-4" />}
              >
                Convert to Customer
              </Button>
            )}

            {lead.status !== 'WON' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkWon}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Mark Won
              </Button>
            )}

            {lead.status !== 'LOST' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkLost}
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                icon={<XCircle className="w-4 h-4" />}
              >
                Mark Lost
              </Button>
            )}
          </div>
        </div>

        {/* Lead Overview Header Card */}
        <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 font-mono font-bold">{lead.leadNumber}</span>
              <StatusBadge status={lead.status} />
              <Badge variant="purple">{lead.customerType}</Badge>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{lead.fullName}</h1>
            <p className="text-xs text-slate-300">
              {lead.companyName ? `${lead.companyName} • ` : ''}Source: <strong className="text-white">{lead.source}</strong> • Created: {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[200px] text-xs space-y-1">
            <span className="text-slate-400 block uppercase font-semibold">Estimated Project Value</span>
            <span className="text-2xl font-black text-emerald-400">₹{estValue.toLocaleString()}</span>
            <span className="text-[11px] text-brand-purplelight font-bold block">{lead.proposedCapacityKw || 10} kW System Capacity</span>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Contact & Location Info */}
            <Card className="border-slate-200">
              <CardHeader title="Contact & Location Information" subtitle="Client communications address & contact numbers." />
              <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-semibold">Phone Number</span>
                    <span className="font-bold text-navy-900 text-sm">{lead.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-semibold">Email Address</span>
                    <span className="font-bold text-navy-900">{lead.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-brand-magenta shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-semibold">Site Location & Address</span>
                    <span className="font-medium text-slate-800">{lead.address}, {lead.city}, {lead.state} - {lead.pinCode}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Requirement Specifications */}
            <Card className="border-slate-200">
              <CardHeader title="Solar Requirement Specifications" subtitle="Site engineering inputs & recommended system capacity." />
              <CardBody className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Proposed System</span>
                  <span className="text-lg font-black text-navy-900">{lead.proposedCapacityKw || 10} kWp</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Monthly Bill</span>
                  <span className="text-lg font-black text-brand-purple">₹{(lead.monthlyBillAmount || 15000).toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Roof Area</span>
                  <span className="text-lg font-black text-navy-900">{lead.roofAreaSqFt || 1200} Sq Ft</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Roof Type</span>
                  <span className="text-sm font-bold text-slate-800">{lead.roofType || 'Terrace RCC'}</span>
                </div>
              </CardBody>
            </Card>

            {/* Notes & Follow-ups */}
            <Card className="border-slate-200">
              <CardHeader
                title="Follow-up Reminders & Notes"
                subtitle="Tasks and communication notes for this lead."
              />
              <CardBody className="space-y-4 text-xs">
                {lead.notes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-800 text-xs">
                    <strong className="text-amber-900 font-bold block mb-1">Lead Notes:</strong>
                    {lead.notes}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-bold text-navy-900 flex items-center justify-between">
                    <span>Scheduled Tasks ({leadFollowUps.length})</span>
                    <button
                      onClick={() => setIsFollowUpModalOpen(true)}
                      className="text-brand-purple font-semibold hover:underline"
                    >
                      + Add Task
                    </button>
                  </h4>

                  {leadFollowUps.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No active follow-up tasks scheduled.</p>
                  ) : (
                    leadFollowUps.map((fol) => (
                      <div
                        key={fol.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                          fol.isCompleted ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={fol.isCompleted}
                            onChange={() => toggleFollowUp(fol.id)}
                            className="rounded text-brand-purple focus:ring-0"
                          />
                          <div>
                            <span className={`font-bold block ${fol.isCompleted ? 'line-through' : 'text-navy-900'}`}>
                              {fol.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Due: {new Date(fol.dueDate).toLocaleDateString()} • Assigned: {fol.userName}
                            </span>
                          </div>
                        </div>
                        <Badge variant={fol.priority === 'HIGH' || fol.priority === 'URGENT' ? 'danger' : 'purple'}>
                          {fol.priority}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Sidebar: Sales Exec & Quotation History */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sales Executive Assignment */}
            <Card className="border-slate-200">
              <CardHeader title="Assigned Sales Executive" subtitle="Re-assign lead ownership." />
              <CardBody className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-purple text-white font-bold flex items-center justify-center text-sm">
                    {(lead.assignedToName || 'S').charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-navy-900 block">{lead.assignedToName || 'Siddharth Patel'}</span>
                    <span className="text-[10px] text-slate-500">Sales Executive</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Re-assign Executive</label>
                  <select
                    value={lead.assignedToId || 'user-4'}
                    onChange={(e) => handleReassignExec(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
                  >
                    {salesExecs.map((exec) => (
                      <option key={exec.id} value={exec.id}>
                        {exec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardBody>
            </Card>

            {/* Quotation History */}
            <Card className="border-slate-200">
              <CardHeader title="Quotation History" subtitle="Proposals generated for this lead." />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {leadQuotations.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No quotation generated yet.</div>
                  ) : (
                    leadQuotations.map((quo) => (
                      <div key={quo.id} className="p-3.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-navy-900 block">{quo.quotationNumber}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">₹{quo.totalAmount.toLocaleString()}</span>
                        </div>
                        <StatusBadge status={quo.status} />
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Timeline & Audit Logs */}
            <Card className="border-slate-200">
              <CardHeader title="Activity Timeline" subtitle="Audit log history of changes." />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100 text-xs max-h-64 overflow-y-auto">
                  {leadAuditLogs.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No audit activity logged.</div>
                  ) : (
                    leadAuditLogs.map((log) => (
                      <div key={log.id} className="p-3 flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-purple shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-navy-900 block">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-slate-500 block">{log.details}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <LeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          leadToEdit={lead}
        />

        <FollowUpModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          leadId={lead.id}
          leadName={lead.fullName}
        />
      </div>
    </ModuleGuard>
  );
}
