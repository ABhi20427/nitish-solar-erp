'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useSolarStore } from '@/lib/store-context';
import { Layers, Package, Zap } from 'lucide-react';

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AllocationModal({ isOpen, onClose }: AllocationModalProps) {
  const { allocateHardwareToProject, projects, products } = useSolarStore();

  const [form, setForm] = useState({
    projectId: projects[0]?.id || 'proj-1',
    productId: products[0]?.id || 'prod-1',
    requiredQty: 180,
    allocatedQty: 180,
    deliveredQty: 180,
    installedQty: 120,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProj = projects.find((p) => p.id === form.projectId);
    const targetProd = products.find((p) => p.id === form.productId);
    if (!targetProj || !targetProd) return;

    allocateHardwareToProject({
      projectId: targetProj.id,
      projectNumber: targetProj.projectNumber,
      customerName: targetProj.customerName,
      productId: targetProd.id,
      productName: targetProd.name,
      sku: targetProd.sku,
      requiredQty: Number(form.requiredQty),
      allocatedQty: Number(form.allocatedQty),
      deliveredQty: Number(form.deliveredQty),
      installedQty: Number(form.installedQty),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <Layers className="w-5 h-5 text-brand-purple" />
          Allocate Hardware to Solar Project
        </span>
      }
      subtitle="Reserve and allocate warehouse equipment for site installation."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Select Solar Project *</label>
          <select
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectNumber} — {p.customerName} ({p.systemSizeKw} kW)
              </option>
            ))}
          </select>
        </div>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Required Qty</label>
            <input
              type="number"
              min={1}
              value={form.requiredQty}
              onChange={(e) => setForm({ ...form, requiredQty: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-navy-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Allocated Qty</label>
            <input
              type="number"
              min={0}
              value={form.allocatedQty}
              onChange={(e) => setForm({ ...form, allocatedQty: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-brand-purple"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Delivered Qty</label>
            <input
              type="number"
              min={0}
              value={form.deliveredQty}
              onChange={(e) => setForm({ ...form, deliveredQty: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-blue-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Installed Qty</label>
            <input
              type="number"
              min={0}
              value={form.installedQty}
              onChange={(e) => setForm({ ...form, installedQty: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700"
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
            Confirm Hardware Allocation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
