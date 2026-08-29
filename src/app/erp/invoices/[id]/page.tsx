'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { Receipt, ArrowLeft, Printer, CreditCard, DollarSign, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;

  const { invoices, payments } = useSolarStore();

  const invoice = invoices.find((i) => i.id === invoiceId);

  if (!invoice) {
    return (
      <ModuleGuard module="invoices" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Invoice Record Not Found</h2>
          <p className="text-xs text-slate-500">The requested tax invoice ID does not exist.</p>
          <Link href="/erp/invoices">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Invoices Desk
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  const linkedPayments = payments.filter((p) => p.invoiceId === invoice.id || p.invoiceNumber === invoice.invoiceNumber);

  return (
    <ModuleGuard module="invoices" action="view">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between print:hidden">
          <Link href="/erp/invoices">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Invoices Desk
            </Button>
          </Link>

          <Button
            variant="accent"
            size="sm"
            onClick={() => window.print()}
            className="bg-navy-950 text-white font-bold"
            icon={<Printer className="w-4 h-4 text-amber-400" />}
          >
            Print Tax Invoice PDF
          </Button>
        </div>

        {/* Printable GST Tax Invoice Document Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0">
          {/* Header Letterhead */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="nitish solar logo" width={160} height={40} className="h-10 w-auto object-contain" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Nitish Solar Energy Pvt. Ltd. • Turnkey Engineering, Procurement & Construction (EPC)<br />
                GSTIN: 27AABCN9842F1Z6 • HSN/SAC Code: 995468<br />
                nitish solar, Chromepet, Chennai - 600044
              </p>
            </div>

            <div className="text-right space-y-1 text-xs">
              <span className="bg-amber-100 text-amber-900 font-mono font-bold px-3 py-1 rounded text-sm block">
                TAX INVOICE
              </span>
              <span className="font-mono text-base font-black text-navy-900 block">{invoice.invoiceNumber}</span>
              <div className="pt-1">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          {/* Billing & Invoice Metadata */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Billed To (Customer):</span>
              <strong className="text-sm text-navy-900 font-bold block">{invoice.customerName}</strong>
              <p className="text-slate-600">
                Project Reference: <strong className="text-slate-800">{invoice.projectNumber || 'Turnkey Solar System Installation'}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Invoice Date & Terms:</span>
              <p className="text-slate-700">Issue Date: <strong>{new Date(invoice.issueDate).toLocaleDateString()}</strong></p>
              <p className="text-rose-600 font-bold">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p className="text-slate-600">Terms: <strong>{invoice.paymentTerms || 'Advance + Balance'}</strong></p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="p-3.5">Milestone Line Description</th>
                  <th className="p-3.5 text-center">HSN/SAC</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-right">Rate (₹)</th>
                  <th className="p-3.5 text-right">GST %</th>
                  <th className="p-3.5 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3.5 font-semibold text-navy-900">{item.productName}</td>
                      <td className="p-3.5 text-center font-mono text-slate-500">995468</td>
                      <td className="p-3.5 text-center font-bold">{item.quantity}</td>
                      <td className="p-3.5 text-right">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="p-3.5 text-right text-slate-600">12%</td>
                      <td className="p-3.5 text-right font-bold text-navy-900">₹{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3.5 font-semibold text-navy-900">
                      Supply, Installation, & Commissioning of Rooftop Solar Power System (Milestone Invoice)
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-500">995468</td>
                    <td className="p-3.5 text-center font-bold">1 Lot</td>
                    <td className="p-3.5 text-right">₹{invoice.subtotal.toLocaleString()}</td>
                    <td className="p-3.5 text-right text-slate-600">12%</td>
                    <td className="p-3.5 text-right font-bold text-navy-900">₹{invoice.subtotal.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Table */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 text-xs">
            <div className="space-y-2 max-w-sm">
              <span className="font-bold text-navy-900 block">Bank Payment Account Details:</span>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 space-y-0.5">
                <p>Account Name: Nitish Solar Energy Pvt Ltd</p>
                <p>Bank Name: State Bank of India (Industrial Branch)</p>
                <p>A/C Number: 409811098221</p>
                <p>IFSC Code: SBIN0008822</p>
              </div>
            </div>

            <div className="w-full md:w-72 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-navy-900">₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (12%):</span>
                <span className="font-bold text-slate-800">₹{invoice.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200 text-navy-900">
                <span>Invoice Total:</span>
                <span className="text-amber-600 font-black">₹{invoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 pt-1">
                <span>Amount Paid:</span>
                <span className="font-bold">₹{invoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-slate-200 text-sm">
                <span>Balance Due:</span>
                <span>₹{invoice.balanceAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Linked Payment Receipts History */}
          {linkedPayments.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-navy-900 uppercase text-[10px]">Payment Receipts Recorded Against Invoice</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {linkedPayments.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between bg-slate-50">
                    <span className="font-mono font-bold text-navy-900">{p.receiptNumber}</span>
                    <span className="text-slate-600">Method: {p.paymentMethod.replace(/_/g, ' ')} • UTR: {p.referenceNo || 'N/A'}</span>
                    <span className="font-black text-emerald-700">₹{p.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModuleGuard>
  );
}
