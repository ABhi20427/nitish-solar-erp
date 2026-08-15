'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductModal } from '@/components/products/product-modal';
import { Product, ProductType } from '@/lib/types';
import { Package, Plus, Search, ArrowUpRight, Sun, ShieldCheck, ArrowUpDown, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export default function ProductsPage() {
  const { products } = useSolarStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Extract unique brands for filter dropdown
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'ALL' || p.type === categoryFilter;
      const matchesBrand = brandFilter === 'ALL' || p.brand === brandFilter;

      const matchesStock =
        stockFilter === 'ALL'
          ? true
          : stockFilter === 'IN_STOCK'
          ? p.stockQuantity > 50
          : stockFilter === 'LOW_STOCK'
          ? p.stockQuantity > 0 && p.stockQuantity <= 50
          : p.stockQuantity === 0;

      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'desc' ? b.unitPrice - a.unitPrice : a.unitPrice - b.unitPrice;
      }
      if (sortBy === 'stock') {
        return sortOrder === 'desc' ? b.stockQuantity - a.stockQuantity : a.stockQuantity - b.stockQuantity;
      }
      return sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const getStockBadge = (qty: number) => {
    if (qty === 0) {
      return <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px]">OUT OF STOCK</span>;
    }
    if (qty <= 50) {
      return <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">LOW STOCK ({qty})</span>;
    }
    return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">IN STOCK ({qty})</span>;
  };

  return (
    <ModuleGuard module="products" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-purple" /> Solar Hardware Catalog & Inventory
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage Tier-1 solar modules, inverters, battery storage, mounting frames, and BOS components.
            </p>
          </div>

          <Button
            variant="accent"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Product
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardBody className="p-4 space-y-4 text-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product by name, SKU code (e.g. PAN-TOP-540), manufacturer, model..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
                >
                  <option value="name">Product Name</option>
                  <option value="price">Selling Price (₹)</option>
                  <option value="stock">Stock Quantity</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50"
                  title="Toggle Ascending / Descending"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Category Filter</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="ALL">All 8 Categories ({products.length})</option>
                  <option value="SOLAR_PANEL">Solar Panels</option>
                  <option value="INVERTER">Inverters</option>
                  <option value="MOUNTING_STRUCTURE">Mounting Structures</option>
                  <option value="BATTERY_STORAGE">Batteries</option>
                  <option value="CABLES">Cables</option>
                  <option value="PROTECTION_EQUIPMENT">Protection Equipment</option>
                  <option value="MONITORING_SYSTEM">Monitoring Systems</option>
                  <option value="ACCESSORIES">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Manufacturer Filter</label>
                <select
                  value={brandFilter}
                  onChange={(e) => {
                    setBrandFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="ALL">All Manufacturers</option>
                  {uniqueBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Stock Availability Filter</label>
                <select
                  value={stockFilter}
                  onChange={(e) => {
                    setStockFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="ALL">All Stock Levels</option>
                  <option value="IN_STOCK">In Stock (&gt; 50)</option>
                  <option value="LOW_STOCK">Low Stock (1 - 50)</option>
                  <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Product Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProducts.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
              No products match your filter criteria.
            </div>
          ) : (
            paginatedProducts.map((prod) => (
              <div key={prod.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-44 bg-slate-100 flex items-center justify-center">
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <Sun className="w-12 h-12 text-brand-purple" />
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant="purple">{prod.type.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-2 text-xs">
                    <span className="font-mono text-[10px] text-slate-400 block font-bold">{prod.sku}</span>
                    <h3 className="font-bold text-navy-900 text-sm leading-snug line-clamp-2">{prod.name}</h3>
                    <span className="text-[11px] text-slate-500 block">Brand: <strong className="text-slate-800">{prod.brand}</strong></span>

                    <div className="flex items-center justify-between pt-1">
                      {getStockBadge(prod.stockQuantity)}
                      <span className="text-[10px] text-slate-400">{prod.warrantyYears} Yrs Warranty</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Selling Price</span>
                    <span className="text-base font-black text-navy-900">₹{prod.unitPrice.toLocaleString()}</span>
                  </div>

                  <Link href={`/erp/products/${prod.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Specs
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <Card className="border-slate-200">
          <CardBody className="p-4 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <strong className="text-navy-900">{filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
              <strong className="text-navy-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of{' '}
              <strong className="text-navy-900">{filteredProducts.length}</strong> catalog products
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Prev
              </Button>
              <span className="font-bold text-navy-900 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Modal Form */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productToEdit={productToEdit}
        />
      </div>
    </ModuleGuard>
  );
}
