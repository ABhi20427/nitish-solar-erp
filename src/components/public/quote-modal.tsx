'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useSolarStore } from '@/lib/store-context';
import { calculateSolarSystem } from '@/lib/solar-calc';
import { CheckCircle2, Sun, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

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
  });

  const [submittedLead, setSubmittedLead] = useState<any>(null);

  const calcEst = calculateSolarSystem({
    monthlyBillAmount: formData.monthlyBillAmount,
    customerType: formData.customerType,
    availableRoofAreaSqFt: formData.roofAreaSqFt,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    const created = addLead({
      fullName: formData.fullName,
      companyName: formData.companyName,
      phone: formData.phone,
      email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      customerType: formData.customerType,
      monthlyBillAmount: Number(formData.monthlyBillAmount),
      city: formData.city || 'Pune',
      state: formData.state,
      address: formData.address || 'Project Location',
      roofAreaSqFt: Number(formData.roofAreaSqFt),
      proposedCapacityKw: calcEst.recommendedCapacityKw,
      notes: formData.notes || `Quote request submitted to nitish solar for a ${calcEst.recommendedCapacityKw} kW system`,
      source: 'nitish solar Web Quote Form',
      priority: 'HIGH',
    });

    setSubmittedLead(created);
  };

  const handleReset = () => {
    setSubmittedLead(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={
        submittedLead ? (
          <span className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" /> Quote Request Received
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-purplelight" /> Request a Quote from nitish solar
          </span>
        )
      }
      subtitle={
        submittedLead
          ? `Lead Reference: ${submittedLead.leadNumber}`
          : 'Get an engineering system recommendation, payback estimate, & free site survey.'
      }
      maxWidth="lg"
    >
      {submittedLead ? (
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-navy-900">Thank You, {submittedLead.fullName}!</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              Your inquiry for a <strong className="text-brand-purple font-bold">{submittedLead.proposedCapacityKw} kW</strong> system has been routed to the engineering team at <strong className="text-navy-900 font-bold">nitish solar</strong>.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Lead Reference:</span>
              <span className="font-bold text-navy-900">{submittedLead.leadNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Recommended Capacity:</span>
              <span className="font-bold text-navy-900">{submittedLead.proposedCapacityKw} kWp</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Subsidy / Benefits Est:</span>
              <span className="font-bold text-emerald-600">₹{calcEst.subsidyEstimate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Engineer:</span>
              <span className="font-bold text-navy-900">{submittedLead.assignedToName || 'Siddharth Patel'}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={handleReset}>
              Close
            </Button>
            <Link href="/erp/leads" onClick={handleReset}>
              <Button variant="accent" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white" icon={<ArrowRight className="w-4 h-4" />}>
                View Lead in nitish solar ERP
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/40 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Sharma Logistics"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/40 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/40 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/40 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
              <select
                value={formData.customerType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerType: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/40 outline-none bg-white font-medium"
              >
                <option value="RESIDENTIAL">Residential Property</option>
                <option value="COMMERCIAL">Commercial Building / Office</option>
                <option value="INDUSTRIAL">Industrial Factory Plant</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Electricity Bill (₹)</label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={formData.monthlyBillAmount}
                onChange={(e) => setFormData({ ...formData, monthlyBillAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/40 outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Recommended Capacity:</span>
              <span className="text-base font-extrabold text-navy-900">{calcEst.recommendedCapacityKw} kW System</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Est. Annual Generation:</span>
              <span className="text-sm font-bold text-emerald-700">{calcEst.annualGenerationKwh.toLocaleString()} kWh</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location & Project Notes</label>
            <textarea
              rows={2}
              placeholder="City, roof area, or specific energy requirements..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/40 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-magenta text-white font-bold">
              Submit Quote Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
