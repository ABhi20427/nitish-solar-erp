'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { InvoiceModal } from '@/components/finance/invoice-modal';
import { PaymentModal } from '@/components/finance/payment-modal';
import { Receipt, Plus, CreditCard, CheckCircle2, DollarSign, ArrowUpRight, Search, TrendingUp, AlertTriangle } from 'lucide-react';

export default function InvoicesPage() {
  const { invoices, payments } = useSolarStore();

  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Financial Dashboard Analytics Calculations
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceAmount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'OVERDUE').reduce((acc, i) => acc + i.balanceAmount, 0);
  const thisMonthRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  const collectionPct = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.projectNumber && inv.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <ModuleGuard module="invoices" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-6 h-6 text-amber-500" /> Milestone Invoices & Finance Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Turnkey solar project milestone billing, payment receipt recording, GST tax invoices, & revenue analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsInvoiceModalOpen(true)}
              icon={<Plus className="w-4 h-4 text-amber-600" />}
            >
              Issue Invoice
            </Button>

            <Button
              variant="accent"
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold"
              icon={<CreditCard className="w-4 h-4" />}
            >
              Record Payment Receipt
            </Button>
          </div>
        </div>

        {/* Finance Dashboard KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <Card className="border-slate-200">
            <CardBody className="p-4 space-y-1">
              <span className="text-slate-500 font-semibold block">Total Invoiced</span>
              <span className="text-xl font-black text-navy-900">₹{(totalInvoiced / 100000).toFixed(2)}L</span>
              <span className="text-[10px] text-slate-400 block">{invoices.length} invoices issued</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-emerald-50/50">
            <CardBody className="p-4 space-y-1">
              <span className="text-slate-500 font-semibold block">Total Collections</span>
              <span className="text-xl font-black text-emerald-700">₹{(totalCollected / 100000).toFixed(2)}L</span>
              <span className="text-[10px] text-emerald-600 font-bold block">{collectionPct}% Collected</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-amber-50/50">
            <CardBody className="p-4 space-y-1">
              <span className="text-slate-500 font-semibold block">Outstanding Balance</span>
              <span className="text-xl font-black text-amber-700">₹{(totalOutstanding / 100000).toFixed(2)}L</span>
              <span className="text-[10px] text-amber-600 font-bold block">Pending Receipts</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-rose-50/50">
            <CardBody className="p-4 space-y-1">
              <span className="text-slate-500 font-semibold block">Overdue Collections</span>
              <span className="text-xl font-black text-rose-700">₹{(totalOverdue / 100000).toFixed(2)}L</span>
              <span className="text-[10px] text-rose-600 font-bold block">Past Due Date</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-blue-50/50">
            <CardBody className="p-4 space-y-1">
              <span className="text-slate-500 font-semibold block">This Month's Revenue</span>
              <span className="text-xl font-black text-blue-900">₹{(thisMonthRevenue / 100000).toFixed(2)}L</span>
              <span className="text-[10px] text-blue-700 font-bold block">{payments.length} receipts logged</span>
            </CardBody>
          </Card>
        </div>

        {/* Collection Revenue Distribution Bar */}
        <Card className="border-slate-200">
          <CardBody className="p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold text-navy-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Revenue Collection vs. Outstanding Distribution
              </span>
              <span className="font-mono text-emerald-700 font-black">{collectionPct}% Collected</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${collectionPct}%` }}
                title={`Collected: ₹${totalCollected.toLocaleString()}`}
              />
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${100 - collectionPct}%` }}
                title={`Outstanding: ₹${totalOutstanding.toLocaleString()}`}
              />
            </div>
          </CardBody>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'invoices'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Milestone Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'payments'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Payment Receipts History ({payments.length})
          </button>
        </div>

        {/* TAB 1: Milestone Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <Card className="border-slate-200">
              <CardBody className="p-4 space-y-3 text-xs">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search invoice by ID (e.g. INV-2025-001), customer name, or project number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Status Filter:</span>
                  {['ALL', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'DRAFT', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        statusFilter === st
                          ? 'bg-navy-950 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className="border-slate-200">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="p-3.5">Invoice ID & Customer</th>
                        <th className="p-3.5">Payment Terms</th>
                        <th className="p-3.5 text-right">Invoice Total (₹)</th>
                        <th className="p-3.5 text-right">Amount Paid (₹)</th>
                        <th className="p-3.5 text-right">Outstanding (₹)</th>
                        <th className="p-3.5">Due Date</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5">
                            <Link href={`/erp/invoices/${inv.id}`} className="font-mono font-bold text-navy-900 hover:text-amber-600 transition-colors flex items-center gap-1">
                              {inv.invoiceNumber} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                            </Link>
                            <span className="text-[11px] text-slate-600 font-bold block mt-0.5">{inv.customerName}</span>
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">
                            {inv.paymentTerms || 'Advance + Balance'}
                          </td>
                          <td className="p-3.5 text-right font-black text-navy-900 text-sm">
                            ₹{inv.totalAmount.toLocaleString()}
                          </td>
                          <td className="p-3.5 text-right font-bold text-emerald-700">
                            ₹{inv.paidAmount.toLocaleString()}
                          </td>
                          <td className="p-3.5 text-right font-extrabold text-rose-600">
                            ₹{inv.balanceAmount.toLocaleString()}
                          </td>
                          <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                            {new Date(inv.dueDate).toLocaleDateString()}
                          </td>
                          <td className="p-3.5">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="p-3.5 text-right">
                            <Link href={`/erp/invoices/${inv.id}`}>
                              <Button variant="outline" size="sm" className="text-xs">
                                View Tax Invoice
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* TAB 2: Payment Receipts History */}
        {activeTab === 'payments' && (
          <Card className="border-slate-200">
            <CardHeader title="Payment Collections Log History" subtitle="Logged receipts, payment channels, & UTR reference numbers." />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="p-3.5">Receipt No.</th>
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Invoice Ref</th>
                      <th className="p-3.5 text-right">Amount Collected (₹)</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">UTR / Ref No.</th>
                      <th className="p-3.5">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-navy-900">{pay.receiptNumber}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{pay.customerName}</td>
                        <td className="p-3.5 font-mono text-amber-600">{pay.invoiceNumber}</td>
                        <td className="p-3.5 text-right font-black text-emerald-700 text-sm">₹{pay.amount.toLocaleString()}</td>
                        <td className="p-3.5 text-slate-600 font-medium">{pay.paymentMethod.replace(/_/g, ' ')}</td>
                        <td className="p-3.5 font-mono text-slate-500">{pay.referenceNo || 'N/A'}</td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">{new Date(pay.paymentDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Modals */}
        <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
        <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
      </div>
    </ModuleGuard>
  );
}
