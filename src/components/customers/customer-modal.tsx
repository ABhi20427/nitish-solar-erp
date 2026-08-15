'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Customer, CustomerType } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { UserCheck, Building2, Phone, Mail, FileText } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export function CustomerModal({ isOpen, onClose, customerToEdit }: CustomerModalProps) {
  const { addCustomer, updateCustomer, users } = useSolarStore();

  const salesExecs = users.filter(
    (u) => u.role === 'SALES_EXECUTIVE' || u.role === 'SALES_MANAGER' || u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
  );

  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411001',
    customerType: 'RESIDENTIAL' as CustomerType,
    gstNumber: '',
    sanctionedLoadKw: 10,
    totalProjectValue: 450000,
    paymentStatus: 'PAID' as 'PAID' | 'PARTIALLY_PAID' | 'PENDING_PAYMENT' | 'OVERDUE',
    assignedToId: 'user-4',
    assignedToName: 'Siddharth Patel',
  });

  useEffect(() => {
    if (customerToEdit) {
      setForm({
        fullName: customerToEdit.fullName,
        companyName: customerToEdit.companyName || '',
        phone: customerToEdit.phone,
        email: customerToEdit.email,
        address: customerToEdit.address || '',
        city: customerToEdit.city || 'Pune',
        state: customerToEdit.state || 'Maharashtra',
        pinCode: customerToEdit.pinCode || '411001',
        customerType: customerToEdit.customerType,
        gstNumber: customerToEdit.gstNumber || '',
        sanctionedLoadKw: customerToEdit.sanctionedLoadKw || 10,
        totalProjectValue: customerToEdit.totalProjectValue || 450000,
        paymentStatus: customerToEdit.paymentStatus || 'PAID',
        assignedToId: customerToEdit.assignedToId || 'user-4',
        assignedToName: customerToEdit.assignedToName || 'Siddharth Patel',
      });
    } else {
      setForm({
        fullName: '',
        companyName: '',
        phone: '',
        email: '',
        address: '',
        city: 'Pune',
        state: 'Maharashtra',
        pinCode: '411001',
        customerType: 'RESIDENTIAL',
        gstNumber: '',
        sanctionedLoadKw: 10,
        totalProjectValue: 450000,
        paymentStatus: 'PAID',
        assignedToId: 'user-4',
        assignedToName: 'Siddharth Patel',
      });
    }
  }, [customerToEdit, isOpen]);

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

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, form);
    } else {
      addCustomer(form);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <UserCheck className="w-5 h-5 text-brand-purple" />
          {customerToEdit ? `Edit Customer — ${customerToEdit.customerNumber}` : 'Create New Solar Customer'}
        </span>
      }
      subtitle="Configure client contact details, customer type, GST, and project valuation."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patel"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
            <input
              type="text"
              placeholder="e.g. Patel Enterprises"
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
            <label className="block font-semibold text-slate-700 mb-1">Customer Category</label>
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
            <label className="block font-semibold text-slate-700 mb-1">GST Identification Number</label>
            <input
              type="text"
              placeholder="27AAAAA0000A1Z5"
              value={form.gstNumber}
              onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 uppercase"
            />
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
                  {exec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sanctioned Load (kW)</label>
            <input
              type="number"
              value={form.sanctionedLoadKw}
              onChange={(e) => setForm({ ...form, sanctionedLoadKw: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-brand-purple"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Project Value (₹)</label>
            <input
              type="number"
              value={form.totalProjectValue}
              onChange={(e) => setForm({ ...form, totalProjectValue: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-emerald-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
            <select
              value={form.paymentStatus}
              onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as any })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              <option value="PAID">Fully Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Billing & Project Address</label>
          <input
            type="text"
            placeholder="Address line 1..."
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
            {customerToEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
