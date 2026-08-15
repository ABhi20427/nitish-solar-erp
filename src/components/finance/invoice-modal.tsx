'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { InvoiceStatus } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { Receipt, DollarSign, Calendar, FileText } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ isOpen, onClose }: InvoiceModalProps) {
  const { addInvoice, customers, projects } = useSolarStore();

  const [form, setForm] = useState({
    customerId: customers[0]?.id || 'cust-1',
    projectId: projects[0]?.id || 'proj-1',
    paymentTerms: 'Advance + Balance (20%/80%)',
    subtotal: 400000,
    taxAmount: 48000,
    totalAmount: 448000,
    paidAmount: 89600,
    status: 'ISSUED' as InvoiceStatus,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCust = customers.find((c) => c.id === form.customerId);
    const targetProj = projects.find((p) => p.id === form.projectId);
    if (!targetCust) return;

    const sub = Number(form.subtotal);
    const tax = Number(form.taxAmount);
    const tot = sub + tax;

    addInvoice({
      customerId: targetCust.id,
      customerName: targetCust.fullName,
      projectId: targetProj?.id,
      projectNumber: targetProj?.projectNumber,
      paymentTerms: form.paymentTerms,
      subtotal: sub,
      taxAmount: tax,
      totalAmount: tot,
      paidAmount: Number(form.paidAmount),
      balanceAmount: Math.max(0, tot - Number(form.paidAmount)),
      status: form.status,
      dueDate: form.dueDate,
    });

    onClose();
  };

  const TERMS = [
    'Full Payment upfront (100%)',
    'Advance + Balance (20%/80%)',
    'Milestone Based (30%/40%/30%)',
    'Custom Terms',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <Receipt className="w-5 h-5 text-amber-500" />
          Issue Turnkey Milestone Invoice
        </span>
      }
      subtitle="Create a tax invoice linked to customer accounts and turnkey solar projects."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Customer Account *</label>
          <select
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.customerType}) — {c.customerNumber}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Linked Turnkey Project</label>
          <select
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectNumber} — {p.customerName} ({p.systemSizeKw} kW)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Payment Structure Terms</label>
          <select
            value={form.paymentTerms}
            onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
          >
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subtotal Amount (₹)</label>
            <input
              type="number"
              value={form.subtotal}
              onChange={(e) => {
                const sub = Number(e.target.value);
                const tax = Math.round(sub * 0.12);
                setForm({ ...form, subtotal: sub, taxAmount: tax, totalAmount: sub + tax });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-navy-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">GST Tax Amount (₹)</label>
            <input
              type="number"
              value={form.taxAmount}
              onChange={(e) => {
                const tax = Number(e.target.value);
                setForm({ ...form, taxAmount: tax, totalAmount: form.subtotal + tax });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Paid Amount (₹)</label>
            <input
              type="number"
              value={form.paidAmount}
              onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Invoice Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold">
            Issue Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}
