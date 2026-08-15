'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { InventoryTransactionType } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { Package, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const { addInventoryTransaction, products } = useSolarStore();

  const [form, setForm] = useState({
    productId: products[0]?.id || 'prod-1',
    type: 'STOCK_IN' as InventoryTransactionType,
    quantity: 100,
    referenceNo: 'PO-2025-102',
    warehouseLocation: 'Pune Main Logistics Hub',
    notes: 'Stock replenishment from cell assembly plant.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProd = products.find((p) => p.id === form.productId);
    if (!selectedProd) return;

    addInventoryTransaction({
      ...form,
      productName: selectedProd.name,
      sku: selectedProd.sku,
      quantity: Number(form.quantity),
    });

    onClose();
  };

  const TYPES: { id: InventoryTransactionType; label: string }[] = [
    { id: 'STOCK_IN', label: 'Stock In (Inward Warehouse Dispatch)' },
    { id: 'STOCK_OUT', label: 'Stock Out (Site Dispatch)' },
    { id: 'RESERVATION', label: 'Stock Reservation' },
    { id: 'ALLOCATION', label: 'Project Hardware Allocation' },
    { id: 'ADJUSTMENT', label: 'Inventory Stock Adjustment' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <Package className="w-5 h-5 text-brand-purple" />
          Log Inventory Transaction
        </span>
      }
      subtitle="Record stock movement, inward purchase orders, or warehouse adjustments."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Select Hardware Product *</label>
          <select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — {p.stockQuantity} in stock
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transaction Movement Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as InventoryTransactionType })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quantity (Units)</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-navy-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reference PO / Project No.</label>
            <input
              type="text"
              placeholder="e.g. PO-2025-102"
              value={form.referenceNo}
              onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Warehouse Hub Location</label>
            <input
              type="text"
              placeholder="e.g. Pune Main Logistics Hub"
              value={form.warehouseLocation}
              onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Transaction Notes & Inspection Remarks</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
            Record Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
