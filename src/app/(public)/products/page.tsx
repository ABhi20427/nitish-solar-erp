'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { useSolarStore } from '@/lib/store-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sun, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const { products } = useSolarStore();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredProducts = products.filter((p) =>
    selectedType === 'ALL' ? true : p.type === selectedType
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-dark">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purplelight">
            Tier-1 Certified Solar Hardware
          </span>
          <h1 className="text-4xl font-black tracking-tight">Products Supplied by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            Explore high-efficiency N-Type TOPCon Mono & Bifacial Panels, Grid-Tie & Hybrid Inverters, Lithium Storage, Mounting Structures, and BOS Equipment.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['ALL', 'SOLAR_PANEL', 'INVERTER', 'BATTERY_STORAGE', 'MOUNTING_STRUCTURE', 'BOS_CABLE_SWITCHGEAR', 'MONITORING_SYSTEM'].map(
            (type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedType === type
                    ? 'bg-brand-dark text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type === 'ALL' ? 'All Products' : type.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
              <div>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                    <Sun className="w-12 h-12 text-brand-purple" />
                  </div>
                )}

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple">{product.type.replace(/_/g, ' ')}</Badge>
                    <span className="text-xs font-semibold text-slate-400">SKU: {product.sku}</span>
                  </div>

                  <h3 className="text-lg font-bold text-brand-dark leading-snug">{product.name}</h3>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                    {product.specifications && Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-semibold text-slate-800">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Turnkey Price</span>
                  <span className="text-lg font-black text-brand-dark">₹{new Intl.NumberFormat('en-IN').format(product.unitPrice)}</span>
                </div>
                <Link href="/quote">
                  <Button variant="accent" size="sm" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Learn More & Quote
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
