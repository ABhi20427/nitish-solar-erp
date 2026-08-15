'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { CreditCard, DollarSign, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { recordPayment, invoices } = useSolarStore();

  const [form, setForm] = useState({
    invoiceId: invoices[0]?.id || 'inv-1',
    amount: 50000,
    paymentMethod: 'BANK_TRANSFER' as PaymentMethod,
    referenceNo: '',
    notes: 'Advance milestone collection',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetInv = invoices.find((i) => i.id === form.invoiceId);

    recordPayment({
      invoiceId: form.invoiceId,
      invoiceNumber: targetInv ? targetInv.invoiceNumber : 'INV-2025-001',
      customerName: targetInv ? targetInv.customerName : 'Solar Client',
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
      referenceNo: form.referenceNo || `UTR${Date.now().toString().slice(-8)}`,
      notes: form.notes,
    });

    onClose();
  };

  const METHODS: { id: PaymentMethod; label: string }[] = [
    { id: 'BANK_TRANSFER', label: 'Bank Transfer (RTGS / NEFT / IMPS)' },
    { id: 'UPI', label: 'UPI Payment (GPay / PhonePe / BHIM)' },
    { id: 'CHEQUE', label: 'Bank Cheque / Demand Draft' },
    { id: 'CASH', label: 'Cash Collection' },
    { id: 'CARD', label: 'Credit / Debit Card' },
    { id: 'OTHER', label: 'Other Financing / Solar Loan' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          Record Payment Receipt
        </span>
      }
      subtitle="Log customer payment collection and automatically update invoice balance."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Select Target Invoice *</label>
          <select
            value={form.invoiceId}
            onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
          >
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — {inv.customerName} (Bal: ₹{inv.balanceAmount.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
            <input
              type="number"
              min={1}
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-emerald-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Channel Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              {METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Reference UTR / Cheque / Transaction No.</label>
          <input
            type="text"
            placeholder="e.g. UTR-98421098221"
            value={form.referenceNo}
            onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Receipt Remarks & Payment Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold">
            Record Payment Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
}
