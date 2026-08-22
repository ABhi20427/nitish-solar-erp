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
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-[#070A10] text-white py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Tier-1 Certified Solar Hardware
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white">Products Supplied by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-light">
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
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-[#131B2E] text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
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
            <div key={product.id} className="bg-[#131B2E] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl hover:border-amber-400/40 transition-all flex flex-col justify-between">
              <div>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover filter brightness-95" />
                ) : (
                  <div className="w-full h-48 bg-[#0F172A] flex items-center justify-center text-amber-400">
                    <Sun className="w-12 h-12" />
                  </div>
                )}

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono font-bold uppercase">
                      {product.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-400">SKU: {product.sku}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">{product.name}</h3>

                  <div className="bg-[#0B0F17] rounded-xl p-3 border border-slate-800 text-xs space-y-1.5 font-light">
                    {product.specifications && Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-semibold text-slate-200">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#0B0F17]/60 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">Turnkey Price</span>
                  <span className="text-lg font-black text-amber-400 font-mono">₹{new Intl.NumberFormat('en-IN').format(product.unitPrice)}</span>
                </div>
                <Link href="/quote">
                  <Button variant="accent" size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" icon={<ArrowRight className="w-3.5 h-3.5" />}>
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
