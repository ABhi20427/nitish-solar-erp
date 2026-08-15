'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { ShoppingBag, DollarSign, Calendar, Zap } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
}

export function OrderModal({ isOpen, onClose, orderToEdit }: OrderModalProps) {
  const { addOrder, updateOrderStatus, customers, quotations } = useSolarStore();

  const [form, setForm] = useState({
    customerId: customers[0]?.id || 'cust-1',
    customerName: customers[0]?.fullName || 'Solar Client',
    quotationId: quotations[0]?.id || 'qt-1',
    systemCapacityKw: 10,
    totalAmount: 450000,
    paidAmount: 90000,
    status: 'CONFIRMED' as OrderStatus,
    expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (orderToEdit) {
      setForm({
        customerId: orderToEdit.customerId,
        customerName: orderToEdit.customerName,
        quotationId: orderToEdit.quotationId,
        systemCapacityKw: orderToEdit.systemCapacityKw,
        totalAmount: orderToEdit.totalAmount,
        paidAmount: orderToEdit.paidAmount,
        status: orderToEdit.status,
        expectedDelivery: orderToEdit.expectedDelivery ? orderToEdit.expectedDelivery.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [orderToEdit, isOpen, customers, quotations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName) return;

    if (orderToEdit) {
      updateOrderStatus(orderToEdit.id, form.status);
    } else {
      addOrder(form);
    }

    onClose();
  };

  const STATUSES: { id: OrderStatus; label: string }[] = [
    { id: 'PENDING', label: 'Pending Confirmation' },
    { id: 'CONFIRMED', label: 'Confirmed Order' },
    { id: 'PROCESSING', label: 'Processing & Dispatch' },
    { id: 'PARTIALLY_DELIVERED', label: 'Partially Delivered' },
    { id: 'DELIVERED', label: 'Delivered to Site' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <ShoppingBag className="w-5 h-5 text-brand-purple" />
          {orderToEdit ? `Edit Order — ${orderToEdit.orderNumber}` : 'Create New Equipment Order'}
        </span>
      }
      subtitle="Record hardware purchase order, delivery schedule, and payment status."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Customer Account *</label>
          <select
            value={form.customerId}
            onChange={(e) => {
              const matched = customers.find((c) => c.id === e.target.value);
              setForm({
                ...form,
                customerId: e.target.value,
                customerName: matched ? matched.fullName : form.customerName,
              });
            }}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.customerType}) — {c.customerNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">System Capacity (kW)</label>
            <input
              type="number"
              min={1}
              value={form.systemCapacityKw}
              onChange={(e) => setForm({ ...form, systemCapacityKw: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-brand-purple"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Order Value (₹)</label>
            <input
              type="number"
              value={form.totalAmount}
              onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-emerald-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
            <input
              type="date"
              value={form.expectedDelivery}
              onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Order Fulfillment Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              {STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
            {orderToEdit ? 'Save Changes' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
