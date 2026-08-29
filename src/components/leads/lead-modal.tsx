'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Lead, LeadStatus, Priority, CustomerType } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { Users, Zap, Calendar, Phone, Mail, MapPin } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}

export function LeadModal({ isOpen, onClose, leadToEdit }: LeadModalProps) {
  const { addLead, updateLead, users } = useSolarStore();

  const salesExecs = users.filter(
    (u) => u.role === 'SALES_EXECUTIVE' || u.role === 'SALES_MANAGER' || u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
  );

  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    email: '',
    address: 'Chromepet, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    customerType: 'RESIDENTIAL' as CustomerType,
    source: 'Website',
    proposedCapacityKw: 10,
    monthlyBillAmount: 15000,
    priority: 'MEDIUM' as Priority,
    status: 'NEW' as LeadStatus,
    assignedToId: 'user-4',
    assignedToName: 'Siddharth Patel',
    nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (leadToEdit) {
      setForm({
        fullName: leadToEdit.fullName,
        companyName: leadToEdit.companyName || '',
        phone: leadToEdit.phone,
        email: leadToEdit.email,
        address: leadToEdit.address || 'Chromepet, Chennai',
        city: leadToEdit.city || 'Chennai',
        state: leadToEdit.state || 'Tamil Nadu',
        customerType: leadToEdit.customerType,
        source: leadToEdit.source || 'Website',
        proposedCapacityKw: leadToEdit.proposedCapacityKw || 10,
        monthlyBillAmount: leadToEdit.monthlyBillAmount || 15000,
        priority: leadToEdit.priority,
        status: leadToEdit.status,
        assignedToId: leadToEdit.assignedToId || 'user-4',
        assignedToName: leadToEdit.assignedToName || 'Siddharth Patel',
        nextFollowUpDate: leadToEdit.nextFollowUpDate ? leadToEdit.nextFollowUpDate.split('T')[0] : '',
        notes: leadToEdit.notes || '',
      });
    } else {
      setForm({
        fullName: '',
        companyName: '',
        phone: '',
        email: '',
        address: 'Chromepet, Chennai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        customerType: 'RESIDENTIAL',
        source: 'Website',
        proposedCapacityKw: 10,
        monthlyBillAmount: 15000,
        priority: 'MEDIUM',
        status: 'NEW',
        assignedToId: 'user-4',
        assignedToName: 'Siddharth Patel',
        nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [leadToEdit, isOpen]);

  const handleExecChange = (execId: string) => {
    const matched = users.find((u) => u.id === execId);
    setForm((prev) => ({
      ...prev,
      assignedToId: execId,
      assignedToName: matched ? matched.name : 'Siddharth Patel',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) return;

    const estVal = form.proposedCapacityKw * 45000;

    if (leadToEdit) {
      updateLead(leadToEdit.id, {
        ...form,
        estimatedProjectValue: estVal,
      });
    } else {
      addLead({
        ...form,
        estimatedProjectValue: estVal,
      });
    }

    onClose();
  };

  const LEAD_SOURCES = [
    'Website',
    'Referral',
    'Advertisement',
    'Phone',
    'Email',
    'Walk-in',
    'Social Media',
    'Other',
  ];

  const STATUSES: { id: LeadStatus; label: string }[] = [
    { id: 'NEW', label: 'New Lead' },
    { id: 'CONTACTED', label: 'Contacted' },
    { id: 'SURVEY_SCHEDULED', label: 'Site Survey' },
    { id: 'PROPOSAL_SENT', label: 'Quotation' },
    { id: 'NEGOTIATING', label: 'Negotiation' },
    { id: 'WON', label: 'Won' },
    { id: 'LOST', label: 'Lost' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <Users className="w-5 h-5 text-brand-purple" />
          {leadToEdit ? `Edit Lead — ${leadToEdit.leadNumber}` : 'Create New Solar Lead'}
        </span>
      }
      subtitle="Enter prospect contact details, system requirement, and assigned executive."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Prospect Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Sharma"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Firm Name</label>
            <input
              type="text"
              placeholder="e.g. Sharma Industries"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="name@domain.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Requirement Category</label>
            <select
              value={form.customerType}
              onChange={(e) => setForm({ ...form, customerType: e.target.value as CustomerType })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              {LEAD_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Sales Exec</label>
            <select
              value={form.assignedToId}
              onChange={(e) => handleExecChange(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              {salesExecs.map((exec) => (
                <option key={exec.id} value={exec.id}>
                  {exec.name} ({exec.role.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Est. Capacity (kW)</label>
            <input
              type="number"
              min={1}
              value={form.proposedCapacityKw}
              onChange={(e) => setForm({ ...form, proposedCapacityKw: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-brand-purple"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead Lifecycle Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              {STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Date</label>
            <input
              type="date"
              value={form.nextFollowUpDate}
              onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Notes & Requirements</label>
          <textarea
            rows={3}
            placeholder="Property details, roof type, or initial customer inquiry notes..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
            {leadToEdit ? 'Save Lead Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
