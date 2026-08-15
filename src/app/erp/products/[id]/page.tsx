'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductModal } from '@/components/products/product-modal';
import { Package, ArrowLeft, Sun, ShieldCheck, Edit, Trash2, DollarSign, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const productId = params?.id as string;

  const { products, deleteProduct } = useSolarStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <ModuleGuard module="products" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Product Record Not Found</h2>
          <p className="text-xs text-slate-500">The requested solar hardware product SKU does not exist.</p>
          <Link href="/erp/products">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Products Catalog
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  const costPrice = product.costPrice || Math.round(product.unitPrice * 0.75);
  const marginAmt = product.unitPrice - costPrice;
  const marginPct = Math.round((marginAmt / product.unitPrice) * 100);

  const handleDelete = () => {
    deleteProduct(product.id);
    addToast({ title: `Deleted product ${product.name}`, type: 'info' });
    router.push('/erp/products');
  };

  return (
    <ModuleGuard module="products" action="view">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/erp/products">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Catalog
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              icon={<Edit className="w-4 h-4" />}
            >
              Edit Product Specs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete Product
            </Button>
          </div>
        </div>

        {/* Product Banner */}
        <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <Sun className="w-8 h-8 text-brand-purplelight" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-mono font-bold">{product.sku}</span>
                <Badge variant="purple">{product.type.replace(/_/g, ' ')}</Badge>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-0.5">{product.name}</h1>
              <p className="text-xs text-slate-300">
                Brand: <strong className="text-white">{product.brand}</strong> • Model: {product.model || 'N/A'} • Warranty: {product.warrantyYears} Years
              </p>
            </div>
          </div>

          <div className="text-right bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[200px] text-xs space-y-1">
            <span className="text-slate-400 block uppercase font-semibold">Unit Selling Price</span>
            <span className="text-2xl font-black text-emerald-400">₹{product.unitPrice.toLocaleString()}</span>
            <span className="text-[11px] text-slate-300 block">Stock Quantity: <strong className="text-white">{product.stockQuantity} {product.unit || 'Nos'}</strong></span>
          </div>
        </div>

        {/* Financial & Technical Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Specs & Description */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-slate-200">
              <CardHeader title="Technical Specifications & Overview" subtitle="Engineering parameters for quotation system sizing." />
              <CardBody className="space-y-4 text-xs">
                {product.description && (
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {product.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block font-semibold">Capacity Rating</span>
                    <span className="text-base font-bold text-navy-900">{product.capacity || '540W'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block font-semibold">Unit of Measure</span>
                    <span className="text-base font-bold text-navy-900">{product.unit || 'Nos'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <h4 className="font-bold text-navy-900">Key Parameters:</h4>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Manufacturer Brand:</span>
                      <span className="font-bold text-navy-900">{product.brand}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Model Number:</span>
                      <span className="font-bold text-navy-900">{product.model || 'Standard Enterprise Model'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Warranty Term:</span>
                      <span className="font-bold text-emerald-700">{product.warrantyYears} Years Manufacturer Warranty</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Pricing & Margin Analysis */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-slate-200">
              <CardHeader title="Pricing & Profit Margin Breakdown" subtitle="Cost price, selling price, and GST tax structure." />
              <CardBody className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Unit Selling Price:</span>
                  <span className="text-lg font-black text-navy-900">₹{product.unitPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Estimated Cost Price:</span>
                  <span className="text-sm font-bold text-slate-700">₹{costPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Estimated Profit Margin:</span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    ₹{marginAmt.toLocaleString()} ({marginPct}%)
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Applicable GST Tax Rate:</span>
                  <span className="text-sm font-bold text-brand-purple">{product.gstPercentage || 12}% GST</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Edit Modal */}
        <ProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          productToEdit={product}
        />
      </div>
    </ModuleGuard>
  );
}
