'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { LeadModal } from '@/components/leads/lead-modal';
import { Lead, LeadStatus, Priority } from '@/lib/types';
import { Users, UserPlus, Search, Filter, ArrowUpRight, Zap, Phone, Calendar, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LeadsPage() {
  const { leads, users } = useSolarStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [execFilter, setExecFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'capacity' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const salesExecs = users.filter(
    (u) => u.role === 'SALES_EXECUTIVE' || u.role === 'SALES_MANAGER' || u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
  );

  const filteredLeads = leads
    .filter((l) => {
      const matchesSearch =
        l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.leadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.companyName && l.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        l.phone.includes(searchTerm) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || l.priority === priorityFilter;
      const matchesExec = execFilter === 'ALL' || l.assignedToId === execFilter || l.assignedToName === execFilter;
      const matchesSource = sourceFilter === 'ALL' || l.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesExec && matchesSource;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dA = new Date(a.createdAt).getTime();
        const dB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dB - dA : dA - dB;
      }
      if (sortBy === 'capacity') {
        const cA = a.proposedCapacityKw || 0;
        const cB = b.proposedCapacityKw || 0;
        return sortOrder === 'desc' ? cB - cA : cA - cB;
      }
      if (sortBy === 'value') {
        const vA = a.estimatedProjectValue || (a.proposedCapacityKw || 0) * 45000;
        const vB = b.estimatedProjectValue || (b.proposedCapacityKw || 0) * 45000;
        return sortOrder === 'desc' ? vB - vA : vA - vB;
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc' ? b.fullName.localeCompare(a.fullName) : a.fullName.localeCompare(b.fullName);
      }
      return 0;
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setLeadToEdit(null);
    setIsModalOpen(true);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'URGENT':
        return <span className="bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded text-[10px]">URGENT</span>;
      case 'HIGH':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">HIGH</span>;
      case 'MEDIUM':
        return <span className="bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded text-[10px]">MEDIUM</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">LOW</span>;
    }
  };

  return (
    <ModuleGuard module="leads" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-purple" /> Leads Management Desk
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Capture, qualify, assign, and track solar prospects across the sales pipeline.
            </p>
          </div>

          <Button
            variant="accent"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
            icon={<UserPlus className="w-4 h-4" />}
          >
            Create New Lead
          </Button>
        </div>

        {/* Search & Multi-Select Filters */}
        <Card className="border-slate-200">
          <CardBody className="p-4 space-y-4 text-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search lead by name, ID (e.g. LD-2025-001), phone, email, or company..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
                />
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
                >
                  <option value="date">Creation Date</option>
                  <option value="capacity">Proposed Capacity (kW)</option>
                  <option value="value">Est. Value (₹)</option>
                  <option value="name">Prospect Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50"
                  title="Toggle Ascending / Descending"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="ALL">All Statuses ({leads.length})</option>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="SURVEY_SCHEDULED">Site Survey</option>
                  <option value="PROPOSAL_SENT">Quotation Sent</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Priority Filter</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Sales Executive Filter</label>
                <select
                  value={execFilter}
                  onChange={(e) => {
                    setExecFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="ALL">All Sales Execs</option>
                  {salesExecs.map((exec) => (
                    <option key={exec.id} value={exec.id}>
                      {exec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Source Filter</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => {
                    setSourceFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="ALL">All Sources</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Phone">Phone</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lead Table View */}
        <Card className="border-slate-200">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-3.5">Lead ID & Prospect</th>
                    <th className="p-3.5">Category & Location</th>
                    <th className="p-3.5">Capacity & Est. Value</th>
                    <th className="p-3.5">Sales Executive</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No leads match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedLeads.map((lead) => {
                      const estValue = lead.estimatedProjectValue || (lead.proposedCapacityKw || 10) * 45000;
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5">
                            <Link href={`/erp/leads/${lead.id}`} className="font-bold text-navy-900 hover:text-brand-purple transition-colors flex items-center gap-1">
                              {lead.fullName} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                            </Link>
                            <span className="text-[10px] text-slate-400 block font-mono">{lead.leadNumber} • {lead.phone}</span>
                          </td>
                          <td className="p-3.5">
                            <Badge variant="purple">{lead.customerType}</Badge>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{lead.city}, {lead.state}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-extrabold text-navy-900 block">{lead.proposedCapacityKw || 10} kWp</span>
                            <span className="text-[10px] text-emerald-600 font-bold">₹{estValue.toLocaleString()}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800 block">{lead.assignedToName || 'Siddharth Patel'}</span>
                            <span className="text-[10px] text-slate-400">Source: {lead.source}</span>
                          </td>
                          <td className="p-3.5">
                            {getPriorityBadge(lead.priority)}
                          </td>
                          <td className="p-3.5">
                            <StatusBadge status={lead.status} />
                          </td>
                          <td className="p-3.5 text-right">
                            <Link href={`/erp/leads/${lead.id}`}>
                              <Button variant="outline" size="sm" className="text-xs">
                                View Lead
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing <strong className="text-navy-900">{filteredLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
                <strong className="text-navy-900">{Math.min(currentPage * itemsPerPage, filteredLeads.length)}</strong> of{' '}
                <strong className="text-navy-900">{filteredLeads.length}</strong> leads
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Prev
                </Button>
                <span className="font-bold text-navy-900 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Modal Form */}
        <LeadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          leadToEdit={leadToEdit}
        />
      </div>
    </ModuleGuard>
  );
}
