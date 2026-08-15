'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Quotation, QuotationItem, QuotationStatus } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { FileText, Plus, Trash2, Zap, DollarSign, Calculator, Send } from 'lucide-react';

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

  const [siteAddress, setSiteAddress] = useState('MIDC Industrial Estate, Pune');
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
      setSiteAddress(quotationToEdit.siteAddress || 'Site Address Location');
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
  const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
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
      siteAddress: siteAddress || selectedCust?.address,
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
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <Calculator className="w-5 h-5 text-brand-purple" />
          {quotationToEdit ? `Edit Quotation — ${quotationToEdit.quotationNumber}` : 'Interactive Solar Quotation Builder'}
        </span>
      }
      subtitle="Configure system capacity (kW/MW), add products from catalog, apply GST, and set additional charges."
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
        {/* Customer & Proposal Title Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Customer Account *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              {customers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.fullName} ({cust.customerType}) — {cust.customerNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Proposal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 10 kW Commercial Solar System Proposal"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        {/* Capacity Sizing & Units (kW / MW) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Solar System Capacity</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                step={0.5}
                value={capacityKw}
                onChange={(e) => setCapacityKw(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-brand-purple text-sm"
              />
              <select
                value={capacityUnit}
                onChange={(e) => setCapacityUnit(e.target.value as 'kW' | 'MW')}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
              >
                <option value="kW">kW</option>
                <option value="MW">MW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Proposal Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuotationStatus)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-xs"
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent to Customer</option>
              <option value="VIEWED">Viewed</option>
              <option value="NEGOTIATION">In Negotiation</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Site Location</label>
            <input
              type="text"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Product Line Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-navy-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-purple" /> Equipment & Hardware Line Items
            </h4>
            <Button variant="outline" size="sm" onClick={handleAddItem} icon={<Plus className="w-3.5 h-3.5" />}>
              Add Product Line
            </Button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5">Product</th>
                  <th className="p-2.5 w-20">Qty</th>
                  <th className="p-2.5 w-28">Unit Price (₹)</th>
                  <th className="p-2.5 w-24">Discount (₹)</th>
                  <th className="p-2.5 w-20">GST %</th>
                  <th className="p-2.5 text-right w-28">Line Total (₹)</th>
                  <th className="p-2.5 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="p-2">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.unitPrice.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center font-bold"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-bold"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.discountAmount || 0}
                        onChange={(e) => handleItemChange(idx, 'discountAmount', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-rose-600 font-medium"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={item.gstPercentage || 12}
                        onChange={(e) => handleItemChange(idx, 'gstPercentage', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                      >
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={5}>5%</option>
                      </select>
                    </td>
                    <td className="p-2 text-right font-black text-navy-900">
                      ₹{(item.totalPrice || 0).toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={lineItems.length <= 1}
                        className="text-slate-400 hover:text-rose-500 disabled:opacity-30"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Installation & Mounting (₹)</label>
            <input
              type="number"
              value={installationCharges}
              onChange={(e) => setInstallationCharges(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transportation & Freight (₹)</label>
            <input
              type="number"
              value={transportationCharges}
              onChange={(e) => setTransportationCharges(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Other / Misc Charges (₹)</label>
            <input
              type="number"
              value={otherCharges}
              onChange={(e) => setOtherCharges(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
            />
          </div>
        </div>

        {/* Automatic Financial Calculation Card */}
        <div className="bg-navy-950 text-white p-4 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Hardware Subtotal:</span>
            <span className="font-mono">₹{subtotal.toLocaleString()}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Item Discounts:</span>
              <span className="font-mono">-₹{totalDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-brand-purplelight">
            <span>GST Taxes (12%/18%):</span>
            <span className="font-mono">+₹{totalGst.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-amber-400">
            <span>Additional Services (Installation & Freight):</span>
            <span className="font-mono">+₹{additionalChargesTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
            <span>Grand Total Payable:</span>
            <span className="text-emerald-400">₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Terms & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
            <textarea
              rows={2}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Warranty & Compliance Terms</label>
            <textarea
              rows={2}
              value={warrantyTerms}
              onChange={(e) => setWarrantyTerms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleSave('DRAFT')}
              className="border-slate-300 text-slate-700"
            >
              Save as Draft
            </Button>
            <Button
              variant="accent"
              type="button"
              onClick={() => handleSave('SENT')}
              className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
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
