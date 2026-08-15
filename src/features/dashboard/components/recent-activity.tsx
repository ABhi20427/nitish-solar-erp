'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSolarStore } from '@/lib/store-context';
import { ArrowUpRight, CalendarCheck, Clock, FileText, Users, Wrench } from 'lucide-react';

export function DashboardRecentActivity() {
  const { leads, quotations, followUps, projects } = useSolarStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Recent Leads Widget */}
      <Card className="lg:col-span-6">
        <CardHeader
          title={<span className="flex items-center gap-2 text-navy-900"><Users className="w-4 h-4 text-amber-500" /> Recent Solar Leads</span>}
          subtitle="Latest prospects submitted across web & direct channels."
          action={
            <Link href="/erp/leads">
              <Button variant="ghost" size="sm" className="text-amber-600 font-bold" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            </Link>
          }
        />
        <CardBody className="p-0">
          <div className="table-container border-0 rounded-none">
            <table className="enterprise-table text-xs">
              <thead>
                <tr>
                  <th>Lead No</th>
                  <th>Customer Name</th>
                  <th>Sizing</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 4).map((l) => (
                  <tr key={l.id}>
                    <td className="font-bold text-navy-900">{l.leadNumber}</td>
                    <td>
                      <div className="font-bold text-navy-900">{l.fullName}</div>
                      <div className="text-[10px] text-slate-500">{l.city}</div>
                    </td>
                    <td className="font-extrabold text-amber-600">{l.proposedCapacityKw} kWp</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Recent Quotations Widget */}
      <Card className="lg:col-span-6">
        <CardHeader
          title={<span className="flex items-center gap-2 text-navy-900"><FileText className="w-4 h-4 text-amber-500" /> Recent Quotations</span>}
          subtitle="Proposals generated for client approval."
          action={
            <Link href="/erp/quotations">
              <Button variant="ghost" size="sm" className="text-amber-600 font-bold" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            </Link>
          }
        />
        <CardBody className="p-0">
          <div className="table-container border-0 rounded-none">
            <table className="enterprise-table text-xs">
              <thead>
                <tr>
                  <th>Quote No</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotations.slice(0, 4).map((q) => (
                  <tr key={q.id}>
                    <td className="font-bold text-navy-900">{q.quotationNumber}</td>
                    <td className="font-semibold text-slate-800">{q.customerName}</td>
                    <td className="font-black text-navy-900">₹{q.totalAmount.toLocaleString()}</td>
                    <td>
                      <StatusBadge status={q.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Upcoming Follow-ups Widget */}
      <Card className="lg:col-span-6">
        <CardHeader
          title={<span className="flex items-center gap-2 text-navy-900"><CalendarCheck className="w-4 h-4 text-amber-500" /> Upcoming Sales Follow-ups</span>}
          subtitle="Task reminders for site visits & negotiations."
        />
        <CardBody className="p-4 space-y-3">
          {followUps.slice(0, 3).map((f) => (
            <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-900">{f.title}</span>
                <StatusBadge status={f.priority} />
              </div>
              <p className="text-[11px] text-slate-500">{f.leadName}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Project Status Widget */}
      <Card className="lg:col-span-6">
        <CardHeader
          title={<span className="flex items-center gap-2 text-navy-900"><Wrench className="w-4 h-4 text-amber-500" /> Active Project Status</span>}
          subtitle="Engineering & commissioning progress."
        />
        <CardBody className="p-4 space-y-3">
          {projects.slice(0, 2).map((p) => (
            <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-900">{p.projectNumber} - {p.customerName}</span>
                <span className="font-extrabold text-amber-600">{p.progressPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${p.progressPct}%` }} />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
