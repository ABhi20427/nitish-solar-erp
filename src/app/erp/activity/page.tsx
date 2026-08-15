'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  History,
  Clock,
  User,
  Search,
  Filter,
  Users,
  UserCheck,
  FileText,
  Bell,
  Wrench,
  Receipt,
  ShieldCheck,
} from 'lucide-react';

export default function ActivityTimelinePage() {
  const { auditLogs } = useSolarStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = moduleFilter === 'ALL' || log.module.toLowerCase() === moduleFilter.toLowerCase();

    return matchesSearch && matchesModule;
  });

  const getModuleBadge = (module: string) => {
    switch (module.toLowerCase()) {
      case 'leads':
        return <Badge variant="purple">Leads</Badge>;
      case 'customers':
        return <Badge variant="success">Customers</Badge>;
      case 'quotations':
        return <Badge variant="info">Quotations</Badge>;
      case 'follow-ups':
        return <Badge variant="amber">Follow-ups</Badge>;
      default:
        return <Badge variant="outline">{module}</Badge>;
    }
  };

  return (
    <ModuleGuard module="leads" action="view">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-brand-purple" /> Centralized CRM Activity Timeline
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit trail of every lead creation, customer conversion, quotation proposal, & follow-up task.
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardBody className="p-4 space-y-3 text-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search timeline by action event, details, or employee name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-semibold">Module Filter:</span>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none text-xs"
                >
                  <option value="ALL">All CRM Modules</option>
                  <option value="leads">Leads</option>
                  <option value="customers">Customers</option>
                  <option value="quotations">Quotations</option>
                  <option value="follow-ups">Follow-ups</option>
                  <option value="authentication">Authentication</option>
                  <option value="users">Users</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Chronological Timeline Feed */}
        <Card className="border-slate-200">
          <CardBody className="p-6">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No activity log records match your filter.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="relative pl-6 space-y-1">
                    {/* Circle Bullet */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-brand-purple flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-navy-900 text-sm">{log.action.replace(/_/g, ' ')}</span>
                        {getModuleBadge(log.module)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {log.details}
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Action performed by: <strong className="text-slate-700">{log.userName}</strong> ({log.userRole.replace(/_/g, ' ')})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </ModuleGuard>
  );
}
