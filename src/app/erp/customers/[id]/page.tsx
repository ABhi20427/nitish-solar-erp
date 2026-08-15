'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { CustomerModal } from '@/components/customers/customer-modal';
import {
  UserCheck,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building2,
  Receipt,
  CreditCard,
  Wrench,
  FileText,
  Clock,
  Edit,
  History,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const {
    customers,
    projects,
    quotations,
    invoices,
    payments,
    leads,
    auditLogs,
  } = useSolarStore();

  const [activeTab, setActiveTab] = useState<'projects' | 'quotations' | 'invoices' | 'payments' | 'activities'>('projects');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <ModuleGuard module="customers" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Customer Record Not Found</h2>
          <p className="text-xs text-slate-500">The requested customer ID does not exist.</p>
          <Link href="/erp/customers">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Customers Directory
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  // Linked Relational Collections
  const customerProjects = projects.filter(
    (p) => p.customerId === customer.id || p.customerName.toLowerCase() === customer.fullName.toLowerCase()
  );
  const customerQuotations = quotations.filter(
    (q) => q.customerId === customer.id || q.customerName.toLowerCase() === customer.fullName.toLowerCase()
  );
  const customerInvoices = invoices.filter(
    (i) => i.customerId === customer.id || i.customerName.toLowerCase() === customer.fullName.toLowerCase()
  );
  const customerPayments = payments.filter(
    (p) => p.customerName.toLowerCase() === customer.fullName.toLowerCase()
  );
  const originLead = customer.leadId ? leads.find((l) => l.id === customer.leadId) : null;
  const customerLogs = auditLogs.filter(
    (log) => log.details.includes(customer.customerNumber) || log.details.includes(customer.fullName)
  );

  return (
    <ModuleGuard module="customers" action="view">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/erp/customers">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Customers Directory
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            icon={<Edit className="w-4 h-4" />}
          >
            Edit Customer Details
          </Button>
        </div>

        {/* Customer Overview Banner */}
        <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 font-mono font-bold">{customer.customerNumber}</span>
              <Badge variant="purple">{customer.customerType}</Badge>
              {originLead && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  Converted from Lead {originLead.leadNumber}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{customer.fullName}</h1>
            <p className="text-xs text-slate-300">
              {customer.companyName ? `${customer.companyName} • ` : ''}GST: <strong className="text-white">{customer.gstNumber || 'N/A'}</strong> • Assigned Exec: {customer.assignedToName || 'Siddharth Patel'}
            </p>
          </div>

          <div className="text-right bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[200px] text-xs space-y-1">
            <span className="text-slate-400 block uppercase font-semibold">Total Portfolio Valuation</span>
            <span className="text-2xl font-black text-emerald-400">₹{(customer.totalProjectValue || 450000).toLocaleString()}</span>
            <span className="text-[11px] text-brand-purplelight font-bold block">{customer.sanctionedLoadKw || 10} kW Sanctioned Load</span>
          </div>
        </div>

        {/* Contact Info Card */}
        <Card className="border-slate-200">
          <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-semibold">Phone Number</span>
                <span className="font-bold text-navy-900">{customer.phone}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-semibold">Email Address</span>
                <span className="font-bold text-navy-900">{customer.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-magenta shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-semibold">Billing Address</span>
                <span className="font-medium text-slate-800">{customer.address}, {customer.city}, {customer.state}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Customer Financial Overview Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <Card className="border-slate-200">
            <CardBody className="p-4 space-y-1">
              <span className="text-slate-500 font-semibold block">Total Project Value</span>
              <span className="text-xl font-black text-navy-900">
                ₹{(customerProjects.reduce((acc, p) => acc + (p.projectValue || p.systemSizeKw * 45000), 0) || customer.totalProjectValue || 450000).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">{customerProjects.length} Turnkey Project(s)</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200">
            <CardBody className="p-4 space-y-1">
              <span className="text-slate-500 font-semibold block">Total Invoiced</span>
              <span className="text-xl font-black text-navy-900">
                ₹{(customerInvoices.reduce((acc, i) => acc + i.totalAmount, 0) || 375600).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">{customerInvoices.length} Milestone Invoice(s)</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-emerald-50/50">
            <CardBody className="p-4 space-y-1">
              <span className="text-slate-500 font-semibold block">Total Paid Collections</span>
              <span className="text-xl font-black text-emerald-700">
                ₹{(customerInvoices.reduce((acc, i) => acc + i.paidAmount, 0) || 200000).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">{customerPayments.length} Payment Receipts</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-rose-50/50">
            <CardBody className="p-4 space-y-1">
              <span className="text-slate-500 font-semibold block">Outstanding Balance</span>
              <span className="text-xl font-black text-rose-700">
                ₹{(customerInvoices.reduce((acc, i) => acc + i.balanceAmount, 0) || 175600).toLocaleString()}
              </span>
              <span className="text-[10px] text-rose-600 font-bold block">Pending Receipt</span>
            </CardBody>
          </Card>
        </div>

        {/* Relational Tabs Navigation */}
        <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
          {[
            { id: 'projects', label: `Projects (${customerProjects.length})`, icon: Wrench },
            { id: 'quotations', label: `Quotations (${customerQuotations.length})`, icon: FileText },
            { id: 'invoices', label: `Invoices (${customerInvoices.length})`, icon: Receipt },
            { id: 'payments', label: `Payments (${customerPayments.length})`, icon: CreditCard },
            { id: 'activities', label: 'Activities & Lead Origin', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-4 flex items-center gap-1.5 transition-all border-b-2 ${
                  isActive
                    ? 'border-brand-purple text-brand-purple font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        {activeTab === 'projects' && (
          <Card className="border-slate-200">
            <CardHeader title="Customer Solar Projects" subtitle="Installed or active engineering projects." />
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {customerProjects.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No active projects associated with this customer.</div>
                ) : (
                  customerProjects.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-navy-900 block text-sm">{p.projectNumber}</span>
                        <span className="text-slate-500">{p.systemSizeKw} kW Sizing • Manager: {p.projectManagerName}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <StatusBadge status={p.status} />
                        <span className="text-[10px] text-slate-400 block font-bold">{p.progressPct}% Completed</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'quotations' && (
          <Card className="border-slate-200">
            <CardHeader title="Customer Quotations" subtitle="System sizing proposals issued." />
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {customerQuotations.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No quotations generated for this customer.</div>
                ) : (
                  customerQuotations.map((q) => (
                    <div key={q.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-navy-900 block">{q.quotationNumber}</span>
                        <span className="text-emerald-700 font-bold">Total: ₹{q.totalAmount.toLocaleString()}</span>
                      </div>
                      <StatusBadge status={q.status} />
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'invoices' && (
          <Card className="border-slate-200">
            <CardHeader title="Customer Invoices" subtitle="Billing statements and milestone invoices." />
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {customerInvoices.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No invoices issued for this customer yet.</div>
                ) : (
                  customerInvoices.map((inv) => (
                    <div key={inv.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-navy-900 block">{inv.invoiceNumber}</span>
                        <span className="text-slate-500">Issue Date: {new Date(inv.issueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 block">₹{inv.totalAmount.toLocaleString()}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'payments' && (
          <Card className="border-slate-200">
            <CardHeader title="Payment Receipts" subtitle="Recorded financial transactions." />
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {customerPayments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No payment receipts recorded yet.</div>
                ) : (
                  customerPayments.map((pay) => (
                    <div key={pay.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-navy-900 block">{pay.receiptNumber}</span>
                        <span className="text-slate-500">Method: {pay.paymentMethod} • Ref: {pay.referenceNo || 'N/A'}</span>
                      </div>
                      <span className="font-black text-emerald-700 text-sm">₹{pay.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Origin Lead Card */}
            {originLead && (
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardHeader title="Originating Lead Record" subtitle="Preserved sales lifecycle history prior to conversion." />
                <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block font-semibold">Lead ID</span>
                    <span className="font-bold text-navy-900">{originLead.leadNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Original Source</span>
                    <span className="font-bold text-navy-900">{originLead.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Conversion Date</span>
                    <span className="font-bold text-emerald-700">{new Date(originLead.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Audit Logs */}
            <Card className="border-slate-200">
              <CardHeader title="Account Activity Log" subtitle="System changes recorded for this customer." />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100 text-xs max-h-64 overflow-y-auto">
                  {customerLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No account activity logs recorded.</div>
                  ) : (
                    customerLogs.map((log) => (
                      <div key={log.id} className="p-3.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-navy-900 block">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-slate-500">{log.details}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        <CustomerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customerToEdit={customer}
        />
      </div>
    </ModuleGuard>
  );
}
