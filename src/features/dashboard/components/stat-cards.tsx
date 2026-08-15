'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { useSolarStore } from '@/lib/store-context';
import { formatCurrency } from '@/utilities/formatters';
import { Users, UserCheck, FileText, TrendingUp, Wrench, CreditCard } from 'lucide-react';

export function DashboardStatCards() {
  const { leads, customers, quotations, orders, projects, invoices } = useSolarStore();

  const totalLeads = leads.length;
  const activeCustomers = customers.length;
  const openQuotations = quotations.filter((q) => q.status === 'SENT' || q.status === 'DRAFT').length;
  const totalSalesValue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const activeProjects = projects.filter((p) => p.status !== 'COMMISSIONED').length;
  const pendingPayments = invoices.reduce((acc, i) => acc + i.balanceAmount, 0);

  const CARDS = [
    { title: 'Total Leads', value: `${totalLeads}`, badge: '+12% this week', icon: Users, border: 'border-l-amber-500', iconBg: 'bg-amber-100 text-amber-700' },
    { title: 'Active Customers', value: `${activeCustomers}`, badge: 'Verified Accounts', icon: UserCheck, border: 'border-l-navy-900', iconBg: 'bg-navy-900 text-amber-400' },
    { title: 'Open Quotations', value: `${openQuotations}`, badge: 'Pending Approval', icon: FileText, border: 'border-l-sky-500', iconBg: 'bg-sky-100 text-sky-700' },
    { title: 'Sales Value', value: formatCurrency(totalSalesValue), badge: 'Confirmed Contracts', icon: TrendingUp, border: 'border-l-emerald-500', iconBg: 'bg-emerald-100 text-emerald-700' },
    { title: 'Active Projects', value: `${activeProjects}`, badge: 'In Field Mounting', icon: Wrench, border: 'border-l-purple-500', iconBg: 'bg-purple-100 text-purple-700' },
    { title: 'Pending Payments', value: formatCurrency(pendingPayments), badge: 'Milestone Balance', icon: CreditCard, border: 'border-l-rose-500', iconBg: 'bg-rose-100 text-rose-700' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title} className={`border-l-4 ${card.border}`}>
            <CardBody className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 font-semibold block">{card.title}</span>
                <span className="text-xl font-black text-navy-900 block">{card.value}</span>
                <span className="text-[9px] text-slate-400 font-medium block">{card.badge}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
