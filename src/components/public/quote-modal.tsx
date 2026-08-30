'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useSolarStore } from '@/lib/store-context';
import { calculateSolarSystem } from '@/lib/solar-calc';
import { CheckCircle2, Zap } from 'lucide-react';

export function QuoteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addLead } = useSolarStore();

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    email: '',
    city: '',
    state: 'Maharashtra',
    address: '',
    customerType: 'RESIDENTIAL' as 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL',
    monthlyBillAmount: 12000,
    proposedCapacityKw: 10,
    roofAreaSqFt: 1200,
    notes: '',
    website_hp: '',
  });

  const [submittedLead, setSubmittedLead] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pdfBase64Data, setPdfBase64Data] = useState<string | null>(null);

  const calcEst = calculateSolarSystem({
    monthlyBillAmount: formData.monthlyBillAmount,
    customerType: formData.customerType,
    availableRoofAreaSqFt: formData.roofAreaSqFt,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address to receive your solar proposal PDF.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setPdfBase64Data(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          company: formData.companyName,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          location: formData.notes,
          propertyType: formData.customerType,
          requiredCapacity: calcEst.recommendedCapacityKw,
          monthlyBill: formData.monthlyBillAmount,
          message: formData.notes,
          website_hp: formData.website_hp,
          source: 'nitish solar Modal Quote Form',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const created = addLead({
          fullName: formData.fullName,
          companyName: formData.companyName,
          phone: formData.phone,
          email: formData.email,
          customerType: formData.customerType,
          monthlyBillAmount: Number(formData.monthlyBillAmount),
          city: formData.city || 'Chennai',
          state: formData.state,
          address: formData.address || 'Project Location',
          roofAreaSqFt: Number(formData.roofAreaSqFt),
          proposedCapacityKw: calcEst.recommendedCapacityKw,
          notes: formData.notes || `Quote request submitted to nitish solar for a ${calcEst.recommendedCapacityKw} kW system`,
          source: 'nitish solar Web Quote Form',
          priority: 'HIGH',
        });
        setSubmittedLead({ ...created, quotNo: data.quotNo });
        if (data.pdfBase64) {
          setPdfBase64Data(data.pdfBase64);
        }
      } else {
        setErrorMessage(data.error || "We couldn't send your proposal. Please verify your email address and try again.");
      }
    } catch (err: any) {
      setErrorMessage("Could not connect to the proposal server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadProposalPdf = () => {
    if (!pdfBase64Data) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdfBase64Data}`;
    link.download = `Solar_Proposal_${submittedLead?.quotNo || 'Quotation'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSubmittedLead(null);
    setPdfBase64Data(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={
        submittedLead ? (
          <span className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" /> Proposal Emailed & Received
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-purplelight" /> Request a Quote from nitish solar
          </span>
        )
      }
      subtitle={
        submittedLead
          ? `Proposal Ref: ${submittedLead.quotNo || submittedLead.leadNumber}`
          : 'Get an engineering system recommendation, payback estimate, & free site survey.'
      }
      maxWidth="lg"
    >
      {submittedLead ? (
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">Thank You, {submittedLead.fullName}!</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Your official Solar Proposal & Quotation PDF (<strong className="text-amber-400 font-bold">{submittedLead.quotNo}</strong>) has been generated and sent to your email address: <strong className="text-white font-bold">{formData.email}</strong>.
            </p>
          </div>

          <div className="bg-[#0B0F17] border border-slate-800 rounded-xl p-4 text-left max-w-md mx-auto text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Quotation No:</span>
              <span className="font-bold text-white">{submittedLead.quotNo}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Recommended Capacity:</span>
              <span className="font-bold text-white">{submittedLead.proposedCapacityKw} kWp System</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Subsidy / Tax Benefit:</span>
              <span className="font-bold text-emerald-400">₹{calcEst.subsidyEstimate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PDF Delivery Status:</span>
              <span className="font-bold text-emerald-400">Sent to {formData.email}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {pdfBase64Data && (
              <Button type="button" onClick={downloadProposalPdf} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6">
                ⬇ Download Proposal PDF
              </Button>
            )}
            <Button variant="accent" onClick={handleReset} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Honeypot Field */}
          <input
            type="text"
            name="website_hp"
            value={formData.website_hp}
            onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {errorMessage && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Sharma Logistics"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address * (PDF Attachment Sent Here)</label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Property Type</label>
              <select
                value={formData.customerType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerType: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white focus:border-amber-400 outline-none font-medium"
              >
                <option value="RESIDENTIAL" className="bg-[#0B0F17]">Residential Property</option>
                <option value="COMMERCIAL" className="bg-[#0B0F17]">Commercial Building / Office</option>
                <option value="INDUSTRIAL" className="bg-[#0B0F17]">Industrial Factory Plant</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Monthly Electricity Bill (₹)</label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={formData.monthlyBillAmount}
                onChange={(e) => setFormData({ ...formData, monthlyBillAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="bg-[#0B0F17] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Recommended Capacity:</span>
              <span className="text-base font-extrabold text-white">{calcEst.recommendedCapacityKw} kW System</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Est. Annual Generation:</span>
              <span className="text-sm font-bold text-emerald-400">{calcEst.annualGenerationKwh.toLocaleString()} kWh</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Location & Project Notes</label>
            <textarea
              rows={2}
              placeholder="City, roof area, or specific energy requirements..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} className="border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white">
              Cancel
            </Button>
            <Button variant="accent" type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-50">
              {isSubmitting ? '⏳ Generating PDF & Emailing...' : '⚡ Get Proposal PDF via Email'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
