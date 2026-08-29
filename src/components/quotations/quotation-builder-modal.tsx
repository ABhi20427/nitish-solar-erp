'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Quotation, QuotationItem, QuotationStatus } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import {
  FileText,
  Plus,
  Trash2,
  Zap,
  DollarSign,
  Calculator,
  Send,
  User,
  MapPin,
  ShieldCheck,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface QuotationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationToEdit?: Quotation | null;
}

export function QuotationBuilderModal({ isOpen, onClose, quotationToEdit }: QuotationBuilderModalProps) {
  const { customers, products, createQuotation, updateQuotation } = useSolarStore();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [proposalTitle, setProposalTitle] = useState('10 kW Commercial Solar System Proposal');
  const [capacityKw, setCapacityKw] = useState(10);
  const [capacityUnit, setCapacityUnit] = useState<'kW' | 'MW'>('kW');
  const [status, setStatus] = useState<QuotationStatus>('DRAFT');

  const [siteAddress, setSiteAddress] = useState('Chromepet, Chennai');
  const [installationCharges, setInstallationCharges] = useState(25000);
  const [transportationCharges, setTransportationCharges] = useState(8000);
  const [otherCharges, setOtherCharges] = useState(2000);

  const [paymentTerms, setPaymentTerms] = useState('20% advance, 70% material dispatch, 10% grid sync');
  const [warrantyTerms, setWarrantyTerms] = useState('25 Years solar module linear warranty, 10 Years inverter warranty');
  const [notes, setNotes] = useState('');

  // Line items
  const [lineItems, setLineItems] = useState<QuotationItem[]>([
    {
      id: 'item-1',
      productId: products[0]?.id || 'prod-1',
      productName: products[0]?.name || 'nitish solar Apex 540W N-Type TOPCon Panel',
      quantity: 20,
      unitPrice: 14500,
      discountAmount: 10000,
      gstPercentage: 12,
      gstAmount: 33600,
      totalPrice: 280000,
    },
  ]);

  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    if (quotationToEdit) {
      setSelectedCustomerId(quotationToEdit.customerId || customers[0]?.id || '');
      setProposalTitle(quotationToEdit.proposalTitle || '10 kW Commercial Solar System Proposal');
      setCapacityKw(quotationToEdit.systemCapacityKw || 10);
      setCapacityUnit(quotationToEdit.capacityUnit || 'kW');
      setStatus(quotationToEdit.status);
      setSiteAddress(quotationToEdit.siteAddress || 'Chromepet, Chennai');
      setInstallationCharges(quotationToEdit.installationCharges || 25000);
      setTransportationCharges(quotationToEdit.transportationCharges || 8000);
      setOtherCharges(quotationToEdit.otherCharges || 2000);
      setPaymentTerms(quotationToEdit.paymentTerms || '20% advance, 70% material dispatch, 10% grid sync');
      setWarrantyTerms(quotationToEdit.warrantyTerms || '25 Years module warranty, 10 Years inverter warranty');
      setNotes(quotationToEdit.notes || '');
      if (quotationToEdit.items && quotationToEdit.items.length > 0) {
        setLineItems(quotationToEdit.items);
      }
    }
  }, [quotationToEdit, isOpen, customers]);

  // Handle line item changes
  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };

      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        if (prod) {
          target.productName = prod.name;
          target.unitPrice = prod.unitPrice;
          target.gstPercentage = prod.gstPercentage || 12;
        }
      }

      const qty = target.quantity || 1;
      const price = target.unitPrice || 0;
      const disc = target.discountAmount || 0;
      const gstPct = target.gstPercentage || 12;

      const sub = Math.max(0, qty * price - disc);
      const gstAmt = Math.round(sub * (gstPct / 100));
      target.gstAmount = gstAmt;
      target.totalPrice = sub + gstAmt;

      updated[index] = target;
      return updated;
    });
  };

  const handleAddItem = () => {
    const firstProd = products[0];
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      productId: firstProd?.id || 'prod-1',
      productName: firstProd?.name || 'nitish solar 540W Mono Panel',
      quantity: 10,
      unitPrice: firstProd?.unitPrice || 14500,
      discountAmount: 0,
      gstPercentage: firstProd?.gstPercentage || 12,
      gstAmount: 17400,
      totalPrice: 162400,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Automatic Calculation Engine
  const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const totalDiscount = lineItems.reduce((acc, item) => acc + (item.discountAmount || 0), 0);
  const totalGst = lineItems.reduce((acc, item) => acc + (item.gstAmount || 0), 0);
  const additionalChargesTotal = Number(installationCharges) + Number(transportationCharges) + Number(otherCharges);
  const grandTotal = subtotal - totalDiscount + totalGst + additionalChargesTotal;

  const handleSave = (targetStatus: QuotationStatus) => {
    const selectedCust = customers.find((c) => c.id === selectedCustomerId) || customers[0];

    const quotationData: Partial<Quotation> = {
      customerId: selectedCust?.id,
      customerName: selectedCust?.fullName || 'Solar Client',
      customerEmail: selectedCust?.email,
      customerPhone: selectedCust?.phone,
      proposalTitle,
      systemCapacityKw: Number(capacityKw),
      capacityUnit,
      siteAddress: siteAddress || selectedCust?.address || 'Chromepet, Chennai',
      items: lineItems,
      subtotalAmount: subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalGst,
      installationCharges: Number(installationCharges),
      transportationCharges: Number(transportationCharges),
      otherCharges: Number(otherCharges),
      totalAmount: grandTotal,
      paymentTerms,
      warrantyTerms,
      notes,
      status: targetStatus,
    };

    if (quotationToEdit) {
      updateQuotation(quotationToEdit.id, quotationData);
    } else {
      createQuotation(quotationData);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">
                {quotationToEdit ? `Edit Quotation — ${quotationToEdit.quotationNumber}` : 'Interactive Solar Quotation Builder'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-slate-900 border border-slate-800 text-amber-400">
                <Sparkles className="w-3 h-3 text-amber-400" />
                REAL-TIME CALCULATION ENGINE
              </span>
            </div>
          </div>
        </div>
      }
      subtitle="Configure system capacity (kW/MW), equipment items, GST taxes, logistics charges, and customer terms."
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs max-h-[78vh] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Step Progress Wizard Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
              1
            </span>
            <span className="font-bold tracking-wide text-[11px]">CLIENT & CAPACITY</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
              2
            </span>
            <span className="font-medium tracking-wide text-[11px]">HARDWARE & ITEMS</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
              3
            </span>
            <span className="font-medium tracking-wide text-[11px]">LOGISTICS & CHARGES</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
              4
            </span>
            <span className="font-medium tracking-wide text-[11px]">FINANCIAL SUMMARY</span>
          </div>
        </div>

        {/* Customer Account & Proposal Title Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs tracking-wide">
              <User className="w-4 h-4 text-amber-400" />
              CUSTOMER ACCOUNT & PROPOSAL IDENTIFICATION
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">STEP 01 / 04</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">
                Select Customer Account <span className="text-amber-400">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-100 font-medium outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
              >
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id} className="bg-slate-900 text-slate-100">
                    {cust.fullName} ({cust.customerType}) — {cust.customerNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">
                Proposal Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10 kW Commercial Solar System Proposal"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner font-medium"
              />
            </div>
          </div>
        </div>

        {/* Capacity Sizing, Status & Location Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs tracking-wide">
              <Cpu className="w-4 h-4 text-amber-400" />
              SYSTEM CAPACITY & SITE SPECIFICATIONS
            </h4>
            <span className="text-[10px] text-amber-400/80 font-mono">LIVE GEOMETRY INTEGRATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">Solar System Capacity</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={capacityKw}
                  onChange={(e) => setCapacityKw(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-950/90 border border-slate-800 rounded-xl font-mono font-bold text-amber-400 text-sm outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
                />
                <select
                  value={capacityUnit}
                  onChange={(e) => setCapacityUnit(e.target.value as 'kW' | 'MW')}
                  className="px-3.5 py-2 bg-slate-950/90 border border-slate-800 rounded-xl bg-slate-900 font-bold text-slate-200 text-xs outline-none focus:border-amber-500/80"
                >
                  <option value="kW" className="bg-slate-900 text-slate-100">kW</option>
                  <option value="MW" className="bg-slate-900 text-slate-100">MW</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">Proposal Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-200 font-semibold text-xs outline-none focus:border-amber-500/80"
              >
                <option value="DRAFT" className="bg-slate-900 text-slate-100">Draft</option>
                <option value="SENT" className="bg-slate-900 text-slate-100">Sent to Customer</option>
                <option value="VIEWED" className="bg-slate-900 text-slate-100">Viewed</option>
                <option value="NEGOTIATION" className="bg-slate-900 text-slate-100">In Negotiation</option>
                <option value="ACCEPTED" className="bg-slate-900 text-slate-100">Accepted</option>
                <option value="REJECTED" className="bg-slate-900 text-slate-100">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Project Site Location
              </label>
              <input
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-200 text-xs outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner font-medium"
              />
            </div>
          </div>
        </div>

        {/* Product Line Items Table Section */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs tracking-wide">
              <Zap className="w-4 h-4 text-amber-400" />
              EQUIPMENT & HARDWARE LINE ITEMS
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="border-slate-800 text-amber-400 hover:bg-slate-800 font-semibold text-xs transition-all rounded-xl"
              icon={<Plus className="w-3.5 h-3.5 text-amber-400" />}
            >
              Add Product Line
            </Button>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80 shadow-2xl">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 font-mono font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <th className="p-3">Product Description</th>
                  <th className="p-3 w-20">Qty</th>
                  <th className="p-3 w-32">Unit Price (₹)</th>
                  <th className="p-3 w-28">Discount (₹)</th>
                  <th className="p-3 w-24">GST %</th>
                  <th className="p-3 text-right w-32">Line Total (₹)</th>
                  <th className="p-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lineItems.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-2.5">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-amber-500/80"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                            {p.name} (₹{p.unitPrice.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-center font-mono font-bold text-amber-400 outline-none focus:border-amber-500/80"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-200 outline-none focus:border-amber-500/80"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        value={item.discountAmount || 0}
                        onChange={(e) => handleItemChange(idx, 'discountAmount', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-medium text-rose-400 outline-none focus:border-amber-500/80"
                      />
                    </td>
                    <td className="p-2.5">
                      <select
                        value={item.gstPercentage || 12}
                        onChange={(e) => handleItemChange(idx, 'gstPercentage', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-amber-500/80"
                      >
                        <option value={12} className="bg-slate-900 text-slate-100">12%</option>
                        <option value={18} className="bg-slate-900 text-slate-100">18%</option>
                        <option value={5} className="bg-slate-900 text-slate-100">5%</option>
                      </select>
                    </td>
                    <td className="p-2.5 text-right font-mono font-extrabold text-amber-400 text-xs">
                      ₹{(item.totalPrice || 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={lineItems.length <= 1}
                        className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Charges Section */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs tracking-wide">
              <Layers className="w-4 h-4 text-amber-400" />
              LOGISTICS, FREIGHT & INSTALLATION SERVICES
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">ADDITIONAL SERVICES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">Installation & Mounting (₹)</label>
              <input
                type="number"
                value={installationCharges}
                onChange={(e) => setInstallationCharges(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-100 outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">Transportation & Freight (₹)</label>
              <input
                type="number"
                value={transportationCharges}
                onChange={(e) => setTransportationCharges(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-100 outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">Other / Misc Charges (₹)</label>
              <input
                type="number"
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-100 outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Automatic Financial Calculation Telemetry Card */}
        <div className="relative overflow-hidden bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-2xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              LIVE FINANCIAL COMPUTATION BREAKDOWN
            </span>
            <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-amber-400 px-2.5 py-0.5 rounded-full">
              AUTOMATIC TAX & MARGIN ENGINE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Hardware & Equipment Subtotal:</span>
              <span className="font-mono text-slate-100 font-bold">₹{subtotal.toLocaleString()}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between items-center text-rose-400">
                <span>Total Item Discounts Applied:</span>
                <span className="font-mono font-bold">-₹{totalDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sky-400">
              <span>GST Taxes (12% / 18% Applicable):</span>
              <span className="font-mono font-bold">+₹{totalGst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-amber-300">
              <span>Additional Logistics & Services:</span>
              <span className="font-mono font-bold">+₹{additionalChargesTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-black text-white pt-3 border-t border-slate-800">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Grand Total Payable Amount:
              </span>
              <span className="text-xl font-black font-mono text-emerald-400">
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Section */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              PAYMENT TERMS & WARRANTY COMPLIANCE
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">COMMERCIAL CLAUSES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">Payment Terms & Schedule</label>
              <textarea
                rows={2}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">Warranty & Performance Guarantee</label>
              <textarea
                rows={2}
                value={warrantyTerms}
                onChange={(e) => setWarrantyTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner font-medium"
              />
            </div>
          </div>
        </div>

        {/* Footer Action Controls */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-800/90">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl text-xs font-semibold px-4 py-2"
          >
            Cancel & Close
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleSave('DRAFT')}
              className="border-slate-800 text-amber-300 hover:bg-slate-800 rounded-xl font-semibold text-xs px-4 py-2 transition-all shadow-sm"
            >
              Save as Draft
            </Button>
            <Button
              variant="accent"
              type="button"
              onClick={() => handleSave('SENT')}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-md active:scale-[0.98] transition-all px-5 py-2.5 text-xs flex items-center gap-2"
              icon={<Send className="w-4 h-4" />}
            >
              Save & Mark Sent
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
