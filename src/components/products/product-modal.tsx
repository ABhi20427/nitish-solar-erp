'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Product, ProductType } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { Package, Tag, DollarSign, ShieldCheck, Zap } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export function ProductModal({ isOpen, onClose, productToEdit }: ProductModalProps) {
  const { addProduct, updateProduct } = useSolarStore();

  const [form, setForm] = useState({
    name: '',
    sku: '',
    type: 'SOLAR_PANEL' as ProductType,
    brand: 'nitish solar Tech',
    model: '',
    capacity: '540W',
    unit: 'Nos',
    unitPrice: 14500,
    costPrice: 11000,
    gstPercentage: 12,
    stockQuantity: 500,
    warrantyYears: 25,
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (productToEdit) {
      setForm({
        name: productToEdit.name,
        sku: productToEdit.sku,
        type: productToEdit.type,
        brand: productToEdit.brand || 'nitish solar Tech',
        model: productToEdit.model || '',
        capacity: productToEdit.capacity || '540W',
        unit: productToEdit.unit || 'Nos',
        unitPrice: productToEdit.unitPrice || 14500,
        costPrice: productToEdit.costPrice || 11000,
        gstPercentage: productToEdit.gstPercentage || 12,
        stockQuantity: productToEdit.stockQuantity || 500,
        warrantyYears: productToEdit.warrantyYears || 25,
        description: productToEdit.description || '',
        imageUrl: productToEdit.imageUrl || '',
      });
    } else {
      setForm({
        name: '',
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        type: 'SOLAR_PANEL',
        brand: 'nitish solar Tech',
        model: '',
        capacity: '540W',
        unit: 'Nos',
        unitPrice: 14500,
        costPrice: 11000,
        gstPercentage: 12,
        stockQuantity: 500,
        warrantyYears: 25,
        description: '',
        imageUrl: '',
      });
    }
  }, [productToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) return;

    if (productToEdit) {
      updateProduct(productToEdit.id, form);
    } else {
      addProduct(form);
    }

    onClose();
  };

  const CATEGORIES: { id: ProductType; label: string }[] = [
    { id: 'SOLAR_PANEL', label: 'Solar Panels' },
    { id: 'INVERTER', label: 'Inverters' },
    { id: 'MOUNTING_STRUCTURE', label: 'Mounting Structures' },
    { id: 'BATTERY_STORAGE', label: 'Batteries' },
    { id: 'CABLES', label: 'Cables' },
    { id: 'PROTECTION_EQUIPMENT', label: 'Protection Equipment' },
    { id: 'MONITORING_SYSTEM', label: 'Monitoring Systems' },
    { id: 'ACCESSORIES', label: 'Accessories' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <Package className="w-5 h-5 text-brand-purple" />
          {productToEdit ? `Edit Product — ${productToEdit.sku}` : 'Add New Solar Product'}
        </span>
      }
      subtitle="Configure hardware specifications, manufacturer model, cost margin, and inventory stock."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. nitish solar 540W Mono PERC Panel"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Code (SKU) *</label>
            <input
              type="text"
              required
              placeholder="e.g. PAN-TOP-540"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 uppercase font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Category *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ProductType })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Manufacturer / Brand</label>
            <input
              type="text"
              placeholder="e.g. nitish solar Tech, Aether"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Model Number</label>
            <input
              type="text"
              placeholder="e.g. NS-540-N"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Capacity Rating</label>
            <input
              type="text"
              placeholder="e.g. 540W, 10kW, 15kWh"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
            <input
              type="text"
              placeholder="e.g. Nos, Meters, Sets"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Warranty (Years)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={form.warrantyYears}
              onChange={(e) => setForm({ ...form, warrantyYears: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
            <input
              type="number"
              required
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-navy-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
            <input
              type="number"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-slate-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">GST Tax Rate (%)</label>
            <select
              value={form.gstPercentage}
              onChange={(e) => setForm({ ...form, gstPercentage: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              <option value={12}>12% GST</option>
              <option value={18}>18% GST</option>
              <option value={5}>5% GST</option>
              <option value={0}>0% Tax Exempt</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Stock Availability</label>
            <input
              type="number"
              min={0}
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-emerald-700"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Technical Description</label>
          <textarea
            rows={3}
            placeholder="Product features, efficiency specs, dimensions..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
            {productToEdit ? 'Save Product Changes' : 'Add Product to Catalog'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
