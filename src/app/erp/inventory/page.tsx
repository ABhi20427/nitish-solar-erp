'use client';

import React, { useState } from 'react';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TransactionModal } from '@/components/inventory/transaction-modal';
import { AllocationModal } from '@/components/inventory/allocation-modal';
import { Package, Plus, Layers, AlertTriangle, ArrowUpRight, ArrowDownLeft, ShieldCheck, Search, Filter } from 'lucide-react';

export default function InventoryPage() {
  const { products, inventoryTransactions, projectAllocations } = useSolarStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'allocations' | 'transactions'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);

  // Identify low stock products (e.g. stock <= 50)
  const lowStockProducts = products.filter((p) => p.stockQuantity <= (p.reorderLevel || 50));

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModuleGuard module="products" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-purple" /> Solar Inventory & Project Allocation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Warehouse stock control, project hardware reservations, and inventory transaction logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAllocModalOpen(true)}
              icon={<Layers className="w-4 h-4 text-brand-purple" />}
            >
              Allocate to Project
            </Button>

            <Button
              variant="accent"
              onClick={() => setIsTxModalOpen(true)}
              className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
              icon={<Plus className="w-4 h-4" />}
            >
              Log Stock Movement
            </Button>
          </div>
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockProducts.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-rose-900">Low Stock Inventory Alert!</h4>
                <p className="text-rose-700 mt-0.5">
                  <strong>{lowStockProducts.length} product(s)</strong> have fallen below reorder levels. Restock inward purchase orders to avoid project delays.
                </p>
              </div>
            </div>

            <Badge variant="danger" className="shrink-0">
              Action Required
            </Badge>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'inventory'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Warehouse Stock Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'allocations'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Project Hardware Allocations ({projectAllocations.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'transactions'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Inventory Transactions Log ({inventoryTransactions.length})
          </button>
        </div>

        {/* TAB 1: Warehouse Stock Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <Card className="border-slate-200">
              <CardBody className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search inventory by product name, SKU code, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
                  />
                </div>
              </CardBody>
            </Card>

            <Card className="border-slate-200">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="p-3.5">Product & SKU</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Warehouse Hub</th>
                        <th className="p-3.5 text-center">Available Stock</th>
                        <th className="p-3.5 text-center">Reserved</th>
                        <th className="p-3.5 text-center">Allocated</th>
                        <th className="p-3.5 text-center">Reorder Level</th>
                        <th className="p-3.5 text-right">Unit Price (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => {
                        const isLow = p.stockQuantity <= (p.reorderLevel || 50);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3.5">
                              <span className="font-bold text-navy-900 block">{p.name}</span>
                              <span className="font-mono text-[10px] text-amber-500 font-semibold">{p.sku}</span>
                            </td>
                            <td className="p-3.5 text-slate-600">
                              <Badge variant="purple">{p.type.replace(/_/g, ' ')}</Badge>
                            </td>
                            <td className="p-3.5 text-slate-600 font-medium">
                              {p.warehouseLocation || 'Pune Main Logistics Hub'}
                            </td>
                            <td className="p-3.5 text-center font-black text-sm">
                              <span className={isLow ? 'text-rose-600 font-black' : 'text-emerald-700'}>
                                {p.stockQuantity} units
                              </span>
                            </td>
                            <td className="p-3.5 text-center font-bold text-slate-600">
                              {p.quantityReserved || 10}
                            </td>
                            <td className="p-3.5 text-center font-bold text-brand-purple">
                              {p.quantityAllocated || 25}
                            </td>
                            <td className="p-3.5 text-center text-slate-500 font-mono">
                              {p.reorderLevel || 50} units
                            </td>
                            <td className="p-3.5 text-right font-bold text-navy-900">
                              ₹{p.unitPrice.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* TAB 2: Project Hardware Allocations */}
        {activeTab === 'allocations' && (
          <Card className="border-slate-200">
            <CardHeader title="Project Hardware Allocation Comparison Grid" subtitle="Required vs Allocated vs Delivered vs Installed component balance." />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="p-3.5">Project ID & Customer</th>
                      <th className="p-3.5">Allocated Product & SKU</th>
                      <th className="p-3.5 text-center">Required Qty</th>
                      <th className="p-3.5 text-center">Allocated Qty</th>
                      <th className="p-3.5 text-center">Delivered Qty</th>
                      <th className="p-3.5 text-center">Installed Qty</th>
                      <th className="p-3.5 text-center">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectAllocations.map((alloc) => {
                      const isComplete = alloc.installedQty >= alloc.requiredQty;
                      return (
                        <tr key={alloc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-navy-900 block">{alloc.projectNumber}</span>
                            <span className="text-[11px] text-slate-600 font-bold">{alloc.customerName}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800 block">{alloc.productName}</span>
                            <span className="font-mono text-[10px] text-amber-500">{alloc.sku}</span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-navy-900">{alloc.requiredQty}</td>
                          <td className="p-3.5 text-center font-bold text-brand-purple">{alloc.allocatedQty}</td>
                          <td className="p-3.5 text-center font-bold text-blue-700">{alloc.deliveredQty}</td>
                          <td className="p-3.5 text-center font-black text-emerald-700">{alloc.installedQty}</td>
                          <td className="p-3.5 text-center">
                            {isComplete ? (
                              <Badge variant="success">Fully Installed</Badge>
                            ) : (
                              <Badge variant="amber">In Installation</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* TAB 3: Inventory Transactions Log */}
        {activeTab === 'transactions' && (
          <Card className="border-slate-200">
            <CardHeader title="Inventory Audit Movement Log" subtitle="History log of Stock In, Stock Out, Allocation, and Adjustments." />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Product & SKU</th>
                      <th className="p-3.5">Movement Type</th>
                      <th className="p-3.5 text-center">Quantity</th>
                      <th className="p-3.5">Reference No.</th>
                      <th className="p-3.5">Warehouse Location</th>
                      <th className="p-3.5">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-navy-900 block">{tx.productName}</span>
                          <span className="font-mono text-[10px] text-amber-500">{tx.sku}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              tx.type === 'STOCK_IN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.type === 'ALLOCATION'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-black text-navy-900">{tx.quantity} units</td>
                        <td className="p-3.5 font-mono text-slate-700">{tx.referenceNo || 'N/A'}</td>
                        <td className="p-3.5 text-slate-600">{tx.warehouseLocation || 'Pune Main Hub'}</td>
                        <td className="p-3.5 text-slate-800 font-medium">{tx.userName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Modals */}
        <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} />
        <AllocationModal isOpen={isAllocModalOpen} onClose={() => setIsAllocModalOpen(false)} />
      </div>
    </ModuleGuard>
  );
}
