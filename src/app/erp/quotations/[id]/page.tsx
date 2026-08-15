'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/public/brand-logo';
import { QuotationBuilderModal } from '@/components/quotations/quotation-builder-modal';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Printer,
  ArrowLeft,
  Edit,
  Send,
  ShoppingBag,
  Zap,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const quotationId = params?.id as string;

  const { quotations, updateQuotationStatus, convertQuotationToOrder } = useSolarStore();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const quotation = quotations.find((q) => q.id === quotationId);

  if (!quotation) {
    return (
      <ModuleGuard module="quotations" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Quotation Record Not Found</h2>
          <p className="text-xs text-slate-500">The requested quotation number does not exist.</p>
          <Link href="/erp/quotations">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Quotations Directory
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  const subtotal = quotation.subtotalAmount || quotation.items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  const discount = quotation.discountAmount || 0;
  const tax = quotation.taxAmount || Math.round(subtotal * 0.12);
  const addCharges = (quotation.installationCharges || 0) + (quotation.transportationCharges || 0) + (quotation.otherCharges || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    updateQuotationStatus(quotation.id, 'SENT');
    addToast({ title: 'Quotation status updated to SENT!', type: 'success' });
  };

  const handleConvertToOrder = () => {
    try {
      const order = convertQuotationToOrder(quotation.id);
      addToast({ title: `Converted quotation to Order ${order.orderNumber}!`, type: 'success' });
      router.push('/erp/orders');
    } catch (e: any) {
      addToast({ title: e.message || 'Failed to convert quotation to order', type: 'error' });
    }
  };

  return (
    <ModuleGuard module="quotations" action="view">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Control Bar (Hidden during PDF print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link href="/erp/quotations">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Quotations Directory
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBuilderOpen(true)}
              icon={<Edit className="w-4 h-4" />}
            >
              Edit Proposal
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSend}
              icon={<Send className="w-4 h-4 text-brand-purple" />}
            >
              Mark Sent
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={handlePrint}
              className="bg-brand-dark text-white font-bold"
              icon={<Printer className="w-4 h-4" />}
            >
              Print / Export PDF
            </Button>

            {quotation.status !== 'APPROVED' && (
              <Button
                variant="accent"
                size="sm"
                onClick={handleConvertToOrder}
                className="bg-emerald-600 text-white font-bold"
                icon={<ShoppingBag className="w-4 h-4" />}
              >
                Convert to Order
              </Button>
            )}
          </div>
        </div>

        {/* Printable PDF Quotation Proposal Document */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 sm:p-12 space-y-8 text-navy-900 print:shadow-none print:border-none print:p-0">
          {/* Header Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 pb-6">
            <BrandLogo variant="dark" />
            <div className="text-right text-xs space-y-1">
              <span className="text-xl font-black text-brand-purple font-mono block">{quotation.quotationNumber}</span>
              <div className="text-slate-500">Date: {new Date(quotation.createdAt).toLocaleDateString()}</div>
              <div className="text-slate-500">Valid Until: <strong className="text-navy-900">{new Date(quotation.validUntil).toLocaleDateString()}</strong></div>
              <div className="pt-1">
                <StatusBadge status={quotation.status} />
              </div>
            </div>
          </div>

          {/* Customer & System Sizing Proposal Banner */}
          <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2">
              <span className="text-xs text-brand-purplelight font-bold uppercase tracking-wider">
                Turnkey Solar System Proposal
              </span>
              <h2 className="text-2xl font-black text-white">{quotation.proposalTitle || `${quotation.systemCapacityKw} kW Solar Power Plant`}</h2>
              <p className="text-xs text-slate-300">
                Prepared for: <strong className="text-white">{quotation.customerName}</strong> ({quotation.customerEmail || 'Client'})
              </p>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-purplelight" />
                <span>Site: {quotation.siteAddress || 'Project Location'}</span>
              </div>
            </div>

            <div className="md:col-span-4 bg-slate-900 p-4 rounded-xl text-center border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block uppercase font-bold">Design Capacity</span>
              <span className="text-3xl font-black text-brand-purplelight">{quotation.systemCapacityKw} {quotation.capacityUnit || 'kW'}</span>
            </div>
          </div>

          {/* Itemized Product Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-2">
              Bill of Materials & Equipment Breakdown
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">#</th>
                    <th className="p-3">Component Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price (₹)</th>
                    <th className="p-3 text-right">Discount (₹)</th>
                    <th className="p-3 text-right">GST %</th>
                    <th className="p-3 text-right">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-3 font-semibold text-navy-900">{item.productName}</td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-right text-rose-600">
                        {item.discountAmount ? `-₹${item.discountAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3 text-right font-medium">{item.gstPercentage || 12}%</td>
                      <td className="p-3 text-right font-black text-navy-900">₹{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Charges & Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
            <div className="md:col-span-7 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-navy-900 uppercase text-[10px] tracking-wider">Payment Terms & Schedule</h4>
                <p className="text-slate-700 leading-relaxed">
                  {quotation.paymentTerms || '20% advance upon order confirmation, 70% prior to dispatch, 10% post grid synchronization.'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-navy-900 uppercase text-[10px] tracking-wider">Warranty & Compliance Guarantee</h4>
                <p className="text-slate-700 leading-relaxed">
                  {quotation.warrantyTerms || '25 Years linear power warranty on PV modules. 10 Years inverter warranty.'}
                </p>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-navy-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2">
                Financial Summary
              </h4>

              <div className="flex justify-between text-slate-600">
                <span>Hardware Subtotal:</span>
                <span className="font-bold text-navy-900">₹{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Special Proposal Discount:</span>
                  <span className="font-bold">-₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>GST Tax Amount:</span>
                <span className="font-bold text-brand-purple">₹{tax.toLocaleString()}</span>
              </div>

              {addCharges > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Installation, Transport & Services:</span>
                  <span className="font-bold text-slate-800">₹{addCharges.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-navy-900 border-t border-slate-300 pt-3">
                <span>Grand Total (Incl Taxes):</span>
                <span className="text-emerald-700">₹{quotation.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms & Authorization Footer */}
          <div className="border-t border-slate-200 pt-6 text-xs text-slate-500 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-1">
              <span className="font-bold text-navy-900 block">nitish solar Engineering Desk</span>
              <p className="text-[10px]">nitish solar Technology Park, Industrial Estate, Pune - 411057</p>
              <p className="text-[10px]">Phone: +91 98765 43210 • Email: info@nitishsolar.com</p>
            </div>

            <div className="text-right space-y-2">
              <div className="h-12 border-b border-slate-300 w-48 ml-auto" />
              <span className="font-bold text-navy-900 block">Authorized Sales Executive Signature</span>
              <span className="text-[10px] text-slate-400">{quotation.salesExecutiveName || 'Siddharth Patel'}</span>
            </div>
          </div>
        </div>

        {/* Builder Modal */}
        <QuotationBuilderModal
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
          quotationToEdit={quotation}
        />
      </div>
    </ModuleGuard>
  );
}
